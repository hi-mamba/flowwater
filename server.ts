import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // 解析 JSON 请求体（新闻写入接口需要）
  app.use(express.json({ limit: "1mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ====== 新闻资讯（内置数据库 / 只保留近 1 小时） ======
  // 存储在 ./data/news.json，写入节流落盘；超过 1 小时的条目自动清理。
  // 数据写入接口（供其他人实现）：POST /api/news
  // 读取接口：GET /api/news
  // 写入成功后通过 socket 事件 news_added 推送到同局域网其他设备。
  const NEWS_FILE = process.env.NEWS_FILE || path.join(process.cwd(), "data", "news.json");
  const NEWS_RETENTION_MS = 60 * 60 * 1000; // 1 小时
  const NEWS_MAX = 500;

  interface NewsItem {
    id: string;
    title: string;
    content: string;
    aiAnalysis: string;
    sourceUrl: string;
    createdAt: number;
    extra?: Record<string, unknown>;
  }

  let newsItems: NewsItem[] = [];
  try {
    if (fs.existsSync(NEWS_FILE)) {
      newsItems = JSON.parse(fs.readFileSync(NEWS_FILE, "utf-8")) || [];
    }
  } catch (e) {
    console.warn("[News] Failed to load file, starting fresh:", (e as Error).message);
    newsItems = [];
  }

  // 移除过期（超过 1 小时）的条目，返回是否有变化
  const pruneNews = (): boolean => {
    const cutoff = Date.now() - NEWS_RETENTION_MS;
    const before = newsItems.length;
    newsItems = newsItems.filter((n) => n.createdAt >= cutoff);
    return newsItems.length !== before;
  };
  pruneNews();

  let newsSaveTimer: NodeJS.Timeout | null = null;
  const scheduleNewsSave = () => {
    if (newsSaveTimer) return;
    newsSaveTimer = setTimeout(() => {
      newsSaveTimer = null;
      try {
        const newsDir = path.dirname(NEWS_FILE);
        if (!fs.existsSync(newsDir)) fs.mkdirSync(newsDir, { recursive: true });
        const tmp = NEWS_FILE + ".tmp";
        fs.writeFileSync(tmp, JSON.stringify(newsItems), "utf-8");
        fs.renameSync(tmp, NEWS_FILE);
      } catch (e) {
        console.warn("[News] Save failed:", (e as Error).message);
      }
    }, 2000);
  };

  // 读取：仅返回近 1 小时、按时间倒序
  app.get("/api/news", (req, res) => {
    pruneNews();
    const items = [...newsItems].sort((a, b) => b.createdAt - a.createdAt);
    res.json({ ok: true, items });
  });

  // 写入接口（供其他人实现数据写入）
  app.post("/api/news", (req, res) => {
    const body = req.body || {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const aiAnalysis = typeof body.aiAnalysis === "string" ? body.aiAnalysis : "";
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl : "";
    if (!title) {
      return res.status(400).json({ ok: false, error: "title 必填" });
    }
    const item: NewsItem = {
      id: typeof body.id === "string" && body.id ? body.id : `news_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.slice(0, 200),
      content: content.slice(0, 20000),
      aiAnalysis: aiAnalysis.slice(0, 20000),
      sourceUrl: sourceUrl.slice(0, 1000),
      createdAt: typeof body.createdAt === "number" ? body.createdAt : Date.now(),
      extra: body.extra && typeof body.extra === "object" ? body.extra : undefined,
    };
    newsItems.push(item);
    pruneNews();
    if (newsItems.length > NEWS_MAX) {
      newsItems.sort((a, b) => b.createdAt - a.createdAt);
      newsItems = newsItems.slice(0, NEWS_MAX);
    }
    scheduleNewsSave();
    // 推送到同局域网内所有已连接设备
    io.emit("news_added", { item });
    res.json({ ok: true, item });
  });

  // 每 5 分钟清理一次过期数据
  setInterval(() => {
    if (pruneNews()) scheduleNewsSave();
  }, 5 * 60 * 1000);

  // ====== 排行榜（JSON 文件持久化版） ======
  // 启动时从 ./data/leaderboards.json 读取；每次提交后节流写盘（默认 2s）
  // 可通过 LEADERBOARD_FILE 环境变量改路径；上量级时再换 SQLite。
  const DATA_DIR = path.join(process.cwd(), "data");
  const LEADERBOARD_FILE = process.env.LEADERBOARD_FILE || path.join(DATA_DIR, "leaderboards.json");
  const MAX_PER_BOARD = 200;

  let leaderboards: Record<string, { name: string; score: number; level?: string; ts: number }[]> = {};
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      leaderboards = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf-8")) || {};
      const total = Object.values(leaderboards).reduce((s, l) => s + l.length, 0);
      console.log(`[Leaderboard] Loaded ${Object.keys(leaderboards).length} boards, ${total} entries from ${LEADERBOARD_FILE}`);
    }
  } catch (e) {
    console.warn("[Leaderboard] Failed to load file, starting fresh:", (e as Error).message);
    leaderboards = {};
  }

  let saveTimer: NodeJS.Timeout | null = null;
  const scheduleSave = () => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        // 原子写：先写 tmp 再 rename，断电不会破坏旧文件
        const tmp = LEADERBOARD_FILE + ".tmp";
        fs.writeFileSync(tmp, JSON.stringify(leaderboards), "utf-8");
        fs.renameSync(tmp, LEADERBOARD_FILE);
      } catch (e) {
        console.warn("[Leaderboard] Save failed:", (e as Error).message);
      }
    }, 2000);
  };

  app.get("/api/leaderboard/:gameId", (req, res) => {
    const list = leaderboards[req.params.gameId] || [];
    res.json(list.slice(0, 20));
  });

  // Socket.io logic
  const players = new Map();
  const sects = {
    '掩月宗': { members: 0, power: 10000 },
    '黄枫谷': { members: 0, power: 8000 },
    '灵兽山': { members: 0, power: 9000 },
    '清虚门': { members: 0, power: 7500 },
    '化刀坞': { members: 0, power: 8500 },
    '天阙堡': { members: 0, power: 7000 },
    '巨剑门': { members: 0, power: 9500 },
  };

  let secretRealmActive = false;
  let secretRealmPlayers = new Set();

  // 排行榜限频：每 socket 3 秒一次；每 IP 60 秒最多 30 次
  const lastSubmitBySocket = new Map<string, number>();
  const ipSubmitWindow = new Map<string, number[]>();
  const SOCKET_COOLDOWN_MS = 3000;
  const IP_WINDOW_MS = 60_000;
  const IP_MAX_IN_WINDOW = 30;

  function allowSubmit(socketId: string, ip: string): boolean {
    const now = Date.now();
    const last = lastSubmitBySocket.get(socketId) || 0;
    if (now - last < SOCKET_COOLDOWN_MS) return false;
    const arr = (ipSubmitWindow.get(ip) || []).filter(t => now - t < IP_WINDOW_MS);
    if (arr.length >= IP_MAX_IN_WINDOW) {
      ipSubmitWindow.set(ip, arr);
      return false;
    }
    arr.push(now);
    ipSubmitWindow.set(ip, arr);
    lastSubmitBySocket.set(socketId, now);
    return true;
  }

  io.on("connection", (socket) => {
    console.log("A cultivator connected:", socket.id);

    socket.on("join", (playerData) => {
      players.set(socket.id, { id: socket.id, ...playerData });
      if (playerData.sect && sects[playerData.sect]) {
        sects[playerData.sect].members++;
      }
      
      // Notify others in the same LAN/World
      socket.broadcast.emit("cultivator_joined", { id: socket.id, ...playerData });
      
      // Send current world state
      socket.emit("world_state", {
        players: Array.from(players.values()),
        sects,
        secretRealmActive
      });
    });

    socket.on("update_cultivation", (data) => {
      const player = players.get(socket.id);
      if (player) {
        player.name = data.name;
        player.level = data.level;
        player.power = data.power;
        players.set(socket.id, player);
        io.emit("player_updated", player);
      }
    });

    socket.on("greet", (targetId) => {
      const player = players.get(socket.id);
      if (player) {
        io.to(targetId).emit("greeting_received", { from: player.name, id: socket.id });
      }
    });

    socket.on("enter_secret_realm", () => {
      if (secretRealmActive) {
        secretRealmPlayers.add(socket.id);
        io.emit("secret_realm_update", Array.from(secretRealmPlayers));
      }
    });

    socket.on("attack_player", (targetId) => {
      if (secretRealmActive && secretRealmPlayers.has(socket.id) && secretRealmPlayers.has(targetId)) {
        const attacker = players.get(socket.id);
        const defender = players.get(targetId);
        if (attacker && defender) {
          // Simple combat logic based on power
          const winChance = attacker.power / (attacker.power + defender.power);
          const attackerWins = Math.random() < winChance;
          
          if (attackerWins) {
            io.to(socket.id).emit("combat_result", { success: true, target: defender.name, reward: 50 });
            io.to(targetId).emit("combat_result", { success: false, attacker: attacker.name, loss: 50 });
          } else {
            io.to(socket.id).emit("combat_result", { success: false, target: defender.name, loss: 20 });
            io.to(targetId).emit("combat_result", { success: true, attacker: attacker.name, reward: 20 });
          }
        }
      }
    });

    socket.on("disconnect", () => {
      const player = players.get(socket.id);
      if (player && player.sect && sects[player.sect]) {
        sects[player.sect].members--;
      }
      players.delete(socket.id);
      secretRealmPlayers.delete(socket.id);
      lastSubmitBySocket.delete(socket.id);
      io.emit("cultivator_left", socket.id);
      console.log("Cultivator disconnected:", socket.id);
    });

    // ====== 排行榜事件 ======
    socket.on("submit_score", (data: { gameId: string; score: number; name?: string; level?: string }) => {
      if (!data || typeof data.gameId !== "string" || typeof data.score !== "number" || data.score <= 0) return;
      // 防刷：socket 冷却 + IP 窗口限频
      const ip = (socket.handshake.address || socket.handshake.headers["x-forwarded-for"] || "unknown").toString();
      if (!allowSubmit(socket.id, ip)) {
        return; // 静默丢弃，不告诉客户端，避免被探测
      }
      // 单次分数上限，防止异常巨大值刷榜
      const safeScore = Math.min(Math.floor(data.score), 10_000_000);
      const gameId = data.gameId.slice(0, 32);
      const existing = leaderboards[gameId] || [];
      // 同名玩家保留最高分
      const player = players.get(socket.id);
      const name = (data.name || player?.name || "无名道友").toString().slice(0, 16);
      const level = (data.level || player?.level || "").toString().slice(0, 16);
      const idx = existing.findIndex(e => e.name === name);
      if (idx >= 0) {
        if (existing[idx].score < safeScore) {
          existing[idx] = { name, score: safeScore, level, ts: Date.now() };
        }
      } else {
        existing.push({ name, score: safeScore, level, ts: Date.now() });
      }
      existing.sort((a, b) => b.score - a.score);
      leaderboards[gameId] = existing.slice(0, MAX_PER_BOARD);
      scheduleSave();
      socket.emit("leaderboard_updated", { gameId, top: leaderboards[gameId].slice(0, 20) });
    });

    // ====== 新闻事件 ======
    socket.on("get_news", () => {
      pruneNews();
      const items = [...newsItems].sort((a, b) => b.createdAt - a.createdAt);
      socket.emit("news_list", { items });
    });

    socket.on("get_leaderboard", (gameId: string) => {
      if (typeof gameId !== "string") return;
      socket.emit("leaderboard_updated", { gameId, top: (leaderboards[gameId] || []).slice(0, 20) });
    });

    // 一次性返回所有游戏的 Top1，用于大厅"风云榜"
    socket.on("get_all_top", () => {
      const summary: Record<string, { name: string; score: number; level?: string }> = {};
      for (const [gameId, list] of Object.entries(leaderboards)) {
        if (list && list.length > 0) {
          const top = list[0];
          summary[gameId] = { name: top.name, score: top.score, level: top.level };
        }
      }
      socket.emit("all_top_updated", summary);
    });
  });

  // Simulate Sect Events and Secret Realm
  setInterval(() => {
    // Random sect events
    const sectNames = Object.keys(sects);
    const eventType = Math.random();
    
    if (eventType < 0.1) {
      // Sect Tournament
      const sect = sectNames[Math.floor(Math.random() * sectNames.length)];
      io.emit("sect_event", { type: "tournament", sect, message: `【${sect}】正在举行宗门大比，弟子修为普遍提升！` });
      sects[sect].power += 500;
    } else if (eventType < 0.15) {
      // Sect Invasion
      const attacker = sectNames[Math.floor(Math.random() * sectNames.length)];
      let defender = sectNames[Math.floor(Math.random() * sectNames.length)];
      while (attacker === defender) defender = sectNames[Math.floor(Math.random() * sectNames.length)];
      
      io.emit("sect_event", { type: "invasion", attacker, defender, message: `【${attacker}】对【${defender}】发动了突袭！` });
      if (sects[attacker].power > sects[defender].power) {
        sects[attacker].power += 1000;
        sects[defender].power -= 500;
      } else {
        sects[attacker].power -= 500;
        sects[defender].power += 500;
      }
    }

    // Secret Realm Logic
    if (!secretRealmActive && Math.random() < 0.05) {
      secretRealmActive = true;
      io.emit("secret_realm_status", { active: true, message: "血色禁地已开启！各位道友可前往探索寻找机缘，但切记其中凶险异常，随时可能遭遇其他修士的劫杀！" });
      
      // Close after 2 minutes
      setTimeout(() => {
        secretRealmActive = false;
        secretRealmPlayers.clear();
        io.emit("secret_realm_status", { active: false, message: "血色禁地已关闭。" });
      }, 120000);
    }

  }, 30000); // Check every 30 seconds

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
