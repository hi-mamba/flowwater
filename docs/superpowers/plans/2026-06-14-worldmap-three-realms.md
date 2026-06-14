# 三界世界地图重做实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页 `WorldMap` 重做成三界（人界/灵界/仙界）分层 Tab 地图，参考小说《凡人修仙传》原著与动画版世界观，青绿山水风，并修复当前不显示的 bug。

**Architecture:** 按界拆 4 个文件 — `worldMap.ts`（数据）+ 容器 `WorldMap.tsx`（Tab/折叠/展开/状态/弹窗）+ 3 个子图 `MortalRealmMap` / `SpiritRealmMap` / `ImmortalRealmMap`。容器用 `RealmMapProps` 统一接口；子图只负责绘图，无副作用。解锁状态由 `levelIndex` 派生，不新增 store 字段。

**Tech Stack:** React 19, TypeScript, Tailwind CSS, motion (framer-motion), lucide-react, Zustand store。无 test runner，验证靠 `npm run lint`（tsc --noEmit）+ `npm run build` + 手工浏览。

**项目无单元测试框架**：`package.json` 的 `lint` 脚本 = `tsc --noEmit`。每个任务完成后跑 `npm run lint` 做类型检查；UI 验证记在文末"手工验证"步骤。

**Spec 参考:** `docs/superpowers/specs/2026-06-14-worldmap-three-realms-design.md`

---

## 文件结构

| 路径 | 操作 | 职责 |
|---|---|---|
| `src/data/worldMap.ts` | 新建 | 三界元数据 + 26 个地点定义（10/10/6） |
| `src/components/worldmap/types.ts` | 新建 | 共享 `RealmMapProps` 接口 + 图标键 → 组件映射 |
| `src/components/worldmap/MortalRealmMap.tsx` | 新建 | 人界青绿山水视觉 + 地点渲染 |
| `src/components/worldmap/SpiritRealmMap.tsx` | 新建 | 灵界悬浮岛屿 + 灵气粒子 |
| `src/components/worldmap/ImmortalRealmMap.tsx` | 新建 | 仙界云海仙宫 + 灰雾遮蔽 |
| `src/components/WorldMap.tsx` | 重写 | 容器：Tab + 折叠/展开 + 弹窗 + 副本中提示 + 接 store |
| `src/pages/Home.tsx` | 微调 | `<WorldMap />` 外层包 `relative z-10` |

---

## Task 1：新建地图数据 `src/data/worldMap.ts`

**Files:**
- Create: `src/data/worldMap.ts`

- [ ] **Step 1: 创建数据文件**

```typescript
// src/data/worldMap.ts
// 三界世界地图数据。参考《凡人修仙传》原著与动画版。
// 解锁阈值参考 src/store/constants.ts CULTIVATION_LEVELS 的索引：
//   0=凡人  1=炼气一层 ... 14=筑基初期  18=筑基后期  22=结丹初期
//   26=元婴初期 38=大乘初期 41=大乘巅峰 42=渡劫期

export type RealmId = 'mortal' | 'spirit' | 'immortal';
export type LocationType = 'region' | 'sect' | 'dungeon' | 'city' | 'gate' | 'secret';
export type IconKey = 'mountain' | 'castle' | 'skull' | 'gem' | 'star' | 'cloud' | 'waves' | 'sparkles' | 'zap';

export interface WorldLocation {
  id: string;
  realm: RealmId;
  name: string;
  x: number;                  // 0-100 百分比
  y: number;                  // 0-100 百分比
  type: LocationType;
  iconKey: IconKey;
  unlockLevelIndex: number;   // 解锁所需 levelIndex
  desc: string;               // 一句话描述
  loreSnippet?: string;       // 小说典故引用
  dungeonId?: string;         // 副本ID（type==='dungeon' 时）
  regionStoreId?: string;     // 切换地区时写入 store.currentRegion
}

export interface RealmMeta {
  id: RealmId;
  name: string;
  unlockLevelIndex: number;   // 整界 Tab 解锁阈值
  unlockHintLevel: string;    // 灰显时显示的境界名（用于提示）
  accentColor: string;        // Tab 高亮主色
}

export const REALM_META: Record<RealmId, RealmMeta> = {
  mortal:   { id: 'mortal',   name: '人界', unlockLevelIndex: 0,  unlockHintLevel: '凡人',     accentColor: '#34d399' },
  spirit:   { id: 'spirit',   name: '灵界', unlockLevelIndex: 38, unlockHintLevel: '大乘初期', accentColor: '#818cf8' },
  immortal: { id: 'immortal', name: '仙界', unlockLevelIndex: 42, unlockHintLevel: '渡劫期',   accentColor: '#facc15' },
};

export const REALMS: RealmMeta[] = [REALM_META.mortal, REALM_META.spirit, REALM_META.immortal];

// ---------- 人界（10 地点）----------
const MORTAL_LOCATIONS: WorldLocation[] = [
  { id: 'qi_xuan_men',      realm: 'mortal', name: '七玄门',         x: 50, y: 88, type: 'sect',    iconKey: 'castle',   unlockLevelIndex: 0,  desc: '韩立入门处，凡人界小宗门',           regionStoreId: '凡人界' },
  { id: 'huangfeng_valley', realm: 'mortal', name: '黄枫谷',         x: 32, y: 70, type: 'sect',    iconKey: 'castle',   unlockLevelIndex: 1,  desc: '天南七派之一，韩立筑基处',           loreSnippet: '"七派会武，黄枫居首"', regionStoreId: '天南' },
  { id: 'taisuan_hui',      realm: 'mortal', name: '太南小会',       x: 42, y: 65, type: 'city',    iconKey: 'castle',   unlockLevelIndex: 4,  desc: '天南散修聚会之地' },
  { id: 'yanyue_zong',      realm: 'mortal', name: '掩月宗',         x: 50, y: 60, type: 'sect',    iconKey: 'castle',   unlockLevelIndex: 14, desc: '双修大宗，南宫婉所在' },
  { id: 'blood_forbidden',  realm: 'mortal', name: '血色禁地',       x: 22, y: 58, type: 'dungeon', iconKey: 'skull',    unlockLevelIndex: 14, desc: '筑基期试炼之地，血色弥漫', dungeonId: 'blood_forbidden' },
  { id: 'xingcheng',        realm: 'mortal', name: '星城',           x: 72, y: 38, type: 'city',    iconKey: 'star',     unlockLevelIndex: 14, desc: '乱星海最大坊市', regionStoreId: '乱星海' },
  { id: 'void_hall',        realm: 'mortal', name: '虚天殿',         x: 80, y: 28, type: 'dungeon', iconKey: 'gem',      unlockLevelIndex: 18, desc: '上古通天灵宝遗留之地', dungeonId: 'void_hall' },
  { id: 'xinggong',         realm: 'mortal', name: '星宫',           x: 55, y: 35, type: 'sect',    iconKey: 'castle',   unlockLevelIndex: 22, desc: '大晋第一大派，化神老怪云集', regionStoreId: '大晋' },
  { id: 'demon_valley',     realm: 'mortal', name: '坠魔谷',         x: 14, y: 32, type: 'dungeon', iconKey: 'skull',    unlockLevelIndex: 26, desc: '上古魔渊，元婴亦难全身而退', dungeonId: 'demon_valley', regionStoreId: '阴冥之地' },
  { id: 'kunwu_ascension',  realm: 'mortal', name: '昆吾山·飞升地', x: 50, y: 12, type: 'gate',    iconKey: 'mountain', unlockLevelIndex: 38, desc: '人界飞升点，传说有玄天之宝镇压', dungeonId: 'kunwu_mountain' },
];

// ---------- 灵界（10 地点）----------
const SPIRIT_LOCATIONS: WorldLocation[] = [
  { id: 'fengyuan_human',   realm: 'spirit', name: '风元大陆·人族区', x: 38, y: 70, type: 'region', iconKey: 'mountain',  unlockLevelIndex: 38, desc: '人族飞升者聚居之地', regionStoreId: '灵界' },
  { id: 'fengyuan_lingzu',  realm: 'spirit', name: '风元大陆·灵族城', x: 52, y: 65, type: 'city',   iconKey: 'castle',    unlockLevelIndex: 38, desc: '灵族都市，灵气如海' },
  { id: 'leiming',          realm: 'spirit', name: '雷鸣大陆',       x: 25, y: 50, type: 'region', iconKey: 'sparkles',  unlockLevelIndex: 39, desc: '雷电交织之地，雷属性圣地' },
  { id: 'baxiongling',      realm: 'spirit', name: '霸熊岭',         x: 70, y: 55, type: 'region', iconKey: 'mountain',  unlockLevelIndex: 39, desc: '妖族圣地，霸熊一族盘踞' },
  { id: 'lieyang_island',   realm: 'spirit', name: '烈阳岛',         x: 78, y: 40, type: 'region', iconKey: 'sparkles',  unlockLevelIndex: 40, desc: '海外火属性灵脉之地' },
  { id: 'xuanfeng_sea',     realm: 'spirit', name: '玄风海',         x: 18, y: 38, type: 'region', iconKey: 'waves',     unlockLevelIndex: 40, desc: '灵界海域，狂风骤雨' },
  { id: 'cuilin_island',    realm: 'spirit', name: '翠灵岛',         x: 60, y: 48, type: 'secret', iconKey: 'gem',       unlockLevelIndex: 40, desc: '韩立洞府所在，翠光环绕' },
  { id: 'void_hall_spirit', realm: 'spirit', name: '灵界·虚天殿',   x: 45, y: 30, type: 'dungeon',iconKey: 'gem',       unlockLevelIndex: 41, desc: '高阶虚天殿，玄天之宝沉眠', dungeonId: 'void_hall' },
  { id: 'changsheng_gate',  realm: 'spirit', name: '长生界入口',     x: 50, y: 18, type: 'gate',   iconKey: 'cloud',     unlockLevelIndex: 41, desc: '灵界至高之地，渡过大乘劫者方可一窥仙路' },
  { id: 'feisheng_arc',     realm: 'spirit', name: '飞升古阵',       x: 50, y: 8,  type: 'gate',   iconKey: 'zap',       unlockLevelIndex: 42, desc: '飞升仙界的古阵' },
];

// ---------- 仙界（6 地点）----------
const IMMORTAL_LOCATIONS: WorldLocation[] = [
  { id: 'qingming_gate',    realm: 'immortal', name: '青冥圣界·入口', x: 50, y: 80, type: 'gate',   iconKey: 'zap',      unlockLevelIndex: 42, desc: '仙界入口，金光万丈', regionStoreId: '仙界' },
  { id: 'zhenling_realm',   realm: 'immortal', name: '真灵界',       x: 30, y: 60, type: 'region', iconKey: 'cloud',    unlockLevelIndex: 42, desc: '仙人初临之地' },
  { id: 'jitan_palace',     realm: 'immortal', name: '极天宫',       x: 50, y: 45, type: 'city',   iconKey: 'castle',   unlockLevelIndex: 42, desc: '万仙朝拜处，仙人居所' },
  { id: 'xiangong_yunhai',  realm: 'immortal', name: '仙宫云海',     x: 70, y: 55, type: 'region', iconKey: 'cloud',    unlockLevelIndex: 42, desc: '飘渺仙宫，云海茫茫' },
  { id: 'hanli_ascend',     realm: 'immortal', name: '韩立飞升点',   x: 40, y: 25, type: 'secret', iconKey: 'sparkles', unlockLevelIndex: 42, desc: '凡人修仙的终点彩蛋' },
  { id: 'mystery_hidden',   realm: 'immortal', name: '???',          x: 65, y: 30, type: 'secret', iconKey: 'star',     unlockLevelIndex: 42, desc: '神秘隐藏之地，未来开启' },
];

export const ALL_LOCATIONS: WorldLocation[] = [
  ...MORTAL_LOCATIONS,
  ...SPIRIT_LOCATIONS,
  ...IMMORTAL_LOCATIONS,
];

export function getLocationsByRealm(realm: RealmId): WorldLocation[] {
  return ALL_LOCATIONS.filter(l => l.realm === realm);
}

/** 由 levelIndex 推断该用户当前应处的界（用于默认 Tab） */
export function inferDefaultRealm(levelIndex: number): RealmId {
  if (levelIndex >= REALM_META.immortal.unlockLevelIndex) return 'immortal';
  if (levelIndex >= REALM_META.spirit.unlockLevelIndex) return 'spirit';
  return 'mortal';
}

/** 当前 store.currentRegion 字符串属于哪个界 */
export function realmOfRegion(region: string): RealmId {
  if (region === '灵界') return 'spirit';
  if (region === '仙界') return 'immortal';
  return 'mortal';
}
```

- [ ] **Step 2: 验证 TypeScript 类型**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: 无错误（仅可能有项目原有警告）

- [ ] **Step 3: 提交**

```bash
git add src/data/worldMap.ts
git commit -m "feat(map): add three-realm world map data (人界/灵界/仙界)

按小说《凡人修仙传》与动画版世界观，新增 26 个地点（人界10/灵界10/仙界6）
解锁阈值由 CULTIVATION_LEVELS 索引派生。

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2：新建子图共享接口 `src/components/worldmap/types.ts`

**Files:**
- Create: `src/components/worldmap/types.ts`

- [ ] **Step 1: 创建接口文件**

```typescript
// src/components/worldmap/types.ts
import type { WorldLocation } from '../../data/worldMap';
import { Mountain, Castle, Skull, Gem, Star, Cloud, Waves, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import type { IconKey } from '../../data/worldMap';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface RealmMapProps {
  locations: WorldLocation[];
  currentLocationId?: string;
  unlockedLocationIds: Set<string>;
  onLocationClick: (loc: WorldLocation) => void;
  timeOfDay: TimeOfDay;
}

export const ICON_MAP: Record<IconKey, LucideIcon> = {
  mountain: Mountain,
  castle:   Castle,
  skull:    Skull,
  gem:      Gem,
  star:     Star,
  cloud:    Cloud,
  waves:    Waves,
  sparkles: Sparkles,
  zap:      Zap,
};
```

- [ ] **Step 2: 类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/worldmap/types.ts
git commit -m "feat(map): add shared types and icon map for realm sub-maps

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3：人界子图 `MortalRealmMap.tsx`（青绿山水）

**Files:**
- Create: `src/components/worldmap/MortalRealmMap.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// src/components/worldmap/MortalRealmMap.tsx
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

const SKY_GRADIENT: Record<RealmMapProps['timeOfDay'], string> = {
  dawn:  'from-orange-200/30 via-emerald-200/15 to-emerald-900/40',
  day:   'from-sky-200/25 via-emerald-200/10 to-emerald-900/40',
  dusk:  'from-rose-300/30 via-amber-200/15 to-emerald-950/45',
  night: 'from-slate-700/40 via-emerald-900/25 to-emerald-950/55',
};

export default function MortalRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick, timeOfDay,
}: RealmMapProps) {
  const sky = SKY_GRADIENT[timeOfDay];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 天空 */}
      <div className={`absolute inset-0 bg-gradient-to-b ${sky} transition-colors duration-1000`} />

      {/* 远山（仿千里江山图层叠） */}
      <svg className="absolute inset-x-0 bottom-0 w-full h-[70%]" viewBox="0 0 100 70" preserveAspectRatio="none">
        <defs>
          <linearGradient id="m-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a6c4d" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1f3a2a" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="m-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f8c5e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a2f20" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="m-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ba874" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0e1f14" />
          </linearGradient>
        </defs>
        {/* 远山 */}
        <path d="M0,40 L8,30 L18,38 L28,22 L38,32 L48,18 L58,28 L68,20 L78,32 L88,24 L100,34 L100,70 L0,70 Z" fill="url(#m-far)" />
        {/* 中山 */}
        <path d="M0,50 L10,40 L22,46 L32,32 L44,42 L54,30 L66,38 L76,28 L86,40 L100,34 L100,70 L0,70 Z" fill="url(#m-mid)" />
        {/* 近山 */}
        <path d="M0,62 L12,52 L24,58 L36,48 L48,55 L60,46 L72,54 L84,46 L100,56 L100,70 L0,70 Z" fill="url(#m-near)" />
      </svg>

      {/* 缓动云雾 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute rounded-full bg-white/15 blur-2xl pointer-events-none"
          style={{ width: `${60 + i * 20}px`, height: `${20 + i * 8}px`, top: `${20 + i * 12}%` }}
          animate={{ x: ['-10%', '110%'] }}
          transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear', delay: i * 5 }}
        />
      ))}

      {/* 地点标记 */}
      {locations.map(loc => {
        const Icon = ICON_MAP[loc.iconKey];
        const unlocked = unlockedLocationIds.has(loc.id);
        const isCurrent = currentLocationId === loc.id;

        return (
          <motion.button
            key={loc.id}
            onClick={() => onLocationClick(loc)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.5 }}
            whileHover={{ scale: unlocked ? 1.15 : 1 }}
            whileTap={{ scale: unlocked ? 0.95 : 1 }}
          >
            {/* 当前位置脉冲圈 */}
            {isCurrent && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-amber-300/70"
                style={{ width: 48, height: 48, left: -10, top: -10 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            {/* 玉印章 */}
            <div
              className={`relative w-7 h-7 flex items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all ${
                unlocked
                  ? 'bg-amber-50/90 border-rose-700/70 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                  : 'bg-slate-800/60 border-slate-600/50 opacity-50'
              }`}
            >
              {unlocked
                ? <Icon size={14} className="text-rose-800" />
                : <Lock size={12} className="text-slate-400" />}
            </div>
            {/* 篆体地名 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap">
              <span
                className={`text-[10px] px-2 py-0.5 rounded ${
                  unlocked
                    ? 'bg-stone-100/85 text-stone-900 font-bold shadow-sm'
                    : 'bg-slate-900/70 text-slate-500'
                }`}
                style={{ fontFamily: '"STZhongsong", "KaiTi", "STKaiti", serif' }}
              >
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/worldmap/MortalRealmMap.tsx
git commit -m "feat(map): add 人界 sub-map (青绿山水风)

千里江山图层叠山形 SVG + 缓动云雾 + 玉印章地点 + 篆体地名

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4：灵界子图 `SpiritRealmMap.tsx`（云海仙鹤）

**Files:**
- Create: `src/components/worldmap/SpiritRealmMap.tsx`

- [ ] **Step 1: 创建组件**

```tsx
// src/components/worldmap/SpiritRealmMap.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

export default function SpiritRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick,
}: RealmMapProps) {
  // 灵气粒子
  const particles = useMemo(
    () => Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
      color: ['#34d399', '#22d3ee', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 4)],
    })),
    []
  );

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 深紫蓝径向背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950/80 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(129,140,248,0.18),transparent_60%)]" />

      {/* 星空 */}
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
          }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* 灵气粒子（底→顶） */}
      {particles.map(p => (
        <motion.div
          key={`p-${p.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
          animate={{ y: ['105%', '-5%'], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
        />
      ))}

      {/* 仙鹤剪影（30s 一次） */}
      <motion.div
        className="absolute text-2xl pointer-events-none"
        style={{ top: '15%' }}
        animate={{ x: ['-10%', '110%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 5 }}
      >
        🦤
      </motion.div>

      {/* 地点（六边形灵脉印记） */}
      {locations.map(loc => {
        const Icon = ICON_MAP[loc.iconKey];
        const unlocked = unlockedLocationIds.has(loc.id);
        const isCurrent = currentLocationId === loc.id;

        return (
          <motion.button
            key={loc.id}
            onClick={() => onLocationClick(loc)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: unlocked ? [0, -4, 0] : 0,
            }}
            transition={{
              scale: { delay: Math.random() * 0.5 },
              y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: unlocked ? 1.15 : 1 }}
            whileTap={{ scale: unlocked ? 0.95 : 1 }}
          >
            {isCurrent && (
              <motion.span
                className="absolute rounded-full border-2 border-indigo-300/70"
                style={{ width: 56, height: 56, left: -14, top: -14 }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            {/* 六边形 */}
            <div
              className={`relative w-7 h-7 flex items-center justify-center transition-all ${unlocked ? 'opacity-100' : 'opacity-50'}`}
              style={{
                clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                background: unlocked
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(34,211,238,0.55))'
                  : 'rgba(100,116,139,0.3)',
                border: 'none',
                boxShadow: unlocked ? '0 0 10px rgba(168,85,247,0.5)' : 'none',
              }}
            >
              {unlocked
                ? <Icon size={13} className="text-amber-200" />
                : <Lock size={12} className="text-slate-400" />}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                unlocked
                  ? 'bg-indigo-950/85 text-indigo-100 border border-indigo-400/40 font-medium'
                  : 'bg-slate-900/70 text-slate-500'
              }`}>
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/worldmap/SpiritRealmMap.tsx
git commit -m "feat(map): add 灵界 sub-map (云海仙鹤 + 灵气粒子)

深紫蓝径向背景 + 星空 + 流光粒子 + 漂浮六边形灵脉印记

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5：仙界子图 `ImmortalRealmMap.tsx`（云海仙宫 + 灰雾遮蔽）

**Files:**
- Create: `src/components/worldmap/ImmortalRealmMap.tsx`

仙界增加一个 prop `mistOverlay`：当用户尚未到渡劫期时，整界灰雾遮蔽。

- [ ] **Step 1: 创建组件**

```tsx
// src/components/worldmap/ImmortalRealmMap.tsx
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

interface ImmortalRealmMapProps extends RealmMapProps {
  mistOverlay?: boolean;  // 未飞升时，整界灰雾遮蔽
}

export default function ImmortalRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick, mistOverlay = false,
}: ImmortalRealmMapProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 金色 + 米白渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-amber-50/20 to-amber-200/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(252,211,77,0.35),transparent_70%)]" />

      {/* 云海层（多层模糊圆） */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`yun-${i}`}
          className="absolute rounded-full bg-white/40 blur-3xl pointer-events-none"
          style={{
            width: `${100 + i * 30}px`,
            height: `${30 + i * 12}px`,
            top: `${30 + i * 9}%`,
            left: `${(i * 18) % 90}%`,
          }}
          animate={{ x: ['0%', '15%', '0%'], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 18 + i * 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* 漂浮仙宫剪影 */}
      <svg className="absolute inset-x-0 top-[20%] w-full h-[40%] opacity-25 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M20,30 L22,18 L24,22 L26,15 L28,22 L30,18 L32,30 Z M55,32 L57,15 L60,20 L63,12 L66,20 L69,15 L71,32 Z M80,30 L82,20 L84,24 L86,16 L88,24 L90,20 L92,30 Z" fill="#854d0e" />
      </svg>

      {/* 地点 */}
      {locations.map(loc => {
        const Icon = ICON_MAP[loc.iconKey];
        const unlocked = unlockedLocationIds.has(loc.id);
        const isCurrent = currentLocationId === loc.id;

        return (
          <motion.button
            key={loc.id}
            onClick={() => onLocationClick(loc)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.5 }}
            whileHover={{ scale: unlocked && !mistOverlay ? 1.15 : 1 }}
            whileTap={{ scale: unlocked && !mistOverlay ? 0.95 : 1 }}
          >
            {isCurrent && (
              <motion.span
                className="absolute rounded-full border-2 border-amber-400/80"
                style={{ width: 56, height: 56, left: -14, top: -14 }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <div
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-200/95 to-amber-400/85 border-amber-700/70 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'bg-slate-700/40 border-slate-500/40 opacity-50'
              }`}
              style={{ transform: 'rotate(45deg)' }}
            >
              <div style={{ transform: 'rotate(-45deg)' }}>
                {unlocked
                  ? <Icon size={14} className="text-amber-900" />
                  : <Lock size={12} className="text-slate-400" />}
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 whitespace-nowrap">
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                unlocked
                  ? 'bg-amber-50/95 text-amber-900 font-bold border border-amber-700/40'
                  : 'bg-slate-900/70 text-slate-500'
              }`}>
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* 灰雾遮蔽（未飞升时） */}
      {mistOverlay && (
        <div className="absolute inset-0 backdrop-blur-md bg-slate-100/40 flex items-center justify-center pointer-events-auto">
          <div className="text-center px-6">
            <p className="text-sm text-slate-700 font-bold tracking-widest mb-2">仙凡之隔</p>
            <p className="text-xs text-slate-600">渡劫飞升后方可一窥仙界</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/worldmap/ImmortalRealmMap.tsx
git commit -m "feat(map): add 仙界 sub-map (云海仙宫 + 灰雾遮蔽)

金色云海 + 漂浮仙宫剪影 + 菱形地点标记
mistOverlay prop: 未飞升时整界灰雾遮蔽

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6：重写容器 `WorldMap.tsx`（Tab + 折叠 + 弹窗）

**Files:**
- Modify: `src/components/WorldMap.tsx` (完全重写)

- [ ] **Step 1: 重写文件**

```tsx
// src/components/WorldMap.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, ChevronDown, ChevronUp, Lock, X } from 'lucide-react';
import { useStore, CULTIVATION_LEVELS } from '../store';
import {
  REALMS, REALM_META, ALL_LOCATIONS, getLocationsByRealm,
  inferDefaultRealm, realmOfRegion,
  type RealmId, type WorldLocation,
} from '../data/worldMap';
import MortalRealmMap from './worldmap/MortalRealmMap';
import SpiritRealmMap from './worldmap/SpiritRealmMap';
import ImmortalRealmMap from './worldmap/ImmortalRealmMap';
import type { TimeOfDay } from './worldmap/types';

export default function WorldMap() {
  const { levelIndex, currentRegion, setCurrentRegion, startDungeon, dungeon } = useStore();

  const [expanded, setExpanded] = useState(false);
  const [activeRealm, setActiveRealm] = useState<RealmId>(() => inferDefaultRealm(levelIndex));
  const [selected, setSelected] = useState<WorldLocation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  // 初次或修为变化时，未手动切过 Tab 则跟随境界
  const [tabUserChanged, setTabUserChanged] = useState(false);
  useEffect(() => {
    if (!tabUserChanged) {
      setActiveRealm(inferDefaultRealm(levelIndex));
    }
  }, [levelIndex, tabUserChanged]);

  // 时辰
  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour < 6 ? 'night' : hour < 9 ? 'dawn' : hour < 18 ? 'day' : hour < 21 ? 'dusk' : 'night');
  }, []);

  const unlockedSet = useMemo(
    () => new Set(ALL_LOCATIONS.filter(l => levelIndex >= l.unlockLevelIndex).map(l => l.id)),
    [levelIndex]
  );

  const currentRealm = realmOfRegion(currentRegion);
  // 找当前所在地点（粗略匹配 regionStoreId 中第一个匹配的）
  const currentLocationId = useMemo(() => {
    const match = ALL_LOCATIONS.find(l => l.regionStoreId && l.regionStoreId === currentRegion);
    return match?.id;
  }, [currentRegion]);

  const realmMeta = REALM_META[activeRealm];
  const realmLocked = levelIndex < realmMeta.unlockLevelIndex;
  const inDungeon = dungeon.active;

  // 当前显示的子图组件
  const SubMap = activeRealm === 'mortal' ? MortalRealmMap
    : activeRealm === 'spirit' ? SpiritRealmMap
    : ImmortalRealmMap;
  const subMapLocations = getLocationsByRealm(activeRealm);
  const showImmortalMist = activeRealm === 'immortal' && realmLocked;

  const handleTabClick = (realm: RealmId) => {
    const meta = REALM_META[realm];
    if (levelIndex < meta.unlockLevelIndex) {
      setToast(`${meta.name} 需 ${meta.unlockHintLevel} 方可窥探`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setActiveRealm(realm);
    setTabUserChanged(true);
  };

  const handleLocationClick = (loc: WorldLocation) => {
    if (inDungeon) {
      setToast('副本进行中，无法切换');
      setTimeout(() => setToast(null), 1800);
      return;
    }
    if (!unlockedSet.has(loc.id)) {
      const lvl = CULTIVATION_LEVELS[loc.unlockLevelIndex]?.name || '更高境界';
      setToast(`此地需 ${lvl} 方可前往`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setSelected(loc);
  };

  const confirmAction = () => {
    if (!selected) return;
    if (selected.type === 'dungeon' && selected.dungeonId) {
      const r = startDungeon(selected.dungeonId);
      setToast(r.message);
    } else if (selected.regionStoreId) {
      setCurrentRegion(selected.regionStoreId);
      setToast(`传送至 ${selected.name}`);
    } else {
      setToast(`${selected.name}：${selected.desc}`);
    }
    setTimeout(() => setToast(null), 2400);
    setSelected(null);
  };

  const currentLocationName = ALL_LOCATIONS.find(l => l.id === currentLocationId)?.name || currentRegion;

  return (
    <div className="relative z-10 w-full mb-4">
      {/* 折叠态：标题栏 */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl backdrop-blur-md transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MapIcon size={16} className="text-emerald-400" />
          <span className="text-sm font-medium text-slate-200">修仙地图</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">
            {REALM_META[currentRealm].name} · {currentLocationName}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center">
          {expanded ? <>收起 <ChevronUp size={14} className="ml-1" /></> : <>展开 <ChevronDown size={14} className="ml-1" /></>}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden mt-2"
          >
            <div className="rounded-3xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-3">
              {/* Tab */}
              <div className="flex items-center space-x-2 mb-3">
                {REALMS.map(meta => {
                  const locked = levelIndex < meta.unlockLevelIndex;
                  const isActive = activeRealm === meta.id;
                  return (
                    <button
                      key={meta.id}
                      onClick={() => handleTabClick(meta.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all relative ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-500 shadow-inner'
                          : locked
                            ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800/70'
                      }`}
                      style={isActive ? { borderColor: meta.accentColor + '80' } : undefined}
                    >
                      <span className="flex items-center justify-center space-x-1.5">
                        {locked && <Lock size={11} />}
                        <span>{meta.name}</span>
                      </span>
                      {locked && (
                        <span className="absolute -top-1.5 -right-1 text-[9px] bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full px-1.5 py-0.5">
                          {meta.unlockHintLevel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 子地图 */}
              <div className="relative w-full h-[50vh] min-h-[320px] max-h-[450px] rounded-2xl overflow-hidden border border-slate-700/40">
                {activeRealm === 'mortal' && (
                  <MortalRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'mortal' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                  />
                )}
                {activeRealm === 'spirit' && (
                  <SpiritRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'spirit' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                  />
                )}
                {activeRealm === 'immortal' && (
                  <ImmortalRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'immortal' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                    mistOverlay={showImmortalMist}
                  />
                )}

                {/* 副本进行中遮罩 */}
                {inDungeon && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-30">
                    <div className="text-center px-6">
                      <p className="text-amber-300 text-sm font-bold mb-1">副本进行中</p>
                      <p className="text-xs text-slate-400">退出副本后方可切换地点</p>
                    </div>
                  </div>
                )}

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-slate-800/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] border border-slate-600 shadow-lg whitespace-nowrap max-w-[80%] truncate"
                    >
                      {toast}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 底部信息条 */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-2">
                <span>当前境界：{CULTIVATION_LEVELS[levelIndex]?.name || '凡人'}</span>
                <span>共 {ALL_LOCATIONS.length} 处秘境 · 已解锁 {unlockedSet.size}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 地点详情弹窗 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800/95 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">{selected.desc}</p>
              {selected.loreSnippet && (
                <p className="text-xs text-amber-300/80 italic mb-3 border-l-2 border-amber-500/40 pl-3">
                  {selected.loreSnippet}
                </p>
              )}
              <div className="text-[10px] text-slate-500 mb-4">
                解锁境界：{CULTIVATION_LEVELS[selected.unlockLevelIndex]?.name}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors"
                >
                  关闭
                </button>
                {(selected.type === 'dungeon' || selected.regionStoreId) && !inDungeon && (
                  <button
                    onClick={confirmAction}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg hover:from-amber-400 hover:to-orange-400 transition-colors"
                  >
                    {selected.type === 'dungeon' ? '进入副本' : '前往此地'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add src/components/WorldMap.tsx
git commit -m "feat(map): rewrite WorldMap as three-realm tabbed container

- 折叠/展开（默认折叠为 56px 横条）
- 顶部三界 Tab，未解锁灰显并显示境界门槛
- 默认 Tab 跟随当前修为
- 地点弹窗：描述 + 小说典故 + 前往/进入按钮
- 副本进行中：地图依然可见，仅遮罩提示（修复原 return null 隐藏问题）
- 容器加 relative z-10（修复被首页背景遮挡问题）

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7：Home.tsx 微调（包裹层）

实际上 Task 6 中的容器已经自带 `relative z-10`。这一步只是确认 `Home.tsx:799` 处的 `<WorldMap />` 调用没有被父级压住。

**Files:**
- Modify: `src/pages/Home.tsx:799`

- [ ] **Step 1: 检查现状**

Run: `grep -n "WorldMap" /g/code/flowwater4/src/pages/Home.tsx`
Expected: 第 24 行 import；第 799 行 `<WorldMap />`

- [ ] **Step 2: 不需要修改**

由于新 `WorldMap` 容器最外层已是 `<div className="relative z-10 w-full mb-4">`，且原 `<WorldMap />` 单行调用本身不需要包裹层。**跳过此步**。

如果运行后仍有遮挡问题，再回来包一层。否则**直接进入 Task 8**。

---

## Task 8：清理与验证

- [ ] **Step 1: 运行类型检查**

Run: `cd /g/code/flowwater4 && npm run lint`
Expected: PASS（仅项目原有警告）

- [ ] **Step 2: 构建**

Run: `cd /g/code/flowwater4 && npm run build`
Expected: build 成功，无报错

- [ ] **Step 3: 手工浏览器验证**（启动 `npm run dev` 后访问首页）

| 验证项 | 期望结果 |
|---|---|
| 首页加载 | 看到"修仙地图"折叠条（56px 高），不再被背景遮挡 |
| 点击折叠条 | 展开 50vh 地图，默认显示对应当前修为的界 |
| 切换 Tab | 人界/灵界/仙界三个 Tab 可切换；未解锁的灰显并显示门槛标签 |
| 凡人态(`levelIndex=0`) | 灵界 Tab 显示"大乘初期"标签且不可点；仙界显示"渡劫期" |
| 点已解锁地点 | 弹出详情弹窗（名称+描述+典故+前往按钮） |
| 点未解锁地点 | 顶部 Toast 提示需要的境界 |
| 点副本类地点确认 | 触发 `startDungeon`，进入副本流程 |
| 点 region 类地点确认 | 切换 `currentRegion`，Toast 提示传送成功 |
| 副本进行中(`dungeon.active=true`) | 地图依然可见，但出现"副本进行中"遮罩，不再整张图消失 |
| 风格 | 人界青绿山水 / 灵界深紫云海 / 仙界金色云海 |

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "feat(map): three-realm world map redesign — completed

参考小说《凡人修仙传》与动画版世界观，重做首页地图：
- 三界（人界/灵界/仙界）Tab 切换，每界~10地点
- 青绿山水（人界）/ 云海仙鹤（灵界）/ 缥缈仙宫（仙界）三种视觉
- 默认折叠为 56px 横条，点击展开 50vh 地图
- 修复原地图被背景遮挡 + 副本中整张图消失的 bug
- 解锁状态由 levelIndex 派生，不新增 store 字段

Spec: docs/superpowers/specs/2026-06-14-worldmap-three-realms-design.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>" --allow-empty
```

---

## Self-Review 已完成（写计划时同步检查）

- ✅ Spec 11 节全部覆盖（数据→子图×3→容器→修复→验证）
- ✅ 无 TBD/TODO 占位
- ✅ 类型一致性：`RealmId`/`WorldLocation`/`RealmMapProps` 在所有任务统一引用
- ✅ `dungeonId` 与 `src/store/constants.ts` 中 `DUNGEONS` 表 ID 一致（`blood_forbidden`/`void_hall`/`demon_valley`/`kunwu_mountain`）
- ✅ `regionStoreId` 字符串与 `REGIONS` 表（`'凡人界'/'天南'/'乱星海'/'大晋'/'阴冥之地'/'灵界'/'仙界'`）一致
- ✅ 解锁阈值（38/41/42）与 `CULTIVATION_LEVELS` 实际索引匹配（共 43 项，0~42）
