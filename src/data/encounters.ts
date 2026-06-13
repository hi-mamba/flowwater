// 凡人修仙传风格 · 每日奇遇系统

export interface EncounterChoice {
  id: string;
  text: string;
  risk: 'safe' | 'risky' | 'dangerous';
  outcome: {
    successChance: number;
    success: { message: string; reward: { type: string; amount: number; item?: string } | null };
    failure: { message: string; penalty: { type: string; amount: number } | null; reward?: { type: string; amount: number; item?: string } | null };
  };
}

export interface Encounter {
  id: string;
  title: string;
  narrative: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  minLevel?: number;
  region?: string;
  trigger?: 'daily' | 'drink' | 'breakthrough' | 'random';
  choices: EncounterChoice[];
}

// 预定义的凡人修仙传经典奇遇
export const ENCOUNTERS: Encounter[] = [
  // === 常见奇遇 (daily) ===
  {
    id: 'herb_found',
    title: '路遇灵草',
    narrative: '你沿着山路返回洞府，忽见崖壁缝隙中透出一丝微光。走近细看，竟是一株野生灵草，灵气氤氲。',
    rarity: 'common',
    trigger: 'daily',
    choices: [
      {
        id: 'pick',
        text: '小心采摘',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你小心翼翼地将灵草连根拔起，收入储物袋。', reward: { type: 'material', amount: 1, item: 'common_herb' } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'water',
        text: '取灵泉水浇灌',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '灵泉滋润下，灵草长得更加茂盛，你获得了更多炼丹材料。同时喝下一口灵泉，修为微增。', reward: { type: 'material', amount: 2, item: 'common_herb' } },
          failure: { message: '', penalty: null },
        },
      },
    ],
  },
  {
    id: 'traveling_merchant',
    title: '游方商人',
    narrative: '一位须发皆白的老者牵着驼兽经过，停在你的洞府前。"这位道友，老朽这里有些稀罕物件，可有兴趣一观？"',
    rarity: 'common',
    trigger: 'daily',
    choices: [
      {
        id: 'browse',
        text: '看看货物（消耗 50 灵石）',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你以极低的价格淘到一张古丹方所需的灵草。', reward: { type: 'material', amount: 1, item: 'rare_herb' } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'decline',
        text: '婉言谢绝，继续修炼',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '老者也不勉强，驾着驼兽缓缓离去。你收拢心神，继续吐纳。', reward: { type: 'cultivation', amount: 50 } },
          failure: { message: '', penalty: null },
        },
      },
    ],
  },

  // === 罕见奇遇 ===
  {
    id: 'ancient_formation',
    title: '古传送阵',
    narrative: '你在密林深处发现了一座布满青苔的古老传送阵。阵纹虽已暗淡，但仍隐隐散发着空间波动。这可能是通往某处秘境或宝库的入口，也可能是陷阱。',
    rarity: 'uncommon',
    trigger: 'random',
    choices: [
      {
        id: 'activate',
        text: '注入灵力激活传送阵',
        risk: 'risky',
        outcome: {
          successChance: 0.55,
          success: { message: '传送阵亮起耀眼光芒，你被传送到一处隐藏秘境！获得大量灵石和稀有材料！', reward: { type: 'spiritStones', amount: 500 } },
          failure: { message: '传送阵失控，空间乱流将你抛回原地。你受了一些内伤，损失部分修为。', penalty: { type: 'cultivation', amount: 200 } },
        },
      },
      {
        id: 'study',
        text: '仔细研究阵纹，记录后离去',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你记下了古传送阵的阵纹结构，对阵法的理解精进不少。', reward: { type: 'formation_exp', amount: 5 } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'destroy',
        text: '毁掉传送阵，防止他人进入',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '你成功破坏了传送阵的核心，意外获得了阵法核心中的上古灵石！', reward: { type: 'spiritStones', amount: 2000 } },
          failure: { message: '传送阵爆炸，强烈的空间震荡波及了你！修为大损！', penalty: { type: 'cultivation', amount: 1000 } },
        },
      },
    ],
  },
  {
    id: 'injured_cultivator',
    title: '受伤的同道',
    narrative: '你在一处山洞中发现一名重伤昏迷的修士。从衣着看，似乎是某个大宗门的弟子。他身下的血泊中散落着几件法器碎片和一个储物袋。',
    rarity: 'uncommon',
    trigger: 'random',
    choices: [
      {
        id: 'help',
        text: '出手相救，用丹药为他疗伤',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你取出疗伤丹药为他服下。修士醒来后感激涕零，将储物袋中的宝物相赠，并表示日后必有厚报。', reward: { type: 'spiritStones', amount: 300 } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'take',
        text: '趁人之危，取走储物袋',
        risk: 'risky',
        outcome: {
          successChance: 0.4,
          success: { message: '你悄悄取走储物袋，里面竟有一枚筑基丹！', reward: { type: 'material', amount: 1, item: 'pill_foundation' } },
          failure: { message: '修士突然醒来，发现你的举动，愤怒地以秘术逃走。你什么都没得到，还结下了仇家。', penalty: { type: 'luck', amount: 20 } },
        },
      },
    ],
  },
  {
    id: 'mysterious_old_man',
    title: '神秘老者',
    narrative: '月光下，一位看不清面容的老者坐在溪边垂钓。他头也不回地说："小家伙，你身上有灵根的气息。老夫这里有一部功法，只传有缘人。"说着，一卷玉简浮空飘来。',
    rarity: 'uncommon',
    minLevel: 0,
    trigger: 'random',
    choices: [
      {
        id: 'accept',
        text: '恭敬接过玉简',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '玉简中记载的是一门上古吐纳术。你的饮水修为永久提升 15%！', reward: { type: 'passive_boost', amount: 15 } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'kneel',
        text: '跪地叩拜，恳请收徒',
        risk: 'risky',
        outcome: {
          successChance: 0.2,
          success: { message: '老者大笑三声："好！老夫已千年未收徒，今日破例！"他赐你一枚洗髓丹和一部完整功法，你的灵根资质提升了！', reward: { type: 'spiritual_root_upgrade', amount: 1 } },
          failure: { message: '老者摇了摇头："缘分未到。"化为一道青光消失不见。', penalty: null },
        },
      },
    ],
  },

  // === 稀有奇遇 ===
  {
    id: 'ancient_cave',
    title: '上古修士洞府',
    narrative: '你在一处瀑布后发现了一个隐蔽的洞口。洞内别有洞天，是上古某位大修士的坐化之地！墙壁上刻满了密密麻麻的功法口诀，中央石台上放着一个玉盒。',
    rarity: 'rare',
    minLevel: 14,
    trigger: 'random',
    choices: [
      {
        id: 'open',
        text: '打开玉盒',
        risk: 'dangerous',
        outcome: {
          successChance: 0.35,
          success: { message: '玉盒中是一枚九转金丹和一套完整的古修士功法！你的修为暴涨！', reward: { type: 'cultivation', amount: 50000 } },
          failure: { message: '玉盒上设有强大禁制！你被反噬，修为受损。但禁制松动，你获得了一些残留灵力。', penalty: { type: 'cultivation', amount: 3000 } },
        },
      },
      {
        id: 'study_walls',
        text: '参悟墙壁上的功法口诀',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你将古修士留下的功法口诀牢记于心，饮水中蕴含的灵力转化效率大幅提升。', reward: { type: 'passive_boost', amount: 25 } },
          failure: { message: '', penalty: null },
        },
      },
    ],
  },
  {
    id: 'treasure_map',
    title: '藏宝图碎片',
    narrative: '你在坊市的地摊上发现一张残破的兽皮卷。摊主是个落魄散修，开价 200 灵石。你仔细辨认，发现这可能是传说中血色禁地深处某处秘藏的线索！',
    rarity: 'rare',
    trigger: 'daily',
    choices: [
      {
        id: 'buy',
        text: '果断买下（-200 灵石）',
        risk: 'risky',
        outcome: {
          successChance: 0.6,
          success: { message: '你根据藏宝图指引，在血色禁地深处找到一处隐藏宝库！获得大量灵石和一把古宝飞剑！', reward: { type: 'spiritStones', amount: 5000 } },
          failure: { message: '可惜藏宝图残缺不全，你扑了个空。但探索过程中你意外发现了一些灵草。', penalty: { type: 'spiritStones', amount: 200 } },
        },
      },
      {
        id: 'pass',
        text: '不买，这东西像假的',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你继续闲逛，用省下的灵石买了一些修炼用的丹药。', reward: { type: 'material', amount: 2, item: 'pill_1' } },
          failure: { message: '', penalty: null },
        },
      },
    ],
  },
  {
    id: 'demonic_cultivator',
    title: '遭遇魔修',
    narrative: '你正在洞府修炼，突然感到一股阴冷的魔气逼近！一个黑袍魔修站在你的洞府外，阴森笑道："此处灵气不错，归我了！道友是自己走，还是我送你走？"',
    rarity: 'rare',
    minLevel: 10,
    trigger: 'random',
    choices: [
      {
        id: 'fight',
        text: '拔剑迎战！',
        risk: 'dangerous',
        outcome: {
          successChance: 0.3,
          success: { message: '一番激战后，你重伤了魔修！他仓皇逃走，留下了一个储物袋。里面竟有降尘丹和大量灵石！', reward: { type: 'spiritStones', amount: 3000 } },
          failure: { message: '魔修实力远超你的预想。你被重伤，修为大损。', penalty: { type: 'cultivation', amount: 5000 } },
        },
      },
      {
        id: 'flee',
        text: '启动预先布置的传送符逃走',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你在魔修出手的前一刻激活传送符，有惊无险地传送到安全地点。虽然保住了性命，但洞府被占。', reward: { type: 'spiritStones', amount: 0 } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'negotiate',
        text: '提出用灵石换取和平',
        risk: 'risky',
        outcome: {
          successChance: 0.5,
          success: { message: '魔修收下灵石后大笑离去。但他临走时丢下一句话："你这小子倒识趣，下次见面饶你一命。"你意外获得了魔修的认可。', reward: { type: 'luck', amount: 10 } },
          failure: { message: '魔修收了灵石后突然变卦，出手偷袭！你措手不及，损失惨重。', penalty: { type: 'spiritStones', amount: 1000 } },
        },
      },
    ],
  },

  // === 传说级奇遇 (极低概率) ===
  {
    id: 'heavenly_bottle_discovery',
    title: '掌天瓶现世',
    narrative: '你在溪边饮水时，水面突然泛起七彩光芒。一个翠绿色的小瓶自水底浮起，瓶身布满玄奥纹路，散发着令天地变色的灵力波动！这...这不就是传说中的掌天瓶吗？！',
    rarity: 'legendary',
    trigger: 'drink',
    choices: [
      {
        id: 'grab',
        text: '伸手抓住掌天瓶！',
        risk: 'dangerous',
        outcome: {
          successChance: 0.15,
          success: { message: '你成功握住了掌天瓶！一股浩瀚的灵力涌入体内，你的资质发生了翻天覆地的变化！灵根直接晋升为天灵根！掌天瓶认你为主！', reward: { type: 'spiritual_root_upgrade', amount: 3 } },
          failure: { message: '掌天瓶释放的强大灵力排斥了你。但你触碰瓶身时吸收了一丝仙灵之气，修为仍大幅提升。', penalty: { type: 'cultivation', amount: 0 } },
        },
      },
      {
        id: 'observe',
        text: '屏息凝神，观察情况',
        risk: 'safe',
        outcome: {
          successChance: 0.6,
          success: { message: '瓶身上浮现出一篇太古仙文。你勉强读懂了一小段，领悟了夺天地造化的吐纳之法。饮水修为永久翻倍！', reward: { type: 'passive_boost', amount: 100 } },
          failure: { message: '仙文太过深奥，你只记住了只言片语。但掌天瓶的一丝灵力已融入你的体内。', penalty: null, reward: { type: 'passive_boost', amount: 20 } },
        },
      },
    ],
  },
  {
    id: 'ascension_vision',
    title: '飞升异象',
    narrative: '天突然暗了下来。九色雷云在天空聚集，一道巨大的光柱从天而降，笼罩了你的洞府。光柱中，你看到了一座巍峨的飞升台，那是——通往真仙界的入口！',
    rarity: 'legendary',
    minLevel: 30,
    trigger: 'breakthrough',
    choices: [
      {
        id: 'step_in',
        text: '踏入光柱！',
        risk: 'dangerous',
        outcome: {
          successChance: 0.1,
          success: { message: '你成功踏上了飞升台！仙灵之气洗刷全身，你直接从当前境界连破三级！更重要的是——你感应到了真仙界的存在！', reward: { type: 'level_boost', amount: 3 } },
          failure: { message: '光柱的力量太过强大，你的肉身难以承受。但仙灵之气已经改造了你的体质，灵根大幅提升！', penalty: { type: 'cultivation', amount: 0 } },
        },
      },
      {
        id: 'absorb',
        text: '在光柱边缘吸收逸散的仙气',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '你贪婪地吸收着逸散的仙灵之气。当光柱消散时，你的修为已经有了质的飞跃！', reward: { type: 'cultivation', amount: 100000 } },
          failure: { message: '', penalty: null },
        },
      },
    ],
  },
  {
    id: 'hanli_meeting',
    title: '韩立！',
    narrative: '你看到一个青袍青年坐在路边的大石上，手中把玩着一个翠绿小瓶。他抬头看了你一眼，淡淡说道："道友也是散修？要不去前面的坊市一起看看？"那淡漠的眼神、那熟悉的小瓶——这分明就是传说中的韩立！',
    rarity: 'legendary',
    minLevel: 20,
    trigger: 'random',
    choices: [
      {
        id: 'follow',
        text: '恭敬跟随',
        risk: 'safe',
        outcome: {
          successChance: 1.0,
          success: { message: '韩立带着你进入了一处隐藏的秘市，以极低的价格买到了数件珍品。临别时，他递给你一个玉简："这里面是青元剑诀的前三层，能领悟多少看你造化了。"', reward: { type: 'passive_boost', amount: 50 } },
          failure: { message: '', penalty: null },
        },
      },
      {
        id: 'challenge',
        text: '出言挑衅，想试试他的实力',
        risk: 'dangerous',
        outcome: {
          successChance: 0.01,
          success: { message: '你竟接住了韩立一剑！他微微点头："不错。"随即扔给你一枚筑基丹后飘然离去。', reward: { type: 'material', amount: 1, item: 'pill_foundation' } },
          failure: { message: '韩立连剑都没拔，轻轻一拂袖，你便被一股无形之力推出十丈之外。你从地上爬起来，突然发现自己的修为反而精进了——对方的一拂竟然蕴含了灵力淬体！', penalty: { type: 'cultivation', amount: 0 } },
        },
      },
    ],
  },
];

// V8.0: NPC 声望系统
export interface NpcReputation {
  id: string;
  name: string;
  title: string;
  reputation: number; // -100 to 100
  relationship: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'dao_companion' | 'enemy';
  firstMet: number;
  lastInteraction: number;
  interactions: number;
}

export function getNpcRelationship(reputation: number): NpcReputation['relationship'] {
  if (reputation >= 80) return 'dao_companion';
  if (reputation >= 50) return 'close_friend';
  if (reputation >= 20) return 'friend';
  if (reputation >= 0) return 'acquaintance';
  if (reputation >= -50) return 'stranger';
  return 'enemy';
}

export const WORLD_NPCS: Array<Omit<NpcReputation, 'reputation' | 'relationship' | 'firstMet' | 'lastInteraction' | 'interactions'>> = [
  { id: 'npc_hanli', name: '韩立', title: '青袍散修' },
  { id: 'npc_nangong', name: '南宫婉', title: '掩月宗长老' },
  { id: 'npc_ziling', name: '紫灵仙子', title: '妙音门' },
  { id: 'npc_yinyue', name: '银月', title: '妖族皇族' },
  { id: 'npc_lifei', name: '厉飞雨', title: '凡人武者' },
  { id: 'npc_xiang', name: '向之礼', title: '化神修士' },
];

// 根据条件筛选可用的奇遇
export function getAvailableEncounters(
  levelIndex: number,
  currentRegion: string,
  hasDrunkToday: boolean,
  isBreakthrough: boolean
): Encounter[] {
  return ENCOUNTERS.filter(e => {
    if (e.minLevel && levelIndex < e.minLevel) return false;
    if (e.region && e.region !== currentRegion) return false;
    if (e.trigger === 'drink' && !hasDrunkToday) return false;
    if (e.trigger === 'breakthrough' && !isBreakthrough) return false;
    return true;
  });
}

// 根据稀有度权重随机选择
export function pickRandomEncounter(available: Encounter[]): Encounter | null {
  if (available.length === 0) return null;

  const weights: Record<string, number> = {
    common: 70,
    uncommon: 20,
    rare: 8,
    legendary: 2,
  };

  const weighted: Encounter[] = [];
  available.forEach(e => {
    const w = weights[e.rarity] || 1;
    for (let i = 0; i < w; i++) weighted.push(e);
  });

  return weighted[Math.floor(Math.random() * weighted.length)] || available[0];
}
