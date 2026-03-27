import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

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

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
      io.emit("cultivator_left", socket.id);
      console.log("Cultivator disconnected:", socket.id);
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
