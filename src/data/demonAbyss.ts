// 魔渊副本数据 / Demon Abyss data
// MVP 范围：仅完整实现 demon_abyss_qi（乱星海三魔），其余两副本留 stub 接口
// 节点池每节阶 4 个，按原著用语撰写

export interface NarrativeChoice {
  id: string;
  label: string;
  flavor: string; // 战斗前的旁白
  battleMod: {
    monsterCountDelta?: number;  // ±N 怪
    monsterPowerMul?: number;    // 0.7 ~ 1.3
    spawnAllies?: number;        // 0/1/2 个友军
    bonusReward?: { stones?: number; materials?: Record<string, number> };
  };
}

export interface NarrativeNode {
  id: string;
  title: string;
  text: string;
  choices: NarrativeChoice[];
}

export interface BossDef {
  id: string;
  name: string;
  title: string;       // 称号 / 简介
  emoji: string;       // 头像 emoji
  bgColor: number;     // 战斗背景主色
  bodyColor: number;   // 怪物主体色
  glowColor: number;
}

export interface StageReward {
  stones: number;
  materials: Record<string, number>;
  skillPages: number;
}

export interface DemonAbyssDungeonDef {
  id: string;
  name: string;
  unlockLevelIndex: number;
  unlockLevelName: string;
  desc: string;
  bosses: BossDef[];
  narrativePools: [NarrativeNode[], NarrativeNode[], NarrativeNode[]];
  stageRewards: [StageReward, StageReward, StageReward];
  // Phaser 战斗参数
  stageBattles: [
    { totalWaves: number; baseMonsterPower: number; hasBoss: boolean },
    { totalWaves: number; baseMonsterPower: number; hasBoss: boolean },
    { totalWaves: number; baseMonsterPower: number; hasBoss: boolean }
  ];
}

const QI_BOSSES: BossDef[] = [
  { id: 'blood_ancestor', name: '血煞老祖', title: '乱星海三魔之首 · 血煞', emoji: '🩸', bgColor: 0x3a0a13, bodyColor: 0x991b1b, glowColor: 0xef4444 },
  { id: 'sky_demon',      name: '天魔',     title: '乱星海三魔 · 天魔',     emoji: '🌑', bgColor: 0x1e1b3a, bodyColor: 0x4c1d95, glowColor: 0x8b5cf6 },
  { id: 'wolf_demon',     name: '狼煞',     title: '乱星海三魔 · 狼煞',     emoji: '🐺', bgColor: 0x111827, bodyColor: 0x7c2d12, glowColor: 0xea580c },
];

// ============ 节阶 1：序章·入渊 ============
const STAGE_1_NODES: NarrativeNode[] = [
  {
    id: 'qi_s1_n1',
    title: '魔气溢散',
    text: '黄枫谷与七玄门之间的旷野上，黑紫魔气如蛇游走。一队魔修先头部队正在搜刮散修洞府，杀人夺宝。你正巧路过此地。',
    choices: [
      {
        id: 'ambush', label: '暗中埋伏，伺机突袭',
        flavor: '你藏身于乱石之后，凝神屏息。待魔修走入伏击圈的瞬间，剑气暴起！',
        battleMod: { monsterCountDelta: -1, monsterPowerMul: 0.85, bonusReward: { stones: 200 } },
      },
      {
        id: 'rally', label: '联合附近散修',
        flavor: '你借传音符召集附近三两散修。修士们汇成一股薄薄的剑光，迎敌而上。',
        battleMod: { spawnAllies: 1, monsterCountDelta: 1 },
      },
      {
        id: 'charge', label: '正面冲杀',
        flavor: '剑气化虹，你直直撞向魔修阵中——以杀止杀，最是痛快！',
        battleMod: { monsterPowerMul: 1.15, bonusReward: { stones: 500 } },
      },
    ],
  },
  {
    id: 'qi_s1_n2',
    title: '血祭法阵',
    text: '前方山坳里，一座血色法阵正在运转。十数个被掳的凡人被吊在阵眼上方，鲜血一滴滴坠入阵中——这是乱星海魔修惯用的「血煞炼魂阵」。',
    choices: [
      {
        id: 'rescue', label: '强行破阵救人',
        flavor: '你不及多想，一道剑光斩向阵眼。法阵骤然崩散，凡人们瘫倒在地——但魔修也察觉了你！',
        battleMod: { monsterCountDelta: 2, spawnAllies: 1, bonusReward: { materials: { common_herb: 3 } } },
      },
      {
        id: 'study', label: '隐于一旁观察阵纹',
        flavor: '你按捺住怒火，暗中记下血煞炼魂阵的阵纹运转。日后必有大用。',
        battleMod: { bonusReward: { materials: { rare_herb: 2 } } },
      },
      {
        id: 'sabotage', label: '远程符箓干扰',
        flavor: '一张定身符飞出，阵眼魔修身形一滞——足够你结阵反击！',
        battleMod: { monsterPowerMul: 0.9, bonusReward: { stones: 150 } },
      },
    ],
  },
  {
    id: 'qi_s1_n3',
    title: '同道求援',
    text: '一名重伤散修跌跌撞撞冲入你的视野。他衣襟尽染鲜血，是被血煞老祖的手下追杀至此。「道友救我！我有……我有重要消息！」',
    choices: [
      {
        id: 'shelter', label: '护他周全',
        flavor: '你将散修藏于身后，剑气围出三尺真元领域。"既然来了，便一个也别想走。"',
        battleMod: { spawnAllies: 1, bonusReward: { materials: { humai_pill: 1 } } },
      },
      {
        id: 'refuse', label: '收下消息独自迎敌',
        flavor: '"消息留下，你走。"散修留下一片地图后远遁，你独自面对追兵。',
        battleMod: { monsterCountDelta: -1, bonusReward: { stones: 300 } },
      },
      {
        id: 'use_him', label: '让他做诱饵',
        flavor: '"恕道友难以保全。"你心下冷然，借他吸引追兵注意，自己则绕到敌后。道心微损。',
        battleMod: { monsterPowerMul: 0.8 },
      },
    ],
  },
  {
    id: 'qi_s1_n4',
    title: '魔修挑衅',
    text: '一名身穿暗红长袍的魔修拦住去路，咧嘴一笑："小道友，这片地是我血煞老祖的，要过去，留下储物袋。"',
    choices: [
      {
        id: 'fight', label: '剑出鞘',
        flavor: '"魔修也配谈道理？"剑气暴涨，话音未落剑光已至！',
        battleMod: { monsterPowerMul: 1.1, bonusReward: { stones: 400 } },
      },
      {
        id: 'negotiate', label: '虚与委蛇',
        flavor: '你赔笑递出一枚假储物袋（内置爆炸符）。轰——魔修身形一僵的瞬间，你已经欺身而上！',
        battleMod: { monsterCountDelta: -1, monsterPowerMul: 0.85 },
      },
      {
        id: 'detour', label: '绕路潜行',
        flavor: '你借八卦镜遁光绕开正面，直接撞上后方的魔修小队。',
        battleMod: { monsterCountDelta: 1, spawnAllies: 1 },
      },
    ],
  },
];

// ============ 节阶 2：中章·遇魔 ============
const STAGE_2_NODES: NarrativeNode[] = [
  {
    id: 'qi_s2_n1',
    title: '魔修阵营',
    text: '深入血色禁地，你撞见血煞老祖的中军大帐。帐外有数十魔修值守，帐内灵光大作，似有魔功正在炼化。',
    choices: [
      {
        id: 'frontal', label: '正面强攻',
        flavor: '你一声暴喝，剑气如龙，直直撞入大帐——刹那间魔气与剑光交击，整片山谷震动！',
        battleMod: { monsterCountDelta: 2, monsterPowerMul: 1.1, bonusReward: { stones: 600, materials: { demon_crystal: 1 } } },
      },
      {
        id: 'stealth', label: '隐匿气息潜入',
        flavor: '你催动隐匿之术，避开外层守卫。直到帐内方才暴起！',
        battleMod: { monsterCountDelta: -1, bonusReward: { materials: { demon_skill_page: 1 } } },
      },
      {
        id: 'distract', label: '引爆周边阵旗',
        flavor: '你点燃外围阵法节点，引来魔修军中骚乱。趁乱杀入，所向披靡！',
        battleMod: { monsterPowerMul: 0.9, spawnAllies: 1 },
      },
    ],
  },
  {
    id: 'qi_s2_n2',
    title: '南宫婉的传讯',
    text: '一道淡紫色传讯符无声落入你掌中。「道友若在乱星海，可来此处。我有要事相商。」——是掩月宗的南宫婉。',
    choices: [
      {
        id: 'meet', label: '前往会合',
        flavor: '紫衣女子立于山巅，眉目如画。"血煞老祖近日炼制傀儡，须得早些除之。我助你一臂之力。"',
        battleMod: { spawnAllies: 2, bonusReward: { stones: 300 } },
      },
      {
        id: 'warn', label: '回讯告知魔修动向',
        flavor: '你将所知魔修布防一一回禀。南宫婉以传讯符回赠：「道友珍重，他日相见。」',
        battleMod: { bonusReward: { materials: { demon_crystal: 2 } } },
      },
      {
        id: 'ignore', label: '不予理会',
        flavor: '修仙之路，身不由己。你将传讯符收起，独自前行。',
        battleMod: { monsterCountDelta: 1, bonusReward: { stones: 200 } },
      },
    ],
  },
  {
    id: 'qi_s2_n3',
    title: '血傀儡群',
    text: '前方山道堆满白骨。魔修以新鲜尸体炼制的血傀儡正在缓缓集结——它们刀枪不入，唯惧火属性灵气。',
    choices: [
      {
        id: 'fire', label: '催动火属性功法',
        flavor: '你激发火云剑诀，剑光化为赤红龙形——血傀儡见火即燃，化为黑灰！',
        battleMod: { monsterPowerMul: 0.7, bonusReward: { materials: { rare_herb: 2 } } },
      },
      {
        id: 'sword_qi', label: '高速剑气切割',
        flavor: '你硬抗着血傀儡的反扑，每一剑都需斩断关节方能阻其行动。',
        battleMod: { monsterCountDelta: 1, monsterPowerMul: 1.0 },
      },
      {
        id: 'flee', label: '绕道避战',
        flavor: '你以遁术从血傀儡群上方掠过——但为节省灵力，途中放出几道剑气清扫尾随者。',
        battleMod: { monsterCountDelta: -2, bonusReward: { stones: -200 } },
      },
    ],
  },
  {
    id: 'qi_s2_n4',
    title: '魔功诱惑',
    text: '一名濒死魔修将一枚黑色玉简递给你："这是……我师从血煞老祖所学……《血魂炼魂经》……道友若能炼至大成，可——"',
    choices: [
      {
        id: 'accept', label: '收下玉简',
        flavor: '你将玉简收入储物袋。魔气滚滚而来——仿佛玉简本身在召唤同道。',
        battleMod: { monsterPowerMul: 1.2, bonusReward: { materials: { demon_skill_page: 2 } } },
      },
      {
        id: 'destroy', label: '一剑毁去',
        flavor: '"魔功祸世，岂能留之！"剑光起处，玉简碎为齑粉，但魔气也因此惊动了远处的魔修。',
        battleMod: { monsterCountDelta: 1, bonusReward: { stones: 400 } },
      },
      {
        id: 'study_burn', label: '速记后焚毁',
        flavor: '你以神识扫过玉简关键部分（仅一二）便焚之。心中隐有所得，但道心微涩。',
        battleMod: { bonusReward: { materials: { demon_skill_page: 1 } } },
      },
    ],
  },
];

// ============ 节阶 3：终章·斩魔 ============
const STAGE_3_NODES: NarrativeNode[] = [
  {
    id: 'qi_s3_n1',
    title: '魔头降世',
    text: '魔气滔天，血色光柱直冲云霄。乱星海三魔之首已经感应到你——他正在出关而来。所有逃路都被魔气封死。',
    choices: [
      {
        id: 'all_in', label: '舍命一击',
        flavor: '你以全部灵力凝出毕生最强一剑——「青元归一」！剑气如山岳坠落！',
        battleMod: { monsterPowerMul: 0.9, bonusReward: { stones: 1000, materials: { demon_crystal: 2 } } },
      },
      {
        id: 'array', label: '激活布下的剑阵',
        flavor: '你早将七十二根竹剑埋入此地。此刻一齐出鞘，组成春秋剑阵！',
        battleMod: { monsterPowerMul: 0.85, spawnAllies: 1 },
      },
      {
        id: 'wait', label: '凝神待机，反守为攻',
        flavor: '你按住躁动的灵力，静静感应魔头气机。一招制敌，一击毙命！',
        battleMod: { monsterPowerMul: 1.0, bonusReward: { materials: { demon_skill_page: 1 } } },
      },
    ],
  },
  {
    id: 'qi_s3_n2',
    title: '本命法宝',
    text: '魔头近在咫尺。你能感觉到本命法宝在嗡嗡作响——这是它要与你共鸣的征兆。',
    choices: [
      {
        id: 'unleash', label: '催发本命法宝',
        flavor: '法宝之灵咆哮而出，灵性大放！你与法宝心意相通，威力远胜往常！',
        battleMod: { monsterPowerMul: 0.8, bonusReward: { stones: 800 } },
      },
      {
        id: 'reserve', label: '留作底牌',
        flavor: '你按住躁动的法宝。决战时分自有玄机，此时尚未到决死之刻。',
        battleMod: { bonusReward: { materials: { demon_crystal: 3, demon_skill_page: 1 } } },
      },
    ],
  },
  {
    id: 'qi_s3_n3',
    title: '最后的话',
    text: '魔头忽然冷笑："小子，你与我有相似之处——皆是逆天之人。何不弃道入魔？我可保你结丹无忧。"',
    choices: [
      {
        id: 'reject', label: '"道魔不两立！"',
        flavor: '你怒喝出声，剑气穿云而出！魔头哈哈大笑，亦展开滔天魔气！',
        battleMod: { monsterPowerMul: 1.0, bonusReward: { stones: 1500 } },
      },
      {
        id: 'tempted', label: '"魔功要诀，留下再战。"',
        flavor: '魔头笑得意味深长，吐出一缕魔气化作功法心得。你接下，道心微震——但实力果然大涨。',
        battleMod: { monsterPowerMul: 0.85, bonusReward: { materials: { demon_skill_page: 2 } } },
      },
    ],
  },
];

// ============ 副本定义 ============
export const DEMON_ABYSS_DUNGEONS: DemonAbyssDungeonDef[] = [
  {
    id: 'demon_abyss_qi',
    name: '魔渊·乱星海',
    unlockLevelIndex: 14,
    unlockLevelName: '筑基初期',
    desc: '乱星海三大魔头借魔气大潮出世，尔等修士可入魔渊，一斩魔头之首！',
    bosses: QI_BOSSES,
    narrativePools: [STAGE_1_NODES, STAGE_2_NODES, STAGE_3_NODES],
    stageRewards: [
      { stones: 800, materials: { common_herb: 2, rare_herb: 1 }, skillPages: 0 },
      { stones: 1800, materials: { rare_herb: 2, demon_crystal: 1 }, skillPages: 1 },
      { stones: 4000, materials: { demon_crystal: 3, millennium_lingzhi: 1 }, skillPages: 2 },
    ],
    stageBattles: [
      { totalWaves: 3, baseMonsterPower: 1.0, hasBoss: false },
      { totalWaves: 4, baseMonsterPower: 1.2, hasBoss: false },
      { totalWaves: 3, baseMonsterPower: 1.4, hasBoss: true },
    ],
  },
  // 后续两副本：暂留 stub，留出扩展接口
  {
    id: 'demon_abyss_core',
    name: '魔渊·坠魔谷',
    unlockLevelIndex: 18,
    unlockLevelName: '结丹初期',
    desc: '上古战场遗址，古魔残魂蠢动。需结丹方可入。（即将开启）',
    bosses: [{ id: 'ancient_demon', name: '古魔残魂', title: '上古战场之古魔', emoji: '👁', bgColor: 0x18181b, bodyColor: 0x431407, glowColor: 0xa3e635 }],
    narrativePools: [[], [], []],
    stageRewards: [
      { stones: 0, materials: {}, skillPages: 0 },
      { stones: 0, materials: {}, skillPages: 0 },
      { stones: 0, materials: {}, skillPages: 0 },
    ],
    stageBattles: [
      { totalWaves: 3, baseMonsterPower: 2.0, hasBoss: false },
      { totalWaves: 4, baseMonsterPower: 2.4, hasBoss: false },
      { totalWaves: 3, baseMonsterPower: 2.8, hasBoss: true },
    ],
  },
  {
    id: 'demon_abyss_void',
    name: '魔渊·乱魔海',
    unlockLevelIndex: 22,
    unlockLevelName: '元婴初期',
    desc: '灵界前哨魔族探路，破界而来。需元婴方可入。（即将开启）',
    bosses: [{ id: 'demon_general', name: '魔族先锋将军', title: '灵界魔族·先锋', emoji: '⚔', bgColor: 0x1e3a8a, bodyColor: 0x1e1b3a, glowColor: 0x6366f1 }],
    narrativePools: [[], [], []],
    stageRewards: [
      { stones: 0, materials: {}, skillPages: 0 },
      { stones: 0, materials: {}, skillPages: 0 },
      { stones: 0, materials: {}, skillPages: 0 },
    ],
    stageBattles: [
      { totalWaves: 4, baseMonsterPower: 4.0, hasBoss: false },
      { totalWaves: 5, baseMonsterPower: 4.5, hasBoss: false },
      { totalWaves: 4, baseMonsterPower: 5.0, hasBoss: true },
    ],
  },
];

export function getDemonAbyssDungeon(id: string): DemonAbyssDungeonDef | undefined {
  return DEMON_ABYSS_DUNGEONS.find(d => d.id === id);
}

export function getNarrativeNode(dungeonId: string, stage: number, nodeId: string): NarrativeNode | undefined {
  const def = getDemonAbyssDungeon(dungeonId);
  if (!def) return undefined;
  const pool = def.narrativePools[stage - 1] || [];
  return pool.find(n => n.id === nodeId);
}

export function getNarrativeChoice(dungeonId: string, stage: number, nodeId: string, choiceId: string): NarrativeChoice | undefined {
  const node = getNarrativeNode(dungeonId, stage, nodeId);
  return node?.choices.find(c => c.id === choiceId);
}

export function getBossById(dungeonId: string, bossId: string): BossDef | undefined {
  const def = getDemonAbyssDungeon(dungeonId);
  return def?.bosses.find(b => b.id === bossId);
}
