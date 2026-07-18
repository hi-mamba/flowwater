<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">悦泉修仙 · FlowWater</h1>

<p align="center">
  <b>🌐 Languages:</b>
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

<p align="center">
  <a href="https://github.com/hi-mamba/flowwater/releases/latest/download/FlowWater-Android.apk">
    <img alt="Download Android APK" src="https://img.shields.io/badge/Download-Android_APK-3DDC84?logo=android&logoColor=white">
  </a>
</p>

---

**FlowWater (悦泉修仙)** is a lightweight PWA / Android app that turns drinking water into a Xianxia (cultivation) journey set in the world of *"A Record of a Mortal's Journey to Immortality"* (凡人修仙传).

Every sip of water (spirit liquid / spirit tea / spirit coffee / immortal milk tea) is converted into cultivation, helping you ascend from a mere mortal through Qi Condensation, Foundation Establishment, Core Formation, Nascent Soul… all the way to tribulation and ascension. Build the healthy habit of drinking enough water while building your cultivation.

> 中文文档请见 [README.zh-CN.md](./README.zh-CN.md)

### ✨ Core Features

- **💧 Drink to Cultivate**: Log water intake; cultivation is calculated by drink type and absorption rate. Supports water, spirit tea, spirit coffee, and immortal milk tea — absorption rates are customizable in Settings.
- **🧘 Cultivation Realms**: Mortal → Qi Condensation (13 layers) → Foundation Establishment → Core Formation → Nascent Soul → Spirit Severing → Void Refinement → Body Integration → Great Ascension → Tribulation — 40+ stages, each with its own color theme and background.
- **🌱 Spiritual Roots & Sects**: Roll a spiritual root (Heavenly / Mutated / Late-blooming Genius…) at startup, and join a sect such as Yellow Maple Valley, Moon-Masking Sect, or Spirit Beast Mountain for unique bonuses.
- **💞 Dao Companions & Spirit Beasts**: Befriend companions like Nangong Wan and Zi Ling for dual-cultivation speedups; capture and raise spirit beasts to assist you.
- **🏔️ Cave Dwelling**: Herb garden, alchemy furnace, talisman crafting table, puppet automation (offline income settlement), plus artifacts like the Heavenly Bottle (time acceleration), Lifebound Artifact, Gold-Devouring Beetles, and Divine Sense scanning.
- **⚔️ Adventures & Secret Realms**: Explore instance dungeons, the Blood-Colored Forbidden Land (Phaser turn-based combat), Mount Kunwu, monster hunts, and sword formations — 3D artifacts and turn-based combat powered by Three.js / Phaser.
- **🏯 Sect Social**: Sect wars, sect leaderboards, and sect events over Socket.io LAN multiplayer.
- **🗺️ Three-Realm World Map**: Mortal Realm / Tiannan / Scattered Star Seas / Great Jin / Netherworld / Demon Realm / Spirit Realm / Immortal Realm — unlock higher spirit-density training grounds as your cultivation grows.
- **⚡ Tribulation & Serendipity**: Breakthrough tribulation animations; random daily serendipity events (fortune / disaster / encounter).
- **📅 Plan Reminders & Daily Check-in**: Custom drinking plans and reminders, daily check-in rewards; supports system notifications and vibration feedback.
- **📰 News Feed**: Built-in news stream with Gemini AI summary analysis, synced in real time over Socket.io across the LAN.
- **🎵 Theme Song & Ambience**: Built-in theme song *"Bufan"* and region-specific ambient audio.
- **📱 Android Native**: Packaged with Capacitor for installation on Android devices.

### 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 + @tailwindcss/typography |
| State | Zustand |
| Routing | React Router 7 (HashRouter) |
| 3D / Games | Three.js + @react-three/fiber + @react-three/drei + Phaser 4 |
| Animation | Motion |
| Charts | Recharts |
| Realtime | Socket.io (Express server) |
| AI | Google GenAI (Gemini) |
| Mobile | Capacitor 8 (Android) |
| Persistence | localStorage + server-side JSON files |

### 🚀 Run Locally

**Prerequisites**: Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional, only for news AI analysis)
cp .env.example .env.local
# Edit .env.local and fill in your GEMINI_API_KEY

# 3. Start the dev server (Express + Vite middleware, port 3000)
npm run dev
# Open http://localhost:3000 in your browser
```

### 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server (`tsx server.ts`, port 3000) |
| `npm run build` | Build production bundle to `dist/` |
| `npm run start` | Run in production mode (`node server.js`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Clean `dist/` |

### 🤖 Build for Android

```bash
npm run build
npx cap sync android
# Open the android/ directory in Android Studio to build an APK
```

### ⚙️ Environment Variables

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key for news AI summary analysis (optional) |
| `APP_URL` | Hosted app URL, used for self-referential links / OAuth callbacks |
| `NEWS_FILE` | News data storage path, default `./data/news.json` |
| `LEADERBOARD_FILE` | Leaderboard data storage path |

### 📂 Project Structure

```
flowwater4/
├── server.ts              # Express + Vite + Socket.io server
├── capacitor.config.ts    # Capacitor (Android) config
├── src/
│   ├── App.tsx            # Root component / routing / bottom nav
│   ├── pages/             # Home / Adventure / Cave / Sect / Settings pages
│   ├── components/        # Alchemy / Talisman / HerbGarden / Dungeon / Tribulation
│   │   ├── three/         # Three.js 3D artifacts
│   │   └── worldmap/      # Three-realm world map
│   ├── store/             # Zustand slices (constants / puppet / companion ...)
│   ├── data/              # Story / narrative / emotional message data
│   ├── games/             # Phaser game logic
│   └── socket.ts          # Socket.io client lifecycle
└── android/               # Capacitor Android project
```

### 📖 Quick Start Guide

1. Log each drink on the Home page, choosing drink type and volume.
2. Cultivation auto-breaks through realms at thresholds, triggering tribulation animations.
3. Once cultivation is high enough, unlock higher spirit-density training grounds on the world map.
4. In your Cave, grow herbs, refine pills, and idle puppets to gather resources and artifacts.
5. Head to Adventures to explore dungeons and challenge mini-games like the Blood-Colored Forbidden Land for rare materials.
6. Join a sect, fight sect wars, and compete on leaderboards with fellow Daoists on the same LAN.

---

<p align="center">
  Stay hydrated, fellow Daoist 💧
</p>
