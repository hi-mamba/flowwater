# 秘境历练 / 游戏系统 工作记录

**日期:** 2026-06-13
**作者:** Claude (glm-5.1)
**起点:** 用户问"当前是否包含游戏引擎、是否能吸引用户"
**终点:** 全 11 个游戏改造完成 + 排行榜 + 装备/功法接入 + 视觉重做

---

## 一、起始诊断

接手时项目 11 个"小游戏"全部用 React 状态机 + Tailwind div 实现，无 `<canvas>`、无引擎、无音效。`package.json` 中已装 `phaser@4.0.0` 但未被任何代码引用。

核心结论：游戏不能吸引用户。玩法朴素（2048/贪吃蛇/反应测试/翻牌/点击）、缺长线驱动（无排行榜、无每日内容、无 BOSS 周常）、奖励曲线粗糙、"杀人夺宝"惩罚开局即扣 50% 灵石属于反向劝退。

---

## 二、改造路线（按时间顺序，最终全部 ✅）

### 第一阶段：把 Phaser 引擎真正用起来

| # | 任务 | 关键文件 |
|---|---|---|
| 1 | 用 Phaser 重写昆吾山斗法（首个 ARPG demo：走位 + Boss 三种技能 + 闪避帧 + 阶段递进） | `src/games/KunwuPhaser.ts`、`src/components/KunwuPhaserGame.tsx` |
| 4 | 修 KunwuGame stale state bug（旧版 attack() 用 setState 之前的旧值判定 boss 死亡） | `src/pages/Games.tsx` |

### 第二阶段：长线驱动 / 玩法可对抗

| # | 任务 |
|---|---|
| 2 | 排行榜：服务端 + Games 详情页 Top10（socket emit `submit_score` / `get_leaderboard` / `leaderboard_updated`） |
| 3 | "杀人夺宝"改造为可对抗：删掉开局掷骰子，改为"硬闯/绕路/隐匿"三选一 + 装备/灵根检定 |

### 第三阶段：性能、持久化、音频

| # | 任务 |
|---|---|
| 5 | Phaser 模块懒加载：Games chunk 51KB → 42KB；phaser 1.6MB chunk 仅在用户点击 Phaser 游戏后加载 |
| 6 | Phaser 重写乱星海捕妖：横版射击，飞舟上下移动 + 空格发射飞剑 + boss 三击破，30s 倒计时 |
| 7 | 排行榜持久化：`./data/leaderboards.json` 原子写 + 2s 节流（最初想用 better-sqlite3，Windows 无 VS Build Tools 编译失败，改 JSON） |
| 8 | 昆吾山音效系统：`src/games/audio.ts` Web Audio 合成式 SFX（攻击/受击/闪避/击杀/警告/失败）+ 合成式 BGM pad |

### 第四阶段：扩散到大厅与老游戏

| # | 任务 |
|---|---|
| 9 | Games 大厅风云榜：服务端新增 `get_all_top` 事件，客户端 `HallTopBoard` 组件展示每个游戏的 Top1 |
| 10 | 老 React 游戏接入音效（2048 合成 / 贪吃蛇进食+撞死 / 炼丹收丹+炸炉 / 翻牌成功+错误） |
| 11 | 每日妖王机制（捕妖）：本地日期 hash 选 buff（妖丹增产/妖潮汹涌/妖王坐镇），结束面板预告明日 |

### 第五阶段：探索性内容 + 防滥用

| # | 任务 |
|---|---|
| 12 | Phaser 重写坠魔谷：爬塔式房间，每层 3 扇门（敌人/宝箱/陷阱/商人），保留撤退机制 |
| 13 | 排行榜防刷：每 socket 3s 冷却 + 每 IP 60s 内最多 30 次；单次分数 ≤ 10M 截断 |
| 14 | 卡片本地最高分徽章：localStorage 持久化 + 卡片角标显示 + 创下新纪录 toast |

### 第六阶段：用户抱怨"游戏太难看，太难用"——视觉重做

| # | 任务 |
|---|---|
| 15 | Phaser 重写魔界入侵 + 接入法宝/招数：塔防玩法（玩家守护"界面之心"，魔兵从右路三波涌来），4 个技能槽根据已学功法（青元剑诀/玄阴诀/五行诀/天雷双剑）解锁差异化招式，装备真正生效（古剑增伤、玄铁盾增血、八卦镜降速、掌天瓶被动治疗） |
| 16 | Games 大厅卡片视觉升级：emoji 大图 + 9 种主题色渐变（sky/emerald/rose/amber/indigo/red/cyan/blue/purple）+ 封印纹路（修为不足时） |
| 17 | 音效全局静音开关：localStorage 持久化 + 跨页面 subscribe |
| 18 | 详情页字体衬线统一（Noto Serif SC，已在 `index.css` 加载） |
| 19 | 老 React 游戏 UI 风格对齐：抽 `GameSceneHeader` 组件统一卡头 |
| 20 | 战前简报：进入游戏前展示装备/法宝/功法/最高分，未装备时可点链接跳洞府 |

### 第七阶段：bug 修复 + 细节加固

| # | 任务 |
|---|---|
| 21 | **修 Phaser wrapper 缩放重建 bug**（关键 fix）：原先 useEffect `[size.w, size.h]` 让 game 在每次 resize 时销毁重建，玩家进度归零。抽 `useMeasureContainer` hook，bootSize 锁定 + game 只创建一次 + resize 走 `gameRef.current.scale.resize` |
| 22 | 遭遇/死亡 modal 视觉重做：金色卷轴风（amber 渐变 + 顶/底金线）/ 血色封印风（red 渐变 + 45° 封印纹理） |
| 23 | 静音开关连动 ThemeSong：订阅 `audio.ts` 的 mute 事件，立即停《不凡》且不再被天劫/突破自动起播 |
| 24 | 简报引导跳转洞府：`useNavigate('/cave')` |
| 25 | 老游戏宽度对齐：TalismanDrawGame、SpiritMineGame 根 motion.div 加 `w-full` |
| 26 | 详情页主标题对 Phaser 游戏也显示：移除 PHASER_IDS 跳过逻辑，删除 wrapper 内重复 h2 |
| 27 | ref null 检查加固（review only：useMeasureContainer 已用 optional chain，4 个 wrapper 都做了 if (!ref.current) return） |
| 28 | 修 SpiritBeast JSX 类型遗留：React 19 把 JSX 命名空间移除，改用 `ReactElement` |

---

## 三、关键架构决策

### 引擎选择

- **Phaser 4** 而非 PixiJS / Three.js：社区文档全、Arcade Physics 够用、与 React 集成简单。
- 懒加载：通过 `lazy(() => import('./components/KunwuPhaserGame'))`，phaser ESM 1.6MB（gzip 374KB）chunk 仅在用户点击 Phaser 游戏后下载。

### Phaser ↔ React 边界

- React Wrapper（如 `KunwuPhaserGame.tsx`）负责：测量容器 → 计算 boot 尺寸 → 一次创建 Phaser.Game → unmount 时 destroy
- Scene 文件（如 `KunwuPhaser.ts`）负责：纯游戏逻辑，不 import 项目 store；所有外部数据通过 `KunwuOptions` 一次性传入
- 这条边界让 scene 文件可以独立测试 / 复用 / 重写，不被 React 状态污染

### 响应式但不重建

经验教训（任务 #21）：

```ts
// ❌ 错误版本（玩家旋转屏 → 进度归零）
useEffect(() => {
  gameRef.current = createGame({ width: size.w, height: size.h });
  return () => gameRef.current?.destroy();
}, [size.w, size.h]);

// ✅ 正确版本
useEffect(() => {
  if (gameRef.current || !bootSize) return;
  gameRef.current = createGame({ width: bootSize.w, height: bootSize.h });
  return () => gameRef.current?.destroy();
}, [bootSize]);

useEffect(() => {
  gameRef.current?.scale.resize(size.w, size.h);
}, [size.w, size.h]);
```

### 装备 / 功法接入

- 4 个 Phaser 战斗游戏（昆吾山 / 捕妖 / 坠魔谷 / 魔界入侵）都从 store 读 `equippedArtifacts` + `artifactLevels` + `skills` + `equippedSkills`
- 装备效果：`ancient_sword` 攻击 +(20+5*lv)%、`shield_artifact` 减伤、`artifact_2` 八卦镜降速、`artifact_1` 掌天瓶被动治疗
- 功法 → 招数：`skill_1/2/3/5` 各对应一个 SkillSlot（穿透剑气/吸血/AOE 小/AOE 大）

### 排行榜数据流

```
玩家 game over
  ↓ Phaser scene 调 onGameOver(score)
  ↓ React wrapper 调 React 父组件的 handleGameOver
  ↓ Games.tsx 调 submitScore(gameId, score)
  ↓ Socket.io emit 'submit_score'
  ↓ server.ts 限频检查 (3s/socket, 30/min/IP) + 截断 (≤10M)
  ↓ 写内存 leaderboards + scheduleSave (2s 节流写 JSON 文件)
  ↓ emit 'leaderboard_updated' 回客户端
  ↓ LeaderboardPanel/HallTopBoard 实时刷新
```

### 视觉风格统一

- **字体**：Noto Serif SC（中文衬线），通过 `index.css` 的 Google Fonts import 加载
- **配色**：每个游戏一个 theme（9 种），存于 `THEME_STYLES` 表，用于卡片渐变 / 边框 / 光晕 / 标题色
- **图标**：emoji 大图替代 lucide（视觉饱满度更高）
- **HP 条**：圆角 + 渐变（绿黄红） + 内高光 + 描边
- **数字**：衬线 + 黑描边 + 上飘 tween

---

## 四、文件清单

### 新增

```
src/games/
  audio.ts                    # 合成 SFX + pad BGM + 全局 mute
  highScores.ts               # localStorage 本地最高分
  useMeasureContainer.ts      # Phaser wrapper 通用响应式 hook
  KunwuPhaser.ts              # 昆吾山斗法（ARPG）
  MonsterHuntPhaser.ts        # 乱星海捕妖（横版射击 + 每日 buff）
  DevilfallPhaser.ts          # 坠魔谷（爬塔房间）
  DemonInvasionPhaser.ts      # 魔界入侵（塔防 + 招数槽）

src/components/
  KunwuPhaserGame.tsx         # React wrapper
  MonsterHuntPhaserGame.tsx
  DevilfallPhaserGame.tsx
  DemonInvasionPhaserGame.tsx
  LeaderboardPanel.tsx        # 详情榜 + HallTopBoard + submitScore

data/
  leaderboards.json           # 服务端排行榜持久化（gitignore）
```

### 修改

```
package.json                  # phaser@4 已装；本次未新增依赖
server.ts                     # 排行榜 socket 事件 + JSON 持久化 + 限频
src/index.css                 # 加载 Noto Serif SC
src/socket.ts                 # （未改，复用现有连接）
src/pages/Games.tsx           # 大厅卡片重做 + GameSceneHeader + BattleBriefing + 遭遇/死亡 modal 重做 + 接入老游戏音效
src/components/SpiritBeast.tsx # JSX.Element → ReactElement (任务 #28)
src/components/ThemeSong.tsx  # 订阅全局 mute
.gitignore                    # 加 data/
```

---

## 五、最终性能指标

```
dist/assets/Games-*.js              43 KB / gzip 13 KB
dist/assets/KunwuPhaserGame-*.js     9 KB / gzip  3.6 KB
dist/assets/DemonInvasionPhaserGame-*.js 14 KB / gzip 5.6 KB
dist/assets/index-*.js              601 KB / gzip 191 KB
dist/assets/phaser.esm-*.js       1,657 KB / gzip 374 KB  ← 懒加载
```

`tsc --noEmit` 0 错误；`vite build` 4 秒通过。

---

## 六、未做（建议下一步）

1. **PVP 实战**：server.ts 已有 `attack_player` 事件但只是简单胜率比拼。基于 Phaser 做 1v1 对战房间，让"多人"标签真正落地。
2. **昆吾山无尽模式**：当前打到 boss 死/玩家死结束。加无尽时间挑战版可粘住高分玩家。
3. **把剩余 React 老游戏（2048/贪吃蛇/炼丹/翻牌/灵石矿/符箓/血色禁地）也用 Phaser 重写**：当前价值递减，工作量大。
4. **每周妖王挑战**（任务 #29 放弃原因）：发现外部正在做 `src/store/demonAbyssSlice.ts` 的"魔渊副本"系统（72h 周期 + 24h 开放窗口 + 三节阶 + 剧情节点 + 称号），方向更系统化，撞车未做。可在魔渊系统稳定后再考虑全服 boss 周常作为补充。

---

## 七、给后来者的提示

- Phaser 4 的 ESM 没有 default export，必须 `import * as Phaser from 'phaser'`
- Phaser 4 把 group.children.each 改成 Set，要用 `getChildren().forEach`
- Phaser scene 想接收启动参数，`scene.add(key, Class, false)` + `scene.start(key, opts)`，配合 `init(data)` 接收
- React 19 + tsc：`JSX.Element` 不再可用，统一用 `import type { ReactElement } from 'react'`
- 加 wrapper 时务必搜一遍 `<h2>` 等内嵌标题，否则会与新 wrapper 标题双重显示
- 改完一定跑 `npx tsc --noEmit` + `npx vite build` 双验证；vite 用 esbuild 不做严格类型检查，单跑 vite 会漏 tsc 错误
