# 修仙世界地图重做：三界分层 · 青绿山水风

**日期**：2026-06-14
**目标**：把首页 `WorldMap` 重做成参考小说《凡人修仙传》原著与动画版的三界（人界/灵界/仙界）分层地图，修复当前不显示的 bug。

---

## 1. 背景与现状

当前 `src/components/WorldMap.tsx`：
- 单层平面图，把人界、灵界、飞升台堆在同一张图上
- 抽象点 + 路径线，缺乏小说世界观的层次感
- **bug**：在 `Home.tsx:799` 直接渲染，没有显式 z-index，被 `Home.tsx:857` 的 `absolute inset-0` 渐变背景覆盖；当 `dungeon.active === true` 时 `return null` 也会触发隐藏

地点稀疏，未对齐小说时间线（缺天南七派全景、星宫、灵流岛、风元大陆等）。

---

## 2. 设计目标

1. **按小说+动画版世界观**重做地图：三界分层（人界 → 灵界 → 仙界）
2. **顶部 Tab 切换三界**，未解锁的灰显并显示境界门槛
3. **每界 ~10 个地点**（仙界因小说"仅一窥仙路"语义，可少至 5-7 个）
4. **视觉风格**：青绿山水（动画版风格）+ 国风3D层次感
5. **首屏紧凑**：默认折叠为标题栏，点击展开成 50vh 地图
6. 修复当前不显示问题

---

## 3. 架构

```
src/components/WorldMap.tsx              ← 重写：容器 + 三界Tab + 折叠/展开
src/data/worldMap.ts                     ← 新增：三界地图数据（地点、坐标、解锁条件、小说描述）
src/components/worldmap/
  ├── MortalRealmMap.tsx                 ← 人界子图（青绿山水）
  ├── SpiritRealmMap.tsx                 ← 灵界子图（悬浮大陆 + 云海）
  └── ImmortalRealmMap.tsx               ← 仙界子图（云海仙宫，未飞升时灰雾遮蔽）
```

**拆分理由**：每界视觉差异极大（地形、配色、动效），共用一个组件需要太多 if/else 分支，可读性差且难维护；拆开后每界自治。

**共享接口**（每个子图组件统一 props）：
```ts
interface RealmMapProps {
  locations: WorldLocation[];        // 该界的地点列表
  currentLocationId?: string;         // 当前所在地点（高亮）
  unlockedLocationIds: Set<string>;  // 已解锁地点
  onLocationClick: (loc: WorldLocation) => void;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
}
```

---

## 4. 数据结构（`src/data/worldMap.ts`）

```ts
export type RealmId = 'mortal' | 'spirit' | 'immortal';

export interface WorldLocation {
  id: string;                          // 唯一 ID
  realm: RealmId;                      // 所属界
  name: string;                        // 显示名（篆体）
  x: number; y: number;                // 0-100 百分比坐标
  type: 'region' | 'sect' | 'dungeon' | 'city' | 'gate' | 'secret';
  iconKey: 'mountain' | 'castle' | 'skull' | 'gem' | 'star' | 'cloud' | 'waves' | 'sparkles' | 'zap';
  unlockLevelIndex: number;            // 解锁所需 levelIndex（CULTIVATION_LEVELS 索引）
  desc: string;                        // 描述（带小说典故）
  loreSnippet?: string;                // 小说片段引用（可选）
  dungeonId?: string;                  // 副本 ID（type==='dungeon' 时）
  regionStoreId?: string;              // 切换地区时写入 store.currentRegion 的值
}

export interface RealmMeta {
  id: RealmId;
  name: string;                        // '人界' / '灵界' / '仙界'
  unlockLevelIndex: number;            // 该界 Tab 整体解锁的 levelIndex
  unlockHint: string;                  // 灰显时显示的提示
  background: 'mortal-greenmountain' | 'spirit-cloudsea' | 'immortal-mistgold';
}
```

### 4.1 人界（10 地点，含 1 个飞升地）

| ID | 名称 | 类型 | 解锁 | 备注（小说典故） |
|---|---|---|---|---|
| `qi_xuan_men` | 七玄门 | sect | 0 (凡人) | 韩立入门处 |
| `huangfeng_valley` | 黄枫谷 | sect | 1 (炼气一层) | 天南七派之一，韩立筑基处 |
| `taisuan_hui` | 太南小会 | city | 4 (炼气四层) | 天南散修聚会 |
| `yanyue_zong` | 掩月宗 | sect | 14 (筑基初期) | 双修大宗，南宫婉所在 |
| `blood_forbidden` | 血色禁地 | dungeon | 14 | dungeonId='blood_forbidden' |
| `xingcheng` | 星城 | city | 14 | 乱星海最大坊市 |
| `void_hall` | 虚天殿 | dungeon | 18 (筑基后期) | 上古通天灵宝 |
| `xinggong` | 星宫 | sect | 22 (结丹初期) | 大晋第一大派 |
| `demon_valley` | 坠魔谷 | dungeon | 26 (元婴初期) | 上古魔渊 |
| `kunwu_ascension` | 昆吾山·飞升地 | gate | 38 (大乘初期) | 人界飞升点 |

### 4.2 灵界（10 地点）

`CULTIVATION_LEVELS` 索引参考：大乘初期=38、大乘中期=39、大乘后期=40、大乘巅峰=41、渡劫期=42。

| ID | 名称 | 类型 | 解锁 | 备注 |
|---|---|---|---|---|
| `fengyuan_human` | 风元大陆·人族区 | region | 38 | 人族飞升者聚居 |
| `fengyuan_lingzu` | 风元大陆·灵族城 | city | 38 | 灵族都市 |
| `leiming` | 雷鸣大陆 | region | 39 | 雷电灵气浓郁 |
| `baxiongling` | 霸熊岭 | region | 39 | 妖族圣地 |
| `lieyang_island` | 烈阳岛 | region | 40 | 火灵根圣地 |
| `xuanfeng_sea` | 玄风海 | region | 40 | 灵界海域 |
| `cuilin_island` | 翠灵岛 | secret | 40 | 韩立洞府所在 |
| `void_hall_spirit` | 灵界·虚天殿 | dungeon | 41 | 高阶虚天殿 |
| `changsheng_gate` | 长生界入口 | gate | 41 | 灵界至高之地 |
| `feisheng_arc` | 飞升古阵 | gate | 42 (渡劫期) | 飞升仙界 |

### 4.3 仙界（6 地点，符合"仙路缥缈"语义）

仙界 Tab 整体在 `levelIndex >= 42`（渡劫期）解锁；未飞升前 Tab 可点开但整界灰雾遮蔽，仅显示模糊轮廓。

| ID | 名称 | 类型 | 解锁 | 备注 |
|---|---|---|---|---|
| `qingming_gate` | 青冥圣界·入口 | gate | 42 | 仙界入口 |
| `zhenling_realm` | 真灵界 | region | 42 | 仙人初临之地 |
| `jitan_palace` | 极天宫 | city | 42 | 万仙朝拜处 |
| `xiangong_yunhai` | 仙宫云海 | region | 42 | 飘渺仙宫 |
| `hanli_ascend` | 韩立飞升点 | secret | 42 | 终点彩蛋 |
| `mystery_hidden` | ??? | secret | 42 | 神秘隐藏（点亮所有其他后显现） |

---

## 5. 视觉设计

### 5.1 人界（青绿山水）
- **底层**：SVG 山脉路径，仿《千里江山图》层叠（远山虚、近山实），渐变填充 `#5a8c5a → #2d4a2d`
- **中层**：浅色云雾缓动（`motion`，10s 循环漂移）
- **顶层**：地点标记 = 圆形玉印章（白底 + 朱砂边）+ 篆体地名（用 `font-family: 'STZhongsong', 'KaiTi'` 回退）
- **时辰**：复用现有 `timeOfDay`（晨曦/白昼/黄昏/深夜），改变天空色温

### 5.2 灵界（云海仙鹤）
- **底层**：深紫蓝径向渐变 + 星空粒子
- **中层**：每个大陆一座悬浮岛屿（带阴影投射的漂浮动画，y 轴 ±5px 缓动）
- **粒子**：从底向顶的灵气流光（绿/青/紫色）
- **彩蛋**：偶尔飞过的仙鹤剪影（CSS 动画，30s 一次）
- **标记**：六边形灵脉印记 + 描金边

### 5.3 仙界（云海仙宫，留白）
- **底层**：金色 + 米白渐变
- **中层**：宽阔云海（CSS blur 模糊圆形）+ 漂浮仙宫剪影
- **未飞升时**：整界灰雾遮蔽（`backdrop-filter: blur(8px)` + `opacity: 0.3`），仅见模糊轮廓
- **极简**：仅 6 个地点，留白占全图 60%+

---

## 6. 交互

1. **入口（折叠状态）**：在 Home `章节卡片` 之上显示一个高度 56px 的横条：
   ```
   [🗺 修仙地图]   当前：黄枫谷 · 天南                    [▼ 展开]
   ```
2. **展开后**：
   - 顶部三界 Tab：`人界 ▶ 灵界 ▶ 仙界`，未解锁灰显（`pointer-events-none` 但显示门槛）
   - 默认 Tab = 当前修为所属界（凡人~大乘=人界，渡劫=灵界，飞升真仙后=仙界）
   - 三界整体解锁阈值：人界 0；灵界 38（大乘初期）；仙界 42（渡劫期）
   - 主区域：50vh 子地图组件
3. **点击地点**：
   - `region`：弹气泡 → 确认传送 → `setCurrentRegion(loc.regionStoreId)` + 旋转消失动画
   - `dungeon`：弹气泡 → 确认进入 → `startDungeon(loc.dungeonId)`
   - `sect/city/secret`：弹气泡显示小说典故描述（不传送）
   - `gate`（飞升台）：等级达到时显示"飞升按钮"，触发 `ascend()`
4. **未解锁地点**：灰显锁图标 + tooltip 显示 `需 ${CULTIVATION_LEVELS[unlockLevelIndex].name}`
5. **副本进行中**（`dungeon.active`）：显示"副本进行中，无法切换"提示，但**不再隐藏整张地图**（修复原 bug）

---

## 7. 与现有 store 的接入

- 读：`levelIndex`, `currentRegion`, `dungeon.active`
- 写：`setCurrentRegion`, `startDungeon`, `ascend`（已有）
- **不新增 store 字段**：解锁状态由 `levelIndex` 派生，避免脏状态

`regionStoreId` 映射（旧 `REGIONS` 表沿用）：
- `fengyuan_human/lingzu/leiming/...` → `'灵界'`
- `qingming_gate/zhenling_realm/...` → `'仙界'`（需在 `REGIONS` 表确认存在 `'仙界'` 项，已存在见 `constants.ts:9`）
- 人界各 region → 对应 `'天南'/'乱星海'/'大晋'/'阴冥之地'`

---

## 8. 显示问题修复

**根因**：
- `Home.tsx:799` 渲染 `<WorldMap />` 时未包 `relative z-10`
- 第 857 行 `<div class="absolute inset-0 opacity-40 ... bg-gradient-to-b">` 在同一栈上下文叠加
- `dungeon.active` 时 `return null` 隐藏整图

**修复**：
1. 新 `WorldMap` 容器外层加 `className="relative z-10 w-full"`
2. `dungeon.active` 时**不隐藏**，改为在地图上覆盖一层"副本进行中"提示，保留地图可视
3. 折叠态高度仅 56px，展开态 50vh，避免与下方章节卡片冲突

---

## 9. 文件改动清单

| 文件 | 操作 |
|---|---|
| `src/data/worldMap.ts` | 新增（地点数据 + RealmMeta） |
| `src/components/WorldMap.tsx` | 重写（容器 + Tab + 折叠展开） |
| `src/components/worldmap/MortalRealmMap.tsx` | 新增 |
| `src/components/worldmap/SpiritRealmMap.tsx` | 新增 |
| `src/components/worldmap/ImmortalRealmMap.tsx` | 新增 |
| `src/pages/Home.tsx` | 微调：`<WorldMap />` 包裹层加 `relative z-10` |

---

## 10. 测试 / 验收

- [ ] 凡人态（levelIndex=0）：人界 Tab 默认显示，灵界/仙界灰显并显示"需筑基初期/渡劫期"
- [ ] 筑基期：人界全部地点解锁，灵界仍灰显
- [ ] 大乘巅峰：灵界 Tab 解锁，可切换并传送至风元大陆等
- [ ] 仙界 Tab 在飞升后显示完整地图；之前显示灰雾遮蔽
- [ ] 折叠态高度 56px，展开后 50vh
- [ ] 副本进行中：地图依然可见，但传送/切换被禁用
- [ ] 切换 Tab 不触发 `setCurrentRegion`（仅查看），点击地点确认后才传送
- [ ] 当前 region 在所属 Tab 中以脉冲圈高亮

---

## 11. YAGNI（已剔除）

- ❌ 缩放/平移：地图固定大小即可，避免移动端手势冲突
- ❌ 多人位置在地图上叠加：与"大千世界"按钮分工
- ❌ 路径动画：保留现有的简单虚线即可
- ❌ 仙界自动隐藏地点解谜系统：仅保留 1 个 `???` 占位符，未来扩展

---

## 12. 不在范围内

- 不改 `REGIONS` / `DUNGEONS` 常量数据
- 不改 `setCurrentRegion` / `startDungeon` 等 action
- 不动 `Home.tsx` 中除 `<WorldMap />` 包裹外的其他 UI
