// 修仙奇遇录 · 互动冒险系统数据
// 核心理念：喝水获得灵力 → 灵力驱动探索 → 探索触发剧情选择 → 选择影响修仙之路

// ============================================
// 区域定义 - 与现有 REGIONS 联动
// ============================================
export interface AdventureRegion {
  id: string;
  name: string;
  minLevelIndex: number;  // CULTIVATION_LEVELS 的 index
  spiritPowerCost: number; // 每步消耗灵力
  eventPool: string[];     // 该区域可触发的事件ID
  description: string;
  atmosphere: 'peaceful' | 'mysterious' | 'dangerous' | 'epic';
  bgColor: string;         // Tailwind gradient
  iconEmoji: string;
  nodes: AdventureNode[];  // 区域内的探索节点
}

export interface AdventureNode {
  id: string;
  name: string;
  description: string;
  x: number;  // 百分比位置
  y: number;
  type: 'village' | 'cave' | 'forest' | 'mountain' | 'river' | 'ruins' | 'market' | 'gate';
  icon: string;
  events: string[];  // 该节点专属事件
  requiredStoryFlag?: string;  // 需要的剧情标记
  rewardStoryFlag?: string;    // 完成后设置的剧情标记
}

// ============================================
// 事件定义
// ============================================
export interface AdventureEvent {
  id: string;
  title: string;
  narrative: string;
  region: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  type: 'encounter' | 'combat' | 'puzzle' | 'trade' | 'story';
  minLevelIndex?: number;
  requiredStoryFlag?: string;
  rewardStoryFlag?: string;
  choices: AdventureChoice[];
  animation: 'none' | 'shake' | 'glow' | 'lightning' | 'ripple' | 'pulse';
}

export interface AdventureChoice {
  id: string;
  text: string;
  icon: string;
  risk: 'safe' | 'risky' | 'dangerous';
  outcome: {
    successChance: number;
    success: ChoiceResult;
    failure: ChoiceResult;
  };
}

export interface ChoiceResult {
  message: string;
  spiritPowerChange?: number;  // 灵力变化
  spiritStonesChange?: number;
  bonusPointsChange?: number;
  materialReward?: { id: string; amount: number };
  itemReward?: string;
  storyFlag?: string;
  luckChange?: number;
  hpChange?: number;
}

// ============================================
// 战斗定义
// ============================================
export interface CombatEnemy {
  id: string;
  name: string;
  title: string;
  hp: number;
  attack: number;
  defense: number;
  skills: CombatSkill[];
  description: string;
  defeatMessage: string;
  victoryReward: ChoiceResult;
  defeatPenalty: ChoiceResult;
  spriteEmoji: string;
  spriteColor: string;
}

export interface CombatSkill {
  name: string;
  damage: number;
  emoji: string;
  chance: number;  // 使用概率
  message: string;
}

// ============================================
// 区域数据
// ============================================
export const ADVENTURE_REGIONS: AdventureRegion[] = [
  {
    id: '凡人界',
    name: '凡人界',
    minLevelIndex: 0,
    spiritPowerCost: 1,
    eventPool: ['village_elder', 'hidden_spring', 'wolf_attack', 'beggar_fortune', 'market_haggle'],
    description: '凡人聚居之地，灵气稀薄。但机缘往往藏于市井之中。',
    atmosphere: 'peaceful',
    bgColor: 'from-amber-900/20 to-stone-900/40',
    iconEmoji: '🏘️',
    nodes: [
      { id: 'fn_village', name: '落霞村', description: '一个宁静的小村庄，村口有一口古井', x: 30, y: 75, type: 'village', icon: '🏠', events: ['village_elder', 'beggar_fortune'] },
      { id: 'fn_market', name: '青石集市', description: '热闹的凡人集市，偶尔有散修来此摆摊', x: 70, y: 70, type: 'market', icon: '🏪', events: ['market_haggle'] },
      { id: 'fn_spring', name: '隐灵泉', description: '传说中灵气汇聚的山泉，凡人喝之百病不生', x: 50, y: 40, type: 'river', icon: '💧', events: ['hidden_spring'] },
      { id: 'fn_forest', name: '野狼岭', description: '村外的山林，有野兽出没', x: 20, y: 50, type: 'forest', icon: '🌲', events: ['wolf_attack'] },
      { id: 'fn_gate', name: '仙道碑', description: '一块刻着"仙"字的古碑，传说触摸它有几率觉醒灵根', x: 50, y: 15, type: 'gate', icon: '🪨', events: ['immortal_stone'], rewardStoryFlag: 'felt_xianqi' },
    ],
  },
  {
    id: '天南',
    name: '天南',
    minLevelIndex: 1,
    spiritPowerCost: 2,
    eventPool: ['sect_trial', 'spirit_herb', 'rogue_cultivator', 'ancient_well', 'flying_sword'],
    description: '修仙界偏僻之地，宗门林立，灵草遍地，却也暗藏杀机。',
    atmosphere: 'mysterious',
    bgColor: 'from-blue-900/20 to-indigo-900/40',
    iconEmoji: '⛰️',
    nodes: [
      { id: 'tn_market', name: '太南小会', description: '天南最大的散修交易集市', x: 60, y: 60, type: 'market', icon: '🏪', events: ['spirit_herb', 'rogue_cultivator'] },
      { id: 'tn_cave', name: '幽冥洞', description: '阴暗的洞穴，传闻有上古修士遗物', x: 25, y: 45, type: 'cave', icon: '🕳️', events: ['ancient_well'] },
      { id: 'tn_forest', name: '万木林', description: '灵木参天的古老森林', x: 75, y: 35, type: 'forest', icon: '🌳', events: ['spirit_herb'] },
      { id: 'tn_mountain', name: '落云峰', description: '云雾缭绕的山峰，有飞剑出没', x: 40, y: 20, type: 'mountain', icon: '🏔️', events: ['flying_sword'] },
      { id: 'tn_gate', name: '宗门试炼场', description: '各大宗门选拔弟子的试炼之地', x: 50, y: 80, type: 'gate', icon: '⛩️', events: ['sect_trial'], requiredStoryFlag: 'felt_xianqi' },
    ],
  },
  {
    id: '乱星海',
    name: '乱星海',
    minLevelIndex: 14,
    spiritPowerCost: 5,
    eventPool: ['sea_monster', 'island_treasure', 'star_ferry', 'pirate_ambush', 'dragon_palace'],
    description: '海外修仙界，妖兽横行。海上有无数岛屿，每座岛都藏着不同的机缘与凶险。',
    atmosphere: 'dangerous',
    bgColor: 'from-cyan-900/20 to-teal-900/40',
    iconEmoji: '🌊',
    nodes: [
      { id: 'ls_port', name: '星城港口', description: '乱星海最大的补给港', x: 50, y: 85, type: 'village', icon: '⚓', events: ['star_ferry'] },
      { id: 'ls_island1', name: '碧波岛', description: '看似平静的小岛', x: 30, y: 55, type: 'forest', icon: '🏝️', events: ['island_treasure'] },
      { id: 'ls_deep', name: '深海区', description: '暗流涌动的深海', x: 70, y: 40, type: 'river', icon: '🌊', events: ['sea_monster', 'dragon_palace'] },
      { id: 'ls_reef', name: '暗礁区', description: '海盗出没的危险水域', x: 40, y: 30, type: 'ruins', icon: '🏴‍☠️', events: ['pirate_ambush'] },
      { id: 'ls_gate', name: '龙宫入口', description: '传说中海底龙宫的入口', x: 55, y: 15, type: 'gate', icon: '🐉', events: ['dragon_palace'], requiredStoryFlag: 'touched_star_sea' },
    ],
  },
  {
    id: '阴冥之地',
    name: '阴冥之地',
    minLevelIndex: 18,
    spiritPowerCost: 7,
    eventPool: ['ghost_encounter', 'nether_market', 'soul_refinement', 'yin_yang_boundary', 'nether_king'],
    description: '阴气极重之地，鬼修横行。生人入此，九死一生，但阴冥宝物也只此才有。',
    atmosphere: 'dangerous',
    bgColor: 'from-purple-900/20 to-gray-900/60',
    iconEmoji: '👻',
    nodes: [
      { id: 'ym_edge', name: '幽冥边界', description: '阴阳交汇之处，阴气渐浓', x: 50, y: 85, type: 'gate', icon: '🌑', events: ['yin_yang_boundary'] },
      { id: 'ym_market', name: '冥市', description: '鬼修的交易场所，用阴冥之物交换阳间宝物', x: 60, y: 60, type: 'market', icon: '🕯️', events: ['nether_market'] },
      { id: 'ym_grave', name: '万魂冢', description: '无数亡魂汇聚之地', x: 30, y: 45, type: 'ruins', icon: '⚰️', events: ['ghost_encounter', 'soul_refinement'] },
      { id: 'ym_palace', name: '冥王殿', description: '阴冥之地的核心', x: 50, y: 20, type: 'mountain', icon: '🏛️', events: ['nether_king'], requiredStoryFlag: 'passed_yin_boundary' },
    ],
  },
  {
    id: '灵界',
    name: '灵界',
    minLevelIndex: 26,
    spiritPowerCost: 10,
    eventPool: ['spirit_beast_tribulation', 'heavenly_court', 'dao_debate', 'immortal_herb', 'ascension_trial'],
    description: '更高层次的世界，灵气浓郁至极。此处强者如云，稍有不慎便身死道消。',
    atmosphere: 'epic',
    bgColor: 'from-amber-900/20 to-yellow-900/40',
    iconEmoji: '✨',
    nodes: [
      { id: 'lj_gate', name: '飞升台', description: '从凡人界飞升而来的入口', x: 50, y: 90, type: 'gate', icon: '☀️', events: ['ascension_trial'] },
      { id: 'lj_garden', name: '仙灵园', description: '灵界独有的仙药园', x: 35, y: 65, type: 'forest', icon: '🌺', events: ['immortal_herb'] },
      { id: 'lj_court', name: '天庭遗址', description: '上古天庭的残垣断壁', x: 65, y: 50, type: 'ruins', icon: '🏯', events: ['heavenly_court'] },
      { id: 'lj_forum', name: '论道台', description: '灵界修士论道切磋之所', x: 40, y: 35, type: 'mountain', icon: '📿', events: ['dao_debate'] },
      { id: 'lj_peak', name: '九天之上', description: '灵界的最高处，传说可以窥见真仙界', x: 50, y: 10, type: 'mountain', icon: '🌟', events: ['spirit_beast_tribulation'], requiredStoryFlag: 'ascended_to_spirit' },
    ],
  },
];

// ============================================
// 事件数据
// ============================================
export const ADVENTURE_EVENTS: AdventureEvent[] = [
  // ===== 凡人界事件 =====
  {
    id: 'village_elder',
    title: '村中老者',
    narrative: '一位白发老者坐在村口石凳上，见到你走来，浑浊的双眼突然一亮："年轻人，你身上有股不一样的气息……老朽活了百年，见过无数人，只有极少数人身上有这种光。"',
    region: '凡人界',
    rarity: 'common',
    type: 'encounter',
    choices: [
      {
        id: 'listen', text: '恭敬聆听老者的话', icon: '👂',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '老者从怀中取出一块温润的玉佩："这是老朽年轻时的机缘，如今用不上了，送给你吧。"你接过玉佩，感到一丝暖意流入丹田。', bonusPointsChange: 100, spiritStonesChange: 20, storyFlag: 'felt_xianqi' },
          failure: { message: '老者叹了口气，不再说话。' },
        },
      },
      {
        id: 'dismiss', text: '不以为然，继续赶路', icon: '🚶',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你离开了村庄，在路边捡到几枚灵石。也许错失了机缘，也许只是开始。', spiritStonesChange: 10 },
          failure: { message: '你继续赶路。' },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'hidden_spring',
    title: '隐灵泉',
    narrative: '你循着一丝若有若无的灵气来到山泉旁。泉水清澈见底，却在月光下泛着淡蓝色的光芒。你隐约听到泉底传来低语，似乎是某种古老的功法口诀。',
    region: '凡人界',
    rarity: 'uncommon',
    type: 'encounter',
    choices: [
      {
        id: 'drink', text: '饮下灵泉水', icon: '💧',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '灵泉水入喉，一股纯净灵力涌入经脉！你的身体变得通透，灵根隐隐被激活。', bonusPointsChange: 300, spiritPowerChange: 5, storyFlag: 'felt_xianqi' },
          failure: { message: '泉水虽好，但你什么也没感觉到。' },
        },
      },
      {
        id: 'dive', text: '潜入泉底探索', icon: '🏊',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '你在泉底发现了一枚古朴的玉简！玉简中记载着基础吐纳之法，修为大增！', bonusPointsChange: 800, itemReward: 'book_1', storyFlag: 'felt_xianqi' },
          failure: { message: '泉底暗流涌动，你差点被卷走。虽然没找到宝物，但灵泉的灵力还是浸润了你的身体。', bonusPointsChange: 100 },
        },
      },
    ],
    animation: 'ripple',
  },
  {
    id: 'wolf_attack',
    title: '野狼袭击',
    narrative: '林中突然传来低沉的嚎叫，三只眼泛红光的野狼从灌木丛中窜出，将你团团围住！这些并非普通野狼，它们身上隐隐有妖气缭绕。',
    region: '凡人界',
    rarity: 'common',
    type: 'combat',
    choices: [
      {
        id: 'fight', text: '拳脚相搏！', icon: '👊',
        risk: 'risky',
        outcome: {
          successChance: 0.6,
          success: { message: '你奋力搏斗，将三只妖狼击退！在它们的巢穴中发现了被叼来的灵石。', spiritStonesChange: 50, bonusPointsChange: 200 },
          failure: { message: '妖狼凶猛异常，你被咬伤逃出。虽然受了伤，但生死之间竟悟出一点灵力运用之法。', bonusPointsChange: 50, hpChange: -10 },
        },
      },
      {
        id: 'climb', text: '爬上旁边的大树', icon: '🌲',
        risk: 'safe',
        outcome: {
          successChance: 0.9,
          success: { message: '你灵巧地爬上大树，妖狼在树下徘徊一阵后离去。你在树上意外发现了一个鸟巢，里面有灵石！', spiritStonesChange: 20 },
          failure: { message: '你从树上滑落，但妖狼也被惊走了。', hpChange: -5 },
        },
      },
      {
        id: 'fire', text: '用随身火折子吓退它们', icon: '🔥',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '火焰在黑夜中格外明亮，妖狼畏缩后退，终于夹着尾巴逃走。你在原地发现它们掉落的妖丹碎片。', materialReward: { id: 'common_herb', amount: 2 } },
          failure: { message: '' },
        },
      },
    ],
    animation: 'shake',
  },
  {
    id: 'beggar_fortune',
    title: '乞丐指路',
    narrative: '一个衣衫褴褛的乞丐拦住你的去路，咧嘴一笑露出一口黄牙："公子，给我一文钱，我告诉你一个天大的秘密。"',
    region: '凡人界',
    rarity: 'common',
    type: 'encounter',
    choices: [
      {
        id: 'give', text: '给他几枚灵石', icon: '💰',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '乞丐低声说："往东走三里，有棵老槐树，树下有前辈留下的东西。"你果然在一棵古树下发现了一袋灵石！', spiritStonesChange: 80 },
          failure: { message: '' },
        },
      },
      {
        id: 'refuse', text: '不予理会', icon: '🚫',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你绕过乞丐继续走，但总觉得错过了什么。', spiritStonesChange: 0 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'none',
  },
  {
    id: 'market_haggle',
    title: '坊市淘宝',
    narrative: '集市角落有个灰扑扑的地摊，摊主是个精神矍铄的老妪。她面前摆着几件看不出品相的旧物，其中一个布满灰尘的木盒引起了你的注意。',
    region: '凡人界',
    rarity: 'uncommon',
    type: 'trade',
    choices: [
      {
        id: 'buy_box', text: '买下木盒（-30灵石）', icon: '📦',
        risk: 'risky',
        outcome: {
          successChance: 0.4,
          success: { message: '打开木盒，里面竟是一枚低阶灵丹和一张残破的阵图！老妪嘿嘿一笑："有缘人。"', spiritStonesChange: -30, materialReward: { id: 'pill_1', amount: 1 }, bonusPointsChange: 200 },
          failure: { message: '木盒里只有几块普通石头。老妪摊手："买卖就是这样，愿赌服输。"', spiritStonesChange: -30 },
        },
      },
      {
        id: 'chat', text: '和老人攀谈，打听消息', icon: '💬',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '老妪告诉你，附近的山中最近有异象出现，或许与修仙有关。你的运气提升了。', luckChange: 5, storyFlag: 'heard_mountain_rumor' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'immortal_stone',
    title: '仙道碑',
    narrative: '你站在古碑前，伸手触摸刻着"仙"字的石面。刹那间，一股神秘力量从碑中涌出，贯穿你的全身！你的眼前闪过无数画面——飞剑、丹炉、雷劫、仙宫……',
    region: '凡人界',
    rarity: 'rare',
    type: 'story',
    requiredStoryFlag: 'felt_xianqi',
    rewardStoryFlag: 'touched_xianbei',
    choices: [
      {
        id: 'accept', text: '接纳这股力量', icon: '✨',
        risk: 'risky',
        outcome: {
          successChance: 0.65,
          success: { message: '仙道碑的力量与你共鸣！你感到体内灵根被彻底激活，修为暴涨！前方，修仙之路正式开启！', bonusPointsChange: 1000, spiritStonesChange: 100, storyFlag: 'touched_xianbei' },
          failure: { message: '力量太过强大，你的身体无法承受。但石碑的灵力还是留下了一丝印记。', bonusPointsChange: 200, storyFlag: 'touched_xianbei' },
        },
      },
      {
        id: 'resist', text: '运功抵抗，稳住心神', icon: '🧘',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你稳住心神，将石碑的力量缓缓引入丹田。虽然收获不如全盘接纳，但根基更加稳固。', bonusPointsChange: 500, luckChange: 10, storyFlag: 'touched_xianbei' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },

  // ===== 天南事件 =====
  {
    id: 'sect_trial',
    title: '宗门试炼',
    narrative: '试炼场上，一名宗门执事审视着你："想要加入宗门，先过这关。"他指向前方一座迷雾笼罩的幻阵——"在一炷香内走出阵法，就算你通过。"',
    region: '天南',
    rarity: 'uncommon',
    type: 'puzzle',
    requiredStoryFlag: 'felt_xianqi',
    choices: [
      {
        id: 'observe', text: '静心观察阵法规律', icon: '👁️',
        risk: 'safe',
        outcome: {
          successChance: 0.8,
          success: { message: '你看出阵法的破绽，从容走出。执事点头："不错，心思缜密。"你获得入宗推荐信和灵石奖励。', spiritStonesChange: 200, bonusPointsChange: 500, luckChange: 5 },
          failure: { message: '阵法变幻莫测，你差一步走出时时间到了。但执事认为你潜力可嘉，给了你一个机会。', spiritStonesChange: 50 },
        },
      },
      {
        id: 'force', text: '以蛮力破阵！', icon: '💥',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '你集中灵力一掌轰出，阵法直接被你击碎！执事目瞪口呆："好强的灵力！欢迎加入宗门！"额外获得宗门贡献。', spiritStonesChange: 500, bonusPointsChange: 1000 },
          failure: { message: '阵法反弹，你被震退数步。执事摇头："蛮力不足恃。"你受了轻伤，但获得了一点经验。', hpChange: -20, bonusPointsChange: 100 },
        },
      },
    ],
    animation: 'pulse',
  },
  {
    id: 'spirit_herb',
    title: '灵草异变',
    narrative: '你发现一株散发七彩光芒的灵草。它正在缓缓拔起根须，似乎要自己逃跑！这是一株化形的灵草，极其珍贵。',
    region: '天南',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'chase', text: '追上去抓住它！', icon: '🏃',
        risk: 'risky',
        outcome: {
          successChance: 0.4,
          success: { message: '你一把抓住灵草，它化为一团灵气钻入你体内！修为大增！', bonusPointsChange: 2000, materialReward: { id: 'rare_herb', amount: 3 } },
          failure: { message: '灵草比你想象的灵活，从指缝中滑走。但你手上沾染了它的灵液，也算有所收获。', materialReward: { id: 'common_herb', amount: 2 } },
        },
      },
      {
        id: 'trap', text: '布下陷阱等它经过', icon: '🪤',
        risk: 'safe',
        outcome: {
          successChance: 0.9,
          success: { message: '灵草毫无防备地走进了你的陷阱！虽然它挣扎逃走了一部分，但你截获了不少。', materialReward: { id: 'rare_herb', amount: 1 }, spiritStonesChange: 50 },
          failure: { message: '灵草绕过了陷阱。但它在附近留下了灵液。', materialReward: { id: 'common_herb', amount: 1 } },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'rogue_cultivator',
    title: '散修拦路',
    narrative: '一个灰衣散修挡住了去路，目光不善："此路是我开，留下灵石来。"他手掐法诀，显然不是普通人。',
    region: '天南',
    rarity: 'common',
    type: 'combat',
    choices: [
      {
        id: 'fight', text: '出手迎战！', icon: '⚔️',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '几招过后，散修不敌你的攻势，仓皇逃走。你从他掉落的储物袋中获得了不少灵石！', spiritStonesChange: 150, bonusPointsChange: 300 },
          failure: { message: '散修实力不俗，你虽未落败却也无力追击。双方僵持一阵后各自退开。', hpChange: -15 },
        },
      },
      {
        id: 'pay', text: '交出灵石消灾', icon: '💰',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你交出了一些灵石，散修满意离去。但临走前他说了一句："你的灵根不错，小心别被人盯上。"', spiritStonesChange: -50, luckChange: 3 },
          failure: { message: '' },
        },
      },
      {
        id: 'befriend', text: '提议结伴同行', icon: '🤝',
        risk: 'risky',
        outcome: {
          successChance: 0.35,
          success: { message: '散修犹豫片刻，点头同意。你们结伴而行，他在路上指点了你不少修炼窍门！', bonusPointsChange: 400, luckChange: 5, spiritStonesChange: 30 },
          failure: { message: '散修冷笑："别套近乎。"他夺走了你一些灵石后离去。', spiritStonesChange: -80 },
        },
      },
    ],
    animation: 'shake',
  },
  {
    id: 'ancient_well',
    title: '古井异声',
    narrative: '幽冥洞深处，一口古井散发着幽幽蓝光。你凑近细听，井底传来阵阵低吟，似乎有生灵在呼救，又似在诱人下井。',
    region: '天南',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'descend', text: '顺绳索下井探查', icon: '🧗',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '井底竟然是一处上古洞府！你获得了前人留下的修炼资源和一枚丹药！', bonusPointsChange: 3000, materialReward: { id: 'pill_1', amount: 2 }, itemReward: 'book_1' },
          failure: { message: '井底是妖物的陷阱！你被阴气侵蚀，紧急脱出时损失了不少修为。', bonusPointsChange: -500, hpChange: -25 },
        },
      },
      {
        id: 'throw_stone', text: '丢一块石头试探', icon: '🪨',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '石头落水，井底泛起涟漪。水中映出了附近灵脉的走向图！你记住了路线，为日后探索打下基础。', bonusPointsChange: 200, luckChange: 5 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'ripple',
  },
  {
    id: 'flying_sword',
    title: '飞剑遗踪',
    narrative: '一道寒光从天而降，一把无主飞剑插在山石上，嗡嗡作响！剑身布满裂纹，但残余的灵力依然惊人。',
    region: '天南',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'pull', text: '尝试拔出飞剑', icon: '🗡️',
        risk: 'dangerous',
        outcome: {
          successChance: 0.25,
          success: { message: '飞剑认你为主！虽然品阶不高，但也是一件难得的法宝！', itemReward: 'artifact_2', bonusPointsChange: 500 },
          failure: { message: '飞剑反抗你的灵力，灵力反噬！你被震退，但剑上残留的灵气还是被你吸收了一些。', bonusPointsChange: 100, hpChange: -15 },
        },
      },
      {
        id: 'absorb', text: '吸收飞剑残余灵力', icon: '✋',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你将灵力注入飞剑，引导其中残余灵力流入体内。飞剑化为飞灰，但你修为精进不少。', bonusPointsChange: 800 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },

  // ===== 乱星海事件 =====
  {
    id: 'sea_monster',
    title: '海兽出没',
    narrative: '海面突然翻涌，一头巨大的海兽从水中跃出！它通体碧绿，长着数只巨眼，每只眼睛都在盯着你。腥风扑面而来！',
    region: '乱星海',
    rarity: 'common',
    type: 'combat',
    choices: [
      {
        id: 'fight', text: '迎战海兽！', icon: '⚔️',
        risk: 'dangerous',
        outcome: {
          successChance: 0.35,
          success: { message: '一番恶战，你斩杀了海兽！从它腹中剖出一颗妖丹和大量灵石！', spiritStonesChange: 300, bonusPointsChange: 800, materialReward: { id: 'millennium_lingzhi', amount: 1 } },
          failure: { message: '海兽力量超乎想象，你负伤逃离。但在搏斗中你领悟了一些战斗技巧。', bonusPointsChange: 200, hpChange: -30, storyFlag: 'touched_star_sea' },
        },
      },
      {
        id: 'dodge', text: '闪避绕行', icon: '🏃',
        risk: 'safe',
        outcome: {
          successChance: 0.85,
          success: { message: '你灵巧地避开了海兽的攻击，在它潜回海中时捞到了一些海中灵材。', materialReward: { id: 'rare_herb', amount: 2 }, storyFlag: 'touched_star_sea' },
          failure: { message: '海兽的尾巴扫中了你，但你还是逃脱了。', hpChange: -20, storyFlag: 'touched_star_sea' },
        },
      },
    ],
    animation: 'shake',
  },
  {
    id: 'island_treasure',
    title: '荒岛宝藏',
    narrative: '你在碧波岛的沙滩上发现了一个半埋的古老箱子。箱子上刻着奇异的符文，锁孔中隐隐有灵光闪烁。',
    region: '乱星海',
    rarity: 'uncommon',
    type: 'encounter',
    choices: [
      {
        id: 'open', text: '用灵力破解符文', icon: '🔓',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '符文被破开，箱中是上古修士留下的宝物！大量灵石和一件法宝！', spiritStonesChange: 500, bonusPointsChange: 1000 },
          failure: { message: '符文设置了反噬禁制！你被灵力冲击，但箱中飞出一颗灵石作为补偿。', hpChange: -15, spiritStonesChange: 30 },
        },
      },
      {
        id: 'dig', text: '在箱子周围挖掘', icon: '⛏️',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在箱子周围挖出了一些被海浪冲来的灵石和灵草。', spiritStonesChange: 100, materialReward: { id: 'common_herb', amount: 3 } },
          failure: { message: '' },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'star_ferry',
    title: '星渡舟',
    narrative: '港口停着一艘散发星光的小舟，舟上老者吆喝："星渡舟，渡有缘人！前往深海只需100灵石，包你安全到达！"',
    region: '乱星海',
    rarity: 'common',
    type: 'trade',
    choices: [
      {
        id: 'ride', text: '搭乘星渡舟（-100灵石）', icon: '⛵',
        risk: 'safe',
        outcome: {
          successChance: 0.9,
          success: { message: '星渡舟稳稳穿越风浪，老者一路上讲了许多海上见闻。你在深海区发现了新的机缘！', spiritStonesChange: -100, storyFlag: 'touched_star_sea', bonusPointsChange: 300 },
          failure: { message: '途中遇到风浪，老者将你安全送回，但灵石已付。', spiritStonesChange: -100 },
        },
      },
      {
        id: 'swim', text: '自己御器飞越', icon: '🌀',
        risk: 'dangerous',
        outcome: {
          successChance: 0.2,
          success: { message: '你凭借自身修为飞越海面，途中发现了一处水下灵脉！收获巨大！', bonusPointsChange: 1500, spiritStonesChange: 200, storyFlag: 'touched_star_sea' },
          failure: { message: '海面妖风突起，你被迫降落在一座荒岛上。不过岛上也有一些灵材。', hpChange: -20, materialReward: { id: 'rare_herb', amount: 1 }, storyFlag: 'touched_star_sea' },
        },
      },
    ],
    animation: 'ripple',
  },
  {
    id: 'pirate_ambush',
    title: '海盗伏击',
    narrative: '暗礁区突然升起数面黑旗！一伙海盗从四面八方包围过来，为首的是一个独眼大汉，手持一把锈迹斑斑的巨刀。',
    region: '乱星海',
    rarity: 'uncommon',
    type: 'combat',
    choices: [
      {
        id: 'fight', text: '以一敌众！', icon: '⚔️',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '你大发神威，独力击退海盗团！独眼大汉丢下宝箱仓皇逃走。', spiritStonesChange: 500, bonusPointsChange: 800 },
          failure: { message: '寡不敌众，你被海盗抢走了大量灵石。但你在战斗中领悟了一些战斗技巧。', spiritStonesChange: -200, bonusPointsChange: 200 },
        },
      },
      {
        id: 'negotiate', text: '提议合作分宝', icon: '🤝',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '独眼大汉考虑片刻同意了。你们一起找到了暗礁中的宝物，五五分成。', spiritStonesChange: 250 },
          failure: { message: '海盗表面答应，趁你不备偷袭！你损失了一些灵石后逃脱。', spiritStonesChange: -100, hpChange: -15 },
        },
      },
    ],
    animation: 'shake',
  },
  {
    id: 'dragon_palace',
    title: '龙宫现世',
    narrative: '海底深处，一座金碧辉煌的宫殿缓缓浮现。龙宫大门洞开，内部传来远古的钟声。无数灵光从宫中涌出，照亮了整个海底！',
    region: '乱星海',
    rarity: 'legendary',
    type: 'story',
    requiredStoryFlag: 'touched_star_sea',
    rewardStoryFlag: 'visited_dragon_palace',
    choices: [
      {
        id: 'enter', text: '踏入龙宫！', icon: '🐉',
        risk: 'dangerous',
        outcome: {
          successChance: 0.2,
          success: { message: '龙宫中的守护灵认可了你的资格！你获得了龙族传承，修为暴涨，灵根进化！', bonusPointsChange: 10000, spiritStonesChange: 2000, luckChange: 20, storyFlag: 'visited_dragon_palace' },
          failure: { message: '龙宫守护灵发起攻击，你勉强逃脱。但龙宫的灵气已经浸润了你的身体。', bonusPointsChange: 2000, hpChange: -30, storyFlag: 'visited_dragon_palace' },
        },
      },
      {
        id: 'observe', text: '在远处观察，吸收外泄灵气', icon: '👁️',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在龙宫外围吸收了浓郁的龙气，修为大进。虽然没有得到核心传承，但安全第一。', bonusPointsChange: 3000, spiritStonesChange: 500, storyFlag: 'visited_dragon_palace' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },

  // ===== 阴冥之地事件 =====
  {
    id: 'ghost_encounter',
    title: '亡魂指路',
    narrative: '一团淡蓝色的鬼火飘到你面前，凝聚成一个模糊的人形。它用沙哑的声音说："活人……你能看到我？请帮我完成一件心愿……"',
    region: '阴冥之地',
    rarity: 'common',
    type: 'encounter',
    choices: [
      {
        id: 'help', text: '倾听亡魂的请求', icon: '👻',
        risk: 'risky',
        outcome: {
          successChance: 0.6,
          success: { message: '亡魂请你将一枚玉佩送回凡人界的某处。你答应后，亡魂感激地将生前储物袋中的宝物赠予你。', spiritStonesChange: 300, bonusPointsChange: 500, storyFlag: 'passed_yin_boundary' },
          failure: { message: '亡魂突然暴走！你被阴气侵蚀，但也在阴气中淬炼了灵根。', hpChange: -25, bonusPointsChange: 200, storyFlag: 'passed_yin_boundary' },
        },
      },
      {
        id: 'purify', text: '以灵力超度亡魂', icon: '🙏',
        risk: 'safe',
        outcome: {
          successChance: 0.9,
          success: { message: '你的灵力净化了亡魂，它安详地消散。作为回报，亡魂留下了浓郁的阴灵之气，你的修为精进。', bonusPointsChange: 600, storyFlag: 'passed_yin_boundary' },
          failure: { message: '亡魂抗拒净化，但还是被驱散了。', bonusPointsChange: 200, storyFlag: 'passed_yin_boundary' },
        },
      },
    ],
    animation: 'pulse',
  },
  {
    id: 'nether_market',
    title: '冥市交易',
    narrative: '冥市与阳间坊市截然不同——这里用阴灵石交易，商品也多是阴冥之物。一个面容苍白的鬼修向你招手："道友，看看我的货？"',
    region: '阴冥之地',
    rarity: 'uncommon',
    type: 'trade',
    choices: [
      {
        id: 'buy', text: '购买阴冥丹药（-200灵石）', icon: '💊',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '阴冥丹药虽含阴气，但对修炼有奇效！你的修为大幅提升！', spiritStonesChange: -200, bonusPointsChange: 2000 },
          failure: { message: '丹药中的阴气过于浓郁，你花了很长时间才化解。修为反而有些受损。', spiritStonesChange: -200, bonusPointsChange: -300 },
        },
      },
      {
        id: 'sell', text: '出售阳间灵物', icon: '💰',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '阴冥之地的鬼修们对阳间灵物趋之若鹜，你赚了一大笔灵石！', spiritStonesChange: 400 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'soul_refinement',
    title: '炼魂之泉',
    narrative: '你发现一汪黑水泉眼，泉中漂浮着无数残破的魂体。这些魂体在泉中翻涌，散发出令人心悸的力量。炼魂泉，可炼化魂体增强自身，但代价是消耗大量灵力。',
    region: '阴冥之地',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'refine', text: '炼化魂体（消耗大量灵力）', icon: '🔥',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '你成功炼化了数个魂体！你的神识大增，修为暴涨！', bonusPointsChange: 5000, spiritPowerChange: -20, luckChange: -5 },
          failure: { message: '魂体反噬！你的神识被冲击，修为受损，灵力也被消耗殆尽。', bonusPointsChange: -1000, spiritPowerChange: -30, hpChange: -30 },
        },
      },
      {
        id: 'release', text: '超度这些魂体', icon: '🕊️',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你以慈悲之心超度了魂体，它们化为纯净灵力融入你的身体。虽然修为增长不多，但道心更加稳固。', bonusPointsChange: 1000, luckChange: 10 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'pulse',
  },
  {
    id: 'yin_yang_boundary',
    title: '阴阳交界',
    narrative: '你站在阴阳交汇之处，一侧是阳光普照的阳间，一侧是阴气弥漫的冥界。交界处有一座古老的石桥，桥头立着一块石碑："过桥者，阴阳两通。"',
    region: '阴冥之地',
    rarity: 'common',
    type: 'story',
    choices: [
      {
        id: 'cross', text: '走过石桥', icon: '🌉',
        risk: 'risky',
        outcome: {
          successChance: 0.6,
          success: { message: '你成功走过石桥！阴阳之气在你体内交融，你的修炼效率大幅提升！', bonusPointsChange: 1500, storyFlag: 'passed_yin_boundary', luckChange: 5 },
          failure: { message: '桥上的阴气过于浓重，你被逼退。但你已经在阴阳交界处淬炼了一番。', bonusPointsChange: 300, storyFlag: 'passed_yin_boundary' },
        },
      },
      {
        id: 'meditate', text: '在交界处打坐修炼', icon: '🧘',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在阴阳交汇处修炼，同时吸收阴阳二气，修为稳步提升。', bonusPointsChange: 500, storyFlag: 'passed_yin_boundary' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'ripple',
  },
  {
    id: 'nether_king',
    title: '冥王试炼',
    narrative: '冥王殿的大门轰然打开。一个身披玄袍的庞大身影坐在王座上，声音如雷："生人闯入冥界……有意思。本座给你一个机会——通过我的试炼，赐你冥王传承！"',
    region: '阴冥之地',
    rarity: 'legendary',
    type: 'story',
    requiredStoryFlag: 'passed_yin_boundary',
    rewardStoryFlag: 'nether_king_approval',
    choices: [
      {
        id: 'accept', text: '接受冥王试炼！', icon: '👑',
        risk: 'dangerous',
        outcome: {
          successChance: 0.15,
          success: { message: '你通过了冥王的全部考验！冥王大笑："好！千年来第一个通过的人！"你获得了冥王传承，阴冥之力涌入体内，修为翻天覆地！', bonusPointsChange: 30000, spiritStonesChange: 5000, luckChange: 25, storyFlag: 'nether_king_approval' },
          failure: { message: '试炼太过艰难，你未能通过。但冥王认可你的勇气，赐予你一丝冥界力量。', bonusPointsChange: 3000, spiritStonesChange: 500, storyFlag: 'nether_king_approval' },
        },
      },
      {
        id: 'decline', text: '婉拒冥王，请求指点', icon: '🙏',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '冥王点头："知进退，好品质。"他指点了你修炼的缺陷，你的修为精进了不少。', bonusPointsChange: 5000, spiritStonesChange: 1000, luckChange: 10, storyFlag: 'nether_king_approval' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },

  // ===== 灵界事件 =====
  {
    id: 'spirit_beast_tribulation',
    title: '灵兽渡劫',
    narrative: '天空中雷云密布，一只巨大的灵兽正在渡天劫！劫雷一道接一道劈下，灵兽已经奄奄一息。如果你出手帮助它渡劫成功，或许能得到一个强大的灵兽伙伴。',
    region: '灵界',
    rarity: 'rare',
    type: 'encounter',
    requiredStoryFlag: 'ascended_to_spirit',
    choices: [
      {
        id: 'help', text: '以灵力为灵兽挡劫', icon: '🛡️',
        risk: 'dangerous',
        outcome: {
          successChance: 0.2,
          success: { message: '你拼尽全力为灵兽挡住了最后一道天劫！灵兽成功渡劫，化为灵兽幼崽，认你为主！你的修为也在雷劫淬炼中大幅提升！', bonusPointsChange: 20000, spiritPowerChange: -30, luckChange: 15 },
          failure: { message: '天劫力量超乎想象，你和灵兽都被击中。灵兽陨落，你虽然受了重伤，但在劫雷中淬炼了肉身。', bonusPointsChange: 3000, hpChange: -40, spiritPowerChange: -20 },
        },
      },
      {
        id: 'watch', text: '旁观吸收逸散的劫雷之力', icon: '⚡',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你吸收了天劫逸散的雷灵之力，修为大进。虽然没能获得灵兽，但雷劫淬体的效果依然显著。', bonusPointsChange: 8000, luckChange: 5 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },
  {
    id: 'heavenly_court',
    title: '天庭遗宝',
    narrative: '天庭遗址深处，一座完好的宫殿散发着金光。宫殿大门紧闭，门上刻着上古仙文。你能感受到其中蕴含的浩瀚灵力。',
    region: '灵界',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'break', text: '以灵力强行破开大门', icon: '💥',
        risk: 'dangerous',
        outcome: {
          successChance: 0.2,
          success: { message: '你以强大的灵力震开了宫殿大门！内部的仙家宝物令你目眩神迷！修为暴增！', bonusPointsChange: 25000, spiritStonesChange: 3000 },
          failure: { message: '大门上的仙文反击，你被弹飞数十丈！不过仙文的灵力还是渗入了你的身体。', hpChange: -35, bonusPointsChange: 3000 },
        },
      },
      {
        id: 'understand', text: '参悟仙文寻找开门之法', icon: '📖',
        risk: 'risky',
        outcome: {
          successChance: 0.4,
          success: { message: '你参悟了仙文的含义，大门缓缓打开！获得了天庭的宝物！', bonusPointsChange: 15000, spiritStonesChange: 2000, luckChange: 10 },
          failure: { message: '仙文太过深奥，你未能参透。但参悟过程本身就是修炼。', bonusPointsChange: 3000 },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'dao_debate',
    title: '论道大会',
    narrative: '论道台上聚集了数十位灵界修士，正在就"道"的真谛进行辩论。台上最年长的修士看到你，微笑道："这位道友，可愿上台论道？"',
    region: '灵界',
    rarity: 'uncommon',
    type: 'encounter',
    choices: [
      {
        id: 'debate', text: '上台论道', icon: '🎤',
        risk: 'risky',
        outcome: {
          successChance: 0.45,
          success: { message: '你的见解令在场修士叹服！老修士赠你一部功法，你的修为大幅提升！', bonusPointsChange: 10000, luckChange: 10, spiritStonesChange: 1000 },
          failure: { message: '你在辩论中落于下风，但也学到了不少。修为有所增长。', bonusPointsChange: 2000, spiritStonesChange: 200 },
        },
      },
      {
        id: 'listen', text: '旁听吸取精华', icon: '👂',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你从众人的论道中领悟了不少道理，修为精进。', bonusPointsChange: 3000, luckChange: 5 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'pulse',
  },
  {
    id: 'immortal_herb',
    title: '仙灵之草',
    narrative: '仙灵园深处，一株散发九彩光芒的仙草正在缓缓生长。这是传说中只存在于灵界的仙灵草，蕴含着远超凡间的灵力。',
    region: '灵界',
    rarity: 'rare',
    type: 'encounter',
    choices: [
      {
        id: 'pick', text: '采摘仙灵草', icon: '🌿',
        risk: 'risky',
        outcome: {
          successChance: 0.4,
          success: { message: '仙灵草被你成功采摘！灵力之浓郁令你震惊，修为暴增！', bonusPointsChange: 15000, materialReward: { id: 'jiuzhuan_grass', amount: 2 } },
          failure: { message: '仙灵草的守护阵法被触发！你被弹开，但手掌沾染的灵液依然带来了不少修为。', hpChange: -20, bonusPointsChange: 2000 },
        },
      },
      {
        id: 'meditate', text: '在仙灵草旁修炼', icon: '🧘',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在仙灵草旁打坐，吸收它散发的仙灵之气。修为稳步提升。', bonusPointsChange: 5000 },
          failure: { message: '' },
        },
      },
    ],
    animation: 'glow',
  },
  {
    id: 'ascension_trial',
    title: '飞升试炼',
    narrative: '飞升台上，金光万丈。你感受到了来自更高层次世界的呼唤。但飞升并非易事——你必须通过天道的考验！',
    region: '灵界',
    rarity: 'legendary',
    type: 'story',
    rewardStoryFlag: 'ascended_to_spirit',
    choices: [
      {
        id: 'challenge', text: '迎接天道考验！', icon: '☀️',
        risk: 'dangerous',
        outcome: {
          successChance: 0.1,
          success: { message: '你通过了天道的考验！仙灵之气洗刷全身，你的修为达到了前所未有的高度！整个灵界都为你震动！', bonusPointsChange: 100000, spiritStonesChange: 10000, luckChange: 30, storyFlag: 'ascended_to_spirit' },
          failure: { message: '天道之力太过浩瀚，你未能通过考验。但试炼本身就是一种修炼，你的根基更加稳固了。', bonusPointsChange: 10000, spiritStonesChange: 1000, storyFlag: 'ascended_to_spirit' },
        },
      },
      {
        id: 'prepare', text: '暂缓飞升，先做准备', icon: '📝',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在飞升台旁仔细感悟天道法则，为未来的飞升打下基础。修为有所精进。', bonusPointsChange: 5000, luckChange: 5, storyFlag: 'ascended_to_spirit' },
          failure: { message: '' },
        },
      },
    ],
    animation: 'lightning',
  },
];

// ============================================
// 战斗敌人数据
// ============================================
export const COMBAT_ENEMIES: Record<string, CombatEnemy> = {
  demon_wolf: {
    id: 'demon_wolf',
    name: '妖狼',
    title: '山野妖兽',
    hp: 60,
    attack: 8,
    defense: 3,
    spriteEmoji: '🐺',
    spriteColor: 'text-gray-400',
    description: '浑身散发着妖气的野狼，双眼赤红',
    defeatMessage: '妖狼嚎叫一声，化为黑烟消散！',
    victoryReward: { message: '你击败了妖狼！', spiritStonesChange: 30, bonusPointsChange: 150 },
    defeatPenalty: { message: '妖狼将你击退！', hpChange: -15, bonusPointsChange: 30 },
    skills: [
      { name: '撕咬', damage: 12, emoji: '🦷', chance: 0.6, message: '妖狼扑上来狠狠咬了一口！' },
      { name: '妖风', damage: 8, emoji: '🌀', chance: 0.3, message: '妖狼释放出一股妖风！' },
      { name: '嚎叫强化', damage: 0, emoji: '📢', chance: 0.1, message: '妖狼仰天长嚎，攻击力增强！' },
    ],
  },
  rogue_cultivator: {
    id: 'rogue_cultivator',
    name: '灰衣散修',
    title: '拦路劫修',
    hp: 100,
    attack: 12,
    defense: 5,
    spriteEmoji: '🥷',
    spriteColor: 'text-gray-500',
    description: '一个面色阴沉的散修，法力不弱',
    defeatMessage: '散修不支，化为一道灰光逃走！',
    victoryReward: { message: '你击败了散修！从他的储物袋中获得不少灵石！', spiritStonesChange: 150, bonusPointsChange: 400 },
    defeatPenalty: { message: '散修将你击倒！你损失了一些灵石。', spiritStonesChange: -80, hpChange: -20 },
    skills: [
      { name: '灵力掌', damage: 15, emoji: '🖐️', chance: 0.5, message: '散修一掌拍来，灵力激荡！' },
      { name: '飞石术', damage: 10, emoji: '🪨', chance: 0.35, message: '散修催动飞石袭来！' },
      { name: '灵盾', damage: 0, emoji: '🛡️', chance: 0.15, message: '散修凝聚灵力护盾！' },
    ],
  },
  sea_serpent: {
    id: 'sea_serpent',
    name: '深海蛟蛇',
    title: '乱星海霸主',
    hp: 200,
    attack: 20,
    defense: 10,
    spriteEmoji: '🐍',
    spriteColor: 'text-cyan-400',
    description: '盘踞深海的蛟蛇，修为高深',
    defeatMessage: '蛟蛇发出悲鸣，沉入深海！',
    victoryReward: { message: '你斩杀了蛟蛇！获得大量珍宝！', spiritStonesChange: 500, bonusPointsChange: 1500, materialReward: { id: 'millennium_lingzhi', amount: 2 } },
    defeatPenalty: { message: '蛟蛇将你击退！', hpChange: -30, bonusPointsChange: 200 },
    skills: [
      { name: '水龙卷', damage: 25, emoji: '🌊', chance: 0.4, message: '蛟蛇掀起滔天巨浪！' },
      { name: '毒雾', damage: 15, emoji: '☠️', chance: 0.35, message: '蛟蛇喷出毒雾！' },
      { name: '龙息', damage: 35, emoji: '🐉', chance: 0.25, message: '蛟蛇释放龙族吐息！' },
    ],
  },
  ghost_general: {
    id: 'ghost_general',
    name: '鬼将',
    title: '冥界守卫',
    hp: 150,
    attack: 18,
    defense: 8,
    spriteEmoji: '💀',
    spriteColor: 'text-purple-400',
    description: '身披幽甲的冥界将领，杀气凛然',
    defeatMessage: '鬼将化为黑烟消散于冥界之中！',
    victoryReward: { message: '你击败了鬼将！获得冥界战利品！', spiritStonesChange: 400, bonusPointsChange: 1200 },
    defeatPenalty: { message: '鬼将将你击败！你被阴气侵蚀。', hpChange: -35, bonusPointsChange: -200 },
    skills: [
      { name: '幽冥斩', damage: 22, emoji: '⚔️', chance: 0.45, message: '鬼将挥出幽冥之刃！' },
      { name: '阴魂缠绕', damage: 12, emoji: '👻', chance: 0.35, message: '无数阴魂缠绕住你！' },
      { name: '冥界之门', damage: 30, emoji: '🕳️', chance: 0.2, message: '鬼将打开冥界之门召唤阴兵！' },
    ],
  },
  spirit_guardian: {
    id: 'spirit_guardian',
    name: '灵界守护者',
    title: '天庭遗将',
    hp: 300,
    attack: 28,
    defense: 15,
    spriteEmoji: '⚔️',
    spriteColor: 'text-amber-400',
    description: '上古天庭留下的守护灵，实力深不可测',
    defeatMessage: '守护者点头认可："你够资格。"',
    victoryReward: { message: '你击败了灵界守护者！获得天庭遗宝！', spiritStonesChange: 2000, bonusPointsChange: 8000, luckChange: 15 },
    defeatPenalty: { message: '守护者将你击退，但你获得了宝贵的战斗经验。', hpChange: -40, bonusPointsChange: 1000 },
    skills: [
      { name: '天雷斩', damage: 35, emoji: '⚡', chance: 0.35, message: '守护者挥出天雷之刃！' },
      { name: '仙光护体', damage: 0, emoji: '✨', chance: 0.25, message: '守护者凝聚仙光防御！' },
      { name: '灭世一击', damage: 50, emoji: '💥', chance: 0.2, message: '守护者蓄力发出毁灭一击！' },
      { name: '天道压制', damage: 20, emoji: '🌟', chance: 0.2, message: '天道之力压制你的灵力！' },
    ],
  },
};

// ============================================
// 辅助函数
// ============================================

/** 根据区域和条件筛选可用事件 */
export function getAvailableAdventureEvents(
  regionId: string,
  levelIndex: number,
  storyFlags: Record<string, boolean>,
  completedEvents: string[]
): AdventureEvent[] {
  return ADVENTURE_EVENTS.filter(e => {
    if (e.region !== regionId) return false;
    if (e.minLevelIndex !== undefined && levelIndex < e.minLevelIndex) return false;
    if (e.requiredStoryFlag && !storyFlags[e.requiredStoryFlag]) return false;
    // 已完成的事件30%概率再次出现（增加可玩性）
    if (completedEvents.includes(e.id) && Math.random() > 0.3) return false;
    return true;
  });
}

/** 根据稀有度权重随机选择事件 */
export function pickRandomAdventureEvent(events: AdventureEvent[]): AdventureEvent | null {
  if (events.length === 0) return null;

  const weights: Record<string, number> = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5,
  };

  const weighted: AdventureEvent[] = [];
  events.forEach(e => {
    const w = weights[e.rarity] || 1;
    for (let i = 0; i < w; i++) weighted.push(e);
  });

  return weighted[Math.floor(Math.random() * weighted.length)] || events[0];
}

/** 根据区域ID获取对应的战斗敌人 */
export function getEnemyForRegion(regionId: string): CombatEnemy | null {
  const mapping: Record<string, string> = {
    '凡人界': 'demon_wolf',
    '天南': 'rogue_cultivator',
    '乱星海': 'sea_serpent',
    '阴冥之地': 'ghost_general',
    '灵界': 'spirit_guardian',
  };
  const enemyId = mapping[regionId];
  return enemyId ? COMBAT_ENEMIES[enemyId] || null : null;
}

/** 计算玩家战斗力 */
export function calculateCombatPower(levelIndex: number, equippedSkills: string[], equippedArtifacts: string[]): number {
  let power = 10 + levelIndex * 8;
  power += equippedSkills.length * 15;
  power += equippedArtifacts.length * 20;
  return power;
}

/** 灵力上限计算 */
export function calculateMaxSpiritPower(levelIndex: number): number {
  return 50 + levelIndex * 5;
}
