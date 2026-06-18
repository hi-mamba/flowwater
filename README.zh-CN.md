<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">悦泉修仙 · FlowWater</h1>

<p align="center">
  <b>🌐 语言：</b>
  <a href="./README.md">English</a> ｜ <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-4-38bdf8">
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-r184-black">
  <img alt="Phaser" src="https://img.shields.io/badge/Phaser-4-white">
  <img alt="Capacitor" src="https://img.shields.io/badge/Capacitor-8-119EFF">
</p>

---

**悦泉修仙** 是一款以《凡人修仙传》为世界观、把「喝水」这件事变成修仙养成的轻量级 PWA / 安卓应用。

每喝一口水（灵液 / 灵茶 / 灵咖 / 仙奶茶）都能转化为修为，助你从一介凡人一路突破炼气、筑基、结丹、元婴…… 直至渡劫飞升。在养成修为的同时，养成每天喝够水的好习惯。

> English version: [README.md](./README.md)

### ✨ 核心功能

- **💧 饮水即修仙**：记录饮水量，按饮品吸收率换算修为；支持白水、灵茶、灵咖、仙奶茶四种饮品，吸收率可在设置中自定义。
- **🧘 修炼境界**：凡人 → 炼气（13 层）→ 筑基 → 结丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫，共 40+ 阶段，每个境界都有专属配色与背景。
- **🌱 灵根 & 宗门**：开局抽取灵根（天灵根 / 变异灵根 / 废柴逆袭……），加入黄枫谷、掩月宗、灵兽山等宗门，享受不同修炼加成。
- **💞 道侣 & 灵兽**：结识南宫婉、紫灵仙子等道侣双修加速，捕获并培养灵兽助阵。
- **🏔️ 洞府系统**：灵草园种植、炼丹炉炼丹、制符台画符、傀儡自动化挂机（离线结算收益），还有掌天瓶（时间加速）、本命法宝、噬金虫、神识探查等法宝玩法。
- **⚔️ 奇遇 & 秘境**：探索秘境副本、血色禁地（Phaser 回合制斗法）、昆吾山、猎妖、剑阵等小游戏，3D 法宝与回合制斗法由 Three.js / Phaser 驱动。
- **🏯 宗门社交**：宗门战、宗门排行榜、宗门事件，通过 Socket.io 局域网联机。
- **🗺️ 三界世界地图**：凡人界 / 天南 / 乱星海 / 大晋 / 阴冥之地 / 魔界 / 灵界 / 仙界，按修为解锁更高灵气倍率的修炼地。
- **⚡ 渡劫 & 机缘**：突破时有渡劫动画，日常随机触发机缘（福 / 祸 / 邂逅）。
- **📅 计划提醒 & 每日签到**：自定义饮水计划与提醒，每日签到领奖；支持系统通知与震动反馈。
- **📰 新闻资讯**：内置新闻流，支持 Gemini AI 摘要分析，局域网内通过 Socket.io 实时同步。
- **🎵 主题曲 & 环境氛围**：内置《不凡》主题曲，不同修炼地有专属环境氛围音。
- **📱 安卓原生**：基于 Capacitor 打包，可在 Android 设备上安装运行。

### 🛠️ 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 4 + @tailwindcss/typography |
| 状态管理 | Zustand |
| 路由 | React Router 7 (HashRouter) |
| 3D / 游戏 | Three.js + @react-three/fiber + @react-three/drei + Phaser 4 |
| 动画 | Motion |
| 图表 | Recharts |
| 实时通信 | Socket.io（服务端 Express） |
| AI | Google GenAI (Gemini) |
| 移动端 | Capacitor 8（Android） |
| 持久化 | localStorage + 服务端 JSON 文件 |

### 🚀 本地运行

**前置要求**：Node.js 18+

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选，仅新闻 AI 分析需要）
cp .env.example .env.local
# 编辑 .env.local，填入你的 GEMINI_API_KEY

# 3. 启动开发服务器（Express + Vite 中间件，端口 3000）
npm run dev
# 浏览器打开 http://localhost:3000
```

### 📜 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（`tsx server.ts`，端口 3000） |
| `npm run build` | 构建生产产物到 `dist/` |
| `npm run start` | 以生产模式运行（`node server.js`） |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run clean` | 清理 `dist/` |

### 🤖 打包 Android

```bash
npm run build
npx cap sync android
# 在 Android Studio 中打开 android/ 目录构建 APK
```

### ⚙️ 环境变量

| 变量 | 说明 |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API 密钥，用于新闻 AI 摘要分析（可选） |
| `APP_URL` | 应用托管地址，用于自引用链接 / OAuth 回调 |
| `NEWS_FILE` | 新闻数据存储路径，默认 `./data/news.json` |
| `LEADERBOARD_FILE` | 排行榜数据存储路径 |

### 📂 项目结构

```
flowwater4/
├── server.ts              # Express + Vite + Socket.io 服务端
├── capacitor.config.ts    # Capacitor (Android) 配置
├── src/
│   ├── App.tsx            # 根组件 / 路由 / 底部导航
│   ├── pages/             # 首页 / 奇遇 / 洞府 / 宗门 / 设置 等页面
│   ├── components/        # 炼丹 / 制符 / 灵草园 / 秘境 / 渡劫 等组件
│   │   ├── three/         # Three.js 3D 法宝
│   │   └── worldmap/      # 三界世界地图
│   ├── store/             # Zustand 状态切片 (constants / puppet / companion ...)
│   ├── data/              # 剧情 / 叙事 / 情感文案等数据
│   ├── games/             # Phaser 游戏逻辑
│   └── socket.ts          # Socket.io 客户端生命周期
└── android/               # Capacitor Android 工程
```

### 📖 玩法速览

1. 在首页记录每次饮水，选择饮品类型与饮水量。
2. 修为累积到阈值自动突破境界，触发渡劫动画。
3. 修为达标后在世界地图解锁更高灵气倍率的修炼地。
4. 在洞府种植灵草、炼丹、挂机傀儡，获取资源与法宝。
5. 前往奇遇探索秘境副本，挑战血色禁地等小游戏获取稀有材料。
6. 加入宗门参与宗门战，与同局域网道友比拼排行榜。

---

<p align="center">
  道友，念头通达，多喝水 💧
</p>
