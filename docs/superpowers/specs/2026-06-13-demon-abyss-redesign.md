# 魔界入侵 → 魔渊系统重制 Design

## 起因 / Problem

当前 `魔界入侵` 实现存在 5 个核心问题：

1. **跟《凡人修仙传》原著严重脱节**——「界面之心」非原著概念；魔族出现节点（乱星海三魔、坠魔谷古魔、灵界魔族大军）也没有体现。
2. **触发机制粗暴**——`Math.random() < 0.03` 每 60 秒抽一次，强制弹窗打断玩家。
3. **重复且割裂**——`SectEvents.tsx` 已有「魔修来袭」事件、`sectSlice.globalEvent` 还有静态 `'魔修入侵'`，三个系统不相通。
4. **奖励 / 惩罚平淡**——胜利 1500 灵石+灵芝×2，失败 -3000 修为，跟其他副本无差。
5. **玩法单薄**——纯 Phaser 塔防，与已有的 `KunwuPhaserGame` / `MonsterHuntPhaserGame` 同质化。

## 目标 / Goal

把「魔界入侵」重做为符合原著语境的**主动型副本系列**——「**魔渊**」，包含限时开启的世界状态、剧情决策和 Phaser 战斗，跟现有副本/秘境历练融合而不是另起一摊。

## 决策摘要 / Decision Summary

| 维度 | 决策 |
|---|---|
| 角色定位 | **副本式 · 主动挑战**（去随机弹窗） |
| 触发方式 | **魔气潮汐**：每 72h 为一周期，每周期开放 24h 窗口 |
| 玩法核心 | **剧情节点 + Phaser 三节阶副本**（序章 / 中章 / 终章） |
| 难度分层 | **三个副本，按境界递进**（仅本次实现第 1 个） |
| 旧代码 | **删除重写**；保留 `SectEvents` 中的「魔修来袭」（性质不同） |
| 实施范围 | **MVP**：仅实现 `demon_abyss_qi`（筑基-结丹期）+ 潮汐调度器 + 三节阶副本框架；其余两副本预留接口 |

## 设计

### 总体定位与命名

| | 旧 | 新 |
|---|---|---|
| 名称 | 魔界入侵 | **魔渊**（系列） |
| 入口 | 全局弹窗 | 「秘境历练 Games」新卡片 + 顶部「魔气潮汐」状态条 |
| 失败惩罚 | -3000 修为，强制结束 | 仅当前节点奖励作废，已取得的可携带撤退；不掉修为 |
| 奖励 | 静态灵石+灵芝 | 阶梯奖励 + 魔晶（新材料）+ 魔功残页（解锁新功法） |
| 与原著挂钩 | 无 | 三副本对应乱星海三魔 / 坠魔谷古魔 / 灵界魔族 |

副本 ID 与对应原著主题：

| ID | 名称 | 解锁 levelIndex | 原著对应 | 主敌 |
|---|---|---|---|---|
| `demon_abyss_qi`   | **魔渊·乱星海** | 14（筑基初期） | 乱星海三大魔头 | 血煞老祖 / 天魔 / 狼煞 |
| `demon_abyss_core` | **魔渊·坠魔谷** | 18（结丹初期） | 韩立坠入坠魔谷遇古魔 | 古魔残魂 |
| `demon_abyss_void` | **魔渊·乱魔海** | 22（元婴初期） | 灵界前哨魔族探路 | 魔族先锋将军 |

### 魔气潮汐 / Demon Tide 调度

```
[关] 0-48h  →  [起势 buff] 48-72h  →  [开启] 0-24h（下个周期内）  →  [关] 24-48h  →  …
                      (世界 buff: 修为受 -10%)            (副本可进)
```

- 全局状态机：`closed` / `rising` / `open` / `closing`
- 周期总长 **72 小时**，开放窗口 **24 小时**
- 上线计算：`tideStartTime + 72h*N` 判断当前所处阶段
- 进入 `rising` 时：宗门系统广播 toast「魔气日盛，魔渊将启」
- 进入 `open` 时：Games 页卡片解锁 + 主页角标 + 红雾遮罩动画
- `closing` 还剩 1 小时：toast 倒计时
- 错过：等下个周期；不会强制弹窗

`storeKey = demonTide.startTime`（首次安装时 = `Date.now()`，之后只要保持周期一致即可）

### 副本三节阶结构

每个副本固定 3 节阶，每节阶分 **「剧情决策 → Phaser 战斗」** 两步：

```
节阶 1 (序章·入渊)
  ├─ 剧情节点池（4-6 个，随机抽 1）
  │   └─ 玩家选择 → 影响 Phaser 出怪组合
  └─ Phaser 战 1（小波 + 1 精英）
节阶 2 (中章·遇魔)
  ├─ 剧情节点池（4-6 个，随机抽 1）
  └─ Phaser 战 2（多波 + 2 精英）
节阶 3 (终章·斩魔)
  ├─ 剧情节点池（3 个，随机抽 1）
  └─ Phaser 战 3 · BOSS
```

每节阶结束后玩家可选「**继续深入**」（押宝下一节奖励）或「**结算撤退**」（带走当前已得）。BOSS 通过 = 完整结算。

### 数据模型

#### `demonTide`（在 `coreSlice` 或新建 `demonAbyssSlice`）

```ts
interface DemonTideState {
  startTime: number;          // 周期锚点
  cyclePeriodMs: number;      // 默认 72*3600*1000
  openWindowMs: number;       // 默认 24*3600*1000
  // 派生（不存）：phase / openSince / closeAt
}
```

#### `demonAbyss`（运行中状态）

```ts
interface DemonAbyssRunState {
  active: boolean;
  dungeonId: 'demon_abyss_qi' | 'demon_abyss_core' | 'demon_abyss_void' | null;
  stage: 0 | 1 | 2 | 3;       // 0 = 未开始, 1-3 = 节阶进行中, 3 = BOSS
  step: 'narrative' | 'battle' | 'rest' | 'done';
  currentNarrativeId: string | null;   // 抽到的节点 id
  narrativeChoiceId: string | null;     // 玩家选择，决定 Phaser 难度/出怪
  pendingRewards: {                     // 已得但未结算
    spiritStones: number;
    materials: Record<string, number>;
    skillPages: string[];               // 魔功残页
  };
  history: { stage: number; narrativeId: string; choiceId: string; won: boolean }[];
}
```

#### 副本静态定义（`src/data/demonAbyss.ts`）

```ts
interface DemonAbyssDungeonDef {
  id: string;
  name: string;
  unlockLevelIndex: number;
  bosses: { id: string; name: string; portrait: string }[];   // 多个，每次抽一
  stageBattles: [BattleDef, BattleDef, BattleDef];
  narrativePools: [NarrativeNode[], NarrativeNode[], NarrativeNode[]];
  baseRewards: { stones: number; materials: Record<string, number>; skillPage?: string }[]; // 每节阶
}

interface NarrativeNode {
  id: string;
  title: string;
  text: string;        // 含原著用语：青元宗 / 黄枫谷 / 七玄门 / 散修等
  choices: NarrativeChoice[];
}

interface NarrativeChoice {
  id: string;
  label: string;       // e.g. "联合附近散修"
  battleMod: {
    monsterCountDelta?: number;  // ±N 怪
    monsterPowerMul?: number;    // 0.8 ~ 1.3
    spawnAllies?: number;        // 友军 NPC 数量
    bonusReward?: { stones?: number; materials?: Record<string, number> };
  };
  flavor: string;      // 战斗前展示的一段叙述
}

interface BattleDef {
  totalWaves: number;     // 节阶 1: 3 波；节阶 2: 4 波；节阶 3: BOSS
  baseMonsterPower: number;
  hasBoss: boolean;
  bossId?: string;        // 节阶 3 用
}
```

### Phaser 场景：`DemonAbyssPhaser.ts`

不复用旧的 `DemonInvasionPhaser.ts`（删除）。新场景特性：

- **三道**（与旧版同）但视觉换皮：黑紫魔气 + 血色印记 + 魔纹地砖
- **怪种类**：
  - `demon_soldier` 普通魔兵
  - `demon_cultivator` 黑袍魔修（远程吐射魔气弹）
  - `blood_corpse` 血傀儡（boss 召唤物）
  - `boss_blood_ancestor` 血煞老祖（节阶 3）
- **友军 NPC**：节阶 2/3 中如剧情选择「联合散修」，会有 1-2 个友军 sprite 自动战斗
- **携带物**：玩家阵亡 ≠ 失败，可在节阶间选择撤退
- **战斗结算**：返回 `{ won: boolean; rewardSnapshot: ... }` 给上层
- 复用 `audio.ts` `sfx` / `playBgm`

### UI 组件

```
src/components/DemonAbyss/
├── DemonAbyssCard.tsx           ← Games 页卡片（替换原 demon_invasion 入口）
├── DemonAbyssEntry.tsx          ← 进入副本的 Modal（选副本 + 显示当前 buff）
├── DemonAbyssNarrative.tsx      ← 剧情节点 UI（卷轴 + 选项）
├── DemonAbyssBattleHost.tsx     ← Phaser 战斗容器（lazy 加载 DemonAbyssPhaser）
├── DemonAbyssRest.tsx           ← 节阶间结算/撤退选择
└── DemonTideBanner.tsx          ← 主页 / Games 页顶部的潮汐倒计时条
```

### 与现有系统的整合

| 系统 | 整合点 |
|---|---|
| `SectEvents` | 「魔修来袭」事件保留，定位为日常小事件（不变）；魔渊副本是史诗周事件 |
| `sectSlice.globalEvent` | 改用真实的 `demonTide` 状态来填充 `globalEvent.progress`，让「全宗共御」UI 起来 |
| 法宝 | `blood_armor`（血魔甲）在魔渊里得到额外 +20% 攻击 |
| 功法 | 新增「魔功残页」掉落 → 集齐 5 页解锁 `skill_demon_blood`（魔道功法，与正道功法二选一） |
| 道侣 | 节阶 2 的剧情节点「南宫婉相助」可让她以友军入场（前提：道侣关系） |
| 噬金虫 | 虫王（stage≥4）可在 BOSS 战吞噬一次大招 |
| 称号 | 通关 `demon_abyss_qi` 解锁称号「斩魔者」 |

### 旧代码处理

删除：

- `src/games/DemonInvasionPhaser.ts`
- `src/components/DemonInvasion.tsx`
- `src/components/DemonInvasionPhaserGame.tsx`
- `Home.tsx` 中 `<DemonInvasion />` 的挂载（line 22 import + line 792 使用）
- `sectSlice.demonInvasion` 状态（替换为 `demonAbyss` + `demonTide`）

保留：

- `SectEvents` 里 `i1: '魔修来袭'` 模板（性质不同，是宗门事件，不重叠）
- `globalEvent` 字段，但内容由新调度器驱动

### 失败 / 异常处理

| 情况 | 行为 |
|---|---|
| 潮汐未开启时点入口 | toast「魔气未起，下一波在 X 小时后」 |
| 战斗中刷新 / 关闭 | 副本进度保留到 store；下次进入时弹「继续 / 放弃」 |
| 节阶失败（hp 归零） | 不扣修为；丢失「pendingRewards」中节阶 N 之后的部分；前几节阶已得保留 |
| 跨周期未通关 | 潮汐关闭瞬间，强制结算当前 pendingRewards，下个周期重新开始 |
| 修为不足强行进 | 现有 Games 页 encounter modal 已处理（硬闯/隐匿/绕路） |

### MVP 实施范围

#### 包含
1. `demonTide` + `demonAbyss` store 数据 + actions
2. `DemonTideBanner` 顶部条 + Games 页卡片
3. `DemonAbyssEntry` 选择副本 + 进入流程
4. `DemonAbyssNarrative` 剧情节点 UI（基于现有 encounter 卷轴风）
5. `DemonAbyssBattleHost` + `DemonAbyssPhaser`（新 Phaser 场景，节阶 1 三波 → 节阶 2 四波 → 节阶 3 BOSS）
6. `DemonAbyssRest` 节阶间撤退/继续 UI
7. `demon_abyss_qi`（乱星海）副本数据：
   - 3 个 BOSS（血煞 / 天魔 / 狼煞，每次随机一个）
   - 节阶 1/2/3 各 4 个剧情节点
   - 每节阶 2-3 个选择 → 影响出怪
8. 新材料 `demon_crystal`（魔晶）+ 新道具 `demon_skill_page`（魔功残页 ×5 → 兑换 `skill_demon_blood`）
9. 删除旧魔界入侵代码
10. 称号「斩魔者」

#### 预留接口（不实施）
- `demon_abyss_core` / `demon_abyss_void` 数据文件留空 stub
- `boss` 抽取逻辑预留扩展点
- 魔功残页兑换 UI 预留入口

### 测试 / 验证策略

无现有测试套件（项目无 `npm test`）。验证方式：

1. `npx tsc --noEmit` 0 错误
2. `npm run dev` 跑通：
   - 等不到 72h，加调试按钮（仅 dev 模式）：「快进潮汐周期」
   - 走完一次 `demon_abyss_qi`（含 3 节阶 + 撤退场景）
   - 跨周期：模拟玩家进副本中潮汐关闭

### 文件变更清单

```
新增：
  src/data/demonAbyss.ts                          副本/剧情数据
  src/store/demonAbyssSlice.ts                    潮汐 + 运行状态
  src/games/DemonAbyssPhaser.ts                   新 Phaser 场景
  src/components/DemonAbyss/
    ├── DemonAbyssCard.tsx
    ├── DemonAbyssEntry.tsx
    ├── DemonAbyssNarrative.tsx
    ├── DemonAbyssBattleHost.tsx
    ├── DemonAbyssRest.tsx
    └── DemonTideBanner.tsx

修改：
  src/store/index.ts                              注册新 slice
  src/store/types.ts                              types：移除旧 DemonInvasion，加入 DemonTide / DemonAbyssRun
  src/store/sectSlice.ts                          删除 demonInvasion 字段，globalEvent 改由潮汐填充
  src/pages/Games.tsx                             加魔渊卡片（unlock + tide 状态联动）
  src/pages/Home.tsx                              移除 <DemonInvasion />，加 DemonTideBanner
  src/store/constants.ts                          加 demon_crystal / demon_skill_page 材料元数据

删除：
  src/games/DemonInvasionPhaser.ts
  src/components/DemonInvasion.tsx
  src/components/DemonInvasionPhaserGame.tsx
```

### 风险

1. **潮汐时间未走过周期** → 加 dev-only 快进按钮（gated by `import.meta.env.DEV`）
2. **三节阶 Phaser 重复感** → 每节阶背景色调、出怪组合、BGM 不同；节阶 3 慢动作镜头 + flash
3. **剧情节点池开发量** → MVP 每池只做 4 个节点；通关后会有重复但 24h 一次进可接受
4. **新材料/新功法** → `demon_crystal` 加入坊市价格表 = 0（不可买卖）；`skill_demon_blood` 数值参考 `skill_2 玄阴诀` 同档但更激进（吸血率 1.5x，回血上限封顶）

### 时间估算（实施单位：步骤）

| 步骤 | 估时 |
|---|---|
| 数据 / store 改造 | 1 |
| 删旧代码 + Home 整理 | 0.5 |
| Phaser 新场景（复用 60% 旧塔防代码思路） | 2 |
| 三节阶 UI + 流程编排 | 2 |
| 副本数据填充（节点池 + BOSS） | 1 |
| 联调 + tsc | 0.5 |

总计：~7 个实施步骤。

