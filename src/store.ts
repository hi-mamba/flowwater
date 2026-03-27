import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, isAfter, isBefore, parse, format, startOfDay, endOfDay } from 'date-fns';

export const PRESET_CHARACTERS = [
  {
    id: 'hanli',
    name: '韩立',
    background: '山村少年，机缘巧合下进入七玄门，获得掌天瓶。',
    talent: '坚韧不拔：突破成功率提升10%，闭关收益提升20%。',
    growthPath: '凡人流：稳扎稳打，资源获取更稳定。',
    spiritualRoot: 'mixed', // 四灵根
    initialSpiritStones: 100,
    initialArtifacts: ['heavenly_bottle'],
    bonusType: 'breakthrough_rate',
    bonusValue: 0.1
  },
  {
    id: 'lizongzhu',
    name: '李宗主',
    background: '名门之后，天生异象，宗门未来的希望。',
    talent: '宗门领袖：宗门贡献获取提升50%，每日俸禄提升100%。',
    growthPath: '天才流：境界突破极快，但根基需稳固。',
    spiritualRoot: 'heaven', // 天灵根
    initialSpiritStones: 1000,
    initialArtifacts: [],
    bonusType: 'prestige_bonus',
    bonusValue: 1.5
  },
  {
    id: 'ziling',
    name: '紫灵',
    background: '乱星海妙音门之后，绝色倾城，精通魅术。',
    talent: '倾城之姿：道侣互动效果提升100%，购买物品价格降低20%。',
    growthPath: '辅助流：擅长利用资源与人脉。',
    spiritualRoot: 'mutated', // 变异灵根
    initialSpiritStones: 500,
    initialArtifacts: [],
    bonusType: 'shop_discount',
    bonusValue: 0.8
  }
];

export const REGIONS = [
  { id: '凡人界', name: '凡人界', minLevel: 0, description: '凡人居住之地，灵气稀薄。', cost: 0, multiplier: 1.0 },
  { id: '天南', name: '天南', minLevel: 2000, description: '修仙界偏僻之地，资源匮乏。', cost: 100, multiplier: 1.2 },
  { id: '乱星海', name: '乱星海', minLevel: 10000, description: '海外修仙界，妖兽众多，资源丰富。需通过古传送阵前往。', cost: 1000, multiplier: 1.5 },
  { id: '阴冥之地', name: '阴冥之地', minLevel: 50000, description: '阴气极重之地，传闻有鬼修出没。', cost: 5000, multiplier: 1.8 },
  { id: '大晋', name: '大晋', minLevel: 100000, description: '人界修炼圣地，宗门林立，资源极度丰富。', cost: 10000, multiplier: 2.2 },
  { id: '灵界', name: '灵界', minLevel: 10000000, description: '更高层次的世界，灵气浓郁，强者如云。', cost: 100000, multiplier: 3.0 },
];

export const CULTIVATION_LEVELS = [
  { name: '凡人', min: 0, bg: 'from-slate-900 to-slate-800', color: 'text-slate-400' },
  { name: '炼气一层', min: 2000, bg: 'from-slate-900 to-blue-900/10', color: 'text-blue-200' },
  { name: '炼气二层', min: 2500, bg: 'from-slate-900 to-blue-900/20', color: 'text-blue-200' },
  { name: '炼气三层', min: 3000, bg: 'from-slate-900 to-blue-900/30', color: 'text-blue-200' },
  { name: '炼气四层', min: 3500, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气五层', min: 4000, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气六层', min: 4500, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气七层', min: 5000, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气八层', min: 5500, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气九层', min: 6000, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气十层', min: 6500, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十一层', min: 7000, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十二层', min: 8000, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十三层', min: 9000, bg: 'from-slate-900 to-blue-900/70', color: 'text-blue-600' },
  { name: '筑基初期', min: 10000, bg: 'from-slate-900 to-emerald-900/40', color: 'text-emerald-300' },
  { name: '筑基中期', min: 15000, bg: 'from-slate-900 to-emerald-900/50', color: 'text-emerald-400' },
  { name: '筑基后期', min: 20000, bg: 'from-slate-900 to-emerald-900/60', color: 'text-emerald-500' },
  { name: '筑基巅峰', min: 25000, bg: 'from-slate-900 to-emerald-900/70', color: 'text-emerald-600' },
  { name: '结丹初期', min: 30000, bg: 'from-slate-900 to-yellow-900/40', color: 'text-yellow-300' },
  { name: '结丹中期', min: 45000, bg: 'from-slate-900 to-yellow-900/50', color: 'text-yellow-400' },
  { name: '结丹后期', min: 60000, bg: 'from-slate-900 to-yellow-900/60', color: 'text-yellow-500' },
  { name: '结丹巅峰', min: 80000, bg: 'from-slate-900 to-yellow-900/70', color: 'text-yellow-600' },
  { name: '元婴初期', min: 100000, bg: 'from-slate-900 to-purple-900/40', color: 'text-purple-300' },
  { name: '元婴中期', min: 150000, bg: 'from-slate-900 to-purple-900/50', color: 'text-purple-400' },
  { name: '元婴后期', min: 200000, bg: 'from-slate-900 to-purple-900/60', color: 'text-purple-500' },
  { name: '元婴巅峰', min: 250000, bg: 'from-slate-900 to-purple-900/70', color: 'text-purple-600' },
  { name: '化神初期', min: 300000, bg: 'from-slate-900 to-rose-900/40', color: 'text-rose-300' },
  { name: '化神中期', min: 400000, bg: 'from-slate-900 to-rose-900/50', color: 'text-rose-400' },
  { name: '化神后期', min: 500000, bg: 'from-slate-900 to-rose-900/60', color: 'text-rose-500' },
  { name: '化神巅峰', min: 600000, bg: 'from-slate-900 to-rose-900/70', color: 'text-rose-600' },
  { name: '炼虚初期', min: 700000, bg: 'from-slate-900 to-cyan-900/40', color: 'text-cyan-300' },
  { name: '炼虚中期', min: 850000, bg: 'from-slate-900 to-cyan-900/50', color: 'text-cyan-400' },
  { name: '炼虚后期', min: 1000000, bg: 'from-slate-900 to-cyan-900/60', color: 'text-cyan-500' },
  { name: '炼虚巅峰', min: 1200000, bg: 'from-slate-900 to-cyan-900/70', color: 'text-cyan-600' },
  { name: '合体初期', min: 1500000, bg: 'from-slate-900 to-indigo-900/40', color: 'text-indigo-300' },
  { name: '合体中期', min: 2000000, bg: 'from-slate-900 to-indigo-900/50', color: 'text-indigo-400' },
  { name: '合体后期', min: 2500000, bg: 'from-slate-900 to-indigo-900/60', color: 'text-indigo-500' },
  { name: '合体巅峰', min: 3000000, bg: 'from-slate-900 to-indigo-900/70', color: 'text-indigo-600' },
  { name: '大乘初期', min: 4000000, bg: 'from-slate-900 to-fuchsia-900/40', color: 'text-fuchsia-300' },
  { name: '大乘中期', min: 5000000, bg: 'from-slate-900 to-fuchsia-900/50', color: 'text-fuchsia-400' },
  { name: '大乘后期', min: 6000000, bg: 'from-slate-900 to-fuchsia-900/60', color: 'text-fuchsia-500' },
  { name: '大乘巅峰', min: 8000000, bg: 'from-slate-900 to-fuchsia-900/70', color: 'text-fuchsia-600' },
  { name: '渡劫期', min: 10000000, bg: 'from-slate-900 to-red-900/40', color: 'text-red-300' },
];

export const DAO_COMPANIONS = [
  { id: 'nangongwan', name: '南宫婉', sect: '掩月宗', reqLevel: '结丹初期', effect: 2.0, desc: '掩月宗长老，修炼素女轮回功。双修可大幅提升修为。', strategy: '需加入掩月宗或修为达到结丹期方可结为道侣。' },
  { id: 'ziling', name: '紫灵仙子', sect: '妙音门', reqLevel: '筑基后期', effect: 1.5, desc: '乱星海第一美女，精通魅术与阵法。', strategy: '需赠送稀有驻颜丹或灵石打动其心。' },
  { id: 'yinyue', name: '银月', sect: '无', reqLevel: '元婴初期', effect: 1.8, desc: '妖族皇族，精通各种秘术，可辅助战斗与修炼。', strategy: '需在秘境中解救其神魂。' },
  { id: 'yuanyao', name: '元瑶', sect: '无', reqLevel: '筑基中期', effect: 1.3, desc: '重情重义，修炼鬼道功法。', strategy: '需在阴冥之地相遇并协助其脱困。' },
  { id: 'dongxuaner', name: '董萱儿', sect: '黄枫谷', reqLevel: '炼气十层', effect: 1.1, desc: '红拂仙子之徒，修炼化春诀。', strategy: '需同属黄枫谷且在宗门大比中展露头角(胜场≥5)。' },
  { id: 'chenqiaoqian', name: '陈巧倩', sect: '黄枫谷', reqLevel: '炼气九层', effect: 1.1, desc: '陈家大小姐，性格刚烈。', strategy: '需在太南小会或门派任务中结识并相救。' },
];

export const SPIRITUAL_ROOTS = [
  { id: 'heaven', name: '天灵根', bonus: 5.0, chance: 0.01, desc: '万中无一，修炼速度极快', color: 'text-amber-400' },
  { id: 'mutated', name: '变异灵根', bonus: 4.5, chance: 0.005, desc: '异变之体，威力绝伦', color: 'text-rose-500' },
  { id: 'waste_genius', name: '废柴逆袭', bonus: 10.0, chance: 0.001, desc: '大器晚成，气运之子', color: 'text-emerald-300' },
  { id: 'dual', name: '双灵根', bonus: 3.0, chance: 0.05, desc: '资质优异，前途无量', color: 'text-purple-400' },
  { id: 'triple', name: '三灵根', bonus: 2.0, chance: 0.15, desc: '资质平平，需勤能补拙', color: 'text-sky-400' },
  { id: 'mixed', name: '杂灵根', bonus: 1.0, chance: 0.784, desc: '资质低劣，仙道艰难', color: 'text-slate-400' },
  { id: 'none', name: '无灵根', bonus: 0, chance: 0, desc: '凡人之躯，需洗毛伐髓', color: 'text-slate-500' },
];

export const SECTS = [
  // 凡人界
  { id: 'qixuan', name: '七玄门', desc: '凡俗武林大派，每日步数修为提升20%', bonusType: 'step_cultivation', bonusValue: 1.2 },
  { id: 'siping', name: '四平帮', desc: '凡俗帮派，每日俸禄增加20%', bonusType: 'daily_salary', bonusValue: 1.2 },
  { id: 'yelang', name: '野狼帮', desc: '凶悍帮派，战斗胜率提升5%', bonusType: 'combat_win_rate', bonusValue: 0.05 },
  { id: 'jingjiao', name: '惊蛟会', desc: '墨大夫创立，毒术暗器防不胜防', bonusType: 'combat_win_rate', bonusValue: 0.05 },
  // 天南七派
  { id: 'huangfeng', name: '黄枫谷', desc: '擅长炼丹，每次饮水额外获得1点炼丹经验', bonusType: 'alchemy_exp', bonusValue: 1 },
  { id: 'yanyue', name: '掩月宗', desc: '双修大宗，道侣互动效果提升50%', bonusType: 'companion_bonus', bonusValue: 1.5 },
  { id: 'lingshou', name: '灵兽山', desc: '御兽宗门，秘境探索获得材料概率提升20%', bonusType: 'explore_material', bonusValue: 1.2 },
  { id: 'qingxu', name: '清虚门', desc: '道家正统，早晨(5点-9点)饮水修为翻倍', bonusType: 'morning_double', bonusValue: 2 },
  { id: 'huadao', name: '化刀坞', desc: '刀修门派，突破成功率额外提升5%', bonusType: 'breakthrough_rate', bonusValue: 0.05 },
  { id: 'tianque', name: '天阙堡', desc: '擅长阵法，聚灵阵效果提升30%', bonusType: 'formation_bonus', bonusValue: 1.3 },
  { id: 'jujian', name: '巨剑门', desc: '剑修门派，每次饮水固定额外增加5点修为', bonusType: 'flat_cultivation', bonusValue: 5 },
  // 天南魔道六宗
  { id: 'guiling', name: '鬼灵门', desc: '魔道六宗之一，擅长驱鬼，战斗胜率提升15%', bonusType: 'combat_win_rate', bonusValue: 0.15 },
  { id: 'hehuan', name: '合欢宗', desc: '魔道第一大宗，双修收益提升100%', bonusType: 'companion_bonus', bonusValue: 2.0 },
  { id: 'yuling', name: '御灵宗', desc: '魔道六宗之一，灵兽培养速度提升30%', bonusType: 'pet_growth', bonusValue: 1.3 },
  { id: 'moyan', name: '魔焰门', desc: '魔道六宗之一，擅长魔火，炼器成功率提升15%', bonusType: 'crafting_rate', bonusValue: 0.15 },
  { id: 'tiansha', name: '天煞宗', desc: '魔道六宗之一，煞气极重，战斗胜率提升10%', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  { id: 'qianhuan', name: '千幻宗', desc: '魔道六宗之一，擅长幻术，探索秘境免伤概率提升', bonusType: 'explore_material', bonusValue: 1.1 },
  // 天南正道盟
  { id: 'taizhen', name: '太真门', desc: '正道盟首领，突破心魔概率降低10%', bonusType: 'reduce_demon_heart', bonusValue: 0.1 },
  { id: 'haoran', name: '浩然阁', desc: '正道大宗，浩然正气，每日俸禄增加30%', bonusType: 'daily_salary', bonusValue: 1.3 },
  // 天南其他
  { id: 'luoyun', name: '落云宗', desc: '擅长灵药培育，每日灵草生长速度提升20%', bonusType: 'herb_growth', bonusValue: 1.2 },
  { id: 'baiqiao', name: '百巧院', desc: '擅长炼器，炼制法宝成功率提升10%', bonusType: 'crafting_rate', bonusValue: 0.1 },
  { id: 'gujian', name: '古剑门', desc: '上古剑修传承，战斗力极强，大比胜率提升10%', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  // 乱星海
  { id: 'xinggong', name: '星宫', desc: '乱星海霸主，每日俸禄(灵石)增加50%', bonusType: 'daily_salary', bonusValue: 1.5 },
  { id: 'nixing', name: '逆星盟', desc: '反抗星宫的联盟，击败敌人获得战利品增加20%', bonusType: 'loot_bonus', bonusValue: 1.2 },
  { id: 'miaoyin', name: '妙音门', desc: '擅长音律与双修，结识道侣概率提升', bonusType: 'companion_chance', bonusValue: 1.5 },
  { id: 'jiyin', name: '极阴岛', desc: '魔道宗门，修炼魔功速度提升20%', bonusType: 'demon_skill_exp', bonusValue: 1.2 },
  { id: 'xingchen', name: '星辰阁', desc: '乱星海商盟，购买物品价格降低10%', bonusType: 'shop_discount', bonusValue: 0.9 },
  { id: 'kuixing', name: '魁星岛', desc: '乱星海外岛，海产丰富，水属性功法修炼提升', bonusType: 'water_skill_exp', bonusValue: 1.2 },
  { id: 'qingyang', name: '青阳门', desc: '魔道宗门，青阳魔火威力巨大', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  // 大晋
  { id: 'yinluo', name: '阴罗宗', desc: '大晋魔道十宗之一，击败敌人可吸取少量修为', bonusType: 'lifesteal_cultivation', bonusValue: 10 },
  { id: 'taiyi', name: '太一门', desc: '大晋正道大宗，突破心魔概率降低20%', bonusType: 'reduce_demon_heart', bonusValue: 0.2 },
  { id: 'xiaoji', name: '小极宫', desc: '北夜小极宫，冰属性功法修炼速度提升30%', bonusType: 'ice_skill_exp', bonusValue: 1.3 },
  { id: 'wanyao', name: '万妖谷', desc: '妖修圣地，妖兽材料掉落率提升30%', bonusType: 'monster_material_drop', bonusValue: 1.3 },
  { id: 'tianmo', name: '天魔宗', desc: '大晋魔道第一宗，呼老魔坐镇', bonusType: 'demon_skill_exp', bonusValue: 1.5 },
  { id: 'huaxian', name: '化仙宗', desc: '大晋神秘宗门，擅长符箓，制符成功率提升20%', bonusType: 'crafting_rate', bonusValue: 0.2 },
  // 灵界
  { id: 'tianyuan', name: '天渊城', desc: '人妖两族圣地，所有基础收益提升10%', bonusType: 'all_stats_bonus', bonusValue: 1.1 },
  { id: 'longjia', name: '真龙世家', desc: '身负真龙血脉，肉身强悍，突破失败不掉落修为', bonusType: 'safe_breakthrough', bonusValue: 1 },
  { id: 'feiling', name: '飞灵族', desc: '灵界大族，身负真灵血脉，风属性功法修炼提升', bonusType: 'wind_skill_exp', bonusValue: 1.3 },
  { id: 'jiaochi', name: '角蚩族', desc: '灵界超级大族，底蕴深厚，宗门威望获取提升', bonusType: 'prestige_bonus', bonusValue: 1.5 },
  // 仙界
  { id: 'jiuyuan', name: '九元观', desc: '仙界大派，底蕴深不可测', bonusType: 'all_stats_bonus', bonusValue: 1.2 },
  { id: 'lunhui', name: '轮回殿', desc: '仙界神秘势力，对抗天庭，死亡损失减少50%', bonusType: 'death_penalty_reduce', bonusValue: 0.5 },
  { id: 'zhulong', name: '烛龙道', desc: '北寒仙域大宗，擅长时间法则，闭关收益提升30%', bonusType: 'offline_bonus', bonusValue: 1.3 },
  { id: 'cangliu', name: '苍流宫', desc: '北寒仙域大宗，水属性功法修炼极快', bonusType: 'water_skill_exp', bonusValue: 1.5 },
  { id: 'fuling', name: '伏凌宗', desc: '北寒仙域大宗，体修圣地，肉身强度提升', bonusType: 'body_cultivation', bonusValue: 1.4 },
  { id: 'tianting', name: '天庭', desc: '仙界正统，掌控法则，每日俸禄极高', bonusType: 'daily_salary', bonusValue: 3.0 },
];

export interface Plan {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  intervalMinutes: number;
  active: boolean;
}

export interface SectNpc {
  id: string;
  name: string;
  level: string;
  cultivation: number;
  sectId?: string;
}

export interface Fate {
  id: string;
  type: 'fortune' | 'disaster' | 'encounter';
  title: string;
  desc: string;
  effectType: 'cultivation_multiplier' | 'first_drink_bonus' | 'random_event' | 'none';
  value: number;
}

export interface SkillDef {
  id: string;
  name: string;
  desc: string;
  effectType: 'cultivation_multiplier' | 'first_drink_bonus' | 'streak_bonus';
  value: number;
}

export interface ArtifactDef {
  id: string;
  name: string;
  desc: string;
  effectType: 'herb_growth_speed' | 'cultivation_multiplier' | 'daily_spring_bonus';
  value: number;
}

export interface Log {
  id: string;
  timestamp: number;
  amount: number; // ml
  type?: 'water' | 'coffee' | 'tea' | 'milktea';
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  type: 'demon_invasion' | 'sect_tournament' | 'secret_realm';
  startTime: number;
  endTime: number;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'failed';
}

export interface SectMission {
  id: string;
  title: string;
  desc: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  reqLevelIndex: number;
  rewardContribution: number;
  rewardSpiritStones: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number; // Spirit Stones
  completed: boolean;
  type: 'drink' | 'game' | 'step' | 'meditate' | 'share';
  category: 'main' | 'optional' | 'side';
  desc?: string;
}

export interface Settings {
  vibrationMode: 'heartbeat' | 'breathe' | 'drop' | 'none';
  music: 'stream' | 'forest' | 'boil' | 'none' | 'custom';
  customMusicUrl?: string;
  voiceCommandEnabled: boolean;
  dailyGoal: number; // ml
  systemNotifications?: boolean;
  drinkMultipliers: {
    water: number;
    tea: number;
    coffee: number;
    milktea: number;
  };
}

export interface Herb {
  id: string;
  type: string;
  stage: 'seed' | 'sprout' | 'mature';
  growth: number;
  maxGrowth: number;
  plantedAt: number;
}

export interface Talisman {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'escape';
  effect: number;
  desc: string;
}

export interface Formation {
  id: string;
  name: string;
  type: 'gathering' | 'trapping' | 'killing';
  effect: number;
  desc: string;
}

export interface CaveState {
  springQi: number;
  lastSpringCollect: number;
  herbs: Herb[];
  furnace: {
    active: boolean;
    recipeId: string | null;
    startTime: number | null;
    endTime: number | null;
  };
}

interface AppState {
  plans: Plan[];
  logs: Log[];
  settings: Settings;
  todaySteps: number;
  todayTemperature: number | null;
  streakDays: number;
  lastActiveDate: string | null;
  lastActiveTimestamp: number | null;
  hasClaimedDailyReward: boolean;
  bonusPoints: number; // Cultivation bonus
  spiritStones: number; // Currency
  inventory: string[]; // Owned item IDs
  quests: Quest[];
  sectMissions: SectMission[];
  
  // New Lore Stats
  spiritualRoot: string | null;
  sect: string | null;
  sectStatus: 'none' | 'joined' | 'left' | 'betrayed';
  sectPosition: 'outer' | 'inner' | 'core' | 'elder' | 'patriarch';
  sectContribution: number;
  sectCompetitionWins: number;
  age: number;
  lifespan: number;
  baseLuck: number;
  dailyLuck: number;
  sealedLogs: Log[];
  marrowWashProgress: number; // For users with no root
  highestLevelReached: string | null;
  levelIndex: number;
  experience: number;
  learnedKnowledge: string[];
  dailyEncyclopediaItems: string[];
  achievements: string[];
  
  // V2.1 Additions
  createdAt: number;
  showMarrowWashEvent: boolean;
  setShowMarrowWashEvent: (show: boolean) => void;
  daoCompanion: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex?: number; exp?: number } | null;
  setDaoCompanion: (companion: { id: string; name: string; active: boolean; favorability?: number; dailyInteractions?: number; lastInteractionDate?: string | null; levelIndex?: number; exp?: number } | null) => void;
  marriedCompanions: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[];
  setMarriedCompanions: (companions: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[]) => void;
  unlockedCompanions: string[];
  unlockCompanion: (id: string) => void;
  interactWithCompanion: (type: 'dual_cultivate' | 'gift', companionId?: string, giftItem?: string) => { success: boolean; message: string; reward?: number };
  breakthroughEvent: string | null;
  setBreakthroughEvent: (event: string | null) => void;

  // V3.0 Additions
  playerName: string;
  setPlayerName: (name: string) => void;
  currentRegion: string;
  setCurrentRegion: (region: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (val: boolean) => void;
  hasDoneFirstDrink: boolean;
  setHasDoneFirstDrink: (val: boolean) => void;
  claimedStreakRewards: number[];
  claimStreakReward: (days: number) => void;
  unlockedTitles: string[];
  currentTitle: string | null;
  setCurrentTitle: (title: string | null) => void;
  cave: CaveState;
  materials: Record<string, number>;
  addMaterial: (id: string, amount: number) => void;
  collectSpring: () => void;
  plantHerb: (type: string) => void;
  waterHerbs: (amount: number) => void;
  harvestHerb: (id: string) => void;
  startAlchemy: (recipeId: string) => void;
  collectPill: () => void;
  speedUpAlchemy: () => void;
  realmExplorationsToday: number;
  realmExplorationTotal: number;
  lastRealmExplorationDate: string | null;
  exploreRealm: (risk: 'low' | 'mid' | 'high') => any; // Returns event result

  activeGame: string | null;
  setActiveGame: (gameId: string | null) => void;
  // V4.0 Additions
  dailyFates: Fate[];
  selectedFate: Fate | null;
  skills: string[];
  equippedSkills: string[];
  skillProficiency: Record<string, number>;
  artifacts: string[];
  equippedArtifacts: string[];
  artifactLevels: Record<string, number>;
  chests: number;
  heavenlyBottleDrops: number;
  storyChapter: number;
  storyNode: number;
  globalEvent: GlobalEvent | null;
  sectNpcs: SectNpc[];
  
  // V6.0 Additions (Character & Story)
  characterId: string | null;
  characterPreset: any | null;
  isDead: boolean;
  deathReason: string | null;
  rebirthCount: number;
  storyProgress: Record<string, boolean>;
  
  // V5.0 Additions (Mortal Journey Core)
  talismans: Record<string, number>;
  formations: string[];
  monsterMaterials: Record<string, number>;
  alchemyLevel: number;
  craftingLevel: number;
  talismanLevel: number;
  formationLevel: number;
  sectContributionRank: number;
  sectLevel: number; // V5.0 Additions
  sectPrestige: number;
  sectWealth: number;
  interSectWins: number;
  dailySalaryClaimed: boolean;
  
  // Actions
  claimSectSalary: () => { success: boolean; message: string; amount: number };
  challengeOtherSect: (npcId: string) => { success: boolean; message: string; win: boolean; reward: any };
  makeTalisman: (id: string) => { success: boolean; message: string };
  makePill: (id: string) => { success: boolean; message: string };
  craftArtifact: (id: string) => { success: boolean; message: string };
  setupFormation: (id: string) => { success: boolean; message: string };
  participateImmortalAssembly: () => { success: boolean; message: string };
  ascend: () => { success: boolean; message: string };
  upgradeSect: () => { success: boolean; message: string };
  activateSectFormation: () => { success: boolean; message: string };
  sectBuff: { type: string; expiresAt: number } | null;
  
  // 灵根系统
  getSpiritualRootBonus: () => number;
  selectFate: (fateId: string) => void;
  generateFates: () => void;
  openChest: () => any;
  addChest: (amount: number) => void;
  gatherMaterials: () => void;
  learnSkill: (id: string) => void;
  equipSkill: (id: string) => void;
  unequipSkill: (id: string) => void;
  obtainArtifact: (id: string) => void;
  equipArtifact: (id: string) => void;
  unequipArtifact: (id: string) => void;
  gainSkillProficiency: (id: string, amount: number) => void;
  upgradeArtifact: (id: string) => void;
  useHeavenlyBottle: (action: 'duplicate' | 'accelerate', targetId?: string) => boolean;
  addHeavenlyBottleDrop: (amount: number) => void;
  advanceStory: () => void;
  contributeToGlobalEvent: (amount: number) => void;
  updateSectNpcs: () => void;

  // V6.0 Actions
  selectCharacter: (characterId: string, customData?: any) => void;
  die: (reason: string) => void;
  rebirth: (newTalent?: string) => void;
  completeStoryNode: (nodeId: string) => void;
  consultHeavens: (query: string) => Promise<string>;

  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlan: (id: string) => void;
  addLog: (amount: number, type?: 'water' | 'coffee' | 'tea' | 'milktea') => number;
  removeLog: (timestamp: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setHealthData: (steps: number, temp: number | null) => void;
  getNextReminder: () => number | null;
  pendingStreakRescue: number | null;
  checkIn: () => void;
  claimDailyReward: () => void;
  claimOfflineGains: () => { time: number; exp: number; items: { id: string, amount: number }[] } | null;
  rescueStreak: (usePill: boolean) => boolean;
  updateQuestProgress: (type: 'drink' | 'game' | 'step', amount: number) => void;
  claimQuestReward: (questId: string) => void;
  claimSectMissionReward: (missionId: string) => { success: boolean; message: string };
  addSpiritStones: (amount: number) => void;
  buyItem: (id: string, cost: number, isConsumable: boolean, effect: number) => boolean;
  sellItem: (id: string, type: 'material' | 'inventory', amount: number, price: number) => boolean;
  
  // Lore Actions
  testSpiritualRoot: () => string;
  joinSect: (sectId?: string) => void;
  leaveSect: () => void;
  rejoinSect: (sectId?: string) => void;
  winSectCompetition: () => void;
  addSectContribution: (amount: number) => void;
  donateToSect: (itemId: string) => { success: boolean; message: string };
  promoteSectPosition: () => { success: boolean; message: string };
  addLuck: (amount: number) => void;
  washMarrow: (amount: number) => void;
  setHighestLevelReached: (levelName: string) => void;
  attemptBreakthrough: (useQingxinPill: boolean, forceSuccess?: boolean) => { success: boolean; message: string };
  setLevelIndex: (index: number) => void;
  resetCultivation: () => void;
  markKnowledgeLearned: (id: string) => void;
  unlockAchievement: (id: string) => void;
}

const generateDailyQuests = (): Quest[] => [
  { id: 'q1', title: '吸收灵气 (喝水)', desc: '今日请于灵泉处吸纳三次清泉', target: 3, progress: 0, reward: 50, completed: false, type: 'drink', category: 'main' },
  { id: 'q2', title: '外出历练 (4000步)', desc: '巡视宗门领地，强健体魄', target: 4000, progress: 0, reward: 30, completed: false, type: 'step', category: 'optional' },
  { id: 'q3', title: '闭关冥想 (10分钟)', desc: '聆听大道之音，稳固道心', target: 10, progress: 0, reward: 30, completed: false, type: 'meditate', category: 'optional' },
  { id: 'q4', title: '探索秘境', desc: '前往秘境寻宝1次', target: 1, progress: 0, reward: 15, completed: false, type: 'game', category: 'side' },
  { id: 'q5', title: '传音天下', desc: '分享一次修仙海报', target: 1, progress: 0, reward: 15, completed: false, type: 'share', category: 'side' },
];

const generateSectMissions = (levelIndex: number): SectMission[] => {
  const missions: SectMission[] = [];
  const difficulties = ['easy', 'normal', 'hard'];
  const titles = {
    easy: ['采集灵草', '巡视山门', '炼制辟谷丹', '整理藏经阁'],
    normal: ['猎杀低阶妖兽', '护送商队', '探查灵矿', '追捕叛徒'],
    hard: ['剿灭魔修据点', '探索未知秘境', '斩杀高阶妖兽', '镇压宗门叛乱']
  };
  for (let i = 0; i < 3; i++) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)] as 'easy' | 'normal' | 'hard';
    const titleList = titles[diff];
    const multiplier = diff === 'easy' ? 1 : diff === 'normal' ? 2 : 4;
    missions.push({
      id: `sm_${Date.now()}_${i}`,
      title: titleList[Math.floor(Math.random() * titleList.length)],
      desc: '宗门发布的日常任务，完成后可获得贡献与灵石。',
      difficulty: diff,
      reqLevelIndex: Math.max(0, levelIndex - (diff === 'easy' ? 2 : diff === 'normal' ? 1 : 0)),
      rewardContribution: 50 * multiplier * (Math.floor(levelIndex / 9) + 1),
      rewardSpiritStones: 100 * multiplier * (Math.floor(levelIndex / 9) + 1),
      completed: false
    });
  }
  return missions;
};

export const SHOP_ITEMS = [
  // 通用
  { id: 'humai_pill', name: '护脉丹', type: 'consumable', effect: 0, cost: 300, desc: '护住心脉，可用于挽救断掉的连续签到', region: 'all' },
  
  // 凡人界
  { id: 'pill_1', name: '黄龙丹', type: 'consumable', effect: 500, cost: 50, desc: '低阶丹药，服用可增加 500 修为', region: '凡人界' },
  { id: 'pill_jinsui', name: '金髓丸', type: 'consumable', effect: 800, cost: 80, desc: '凡俗武林圣药，服用可增加 800 修为', region: '凡人界' },
  { id: 'common_herb', name: '普通灵草', type: 'material', effect: 0, cost: 20, desc: '常见的灵草，可用于炼制基础丹药', region: '凡人界' },
  { id: 'book_1', name: '太上感应篇', type: 'passive', effect: 1.2, cost: 800, desc: '道家经典，永久提升 20% 饮水修为获取', region: '凡人界' },
  { id: 'skill_changchun', name: '长春功', type: 'skill', effect: 1.1, cost: 500, desc: '木属性基础功法，饮水修为 +10%', region: '凡人界' },
  { id: 'skill_zhayan', name: '眨眼剑法', type: 'skill', effect: 1.15, cost: 800, desc: '凡俗顶尖武学，饮水修为 +15%', region: '凡人界' },
  { id: 'skill_luoyan', name: '罗烟步', type: 'skill', effect: 1.05, cost: 600, desc: '绝顶轻功，每日步数修为 +20%', region: '凡人界' },
  { id: 'artifact_sword', name: '精铁长剑', type: 'passive', effect: 1.05, cost: 300, desc: '凡俗兵器，永久提升 5% 饮水修为获取', region: '凡人界' },
  
  // 天南
  { id: 'herb', name: '普通灵草', type: 'material', effect: 0, cost: 10, desc: '随处可见的灵草，可用于炼丹', region: '天南' },
  { id: 'profound_iron', name: '玄铁', type: 'material', effect: 0, cost: 50, desc: '坚硬的矿石，可用于炼器', region: '天南' },
  { id: 'pill_foundation', name: '筑基丹', type: 'breakthrough', effect: 0, cost: 500, desc: '突破筑基期必备丹药', region: '天南' },
  { id: 'pill_heqi', name: '合气丹', type: 'consumable', effect: 2000, cost: 300, desc: '炼气期精进修为的丹药，增加 2000 修为', region: '天南' },
  { id: 'rare_herb', name: '珍稀灵草', type: 'material', effect: 0, cost: 100, desc: '罕见的灵草，蕴含充沛灵气', region: '天南' },
  { id: 'skill_1', name: '青元剑诀', type: 'skill', effect: 1.2, cost: 2000, desc: '剑修功法，饮水修为 +20%', region: '天南' },
  { id: 'skill_dayan', name: '大衍决', type: 'skill', effect: 1.25, cost: 3000, desc: '强化神识的奇功，突破成功率 +15%', region: '天南' },
  { id: 'skill_huachun', name: '化春诀', type: 'skill', effect: 1.15, cost: 1800, desc: '木属性功法，饮水修为 +15%', region: '天南' },
  { id: 'book_2', name: '黄帝内经', type: 'passive', effect: 1.05, cost: 1500, desc: '上古医书，永久提升 5% 饮水修为获取', region: '天南' },
  { id: 'artifact_fubao', name: '平天尺符宝', type: 'passive', effect: 1.3, cost: 2500, desc: '结丹修士法宝降级制成，永久提升 30% 饮水修为获取', region: '天南' },
  { id: 'artifact_qingjiao', name: '青蛟旗', type: 'passive', effect: 1.2, cost: 2000, desc: '顶阶法器，永久提升 20% 饮水修为获取', region: '天南' },

  // 乱星海
  { id: 'monster_bone', name: '妖兽骸骨', type: 'material', effect: 0, cost: 80, desc: '妖兽死后留下的骸骨，可用于炼制法器', region: '乱星海' },
  { id: 'pill_golden_core', name: '降尘丹', type: 'breakthrough', effect: 0, cost: 2000, desc: '突破结丹期必备丹药', region: '乱星海' },
  { id: 'pill_zaohua', name: '造化丹', type: 'consumable', effect: 10000, cost: 1500, desc: '结丹期精进修为的丹药，增加 10000 修为', region: '乱星海' },
  { id: 'millennium_lingzhi', name: '千年灵芝', type: 'material', effect: 0, cost: 500, desc: '极其罕见的天材地宝', region: '乱星海' },
  { id: 'nishang_grass', name: '霓裳草', type: 'material', effect: 0, cost: 800, desc: '可吸引妖兽的奇草，秘境探索收益 +20%', region: '乱星海' },
  { id: 'skill_2', name: '玄阴诀', type: 'skill', effect: 1.3, cost: 5000, desc: '魔修功法，饮水修为 +30%，但突破成功率 -10%', region: '乱星海' },
  { id: 'skill_tuotian', name: '托天魔功', type: 'skill', effect: 1.35, cost: 6000, desc: '乱星海顶尖魔功，饮水修为 +35%', region: '乱星海' },
  { id: 'skill_kuiyuan', name: '魁元功', type: 'skill', effect: 1.25, cost: 4500, desc: '乱星海常见功法，饮水修为 +25%', region: '乱星海' },
  { id: 'skill_water_shield', name: '水罩诀', type: 'skill', effect: 1.15, cost: 3000, desc: '水属性防御功法，突破失败惩罚减少', region: '乱星海' },
  { id: 'artifact_2', name: '八卦镜', type: 'passive', effect: 1.5, cost: 1200, desc: '乱星海常见法器，永久提升 50% 饮水修为获取', region: '乱星海' },
  { id: 'artifact_xutian', name: '虚天鼎(伪)', type: 'passive', effect: 1.8, cost: 8000, desc: '乱星海第一秘宝仿制品，永久提升 80% 饮水修为获取', region: '乱星海' },

  // 大晋
  { id: 'jiuzhuan_grass', name: '九转还魂草', type: 'material', effect: 0, cost: 2000, desc: '大晋特产，可炼制极品丹药', region: '大晋' },
  { id: 'pill_nascent_soul', name: '结婴丹', type: 'breakthrough', effect: 0, cost: 10000, desc: '突破元婴期必备丹药', region: '大晋' },
  { id: 'pill_peiying', name: '培婴丹', type: 'consumable', effect: 50000, cost: 8000, desc: '元婴期精进修为的丹药，增加 50000 修为', region: '大晋' },
  { id: 'skill_3', name: '大庚剑阵', type: 'skill', effect: 1.5, cost: 15000, desc: '顶级剑阵，饮水修为 +50%', region: '大晋' },
  { id: 'skill_mingwang', name: '明王诀', type: 'skill', effect: 1.4, cost: 12000, desc: '佛宗炼体神功，突破成功率 +20%', region: '大晋' },
  { id: 'skill_yinyang', name: '阴阳牵引术', type: 'skill', effect: 1.3, cost: 10000, desc: '大晋奇术，饮水修为 +30%', region: '大晋' },
  { id: 'artifact_3', name: '风雷翅', type: 'passive', effect: 2.0, cost: 5000, desc: '大晋飞行法宝，永久双倍饮水修为', region: '大晋' },
  { id: 'artifact_jiangchen', name: '降尘幡', type: 'passive', effect: 1.6, cost: 15000, desc: '大晋魔道法宝，永久提升 60% 饮水修为获取', region: '大晋' },

  // 灵界
  { id: 'spirit_crystal', name: '极品灵石', type: 'material', effect: 0, cost: 5000, desc: '灵界通用货币，蕴含海量灵气', region: '灵界' },
  { id: 'pill_miechen', name: '灭尘丹', type: 'consumable', effect: 200000, cost: 50000, desc: '洗去下界气息的仙丹，增加 200000 修为', region: '灵界' },
  { id: 'pill_lianxu', name: '炼虚丹', type: 'breakthrough', effect: 0, cost: 80000, desc: '突破炼虚期必备丹药', region: '灵界' },
  { id: 'guanghan_token', name: '广寒令', type: 'material', effect: 0, cost: 30000, desc: '进入广寒界的通行证', region: '灵界' },
  { id: 'skill_5', name: '天雷双剑', type: 'skill', effect: 1.4, cost: 20000, desc: '霸道剑法，饮水修为 +40%，但突破成功率 -20%', region: '灵界' },
  { id: 'skill_fansheng', name: '梵圣真魔功', type: 'skill', effect: 1.6, cost: 40000, desc: '魔界无上魔功，饮水修为 +60%', region: '灵界' },
  { id: 'skill_yuanci', name: '元磁神光', type: 'skill', effect: 1.5, cost: 35000, desc: '克制五行之力的神光，突破成功率 +20%', region: '灵界' },
  { id: 'skill_bailian', name: '百脉炼宝诀', type: 'skill', effect: 1.7, cost: 50000, desc: '灵界炼体奇功，饮水修为 +70%', region: '灵界' },
  { id: 'skill_xuantian', name: '玄天炼器诀', type: 'skill', effect: 1.8, cost: 60000, desc: '灵界顶级炼器法门，饮水修为 +80%', region: '灵界' },
  { id: 'artifact_1', name: '掌天瓶(伪)', type: 'passive', effect: 2.0, cost: 30000, desc: '玄天之宝仿制品，永久双倍饮水修为', region: '灵界' },
  { id: 'artifact_xuantian', name: '玄天斩灵剑', type: 'passive', effect: 3.0, cost: 100000, desc: '玄天之宝，永久三倍饮水修为', region: '灵界' },
  
  // 更多功法
  { id: 'skill_nongyu', name: '弄玉诀', type: 'skill', effect: 1.2, cost: 3500, desc: '乱星海妙音门功法，道侣互动效果 +20%', region: '乱星海' },
  { id: 'skill_kuishui', name: '葵水真经', type: 'skill', effect: 1.3, cost: 5000, desc: '水属性顶级功法，饮水修为 +30%', region: '乱星海' },
  { id: 'skill_haoran', name: '浩然正气', type: 'skill', effect: 1.25, cost: 8000, desc: '大晋儒家功法，突破成功率 +10%', region: '大晋' },
  { id: 'skill_yinluo', name: '阴罗大法', type: 'skill', effect: 1.4, cost: 12000, desc: '阴罗宗镇派功法，饮水修为 +40%', region: '大晋' },
  { id: 'skill_lianshen', name: '炼神术', type: 'skill', effect: 1.8, cost: 100000, desc: '仙界禁术，极难修炼，突破成功率 +50%', region: '仙界' },
  { id: 'skill_niepan', name: '涅槃圣体', type: 'skill', effect: 1.7, cost: 80000, desc: '魔界圣祖功法，饮水修为 +70%', region: '灵界' },
  { id: 'skill_wuxing', name: '大五行幻世诀', type: 'skill', effect: 2.5, cost: 500000, desc: '时间法则顶级功法，饮水修为 +150%', region: '仙界' },
];

export const TALISMANS: Talisman[] = [
  { id: 'tali_fire', name: '火弹符', type: 'attack', effect: 100, desc: '初级低阶符箓，释放一颗火弹攻击敌人。' },
  { id: 'tali_ding', name: '定神符', type: 'defense', effect: 0.1, desc: '初级低阶符箓，可定住敌人神魂片刻。' },
  { id: 'tali_hide', name: '隐身符', type: 'escape', effect: 0.5, desc: '初级低阶符箓，短时间内隐匿身形。' },
  { id: 'tali_wrap', name: '缠绕符', type: 'attack', effect: 200, desc: '初级中阶符箓，召唤藤蔓缠绕敌人。' },
  { id: 'tali_ice', name: '冰锥符', type: 'attack', effect: 300, desc: '初级中阶符箓，释放冰锥攻击。' },
  { id: 'tali_teleport', name: '四分传送符', type: 'escape', effect: 1.0, desc: '中级符箓，瞬间传送至随机位置。' },
  { id: 'tali_avatar', name: '替身符', type: 'defense', effect: 0.8, desc: '中级符箓，承受致命一击。' },
  { id: 'tali_spirit', name: '降灵符', type: 'attack', effect: 1000, desc: '顶级符箓，召唤灵界生物投影。' },
  { id: 'tali_beast', name: '兽甲符', type: 'defense', effect: 500, desc: '顶级符箓，幻化兽甲护身。' },
];

export const FORMATIONS: Formation[] = [
  { id: 'form_gathering', name: '聚灵阵', type: 'gathering', effect: 1.2, desc: '基础聚灵阵，提升灵气聚集速度。' },
  { id: 'form_five_elements', name: '颠倒五行阵', type: 'trapping', effect: 1.5, desc: '齐云霄所赠，威力巨大，可困住筑基修士。' },
  { id: 'form_six_link', name: '六连殿禁制', type: 'trapping', effect: 1.3, desc: '乱星海六连殿使用的禁制。' },
  { id: 'form_big_geng', name: '大庚剑阵', type: 'killing', effect: 2.5, desc: '庚精所化剑阵，威力绝伦。' },
  { id: 'form_ten_thousand', name: '万妖谷禁制', type: 'trapping', effect: 2.0, desc: '大晋万妖谷的强大禁制。' },
];

export const GAME_SKILLS: SkillDef[] = SHOP_ITEMS.filter(item => item.type === 'skill').map(item => ({
  id: item.id,
  name: item.name,
  desc: item.desc,
  effectType: 'cultivation_multiplier',
  value: item.effect
}));

export const sectNpcs = [
  // 凡人界
  { id: 'npc_hanli', name: '韩立', level: '凡人', cultivation: 500, sectId: 'huangfeng' },
  { id: 'npc_lifeiyu', name: '厉飞雨', level: '凡人', cultivation: 800, sectId: 'qixuan' },
  { id: 'npc_wangjuechu', name: '王绝楚', level: '凡人', cultivation: 1000, sectId: 'qixuan' },
  { id: 'npc_modafu', name: '墨大夫', level: '凡人', cultivation: 1200, sectId: 'qixuan' },
  { id: 'npc_zhangtie', name: '张铁', level: '凡人', cultivation: 600, sectId: 'qixuan' },
  { id: 'npc_sunergou', name: '孙二狗', level: '凡人', cultivation: 200, sectId: 'siping' },
  { id: 'npc_jiaming', name: '贾天龙', level: '凡人', cultivation: 900, sectId: 'yelang' },
  // 天南七派
  { id: 'npc_nangongwan', name: '南宫婉', level: '结丹初期', cultivation: 30000, sectId: 'yanyue' },
  { id: 'npc_lushi', name: '陆师兄', level: '炼气十层', cultivation: 6500, sectId: 'huangfeng' },
  { id: 'npc_dongxuaner', name: '董萱儿', level: '筑基初期', cultivation: 12000, sectId: 'huangfeng' },
  { id: 'npc_chenqiaoqian', name: '陈巧倩', level: '筑基初期', cultivation: 11000, sectId: 'huangfeng' },
  { id: 'npc_lihuayuan', name: '李化元', level: '结丹中期', cultivation: 50000, sectId: 'huangfeng' },
  { id: 'npc_hongfu', name: '红拂', level: '结丹后期', cultivation: 90000, sectId: 'huangfeng' },
  { id: 'npc_qionglaoguai', name: '穹老怪', level: '元婴初期', cultivation: 180000, sectId: 'yanyue' },
  { id: 'npc_xiangzhili', name: '向之礼', level: '化神初期', cultivation: 1000000, sectId: 'huangfeng' },
  { id: 'npc_leiwanhe', name: '雷万鹤', level: '结丹中期', cultivation: 45000, sectId: 'huangfeng' },
  { id: 'npc_zhonglingdao', name: '钟灵道', level: '筑基后期', cultivation: 25000, sectId: 'huangfeng' },
  { id: 'npc_nieying', name: '聂盈', level: '筑基初期', cultivation: 15000, sectId: 'huangfeng' },
  { id: 'npc_xinruyin', name: '辛如音', level: '炼气十二层', cultivation: 8500, sectId: 'none' },
  { id: 'npc_qiyunxiao', name: '齐云霄', level: '炼气十一层', cultivation: 7500, sectId: 'none' },
  { id: 'npc_linghu', name: '令狐老祖', level: '元婴中期', cultivation: 220000, sectId: 'huangfeng' },
  { id: 'npc_fuyunzi', name: '浮云子', level: '结丹后期', cultivation: 80000, sectId: 'qingxu' },
  { id: 'npc_hanzongzhu', name: '寒宗主', level: '结丹后期', cultivation: 85000, sectId: 'yanyue' },
  { id: 'npc_zhongwu', name: '钟吾', level: '炼气十三层', cultivation: 9500, sectId: 'lingshou' },
  { id: 'npc_hanzong', name: '涵云芝', level: '炼气十层', cultivation: 6500, sectId: 'lingshou' },
  { id: 'npc_dayan', name: '大衍神君', level: '化神初期', cultivation: 1200000, sectId: 'none' },
  // 天南魔道六宗
  { id: 'npc_yanruyan', name: '燕如嫣', level: '筑基初期', cultivation: 18000, sectId: 'guiling' },
  { id: 'npc_wangchan', name: '王蝉', level: '筑基中期', cultivation: 22000, sectId: 'guiling' },
  { id: 'npc_kuangren', name: '狂人', level: '结丹后期', cultivation: 85000, sectId: 'yuling' },
  { id: 'npc_yunlu', name: '云露老魔', level: '元婴中期', cultivation: 250000, sectId: 'hehuan' },
  { id: 'npc_wangtiansheng', name: '王天胜', level: '元婴初期', cultivation: 150000, sectId: 'guiling' },
  { id: 'npc_hehuanshou', name: '合欢老魔', level: '元婴后期', cultivation: 300000, sectId: 'hehuan' },
  { id: 'npc_dongmen', name: '东门图', level: '元婴初期', cultivation: 160000, sectId: 'yuling' },
  // 乱星海
  { id: 'npc_ziling', name: '紫灵', level: '结丹初期', cultivation: 32000, sectId: 'miaoyin' },
  { id: 'npc_yinyue', name: '银月', level: '元婴初期', cultivation: 150000, sectId: 'none' },
  { id: 'npc_yuanyao', name: '元瑶', level: '结丹后期', cultivation: 80000, sectId: 'none' },
  { id: 'npc_yanli', name: '妍丽', level: '结丹中期', cultivation: 55000, sectId: 'none' },
  { id: 'npc_lingyuling', name: '凌玉灵', level: '结丹后期', cultivation: 85000, sectId: 'xinggong' },
  { id: 'npc_tianxingshuang', name: '天星双圣', level: '元婴后期', cultivation: 350000, sectId: 'xinggong' },
  { id: 'npc_jiyinzushi', name: '极阴祖师', level: '元婴中期', cultivation: 180000, sectId: 'jiyin' },
  { id: 'npc_manhuzi', name: '蛮胡子', level: '元婴中期', cultivation: 190000, sectId: 'none' },
  { id: 'npc_qingyijushi', name: '青易居士', level: '元婴中期', cultivation: 170000, sectId: 'none' },
  { id: 'npc_liudao', name: '六道极圣', level: '元婴后期', cultivation: 280000, sectId: 'nixing' },
  { id: 'npc_wentianren', name: '温天仁', level: '结丹后期', cultivation: 75000, sectId: 'nixing' },
  { id: 'npc_wangtiangu', name: '王天古', level: '元婴初期', cultivation: 160000, sectId: 'nixing' },
  { id: 'npc_suixing', name: '碎星真人', level: '元婴初期', cultivation: 160000, sectId: 'xingchen' },
  { id: 'npc_zhaoxin', name: '赵心', level: '结丹初期', cultivation: 35000, sectId: 'miaoyin' },
  { id: 'npc_fanfuren', name: '范夫人', level: '结丹中期', cultivation: 45000, sectId: 'miaoyin' },
  { id: 'npc_wuchou', name: '乌丑', level: '结丹初期', cultivation: 38000, sectId: 'jiyin' },
  { id: 'npc_xuanbone', name: '玄骨老魔', level: '元婴初期', cultivation: 170000, sectId: 'none' },
  { id: 'npc_xutian', name: '虚天殿使者', level: '元婴初期', cultivation: 150000, sectId: 'none' },
  // 大晋
  { id: 'npc_mubei', name: '慕沛灵', level: '结丹初期', cultivation: 35000, sectId: 'luoyun' },
  { id: 'npc_cheng', name: '程师兄', level: '元婴初期', cultivation: 150000, sectId: 'luoyun' },
  { id: 'npc_lu', name: '吕洛', level: '元婴初期', cultivation: 145000, sectId: 'luoyun' },
  { id: 'npc_songxing', name: '宋姓女子', level: '结丹后期', cultivation: 80000, sectId: 'luoyun' },
  { id: 'npc_baiya', name: '白亚', level: '元婴中期', cultivation: 220000, sectId: 'taiyi' },
  { id: 'npc_yinluozongzhu', name: '阴罗宗主', level: '元婴后期', cultivation: 290000, sectId: 'yinluo' },
  { id: 'npc_chelaoyao', name: '车老妖', level: '化神初期', cultivation: 950000, sectId: 'wanyao' },
  { id: 'npc_bingfeng', name: '冰凤', level: '化神初期', cultivation: 900000, sectId: 'xiaoji' },
  { id: 'npc_xiangzhili2', name: '向之礼(大晋)', level: '化神初期', cultivation: 1050000, sectId: 'none' },
  { id: 'npc_fenglaoguai', name: '风老怪', level: '化神初期', cultivation: 980000, sectId: 'none' },
  { id: 'npc_hulaomo', name: '呼老魔', level: '化神初期', cultivation: 990000, sectId: 'none' },
  { id: 'npc_huqinglei', name: '呼庆雷', level: '化神初期', cultivation: 850000, sectId: 'none' },
  { id: 'npc_xianzi', name: '木夫人', level: '元婴后期', cultivation: 250000, sectId: 'none' },
  // 灵界
  { id: 'npc_baohua', name: '宝花', level: '大乘期', cultivation: 50000000, sectId: 'none' },
  { id: 'npc_liujin', name: '六极', level: '大乘期', cultivation: 45000000, sectId: 'none' },
  { id: 'npc_yuanmo', name: '元魇', level: '大乘期', cultivation: 48000000, sectId: 'none' },
  { id: 'npc_niepan', name: '涅槃', level: '大乘期', cultivation: 49000000, sectId: 'none' },
  { id: 'npc_mingsun', name: '明尊', level: '大乘期', cultivation: 42000000, sectId: 'none' },
  { id: 'npc_aoxiao', name: '敖啸老祖', level: '大乘期', cultivation: 40000000, sectId: 'none' },
  { id: 'npc_moxian', name: '莫简离', level: '大乘期', cultivation: 38000000, sectId: 'none' },
  { id: 'npc_jinlong', name: '金龙大天尊', level: '大乘期', cultivation: 55000000, sectId: 'longjia' },
  { id: 'npc_xueling', name: '血灵', level: '合体后期', cultivation: 15000000, sectId: 'none' },
  { id: 'npc_long', name: '陇家老祖', level: '合体后期', cultivation: 18000000, sectId: 'longjia' },
  { id: 'npc_linyin', name: '林银屏', level: '元婴后期', cultivation: 280000, sectId: 'none' },
  { id: 'npc_tianlan', name: '天澜圣女', level: '元婴中期', cultivation: 180000, sectId: 'none' },
  { id: 'npc_xuying', name: '虚天鼎器灵', level: '合体期', cultivation: 8000000, sectId: 'none' },
  { id: 'npc_qingyuanzi', name: '青元子', level: '大乘期', cultivation: 45000000, sectId: 'none' },
  { id: 'npc_xinyan', name: '辛如音(转世)', level: '元婴初期', cultivation: 150000, sectId: 'none' },
  { id: 'npc_bingpo', name: '冰魄仙子', level: '大乘期', cultivation: 41000000, sectId: 'none' },
  // 仙界
  { id: 'npc_ma', name: '马良', level: '真仙', cultivation: 100000000, sectId: 'jiuyuan' },
  { id: 'npc_guhu', name: '古或今', level: '道祖', cultivation: 999999999, sectId: 'tianting' },
  { id: 'npc_lunhui', name: '轮回殿主', level: '道祖', cultivation: 999999999, sectId: 'lunhui' },
  { id: 'npc_mizhu', name: '弥罗老祖', level: '大罗后期', cultivation: 500000000, sectId: 'zhulong' },
  { id: 'npc_qiling', name: '奇摩子', level: '大罗中期', cultivation: 300000000, sectId: 'tianting' },
  { id: 'npc_jiaosan', name: '蛟三', level: '太乙后期', cultivation: 80000000, sectId: 'lunhui' },
  { id: 'npc_ganjiu', name: '甘九真', level: '大罗初期', cultivation: 150000000, sectId: 'lunhui' },
  { id: 'npc_shichuan', name: '石穿空', level: '大罗初期', cultivation: 140000000, sectId: 'none' },
  { id: 'npc_ziqi', name: '紫灵(仙界)', level: '大罗初期', cultivation: 120000000, sectId: 'none' },
  { id: 'npc_nangong', name: '南宫婉(仙界)', level: '大罗初期', cultivation: 130000000, sectId: 'none' },
  { id: 'npc_jin', name: '金童', level: '道祖', cultivation: 900000000, sectId: 'none' },
  { id: 'npc_tihun', name: '啼魂', level: '大罗后期', cultivation: 400000000, sectId: 'none' },
  { id: 'npc_baoyan', name: '百里炎', level: '大罗中期', cultivation: 250000000, sectId: 'zhulong' },
  { id: 'npc_hu', name: '呼言道人', level: '太乙后期', cultivation: 90000000, sectId: 'zhulong' },
  { id: 'npc_yun', name: '云霓', level: '太乙中期', cultivation: 60000000, sectId: 'zhulong' },
  { id: 'npc_bai', name: '白素媛', level: '金仙后期', cultivation: 30000000, sectId: 'zhulong' },
  { id: 'npc_luo', name: '洛星辰', level: '大罗初期', cultivation: 180000000, sectId: 'cangliu' },
  { id: 'npc_fenglin', name: '封林', level: '大罗中期', cultivation: 220000000, sectId: 'fuling' },
  { id: 'npc_chenl', name: '陈林', level: '太乙初期', cultivation: 70000000, sectId: 'jiuyuan' },
  { id: 'npc_wuyang', name: '武阳', level: '大罗初期', cultivation: 160000000, sectId: 'jiuyuan' },
  // 更多人物
  { id: 'npc_zhong', name: '仲姓仙师', level: '元婴后期', cultivation: 280000, sectId: 'none' },
  { id: 'npc_le', name: '乐姓女子', level: '元婴中期', cultivation: 190000, sectId: 'none' },
  { id: 'npc_fengxi', name: '风希', level: '九级妖修', cultivation: 200000, sectId: 'none' },
  { id: 'npc_jin_yan', name: '金蛟王', level: '十级妖修', cultivation: 400000, sectId: 'none' },
  { id: 'npc_wan_tian_ming', name: '万天明', level: '元婴中期', cultivation: 230000, sectId: 'none' },
  { id: 'npc_yi_tian_du', name: '易天都', level: '元婴中期', cultivation: 210000, sectId: 'none' },
  { id: 'npc_tian_mo_zong_zhu', name: '天魔宗主', level: '元婴后期', cultivation: 320000, sectId: 'tianmo' },
  { id: 'npc_qi_ling_xian_zi', name: '七灵仙子', level: '元婴初期', cultivation: 140000, sectId: 'none' },
];

const initialState: Omit<AppState, keyof Omit<AppState, 'plans' | 'logs' | 'settings' | 'todaySteps' | 'todayTemperature' | 'streakDays' | 'lastActiveDate' | 'lastActiveTimestamp' | 'hasClaimedDailyReward' | 'bonusPoints' | 'spiritStones' | 'inventory' | 'quests' | 'sectMissions' | 'spiritualRoot' | 'sect' | 'sectStatus' | 'sectPosition' | 'sectContribution' | 'sectCompetitionWins' | 'age' | 'lifespan' | 'baseLuck' | 'dailyLuck' | 'sealedLogs' | 'marrowWashProgress' | 'highestLevelReached' | 'levelIndex' | 'experience' | 'learnedKnowledge' | 'dailyEncyclopediaItems' | 'achievements' | 'createdAt' | 'showMarrowWashEvent' | 'daoCompanion' | 'marriedCompanions' | 'unlockedCompanions' | 'breakthroughEvent' | 'playerName' | 'currentRegion' | 'isFirstTime' | 'hasDoneFirstDrink' | 'claimedStreakRewards' | 'currentTitle' | 'unlockedTitles' | 'cave' | 'materials' | 'realmExplorationsToday' | 'realmExplorationTotal' | 'lastRealmExplorationDate' | 'activeGame' | 'dailyFates' | 'selectedFate' | 'skills' | 'equippedSkills' | 'skillProficiency' | 'artifacts' | 'equippedArtifacts' | 'artifactLevels' | 'chests' | 'heavenlyBottleDrops' | 'storyChapter' | 'storyNode' | 'globalEvent' | 'sectNpcs' | 'talismans' | 'formations' | 'monsterMaterials' | 'alchemyLevel' | 'craftingLevel' | 'talismanLevel' | 'formationLevel' | 'sectContributionRank' | 'sectLevel' | 'sectPrestige' | 'sectWealth' | 'interSectWins' | 'dailySalaryClaimed' | 'sectBuff' | 'pendingStreakRescue' | 'characterId' | 'characterPreset' | 'isDead' | 'deathReason' | 'rebirthCount' | 'storyProgress'>> = {
  plans: [],
  logs: [],
  settings: {
    vibrationMode: 'heartbeat',
    music: 'stream',
    voiceCommandEnabled: false,
    dailyGoal: 2000,
    drinkMultipliers: { water: 1, tea: 1.2, coffee: 1.5, milktea: 0.8 },
  },
  todaySteps: 0,
  todayTemperature: null,
  streakDays: 0,
  lastActiveDate: null,
  lastActiveTimestamp: null,
  hasClaimedDailyReward: false,
  bonusPoints: 0,
  spiritStones: 0,
  inventory: [],
  quests: generateDailyQuests(),
  sectMissions: generateSectMissions(0),
  
  spiritualRoot: null,
  sect: null,
  sectStatus: 'none',
  sectPosition: 'outer',
  sectContribution: 0,
  sectCompetitionWins: 0,
  age: 18,
  lifespan: 100,
  baseLuck: 50,
  dailyLuck: 0,
  sealedLogs: [],
  marrowWashProgress: 0,
  highestLevelReached: null,
  levelIndex: 0,
  experience: 0,
  learnedKnowledge: [],
  dailyEncyclopediaItems: [],
  achievements: [],
  
  createdAt: Date.now(),
  showMarrowWashEvent: false,
  daoCompanion: null,
  marriedCompanions: [],
  unlockedCompanions: [],
  breakthroughEvent: null,
  
  playerName: '无名修士',
  currentRegion: '凡人界',
  isFirstTime: true,
  hasDoneFirstDrink: false,
  claimedStreakRewards: [],
  unlockedTitles: ['初入仙途'],
  currentTitle: '初入仙途',
  cave: {
    springQi: 0,
    lastSpringCollect: Date.now(),
    herbs: [],
    furnace: { active: false, recipeId: null, startTime: null, endTime: null }
  },
  materials: {},
  realmExplorationsToday: 0,
  realmExplorationTotal: 0,
  lastRealmExplorationDate: null,
  
  activeGame: null,
  dailyFates: [],
  selectedFate: null,
  skills: [],
  equippedSkills: [],
  skillProficiency: {},
  artifacts: [],
  equippedArtifacts: [],
  artifactLevels: {},
  chests: 0,
  heavenlyBottleDrops: 0,
  storyChapter: 1,
  storyNode: 1,
  globalEvent: null,
  sectNpcs: [],

  // V6.0 Initial State
  characterId: null,
  characterPreset: null,
  isDead: false,
  deathReason: null,
  rebirthCount: 0,
  storyProgress: {},

  // V5.0 Additions (Mortal Journey Core)
  talismans: {},
  formations: [],
  monsterMaterials: {},
  alchemyLevel: 1,
  craftingLevel: 1,
  talismanLevel: 1,
  formationLevel: 1,
  sectContributionRank: 0,
  sectLevel: 1,
  sectPrestige: 1000,
  sectWealth: 50000,
  interSectWins: 0,
  dailySalaryClaimed: false,
  sectBuff: null,
  pendingStreakRescue: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      activateSectFormation: () => {
        const state = get();
        if (state.sectPosition !== 'elder' && state.sectPosition !== 'patriarch') {
          return { success: false, message: '权限不足，仅长老及以上可开启护宗大阵。' };
        }
        if (state.sectWealth < 10000) {
          return { success: false, message: '宗门底蕴不足 10000。' };
        }
        if (state.sectBuff && state.sectBuff.expiresAt > Date.now()) {
          return { success: false, message: '护宗大阵已在运转中。' };
        }
        
        set({
          sectWealth: state.sectWealth - 10000,
          sectBuff: { type: 'protection', expiresAt: Date.now() + 24 * 60 * 60 * 1000 } // 24 hours
        });
        return { success: true, message: '护宗大阵已开启，全宗弟子修炼速度提升20%，持续24小时！' };
      },

      upgradeSect: () => {
        const state = get();
        if (state.sectPosition !== 'patriarch') {
          return { success: false, message: '只有宗主才能提升宗门能力！' };
        }
        const cost = state.sectLevel * 100000;
        if (state.spiritStones < cost) {
          return { success: false, message: `灵石不足！提升宗门需要 ${cost} 灵石。` };
        }
        set({
          spiritStones: state.spiritStones - cost,
          sectLevel: state.sectLevel + 1
        });
        return { success: true, message: `宗门等级提升至 ${state.sectLevel + 1} 级！全宗门修炼速度提升！` };
      },

      setPlayerName: (name) => set({ playerName: name }),
      setCurrentRegion: (region) => set({ currentRegion: region }),
      setIsFirstTime: (val) => set({ isFirstTime: val }),
      setHasDoneFirstDrink: (val) => set({ hasDoneFirstDrink: val }),
      claimStreakReward: (days) => set((state) => {
        if (!state.claimedStreakRewards.includes(days)) {
          return { claimedStreakRewards: [...state.claimedStreakRewards, days] };
        }
        return state;
      }),
      setCurrentTitle: (title) => set({ currentTitle: title }),
      addMaterial: (id, amount) => set((state) => ({
        materials: { ...state.materials, [id]: (state.materials[id] || 0) + amount }
      })),
      collectSpring: () => set((state) => {
        const now = Date.now();
        // 1 Qi per hour, max 24
        const hoursPassed = (now - state.cave.lastSpringCollect) / (1000 * 60 * 60);
        const collected = Math.floor(Math.min(24, state.cave.springQi + hoursPassed));
        if (collected > 0) {
          return {
            bonusPoints: state.bonusPoints + collected * 10, // 10 cultivation per Qi
            cave: { ...state.cave, springQi: 0, lastSpringCollect: now }
          };
        }
        return state;
      }),
      plantHerb: (type) => set((state) => {
        if (state.cave.herbs.length >= 4) return state; // Max 4 herbs
        
        // Define max growth based on herb type
        let maxGrowth = 1000;
        if (type === 'rare_herb') maxGrowth = 3000;
        else if (type === 'millennium_lingzhi') maxGrowth = 10000;
        else if (type === 'jiuzhuan_grass') maxGrowth = 50000;
        
        return {
          cave: {
            ...state.cave,
            herbs: [...state.cave.herbs, { id: Date.now().toString(), type, stage: 'seed', growth: 0, maxGrowth, plantedAt: Date.now() }]
          }
        };
      }),
      waterHerbs: (amount) => set((state) => {
        // 100ml = 5 growth points
        const growthGained = (amount / 100) * 5;
        const newHerbs = state.cave.herbs.map(herb => {
          if (herb.stage === 'mature') return herb;
          const maxGrowth = herb.maxGrowth || 1000;
          const newGrowth = Math.min(maxGrowth, herb.growth + growthGained);
          let newStage: 'seed' | 'sprout' | 'mature' = herb.stage;
          if (newGrowth >= maxGrowth) newStage = 'mature';
          else if (newGrowth >= maxGrowth * 0.3) newStage = 'sprout';
          return { ...herb, growth: newGrowth, stage: newStage };
        });
        return { cave: { ...state.cave, herbs: newHerbs } };
      }),
      harvestHerb: (id) => set((state) => {
        const herb = state.cave.herbs.find(h => h.id === id);
        if (herb && herb.stage === 'mature') {
          let rewardId = herb.type;
          if (rewardId === 'common') rewardId = 'common_herb';
          if (rewardId === 'rare') rewardId = 'rare_herb';
          
          return {
            cave: { ...state.cave, herbs: state.cave.herbs.filter(h => h.id !== id) },
            materials: { ...state.materials, [rewardId]: (state.materials[rewardId] || 0) + 1 }
          };
        }
        return state;
      }),
      startAlchemy: (recipeId) => set((state) => {
        if (state.cave.furnace.active) return state;
        
        const recipes: Record<string, { cost: Record<string, number>, stones: number, time: number }> = {
          'juqi': { cost: { 'common_herb': 2 }, stones: 10, time: 4 * 60 * 60 * 1000 },
          'humai': { cost: { 'rare_herb': 1, 'common_herb': 2 }, stones: 50, time: 8 * 60 * 60 * 1000 },
          'qingxin': { cost: { 'common_herb': 3 }, stones: 20, time: 2 * 60 * 60 * 1000 },
          'millennium': { cost: { 'millennium_lingzhi': 1, 'rare_herb': 2 }, stones: 200, time: 12 * 60 * 60 * 1000 },
          'jiuzhuan': { cost: { 'jiuzhuan_grass': 1, 'millennium_lingzhi': 1 }, stones: 500, time: 24 * 60 * 60 * 1000 }
        };
        
        const recipe = recipes[recipeId];
        if (!recipe) return state;
        
        if (state.spiritStones < recipe.stones) return state;
        
        for (const [mat, amount] of Object.entries(recipe.cost)) {
          if ((state.materials[mat] || 0) < amount) return state;
        }
        
        const newMaterials = { ...state.materials };
        for (const [mat, amount] of Object.entries(recipe.cost)) {
          newMaterials[mat] -= amount;
        }
        
        return {
          spiritStones: state.spiritStones - recipe.stones,
          materials: newMaterials,
          cave: {
            ...state.cave,
            furnace: {
              active: true,
              recipeId,
              startTime: Date.now(),
              endTime: Date.now() + recipe.time
            }
          }
        };
      }),
      collectPill: () => set((state) => {
        const furnace = state.cave.furnace;
        if (!furnace.active || !furnace.endTime || Date.now() < furnace.endTime) return state;
        
        const pillId = furnace.recipeId + '_pill';
        
        return {
          inventory: [...state.inventory, pillId],
          cave: {
            ...state.cave,
            furnace: { active: false, recipeId: null, startTime: null, endTime: null }
          }
        };
      }),
      speedUpAlchemy: () => set((state) => {
        const furnace = state.cave.furnace;
        if (!furnace.active || !furnace.endTime) return state;
        
        if (state.spiritStones < 20) return state; // Cost 20 stones to speed up
        
        return {
          spiritStones: state.spiritStones - 20,
          cave: {
            ...state.cave,
            furnace: { ...furnace, endTime: Date.now() } // Finish immediately
          }
        };
      }),
      exploreRealm: (risk) => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        if (state.lastRealmExplorationDate !== today) {
          set({ realmExplorationsToday: 0, lastRealmExplorationDate: today });
        }
        if (get().realmExplorationsToday >= 3) return { type: 'limit' };

        const newTotal = state.realmExplorationTotal + 1;
        set({ 
          realmExplorationsToday: get().realmExplorationsToday + 1,
          realmExplorationTotal: newTotal
        });
        get().updateQuestProgress('game', 1);

        // Hidden events based on total explorations
        if (newTotal === 5) {
          get().obtainArtifact('artifact_sword');
          return { type: 'hidden_cave', reward: '获得凡俗兵器：精铁长剑' };
        }
        if (newTotal === 10) {
          const newTitles = [...state.unlockedTitles];
          if (!newTitles.includes('秘境探索者')) {
            newTitles.push('秘境探索者');
            set({ unlockedTitles: newTitles });
          }
          return { type: 'hidden_cave', reward: '专属称号：秘境探索者' };
        }
        if (newTotal === 20) {
          get().addMaterial('jiuzhuan_grass', 5);
          return { type: 'hidden_cave', reward: '秘境首领挑战胜利！获得九转还魂草x5' };
        }

        let companionBonus = 1;
        if (state.daoCompanion && state.daoCompanion.active) {
          if (state.daoCompanion.favorability >= 500) companionBonus = 2; // 双修伴侣 100% bonus
          else if (state.daoCompanion.favorability >= 200) companionBonus = 1.5; // 道侣 50% bonus
          else if (state.daoCompanion.favorability >= 50) companionBonus = 1.2; // 知己 20% bonus
        }

        // Luck affects the random roll (higher luck = lower rand = better rewards)
        // dailyLuck is 10-100. Let's say 50 is neutral.
        // If luck is 100, rand is multiplied by 0.5 (better chance for rare items).
        // If luck is 10, rand is multiplied by 1.4 (worse chance).
        const luckFactor = 1 - ((state.dailyLuck - 50) / 100); 
        const rand = Math.random() * luckFactor;

        const applyReward = (result: any) => {
          if (result.type === 'pill' || result.type === 'material') {
            get().addMaterial(result.itemId, result.amount);
          } else if (result.type === 'skill') {
            get().learnSkill(result.itemId);
          } else if (result.type === 'stone') {
            get().addSpiritStones(result.amount);
          } else if (result.type === 'inheritance') {
            set({ experience: get().experience + result.exp });
          } else if (result.type === 'monster') {
            const penalty = Math.floor(get().experience * result.penalty);
            set({ experience: Math.max(0, get().experience - penalty) });
          } else if (['herb', 'rare_herb', 'jiuzhuan_grass', 'millennium_lingzhi', 'profound_iron'].includes(result.type)) {
            get().addMaterial(result.type, result.amount);
          }
          return result;
        };

        if (risk === 'low') {
          if (state.currentRegion === '天南' && !state.unlockedCompanions.includes('chenqiaoqian') && Math.random() < 0.05) {
            get().unlockCompanion('chenqiaoqian');
            return { type: 'hidden_cave', reward: '在太南小会外围，你偶然救下了一名被散修围攻的黄枫谷女修陈巧倩。她对你心生感激，已可结为道侣！' };
          }
          if (state.currentRegion === '乱星海' && rand < 0.1) return applyReward({ type: 'material', itemId: 'monster_bone', amount: Math.ceil(2 * companionBonus) });
          if (state.currentRegion === '阴冥之地' && rand < 0.1) return applyReward({ type: 'material', itemId: 'yin_stone', amount: Math.ceil(1 * companionBonus) });
          
          if (rand < 0.1) return applyReward({ type: 'pill', itemId: 'pill_1', amount: 1 });
          if (rand < 0.5) return applyReward({ type: 'herb', amount: Math.ceil(1 * companionBonus) });
          if (rand < 0.7) return applyReward({ type: 'stone', amount: Math.ceil(10 * companionBonus) });
          if (rand < 0.8) return applyReward({ type: 'profound_iron', amount: Math.ceil(1 * companionBonus) });
          return applyReward({ type: 'monster', penalty: 0.01 }); // 1% loss
        } else if (risk === 'mid') {
          if (state.currentRegion === '天南' && rand < 0.05) return applyReward({ type: 'skill', itemId: 'skill_3' }); // 五行诀
          if (state.currentRegion === '乱星海' && rand < 0.05) return applyReward({ type: 'skill', itemId: 'skill_water_shield' });
          if (state.currentRegion === '大晋' && rand < 0.05) return applyReward({ type: 'skill', itemId: 'skill_buddha' });
          
          if (rand < 0.15) return applyReward({ type: 'pill', itemId: 'pill_foundation', amount: 1 });
          if (rand < 0.4) return applyReward({ type: 'herb', amount: Math.ceil(2 * companionBonus) });
          if (rand < 0.6) return applyReward({ type: 'stone', amount: Math.ceil(30 * companionBonus) });
          if (rand < 0.8) return applyReward({ type: 'millennium_lingzhi', amount: Math.ceil(1 * companionBonus) });
          return applyReward({ type: 'monster', penalty: 0.02 }); // 2% loss
        } else {
          // Check for companion unlocks first
          if (state.currentRegion === '阴冥之地' && !state.unlockedCompanions.includes('yuanyao') && Math.random() < 0.3) {
            get().unlockCompanion('yuanyao');
            return { type: 'hidden_cave', reward: '在阴冥之地深处，你协助了一位名叫元瑶的女子脱困。她对你心生感激，已可结为道侣！' };
          }
          if (state.currentRegion === '乱星海' && !state.unlockedCompanions.includes('ziling') && Math.random() < 0.1) {
            get().unlockCompanion('ziling');
            return { type: 'hidden_cave', reward: '在乱星海的某处荒岛，你偶遇了妙音门紫灵仙子。她对你心生好感，已可结为道侣！' };
          }
          if (!state.unlockedCompanions.includes('yinyue') && Math.random() < 0.1) {
            get().unlockCompanion('yinyue');
            return { type: 'hidden_cave', reward: '你在秘境深处解救了一缕神秘神魂，名为银月。她对你心生感激，已可结为道侣！' };
          }

          if (state.currentRegion === '灵界' && rand < 0.05) return applyReward({ type: 'skill', itemId: 'skill_xuantian' });
          if (state.currentRegion === '大晋' && rand < 0.05) return applyReward({ type: 'skill', itemId: 'skill_5' }); // 天雷双剑

          if (rand < 0.02) return applyReward({ type: 'inheritance', reward: '上古大能传承，修为暴涨！', exp: 50000 });
          if (rand < 0.1) return applyReward({ type: 'pill', itemId: 'pill_golden_core', amount: 1 });
          if (rand < 0.3) return applyReward({ type: 'rare_herb', amount: Math.ceil(1 * companionBonus) });
          if (rand < 0.5) return applyReward({ type: 'stone', amount: Math.ceil(100 * companionBonus) });
          if (rand < 0.7) return applyReward({ type: 'jiuzhuan_grass', amount: Math.ceil(1 * companionBonus) });
          return applyReward({ type: 'monster', penalty: 0.03 }); // 3% loss
        }
      },

      setShowMarrowWashEvent: (show) => set({ showMarrowWashEvent: show }),
      unlockCompanion: (id) => set((state) => ({
        unlockedCompanions: state.unlockedCompanions.includes(id) ? state.unlockedCompanions : [...state.unlockedCompanions, id]
      })),
      setMarriedCompanions: (companions) => set({ marriedCompanions: companions }),
      setDaoCompanion: (companion) => set((state) => {
        if (!companion) return { daoCompanion: null };
        const existing = state.marriedCompanions.find(c => c.id === companion.id);
        const newCompanion = existing || {
          ...companion,
          favorability: companion.favorability || 0,
          dailyInteractions: companion.dailyInteractions || 0,
          lastInteractionDate: companion.lastInteractionDate || null,
          levelIndex: 0
        };
        const newMarried = existing ? state.marriedCompanions : [...state.marriedCompanions, newCompanion];
        return {
          daoCompanion: newCompanion,
          marriedCompanions: newMarried
        };
      }),
      interactWithCompanion: (type, companionId, giftItem) => {
        const state = get();
        const targetId = companionId || state.daoCompanion?.id;
        if (!targetId) return { success: false, message: '尚未结识道侣' };
        
        const companionIndex = state.marriedCompanions.findIndex(c => c.id === targetId);
        if (companionIndex === -1) return { success: false, message: '未找到该道侣' };
        
        const companion = state.marriedCompanions[companionIndex];
        const today = format(new Date(), 'yyyy-MM-dd');
        let currentInteractions = companion.dailyInteractions || 0;
        
        if (companion.lastInteractionDate !== today) {
          currentInteractions = 0;
        }
        
        const updatedCompanions = [...state.marriedCompanions];
        let favorability = companion.favorability || 0;
        let levelIndex = companion.levelIndex || 0;
        
        if (type === 'dual_cultivate') {
          if (favorability < 500) {
            return { success: false, message: '好感度不足，需达到双修伴侣境界 (500好感度)' };
          }
          if (currentInteractions >= 3) {
            return { success: false, message: '今日双修次数已达上限' };
          }
          
          const reward = 1000 + favorability * 10;
          
          updatedCompanions[companionIndex] = {
            ...companion,
            favorability,
            dailyInteractions: currentInteractions + 1,
            lastInteractionDate: today
          };
          
          set({
            bonusPoints: (isNaN(state.bonusPoints) ? 0 : state.bonusPoints) + reward,
            marriedCompanions: updatedCompanions,
            daoCompanion: state.daoCompanion?.id === targetId ? updatedCompanions[companionIndex] : state.daoCompanion
          });
          return { success: true, message: `与${companion.name}双修成功，修为大增！`, reward };
        } else if (type === 'gift') {
          const itemToGift = giftItem || 'rare_herb';
          
          const isMaterial = (state.materials[itemToGift] || 0) > 0;
          const isInventory = state.inventory.includes(itemToGift);
          
          if (!isMaterial && !isInventory) {
            return { success: false, message: `缺少该物品作为礼物` };
          }
          
          if (isMaterial) {
            get().addMaterial(itemToGift, -1);
          } else if (isInventory) {
            const newInventory = [...state.inventory];
            const index = newInventory.indexOf(itemToGift);
            if (index > -1) newInventory.splice(index, 1);
            set({ inventory: newInventory });
          }
          
          let favorabilityGain = 10;
          let expGain = 0;
          
          if (itemToGift === 'zhuyan_pill') {
            favorabilityGain = 50;
            expGain = 100;
          } else if (itemToGift === 'jiuzhuan_grass') {
            favorabilityGain = 20;
            expGain = 50;
          } else if (itemToGift === 'rare_herb') {
            favorabilityGain = 10;
            expGain = 10;
          } else if (itemToGift === 'pill_1') {
            favorabilityGain = 5;
            expGain = 500;
          } else if (itemToGift === 'pill_foundation') {
            favorabilityGain = 30;
            expGain = 2000;
          } else if (itemToGift === 'pill_golden_core') {
            favorabilityGain = 100;
            expGain = 10000;
          } else if (itemToGift === 'pill_nascent_soul') {
            favorabilityGain = 500;
            expGain = 50000;
          } else if (itemToGift === 'jiuzhuan_pill') {
            favorabilityGain = 1000;
            expGain = 100000;
          } else if (itemToGift === 'millennium_pill') {
            favorabilityGain = 200;
            expGain = 20000;
          } else if (itemToGift === 'millennium_lingzhi') {
            favorabilityGain = 50;
            expGain = 100;
          } else if (itemToGift === 'profound_iron') {
            favorabilityGain = 20;
            expGain = 20;
          } else if (itemToGift.startsWith('skill_') || itemToGift.startsWith('book_')) {
            favorabilityGain = 50;
            expGain = 5000;
          } else if (itemToGift.startsWith('artifact_') || itemToGift === 'artifact_flying_sword' || itemToGift === 'artifact_shield') {
            favorabilityGain = 100;
            expGain = 10000;
          } else {
            favorabilityGain = 5;
            expGain = 5;
          }
          
          let newLevelIndex = levelIndex;
          let newExp = (companion.exp || CULTIVATION_LEVELS[levelIndex]?.min || 0) + expGain;
          let leveledUp = false;

          while (newLevelIndex < CULTIVATION_LEVELS.length - 1) {
            const nextLevelMin = CULTIVATION_LEVELS[newLevelIndex + 1].min;
            if (newExp >= nextLevelMin) {
              newLevelIndex++;
              leveledUp = true;
            } else {
              break;
            }
          }
          
          updatedCompanions[companionIndex] = {
            ...companion,
            favorability: favorability + favorabilityGain,
            levelIndex: newLevelIndex,
            exp: newExp,
            dailyInteractions: currentInteractions, // Gifting doesn't consume daily interactions
            lastInteractionDate: today
          };
          
          set({
            marriedCompanions: updatedCompanions,
            daoCompanion: state.daoCompanion?.id === targetId ? updatedCompanions[companionIndex] : state.daoCompanion
          });
          
          let msg = `赠送成功，${companion.name}好感度增加${favorabilityGain}！`;
          if (leveledUp) {
            msg += ` ${companion.name}修为突破到了${CULTIVATION_LEVELS[newLevelIndex].name}！`;
          }
          return { success: true, message: msg };
        }
        
        return { success: false, message: '未知互动' };
      },
      setBreakthroughEvent: (event) => set({ breakthroughEvent: event }),

      unlockAchievement: (id) => set((state) => {
        if (!state.achievements.includes(id)) {
          return { achievements: [...state.achievements, id] };
        }
        return state;
      }),

      setHighestLevelReached: (levelName) => set((state) => {
        const newTitles = [...state.unlockedTitles];
        if (levelName === '筑基初期' && !newTitles.includes('筑基高人')) {
          newTitles.push('筑基高人');
        }
        return { highestLevelReached: levelName, unlockedTitles: newTitles };
      }),

      setLevelIndex: (index) => {
        let newLifespan = 100;
        if (index >= 9) newLifespan = 200; // 筑基
        if (index >= 18) newLifespan = 500; // 结丹
        if (index >= 27) newLifespan = 1000; // 元婴
        if (index >= 36) newLifespan = 2000; // 化神
        if (index >= 45) newLifespan = 5000; // 炼虚
        if (index >= 54) newLifespan = 10000; // 合体
        
        set({ levelIndex: index, lifespan: newLifespan });
      },

      attemptBreakthrough: (useQingxinPill, forceSuccess = false) => {
        const state = get();
        const currentLevel = CULTIVATION_LEVELS[state.levelIndex];
        const nextLevel = CULTIVATION_LEVELS[state.levelIndex + 1];
        
        if (!nextLevel) return { success: false, message: '已达此界巅峰。' };

        // Major Breakthroughs
        let requiredPill = '';
        let pillName = '';
        
        if (currentLevel.name === '炼气十三层' && nextLevel.name === '筑基初期') {
          requiredPill = 'pill_foundation';
          pillName = '筑基丹';
        } else if (currentLevel.name === '筑基巅峰' && nextLevel.name === '结丹初期') {
          requiredPill = 'pill_golden_core';
          pillName = '降尘丹';
        } else if (currentLevel.name === '结丹巅峰' && nextLevel.name === '元婴初期') {
          requiredPill = 'pill_nascent_soul';
          pillName = '定灵丹';
        }

        if (requiredPill && (state.materials[requiredPill] || 0) <= 0) {
          return { success: false, message: `大境界突破需要【${pillName}】，请先准备丹药。` };
        }

        if (useQingxinPill && (state.materials['qingxin_pill'] || 0) <= 0) {
          return { success: false, message: `清心丹数量不足。` };
        }

        // Base success rate is 50%, luck modifies it by up to +/- 20%, plus item bonus
        let skillBonus = 0;
        if (state.equippedSkills.includes('skill_2')) skillBonus -= 10;
        if (state.equippedSkills.includes('skill_3')) skillBonus += 10;
        if (state.equippedSkills.includes('skill_5')) skillBonus -= 20;

        const luckModifier = (state.dailyLuck - 50) / 2.5; // -20 to +20
        const successRateBonus = useQingxinPill ? 20 : 0;
        const successChance = 50 + luckModifier + successRateBonus + skillBonus;
        
        const rand = Math.random() * 100;
        
        // Consume pills
        let newMaterials = { ...state.materials };
        if (requiredPill) {
          newMaterials[requiredPill] = (newMaterials[requiredPill] || 0) - 1;
          if (newMaterials[requiredPill] <= 0) delete newMaterials[requiredPill];
        }
        if (useQingxinPill) {
          newMaterials['qingxin_pill'] = (newMaterials['qingxin_pill'] || 0) - 1;
          if (newMaterials['qingxin_pill'] <= 0) delete newMaterials['qingxin_pill'];
        }

        if (forceSuccess || rand <= successChance) {
          let extraLifespan = 0;
          if (state.equippedSkills.includes('skill_4')) {
            extraLifespan = 50;
          }
          
          set({ 
            levelIndex: state.levelIndex + 1, 
            highestLevelReached: nextLevel.name,
            lifespan: state.lifespan + extraLifespan,
            materials: newMaterials
          });
          return { success: true, message: `突破成功！气运加成：${luckModifier > 0 ? '+' : ''}${luckModifier.toFixed(1)}%${extraLifespan > 0 ? '，寿元额外增加50年' : ''}` };
        } else {
          // Failure penalty: lose some bonus points
          const penalty = Math.floor(state.bonusPoints * 0.05); // 5% loss
          set({ 
            bonusPoints: Math.max(0, state.bonusPoints - penalty),
            materials: newMaterials
          });
          return { success: false, message: `突破失败，修为受损（-${penalty}）。气运加成：${luckModifier > 0 ? '+' : ''}${luckModifier.toFixed(1)}%` };
        }
      },

      resetCultivation: () => set((state) => ({
        levelIndex: 0,
        experience: 0,
        bonusPoints: 0,
        spiritualRoot: null,
        sect: null,
        sectStatus: 'none',
        sectPosition: 'outer',
        sectContribution: 0,
        sectCompetitionWins: 0,
        age: 16,
        lifespan: 100,
        sealedLogs: [...state.sealedLogs, ...state.logs],
        logs: [],
        createdAt: Date.now()
      })),
      
      markKnowledgeLearned: (id) => set((state) => {
        if (!state.learnedKnowledge.includes(id)) {
          return {
            learnedKnowledge: [...state.learnedKnowledge, id],
            experience: state.experience + 1
          };
        }
        return state;
      }),

      testSpiritualRoot: () => {
        const rand = Math.random();
        let rootId = 'mixed';
        if (rand < 0.001) rootId = 'waste_genius'; // 0.1%
        else if (rand < 0.006) rootId = 'mutated'; // 0.5%
        else if (rand < 0.016) rootId = 'heaven'; // 1%
        else if (rand < 0.066) rootId = 'dual'; // 5%
        else if (rand < 0.216) rootId = 'triple'; // 15%
        
        set({ spiritualRoot: rootId });
        return rootId;
      },

      joinSect: (sectId) => {
        const { spiritualRoot } = get();
        if (!spiritualRoot || spiritualRoot === 'none') return;
        
        const sectToJoin = sectId || SECTS[Math.floor(Math.random() * SECTS.length)].id;
        set({ sect: sectToJoin, sectStatus: 'joined', sectPosition: 'outer', sectContribution: 0, sectCompetitionWins: 0 });
      },

      getSpiritualRootBonus: () => {
        const { spiritualRoot } = get();
        if (!spiritualRoot) return 1.0;
        const root = SPIRITUAL_ROOTS.find(r => r.id === spiritualRoot);
        return root ? root.bonus : 1.0;
      },

      claimSectSalary: () => {
        const state = get();
        if (!state.sect || state.sectStatus !== 'joined') {
          return { success: false, message: '未加入宗门，无法领取俸禄。', amount: 0 };
        }
        if (state.dailySalaryClaimed) {
          return { success: false, message: '今日已领取过俸禄。', amount: 0 };
        }
        
        let salary = 0;
        switch (state.sectPosition) {
          case 'outer': salary = 50; break;
          case 'inner': salary = 200; break;
          case 'core': salary = 500; break;
          case 'elder': salary = 1500; break;
          case 'patriarch': salary = 5000; break;
        }
        
        const sectInfo = SECTS.find(s => s.id === state.sect);
        if (sectInfo?.bonusType === 'daily_salary') {
          salary = Math.floor(salary * sectInfo.bonusValue);
        }

        set({ 
          spiritStones: state.spiritStones + salary,
          dailySalaryClaimed: true
        });
        
        return { success: true, message: `领取成功，获得 ${salary} 灵石。`, amount: salary };
      },

      challengeOtherSect: (npcId) => {
        const state = get();
        const npc = state.sectNpcs.find(n => n.id === npcId);
        if (!npc) return { success: false, message: '找不到目标。', win: false, reward: null };
        if (npc.sectId === state.sect) return { success: false, message: '不能挑战同门。', win: false, reward: null };
        
        const myCultivation = state.logs.reduce((acc, log) => acc + (isNaN(log.amount) ? 0 : log.amount), 0);
        const oppCultivation = npc.cultivation;
        let winChance = 0.5;
        if (myCultivation > oppCultivation * 5) winChance = 0.99;
        else if (myCultivation > oppCultivation * 2) winChance = 0.85;
        else if (myCultivation > oppCultivation) winChance = 0.60;
        else if (myCultivation < oppCultivation / 5) winChance = 0.01;
        else if (myCultivation < oppCultivation / 2) winChance = 0.15;
        else winChance = 0.40;
        
        const mySectInfo = SECTS.find(s => s.id === state.sect);
        if (mySectInfo?.bonusType === 'combat_win_rate') {
          winChance += mySectInfo.bonusValue;
        }

        const win = Math.random() < winChance;
        if (win) {
          const prestigeGain = Math.floor(Math.random() * 50) + 50;
          const contributionGain = Math.floor(Math.random() * 200) + 100;
          const stonesGain = Math.floor(Math.random() * 500) + 200;
          
          set({
            interSectWins: state.interSectWins + 1,
            sectPrestige: state.sectPrestige + prestigeGain,
            sectContribution: state.sectContribution + contributionGain,
            spiritStones: state.spiritStones + stonesGain
          });
          
          return { 
            success: true, 
            message: `你击败了 ${npc.name}，扬我宗门威名！`, 
            win: true, 
            reward: { prestige: prestigeGain, contribution: contributionGain, stones: stonesGain } 
          };
        } else {
          return { success: true, message: `你败给了 ${npc.name}，技不如人。`, win: false, reward: null };
        }
      },

      makeTalisman: (id) => {
        const state = get();
        const costs: Record<string, Record<string, number>> = {
          'fireball': { 'paper': 1, 'cinnabar': 1 },
          'shield': { 'paper': 1, 'cinnabar': 2 },
          'escape': { 'paper': 1, 'cinnabar': 3 },
        };
        const cost = costs[id];
        if (!cost) return { success: false, message: '未找到符箓配方' };
        for (const [mat, amount] of Object.entries(cost)) {
          if ((state.materials[mat] || 0) < amount) return { success: false, message: `材料不足: 缺少${mat === 'paper' ? '符纸' : '朱砂'}` };
        }
        const newMaterials = { ...state.materials };
        for (const [mat, amount] of Object.entries(cost)) {
          newMaterials[mat] -= amount;
        }
        set({
          materials: newMaterials,
          talismans: { ...state.talismans, [id]: (state.talismans[id] || 0) + 1 },
          talismanLevel: state.talismanLevel + 0.1
        });
        return { success: true, message: `绘制成功！获得 ${id === 'fireball' ? '火弹符' : id === 'shield' ? '金刚符' : '神行符'}` };
      },

      makePill: (id) => {
        const state = get();
        const recipes: Record<string, Record<string, number>> = {
          'pill_1': { 'common_herb': 2 },
          'pill_foundation': { 'common_herb': 10, 'rare_herb': 2 },
          'pill_golden_core': { 'rare_herb': 5, 'millennium_lingzhi': 1 },
          'pill_nascent_soul': { 'millennium_lingzhi': 3, 'jiuzhuan_grass': 1 },
          'zhuyan_pill': { 'rare_herb': 10, 'millennium_lingzhi': 2 },
        };
        const recipe = recipes[id];
        if (!recipe) return { success: false, message: '未找到丹方' };
        for (const [mat, amount] of Object.entries(recipe)) {
          if ((state.materials[mat] || 0) < amount) return { success: false, message: `材料不足: 缺少${mat === 'common_herb' ? '灵草' : mat === 'rare_herb' ? '珍稀灵草' : mat === 'millennium_lingzhi' ? '千年灵芝' : mat === 'jiuzhuan_grass' ? '九转玄草' : mat}` };
        }
        const newMaterials = { ...state.materials };
        for (const [mat, amount] of Object.entries(recipe)) {
          newMaterials[mat] -= amount;
        }
        
        newMaterials[id] = (newMaterials[id] || 0) + 1;
        set({
          materials: newMaterials,
          alchemyLevel: state.alchemyLevel + 0.2
        });
        return { success: true, message: `炼制成功！获得 ${id === 'pill_1' ? '黄龙丹' : id === 'pill_foundation' ? '筑基丹' : id === 'pill_golden_core' ? '降尘丹' : id === 'pill_nascent_soul' ? '定灵丹' : id === 'zhuyan_pill' ? '驻颜丹' : id}` };
      },

      craftArtifact: (id) => {
        const state = get();
        const costs: Record<string, Record<string, number>> = {
          'artifact_flying_sword': { 'profound_iron': 5, 'monster_bone': 1 },
          'artifact_shield': { 'profound_iron': 10, 'monster_fur': 2 },
        };
        const cost = costs[id];
        if (!cost) return { success: false, message: '未找到法器图纸' };
        for (const [mat, amount] of Object.entries(cost)) {
          if ((state.materials[mat] || 0) < amount) return { success: false, message: `材料不足: 缺少${mat === 'profound_iron' ? '玄铁精' : mat === 'monster_bone' ? '妖兽骨骼' : '妖兽皮毛'}` };
        }
        const newMaterials = { ...state.materials };
        for (const [mat, amount] of Object.entries(cost)) {
          newMaterials[mat] -= amount;
        }
        set({
          materials: newMaterials,
          artifacts: [...state.artifacts, id],
          craftingLevel: state.craftingLevel + 0.5
        });
        return { success: true, message: `炼制成功！获得 ${id === 'artifact_flying_sword' ? '飞剑' : '玄铁盾'}` };
      },

      setupFormation: (id) => {
        const state = get();
        if (state.formations.includes(id)) return { success: false, message: '已布置该阵法' };
        const costs: Record<string, number> = {
          'gathering': 100,
          'trapping': 500,
          'killing': 2000,
        };
        const cost = costs[id];
        if (state.spiritStones < cost) return { success: false, message: `灵石不足: 需要 ${cost} 灵石` };
        set({
          spiritStones: state.spiritStones - cost,
          formations: [...state.formations, id],
          formationLevel: state.formationLevel + 1
        });
        return { success: true, message: `布置成功！${id === 'gathering' ? '聚灵阵' : id === 'trapping' ? '困敌阵' : '杀阵'} 开始运转` };
      },

      participateImmortalAssembly: () => {
        const state = get();
        if (state.levelIndex < 1) return { success: false, message: '凡人之躯，无法参加升仙大会。' };
        if (!state.spiritualRoot || state.spiritualRoot === 'none') return { success: false, message: '尚未测试灵根，无法参加升仙大会。请先测试灵根。' };
        if (state.sect) return { success: false, message: '你已在宗门之中。' };
        
        const rand = Math.random();
        // 天灵根必过，双灵根80%，三灵根40%，杂灵根10%
        let chance = 0.1;
        if (state.spiritualRoot === 'heaven') chance = 1.0;
        else if (state.spiritualRoot === 'dual') chance = 0.8;
        else if (state.spiritualRoot === 'triple') chance = 0.4;

        if (rand < chance) {
          get().joinSect();
          return { success: true, message: '你在升仙大会中表现优异，成功加入宗门！' };
        }
        return { success: false, message: '很遗憾，你未能通过宗门考核。' };
      },

      ascend: () => {
        const state = get();
        if (state.levelIndex < 54) return { success: false, message: '修为不足，无法感应飞升雷劫。' }; // 大乘巅峰
        set({ currentRegion: '灵界', levelIndex: 55 }); // 飞升灵界，进入渡劫期
        return { success: true, message: '雷劫过后，你白日飞升，进入灵界！' };
      },

      leaveSect: () => {
        set((state) => ({
          sect: null,
          sectStatus: 'left',
          sectPosition: 'outer',
          sectContribution: 0,
          sectCompetitionWins: 0,
          sealedLogs: state.logs,
          logs: [],
          highestLevelReached: null,
        }));
      },

      rejoinSect: (sectId) => {
        set((state) => ({
          sect: sectId || SECTS[Math.floor(Math.random() * SECTS.length)].id,
          sectStatus: 'joined',
          sectPosition: 'outer',
          sectContribution: 0,
          sectCompetitionWins: 0,
          logs: [...state.logs, ...state.sealedLogs],
          sealedLogs: [],
        }));
      },

      addSectContribution: (amount) => set((state) => ({ sectContribution: state.sectContribution + amount })),
      
      donateToSect: (itemId) => {
        const state = get();
        if (state.sectStatus !== 'joined') return { success: false, message: '未加入宗门' };
        
        const isMaterial = (state.materials[itemId] || 0) > 0;
        const isInventory = state.inventory.includes(itemId);
        
        if (!isMaterial && !isInventory) {
          return { success: false, message: '缺少该物品' };
        }
        
        let contributionGain = 10;
        if (itemId === 'zhuyan_pill') contributionGain = 500;
        else if (itemId === 'jiuzhuan_grass') contributionGain = 200;
        else if (itemId === 'rare_herb') contributionGain = 50;
        else if (itemId === 'pill_1') contributionGain = 100;
        else if (itemId === 'pill_foundation') contributionGain = 500;
        else if (itemId === 'pill_golden_core') contributionGain = 2000;
        else if (itemId.startsWith('skill_')) contributionGain = 1000;
        else contributionGain = 10;
        
        if (isMaterial) {
          get().addMaterial(itemId, -1);
        } else if (isInventory) {
          set({ inventory: state.inventory.filter(i => i !== itemId) });
        }
        
        set({ sectContribution: state.sectContribution + contributionGain });
        return { success: true, message: `捐献成功，获得 ${contributionGain} 点宗门贡献！` };
      },

      winSectCompetition: () => set((state) => ({ sectCompetitionWins: (state.sectCompetitionWins || 0) + 1 })),

      promoteSectPosition: () => {
        const state = get();
        const levelIndex = state.levelIndex;
        
        if (state.sectPosition === 'outer') {
          if (levelIndex < 14) return { success: false, message: '修为不足，需达到筑基期方可晋升内门弟子。' };
          if (state.sectContribution < 1000) return { success: false, message: '宗门贡献不足 1000，无法晋升。' };
          set({ sectPosition: 'inner', sectContribution: state.sectContribution - 1000 });
          return { success: true, message: '修为突破，晋升为内门弟子！' };
        } else if (state.sectPosition === 'inner') {
          if (levelIndex < 18) return { success: false, message: '修为不足，需达到结丹期方可晋升亲传弟子。' };
          if (state.sectContribution < 5000) return { success: false, message: '宗门贡献不足 5000，无法晋升。' };
          set({ sectPosition: 'core', sectContribution: state.sectContribution - 5000 });
          return { success: true, message: '修为突破，晋升为亲传弟子！' };
        } else if (state.sectPosition === 'core') {
          if (levelIndex < 22) return { success: false, message: '修为不足，需达到元婴期方可晋升宗门长老。' };
          if (state.sectContribution < 20000) return { success: false, message: '宗门贡献不足 20000，无法晋升。' };
          set({ sectPosition: 'elder', sectContribution: state.sectContribution - 20000 });
          return { success: true, message: '修为突破，晋升为宗门长老！' };
        } else if (state.sectPosition === 'elder') {
          if (levelIndex < 26) return { success: false, message: '修为不足，需达到化神期方可继任宗主。' };
          if (state.sectContribution < 100000) return { success: false, message: '宗门贡献不足 100000，无法晋升。' };
          set({ sectPosition: 'patriarch', sectContribution: state.sectContribution - 100000 });
          return { success: true, message: '众望所归，继任宗主之位！' };
        }
        return { success: false, message: '已达宗门最高职位。' };
      },

      addLuck: (amount) => set((state) => ({ baseLuck: Math.min(100, state.baseLuck + amount) })),

      washMarrow: (amount) => {
        const safeAmount = isNaN(amount) ? 0 : amount;
        const { marrowWashProgress, spiritualRoot } = get();
        if (spiritualRoot !== 'none') return;
        
        const newProgress = marrowWashProgress + safeAmount;
        if (newProgress >= 5000) {
          // Re-roll root, guarantee at least pseudo
          const rand = Math.random();
          let rootId = 'pseudo';
          if (rand < 0.05) rootId = 'heaven';
          else if (rand < 0.15) rootId = 'dual';
          else if (rand < 0.4) rootId = 'triple';
          else if (rand < 0.7) rootId = 'quad';
          
          set({ spiritualRoot: rootId, marrowWashProgress: 0 });
        } else {
          set({ marrowWashProgress: newProgress });
        }
      },

      claimDailyReward: () => set((state) => {
        if (state.hasClaimedDailyReward) return state;
        
        const day = (state.streakDays - 1) % 7;
        let stones = 100 * (day + 1);
        let rewardMsg = `获得灵石x${stones}`;
        
        const newMaterials = { ...state.materials };
        let newDrops = state.heavenlyBottleDrops;
        
        if (day === 0) {
          newMaterials['common_herb'] = (newMaterials['common_herb'] || 0) + 1;
          rewardMsg += '，普通灵草x1';
        } else if (day === 1) {
          newMaterials['pill_1'] = (newMaterials['pill_1'] || 0) + 1;
          rewardMsg += '，黄龙丹x1';
        } else if (day === 2) {
          newDrops += 1;
          rewardMsg += '，绿液滴x1';
        } else if (day === 3) {
          newMaterials['rare_herb'] = (newMaterials['rare_herb'] || 0) + 1;
          rewardMsg += '，珍稀灵草x1';
        } else if (day === 4) {
          newMaterials['pill_jinsui'] = (newMaterials['pill_jinsui'] || 0) + 1;
          rewardMsg += '，金髓丸x1';
        } else if (day === 5) {
          newDrops += 2;
          rewardMsg += '，绿液滴x2';
        } else if (day === 6) {
          stones = 1000;
          newDrops += 5;
          rewardMsg = `获得灵石x1000，绿液滴x5`;
        }
        
        return {
          hasClaimedDailyReward: true,
          spiritStones: state.spiritStones + stones,
          materials: newMaterials,
          heavenlyBottleDrops: newDrops
        };
      }),

      claimOfflineGains: () => {
        const { lastActiveTimestamp, levelIndex, spiritualRoot } = get();
        const now = Date.now();
        
        // Update timestamp for next time
        set({ lastActiveTimestamp: now });

        if (!lastActiveTimestamp) return null;

        const offlineMs = now - lastActiveTimestamp;
        const offlineMinutes = Math.floor(offlineMs / (1000 * 60));

        // Minimum 10 minutes for offline gains
        if (offlineMinutes < 10) return null;

        // Max 24 hours of offline gains
        const cappedMinutes = Math.min(offlineMinutes, 24 * 60);

        // Calculate EXP (Base 5 exp per minute)
        let baseExpPerMin = 5;
        
        // Root bonus
        const rootInfo = SPIRITUAL_ROOTS.find(r => r.id === spiritualRoot);
        const rootBonus = rootInfo ? rootInfo.bonus : 1;

        // Level bonus
        const levelBonus = 1 + (levelIndex * 0.1);

        // Sect Buff
        const sectBuffBonus = (get().sectBuff && get().sectBuff!.expiresAt > Date.now()) ? 1.2 : 1;

        const totalExp = Math.floor(cappedMinutes * baseExpPerMin * rootBonus * levelBonus * sectBuffBonus);

        // Calculate Items (Chance to find common herbs or spirit stones)
        const items: { id: string, amount: number }[] = [];
        const stonesFound = Math.floor(cappedMinutes * 0.5); // 0.5 stone per minute
        
        if (stonesFound > 0) {
          get().addSpiritStones(stonesFound);
        }

        if (Math.random() < (cappedMinutes / 1440)) { // Up to 100% chance for 24h
          items.push({ id: 'common_herb', amount: Math.floor(Math.random() * 3) + 1 });
        }

        if (Math.random() < (cappedMinutes / 2880)) { // Up to 50% chance for 24h
          items.push({ id: 'rare_herb', amount: 1 });
        }

        items.forEach(item => get().addMaterial(item.id, item.amount));

        // Add EXP as a log entry
        const newLog = {
          timestamp: now,
          amount: totalExp,
          type: 'water' as const, // Treat as water for simplicity
          id: Math.random().toString(36).substring(7)
        };

        set((state) => ({
          logs: [...state.logs, newLog]
        }));

        return {
          time: cappedMinutes,
          exp: totalExp,
          items: [
            ...(stonesFound > 0 ? [{ id: 'spirit_stone', amount: stonesFound }] : []),
            ...items
          ]
        };
      },

      checkIn: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { lastActiveDate, streakDays, dailyEncyclopediaItems, unlockedTitles } = get();
        
        if (lastActiveDate !== today || !dailyEncyclopediaItems || dailyEncyclopediaItems.length === 0) {
          const yesterday = format(addMinutes(new Date(), -24 * 60), 'yyyy-MM-dd');
          
          let newStreak = 1;
          let pendingRescue = null;
          
          if (lastActiveDate === yesterday) {
            newStreak = streakDays + 1;
          } else if (lastActiveDate && lastActiveDate !== today) {
            // Missed a day
            if (streakDays > 1) {
              pendingRescue = streakDays;
            }
            newStreak = 1;
          }
          
          const newTitles = [...unlockedTitles];
          if (newStreak >= 30 && !newTitles.includes('持之以恒')) {
            newTitles.push('持之以恒');
          }

          // Generate 10 random encyclopedia items
          const newDailyItems: string[] = [];
          while (newDailyItems.length < 10) {
            const randomId = `encyclopedia_${Math.floor(Math.random() * 500) + 1}`;
            if (!newDailyItems.includes(randomId)) {
              newDailyItems.push(randomId);
            }
          }
          
          const newAge = (get().age || 16) + 1;
          const currentLevelIndex = get().levelIndex;
          let currentLifespan = 100;
          if (currentLevelIndex >= 9) currentLifespan = 200;
          if (currentLevelIndex >= 18) currentLifespan = 500;
          if (currentLevelIndex >= 27) currentLifespan = 1000;
          if (currentLevelIndex >= 36) currentLifespan = 2000;
          if (currentLevelIndex >= 45) currentLifespan = 5000;
          if (currentLevelIndex >= 54) currentLifespan = 10000;
          
          set({
            lastActiveDate: today,
            hasClaimedDailyReward: false,
            dailySalaryClaimed: false,
            streakDays: newStreak,
            pendingStreakRescue: pendingRescue,
            quests: generateDailyQuests(), // Reset quests for the new day
            sectMissions: generateSectMissions(currentLevelIndex),
            dailyEncyclopediaItems: newDailyItems,
            realmExplorationsToday: 0,
            lastRealmExplorationDate: today,
            unlockedTitles: newTitles,
            age: newAge,
            lifespan: currentLifespan,
            dailyLuck: Math.max(10, Math.min(100, get().baseLuck + Math.floor(Math.random() * 41) - 20)) // baseLuck +/- 20
          });
          
          // Check for death by old age
          if (newAge > currentLifespan) {
            get().resetCultivation();
            // We could add a specific death event here, but resetCultivation handles the reset.
          }
          
          get().generateFates();
        }
      },
      rescueStreak: (usePill: boolean) => {
        const state = get();
        if (!state.pendingStreakRescue) return false;
        
        if (usePill) {
          if ((state.materials['humai_pill'] || 0) > 0) {
            const newMaterials = { ...state.materials };
            newMaterials['humai_pill'] -= 1;
            if (newMaterials['humai_pill'] <= 0) delete newMaterials['humai_pill'];
            
            set({
              materials: newMaterials,
              streakDays: state.pendingStreakRescue + 1,
              pendingStreakRescue: null
            });
            return true;
          }
          return false;
        } else {
          set({ pendingStreakRescue: null });
          return true;
        }
      },
      updateQuestProgress: (type, amount) => {
        const safeAmount = isNaN(amount) ? 0 : amount;
        set((state) => ({
          quests: state.quests.map(q => {
            if (q.type === type && !q.completed) {
              const newProgress = Math.min(q.progress + safeAmount, q.target);
              return { ...q, progress: newProgress };
            }
            return q;
          })
        }));
      },
      claimQuestReward: (questId) => {
        set((state) => {
          const quest = state.quests.find(q => q.id === questId);
          if (quest && quest.progress >= quest.target && !quest.completed) {
            return {
              quests: state.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
              spiritStones: (state.spiritStones || 0) + quest.reward
            };
          }
          return state;
        });
      },
      claimSectMissionReward: (missionId) => {
        const state = get();
        const mission = state.sectMissions.find(m => m.id === missionId);
        if (!mission) return { success: false, message: '任务不存在' };
        if (mission.completed) return { success: false, message: '任务已完成' };
        if (state.levelIndex < mission.reqLevelIndex) return { success: false, message: '境界不足，无法完成此任务' };

        set({
          sectMissions: state.sectMissions.map(m => m.id === missionId ? { ...m, completed: true } : m),
          sectContribution: state.sectContribution + mission.rewardContribution,
          spiritStones: state.spiritStones + mission.rewardSpiritStones
        });
        return { success: true, message: `任务完成！获得 ${mission.rewardContribution} 贡献，${mission.rewardSpiritStones} 灵石` };
      },
      addSpiritStones: (amount) => set((state) => ({ spiritStones: Math.max(0, (state.spiritStones || 0) + amount) })),
      buyItem: (id, cost, isConsumable, effect) => {
        const state = get();
        if ((state.spiritStones || 0) >= cost) {
          if (id === 'heavenly_drop') {
            set({
              spiritStones: state.spiritStones - cost,
              heavenlyBottleDrops: state.heavenlyBottleDrops + effect
            });
            return true;
          }
          
          const shopItem = SHOP_ITEMS.find(i => i.id === id);
          if (shopItem?.type === 'breakthrough' || shopItem?.type === 'consumable' || shopItem?.type === 'material') {
            set({
              spiritStones: state.spiritStones - cost,
              materials: { ...state.materials, [id]: (state.materials[id] || 0) + 1 }
            });
            return true;
          }

          if (shopItem?.type === 'skill') {
            if (state.inventory.includes(id)) return false; // Already owned book
            if (state.skills.includes(id)) return false; // Already learned
            set({
              spiritStones: state.spiritStones - cost,
              inventory: [...state.inventory, id] // Store as book in inventory
            });
            return true;
          }

          if (state.inventory.includes(id)) return false; // Already owned
          set({ 
            spiritStones: state.spiritStones - cost,
            inventory: [...state.inventory, id]
          });
          return true;
        }
        return false;
      },
      sellItem: (id, type, amount, price) => {
        const state = get();
        if (type === 'material') {
          const currentAmount = state.materials[id] || 0;
          if (currentAmount >= amount) {
            set({
              materials: { ...state.materials, [id]: currentAmount - amount },
              spiritStones: (state.spiritStones || 0) + price * amount
            });
            return true;
          }
        } else if (type === 'inventory') {
          const count = state.inventory.filter(i => i === id).length;
          if (count >= amount) {
            const newInventory = [...state.inventory];
            for (let i = 0; i < amount; i++) {
              const index = newInventory.indexOf(id);
              if (index > -1) newInventory.splice(index, 1);
            }
            set({
              inventory: newInventory,
              spiritStones: (state.spiritStones || 0) + price * amount
            });
            return true;
          }
        }
        return false;
      },
      generateFates: () => {
        const fates: Fate[] = [
          { id: 'f1', type: 'fortune', title: '紫气东来', desc: '今日首次饮水获得双倍修为', effectType: 'first_drink_bonus', value: 2 },
          { id: 'f2', type: 'disaster', title: '丹毒入体', desc: '今日饮用奶茶修为减半', effectType: 'none', value: 0 },
          { id: 'f3', type: 'encounter', title: '秘境开启', desc: '今日探索秘境必定获得灵石', effectType: 'random_event', value: 1 },
          { id: 'f4', type: 'fortune', title: '灵光乍现', desc: '今日所有饮水修为+20%', effectType: 'cultivation_multiplier', value: 1.2 },
          { id: 'f5', type: 'disaster', title: '心魔滋生', desc: '今日未完成目标扣除50修为', effectType: 'none', value: 0 },
        ];
        // Pick 3 random fates
        const shuffled = fates.sort(() => 0.5 - Math.random());
        set({ dailyFates: shuffled.slice(0, 3), selectedFate: null });
      },
      setActiveGame: (gameId) => set({ activeGame: gameId }),
      selectFate: (fateId) => set((state) => ({
        selectedFate: state.dailyFates.find(f => f.id === fateId) || null
      })),
      openChest: () => {
        const state = get();
        if (state.chests <= 0) return null;
        
        set({ chests: state.chests - 1 });
        
        const rand = Math.random();
        if (rand < 0.3) {
          const amount = Math.floor(Math.random() * 50) + 10;
          get().addSpiritStones(amount);
          return { type: 'spiritStones', amount, name: `${amount} 灵石` };
        } else if (rand < 0.6) {
          const mats = ['common_herb', 'rare_herb', 'stone', 'profound_iron', 'monster_bone', 'monster_fur'];
          const mat = mats[Math.floor(Math.random() * mats.length)];
          const names: Record<string, string> = {
            'common_herb': '凝气草',
            'rare_herb': '洗髓草',
            'stone': '灵石矿',
            'profound_iron': '玄铁精',
            'monster_bone': '妖兽骨骼',
            'monster_fur': '妖兽皮毛'
          };
          get().addMaterial(mat, 1);
          return { type: 'material', name: names[mat] };
        } else if (rand < 0.8) {
          get().addHeavenlyBottleDrop(1);
          return { type: 'drop', name: '绿液滴' };
        } else if (rand < 0.9) {
          const rareMats = ['millennium_lingzhi', 'jiuzhuan_grass'];
          const mat = rareMats[Math.floor(Math.random() * rareMats.length)];
          const names: Record<string, string> = {
            'millennium_lingzhi': '千年灵芝',
            'jiuzhuan_grass': '九转玄草'
          };
          get().addMaterial(mat, 1);
          return { type: 'material', name: names[mat] };
        } else if (rand < 0.95) {
          const unlearnedSkills = ['skill_1', 'skill_2', 'skill_3', 'skill_4', 'skill_5'].filter(s => !state.skills.includes(s));
          if (unlearnedSkills.length > 0) {
            const randomSkill = unlearnedSkills[Math.floor(Math.random() * unlearnedSkills.length)];
            get().learnSkill(randomSkill);
            const skillName = GAME_SKILLS.find(s => s.id === randomSkill)?.name || '未知功法';
            return { type: 'skill', name: skillName };
          }
          get().addSpiritStones(100);
          return { type: 'spiritStones', amount: 100, name: `100 灵石` };
        } else {
          if (!state.artifacts.includes('julian_array')) {
            get().obtainArtifact('julian_array');
            return { type: 'artifact', name: '聚灵阵' };
          }
          get().addSpiritStones(200);
          return { type: 'spiritStones', amount: 200, name: `200 灵石` };
        }
      },
      addChest: (amount) => set((state) => ({ chests: state.chests + amount })),
      gatherMaterials: () => set((state) => {
        const rand = Math.random();
        const newMaterials = { ...state.materials };
        let msg = '';
        if (rand < 0.4) {
          newMaterials['common_herb'] = (newMaterials['common_herb'] || 0) + 1;
          msg = '采得一株凝气草';
        } else if (rand < 0.7) {
          newMaterials['stone'] = (newMaterials['stone'] || 0) + 1;
          msg = '挖到一块灵石矿';
        } else if (rand < 0.85) {
          newMaterials['profound_iron'] = (newMaterials['profound_iron'] || 0) + 1;
          msg = '捡到一块玄铁精';
        } else {
          newMaterials['rare_herb'] = (newMaterials['rare_herb'] || 0) + 1;
          msg = '偶得一株洗髓草';
        }
        return { materials: newMaterials };
      }),
      learnSkill: (id) => set((state) => {
        if (!state.skills.includes(id)) {
          return { skills: [...state.skills, id] };
        }
        return state;
      }),
      equipSkill: (id) => set((state) => {
        if (state.skills.includes(id) && !state.equippedSkills.includes(id) && state.equippedSkills.length < 3) {
          return { equippedSkills: [...state.equippedSkills, id] };
        }
        return state;
      }),
      unequipSkill: (id) => set((state) => ({
        equippedSkills: state.equippedSkills.filter(s => s !== id)
      })),
      obtainArtifact: (id) => set((state) => {
        if (!state.artifacts.includes(id)) {
          return { artifacts: [...state.artifacts, id] };
        }
        return state;
      }),
      equipArtifact: (id) => set((state) => {
        if (state.artifacts.includes(id) && !state.equippedArtifacts.includes(id) && state.equippedArtifacts.length < 1) {
          return { equippedArtifacts: [...state.equippedArtifacts, id] };
        }
        return state;
      }),
      unequipArtifact: (id) => set((state) => ({
        equippedArtifacts: state.equippedArtifacts.filter(a => a !== id)
      })),
      gainSkillProficiency: (id, amount) => set((state) => {
        const currentProficiency = state.skillProficiency[id] || 0;
        return {
          skillProficiency: {
            ...state.skillProficiency,
            [id]: Math.min(100, currentProficiency + amount)
          }
        };
      }),
      upgradeArtifact: (id) => set((state) => {
        const currentLevel = state.artifactLevels[id] || 1;
        if (currentLevel >= 5) return state; // Max level 5
        // Deduct spirit stones logic can be added here or handled in the UI component
        return {
          artifactLevels: {
            ...state.artifactLevels,
            [id]: currentLevel + 1
          }
        };
      }),
      useHeavenlyBottle: (action, targetId) => {
        const state = get();
        if (state.heavenlyBottleDrops <= 0) return false;
        
        if (action === 'accelerate') {
          const herb = targetId 
            ? state.cave.herbs.find(h => h.id === targetId)
            : state.cave.herbs.find(h => h.stage !== 'mature');
            
          if (herb && herb.stage !== 'mature') {
            set((state) => ({
              heavenlyBottleDrops: state.heavenlyBottleDrops - 1,
              cave: {
                ...state.cave,
                herbs: state.cave.herbs.map(h => h.id === herb.id ? { ...h, growth: h.maxGrowth || 1000, stage: 'mature' } : h)
              }
            }));
            return true;
          }
        } else if (action === 'duplicate') {
          const herb = targetId 
            ? state.cave.herbs.find(h => h.id === targetId)
            : state.cave.herbs[0];
            
          if (herb && state.cave.herbs.length < 4) {
            set((state) => ({
              heavenlyBottleDrops: state.heavenlyBottleDrops - 1,
              cave: {
                ...state.cave,
                herbs: [...state.cave.herbs, { ...herb, id: Date.now().toString() }]
              }
            }));
            return true;
          }
        }
        return false;
      },
      addHeavenlyBottleDrop: (amount) => set((state) => ({ heavenlyBottleDrops: state.heavenlyBottleDrops + amount })),
      advanceStory: () => set((state) => {
        if (state.storyNode >= 3) {
          return { storyChapter: state.storyChapter + 1, storyNode: 0 };
        }
        return { storyNode: state.storyNode + 1 };
      }),
      contributeToGlobalEvent: (amount) => set((state) => {
        if (!state.globalEvent || state.globalEvent.status !== 'active') return state;
        if (state.spiritStones < amount) return state;
        
        const newProgress = Math.min(state.globalEvent.target, state.globalEvent.progress + amount);
        const newStatus = newProgress >= state.globalEvent.target ? 'completed' : 'active';
        return {
          spiritStones: state.spiritStones - amount,
          globalEvent: {
            ...state.globalEvent,
            progress: newProgress,
            status: newStatus
          }
        };
      }),
      updateSectNpcs: () => set((state) => ({
        sectNpcs: state.sectNpcs.map(npc => {
          let growth = Math.floor(Math.random() * 50);
          if (npc.name === '韩立') {
            growth = Math.floor(Math.random() * 500) + 200; // 韩老魔修炼极快
          } else if (['南宫婉', '紫灵', '银月', '元瑶', '董萱儿', '陈巧倩', '李化元', '红拂', '穹老怪', '向之礼'].includes(npc.name)) {
            growth = Math.floor(Math.random() * 200) + 100;
          } else if (npc.name === '厉飞雨') {
            growth = Math.floor(Math.random() * 10); // 凡人修炼慢
          }
          
          const newCultivation = npc.cultivation + growth;
          
          let newLevel = npc.level;
          for (let i = CULTIVATION_LEVELS.length - 1; i >= 0; i--) {
            if (newCultivation >= CULTIVATION_LEVELS[i].min) {
              newLevel = CULTIVATION_LEVELS[i].name;
              break;
            }
          }

          return {
            ...npc,
            cultivation: newCultivation,
            level: newLevel
          };
        })
      })),

      selectCharacter: (characterId, customData) => {
        const preset = PRESET_CHARACTERS.find(c => c.id === characterId);
        if (preset) {
          set({
            characterId,
            characterPreset: preset,
            playerName: preset.name,
            spiritualRoot: preset.spiritualRoot,
            spiritStones: preset.initialSpiritStones,
            inventory: preset.initialArtifacts,
            isFirstTime: false
          });
        } else if (characterId === 'custom') {
          set({
            characterId: 'custom',
            characterPreset: {
              name: customData.name,
              background: '一介散修，独自踏上寻仙之路。',
              talent: '自由自在：探索秘境收益提升10%。',
              growthPath: '散修流：自由探索，机缘随机。'
            },
            playerName: customData.name,
            spiritualRoot: customData.spiritualRoot || 'mixed',
            isFirstTime: false
          });
        }
      },

      die: (reason) => {
        set({ isDead: true, deathReason: reason });
      },

      rebirth: (newTalent) => {
        const state = get();
        set({
          ...initialState,
          playerName: state.playerName,
          characterId: state.characterId,
          characterPreset: state.characterPreset,
          rebirthCount: state.rebirthCount + 1,
          isDead: false,
          deathReason: null,
          // Keep some progress or give bonus
          bonusPoints: state.bonusPoints + 100,
          spiritualRoot: newTalent || state.spiritualRoot
        });
      },

      completeStoryNode: (nodeId) => {
        const state = get();
        set({
          storyProgress: { ...state.storyProgress, [nodeId]: true },
          storyNode: state.storyNode + 1
        });
      },

      consultHeavens: async (query) => {
        // This will be implemented in the component using the Gemini API
        return "天机不可泄露...";
      },

      addPlan: (plan) =>
        set((state) => ({
          plans: [...state.plans, { ...plan, id: Date.now().toString() }],
        })),
      updatePlan: (id, plan) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)),
        })),
      deletePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        })),
      togglePlan: (id) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        })),
      addLog: (amount, type = 'water') => {
        const state = get();
        const multipliers = state.settings.drinkMultipliers || { water: 1, tea: 0.9, coffee: 0.8, milktea: 0.5 };
        let finalAmount = (isNaN(amount) ? 0 : amount) * (multipliers[type] ?? 1);
        
        // Region Multiplier
        const regionInfo = REGIONS.find(r => r.id === state.currentRegion);
        if (regionInfo) {
          finalAmount *= regionInfo.multiplier;
        }

        // Sect Bonuses
        if (state.sect && state.sectStatus === 'joined') {
          const sectInfo = SECTS.find(s => s.id === state.sect);
          if (sectInfo) {
            if (sectInfo.bonusType === 'flat_cultivation') {
              finalAmount += sectInfo.bonusValue;
            } else if (sectInfo.bonusType === 'morning_double') {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 9) {
                finalAmount *= sectInfo.bonusValue;
              }
            } else if (sectInfo.bonusType === 'alchemy_exp') {
              set({ alchemyLevel: state.alchemyLevel + 0.05 });
            }
          }
        }
        
        if (state.isFirstTime && !state.hasDoneFirstDrink) {
          set({ hasDoneFirstDrink: true, bonusPoints: state.bonusPoints + 50 });
          // Will trigger breakthrough in Home.tsx
        }

        set((state) => {
          const newLogs = [...state.logs, { id: Date.now().toString(), timestamp: Date.now(), amount: finalAmount, type }];
          const totalAmount = newLogs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0);
          const newTitles = [...state.unlockedTitles];
          if (totalAmount >= 100000 && !newTitles.includes('海量真仙')) {
            newTitles.push('海量真仙');
          }
          
          // Random chest drop (20% chance)
          let newChests = state.chests;
          if (Math.random() < 0.2) {
            newChests += 1;
          }

          return {
            logs: newLogs,
            unlockedTitles: newTitles,
            chests: newChests
          };
        });
        get().updateQuestProgress('drink', 1); // Quest is now "Drink 3 times"
        get().waterHerbs(amount);
        if (state.spiritualRoot !== 'none') {
          get().washMarrow(amount); // Try to wash marrow if they have a root
        }
        return finalAmount;
      },
      removeLog: (timestamp) =>
        set((state) => ({
          logs: state.logs.filter((l) => l.timestamp !== timestamp),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setHealthData: (steps, temp) => {
        set(() => ({
          todaySteps: steps,
          todayTemperature: temp,
        }));
        get().updateQuestProgress('step', steps);
      },
      getNextReminder: () => {
        const { plans, logs } = get();
        const activePlans = plans.filter((p) => p.active);
        if (activePlans.length === 0) return null;

        const now = new Date();
        const today = startOfDay(now);
        
        // Find the most recent log today
        const todaysLogs = logs.filter(l => l.timestamp >= today.getTime());
        const lastLogTime = todaysLogs.length > 0 
          ? Math.max(...todaysLogs.map(l => l.timestamp))
          : null;

        let earliestNextReminder: number | null = null;

        for (const plan of activePlans) {
          const start = parse(plan.startTime, 'HH:mm', today);
          const end = parse(plan.endTime, 'HH:mm', today);

          let nextTime = start.getTime();

          if (lastLogTime && lastLogTime >= start.getTime() && lastLogTime <= end.getTime()) {
            // Calculate next reminder based on last log time (Dynamic delay logic)
            nextTime = lastLogTime + plan.intervalMinutes * 60 * 1000;
            
            // If the calculated nextTime is in the past, find the next interval from now
            if (nextTime <= now.getTime()) {
               const elapsedFromLast = now.getTime() - lastLogTime;
               const intervalsPassed = Math.floor(elapsedFromLast / (plan.intervalMinutes * 60 * 1000));
               nextTime = lastLogTime + (intervalsPassed + 1) * plan.intervalMinutes * 60 * 1000;
            }
          } else if (now.getTime() > start.getTime()) {
            // Find the next interval after 'now' if no log today
            const elapsed = now.getTime() - start.getTime();
            const intervalsPassed = Math.floor(elapsed / (plan.intervalMinutes * 60 * 1000));
            nextTime = start.getTime() + (intervalsPassed + 1) * plan.intervalMinutes * 60 * 1000;
          }

          // Ensure nextTime is within plan bounds and in the future
          if (nextTime <= end.getTime() && nextTime > now.getTime()) {
            if (earliestNextReminder === null || nextTime < earliestNextReminder) {
              earliestNextReminder = nextTime;
            }
          } else if (now.getTime() > end.getTime()) {
             // Plan is over for today, check tomorrow
             const tomorrowStart = addMinutes(start, 24 * 60).getTime();
             if (earliestNextReminder === null || tomorrowStart < earliestNextReminder) {
               earliestNextReminder = tomorrowStart;
             }
          } else if (nextTime < now.getTime()) {
             // Should not happen with the logic above, but fallback
             nextTime = now.getTime() + plan.intervalMinutes * 60 * 1000;
             if (nextTime <= end.getTime() && (earliestNextReminder === null || nextTime < earliestNextReminder)) {
                earliestNextReminder = nextTime;
             }
          }
        }

        return earliestNextReminder;
      },
    }),
    {
      name: 'flowwater-storage',
    }
  )
);
