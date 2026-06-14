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
