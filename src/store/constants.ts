export const REGIONS = [
  { id: '凡人界', name: '凡人界', minLevel: 0, description: '凡人居住之地，灵气稀薄。修仙界三大修仙地（天南、乱星海、大晋）的根基所在。', cost: 0, multiplier: 1.0 },
  { id: '天南', name: '天南', minLevel: 2000, description: '修仙界偏僻之地，资源匮乏，七派会武发源地。黄枫谷、巨剑门等小宗门林立。', cost: 100, multiplier: 1.2 },
  { id: '乱星海', name: '乱星海', minLevel: 10000, description: '海外修仙界，万岛林立，妖兽众多。修仙资源丰富，需通过古传送阵前往。', cost: 1000, multiplier: 1.5 },
  { id: '大晋', name: '大晋', minLevel: 50000, description: '人界第一大修仙国度，人才辈出，资源最丰。星宫、化神老怪云集。', cost: 5000, multiplier: 2.0 },
  { id: '阴冥之地', name: '阴冥之地', minLevel: 80000, description: '阴气极重之地，鬼修横行，魂兽出没。', cost: 10000, multiplier: 2.2 },
  { id: '魔界', name: '魔界', minLevel: 200000, description: '上古魔渊裂缝降临之地，古魔横行。人界与魔界的争夺战场。', cost: 50000, multiplier: 2.8 },
  { id: '灵界', name: '灵界', minLevel: 700000, description: '飞升者所至，灵气如海，强者如云。风元大陆、雷鸣大陆、霸熊岭等各方大陆。', cost: 100000, multiplier: 4.0 },
  { id: '仙界', name: '仙界', minLevel: 50000000, description: '凡人修仙的终极归宿，仙人居所，万千仙宫漂浮云海之上。', cost: 1000000, multiplier: 10.0 },
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
  { id: 'dongxuaner', name: '董萱儿', sect: '黄枫谷', reqLevel: '炼气十层', effect: 1.1, desc: '红拂仙子之徒，修炼化春诀。', strategy: '需同属黄枫谷且在门派大比中展露头角(胜场≥5)。' },
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
  { id: 'huangfeng', name: '黄枫谷', desc: '擅长炼丹，每次饮水额外获得1点炼丹经验', bonusType: 'alchemy_exp', bonusValue: 1 },
  { id: 'yanyue', name: '掩月宗', desc: '双修大宗，道侣互动效果提升50%', bonusType: 'companion_bonus', bonusValue: 1.5 },
  { id: 'lingshou', name: '灵兽山', desc: '御兽宗门，秘境探索获得材料概率提升20%', bonusType: 'explore_material', bonusValue: 1.2 },
  { id: 'qingxu', name: '清虚门', desc: '道家正统，早晨(5点-9点)饮水修为翻倍', bonusType: 'morning_double', bonusValue: 2 },
  { id: 'huadao', name: '化刀坞', desc: '刀修门派，突破成功率额外提升5%', bonusType: 'breakthrough_rate', bonusValue: 0.05 },
  { id: 'tianque', name: '天阙堡', desc: '擅长阵法，聚灵阵效果提升30%', bonusType: 'formation_bonus', bonusValue: 1.3 },
  { id: 'jujian', name: '巨剑门', desc: '剑修门派，每次饮水固定额外增加5点修为', bonusType: 'flat_cultivation', bonusValue: 5 },
];

export const BOTTLE_LEVELS = [
  { level: 1, name: '残缺小瓶', maxLiquid: 10, multiplier: 0.05, upgradeAt: 0, desc: '瓶身残缺，绿液稀少' },
  { level: 2, name: '掌天瓶', maxLiquid: 30, multiplier: 0.08, upgradeAt: 50, desc: '瓶身完整，可凝聚绿液' },
  { level: 3, name: '掌天瓶·觉醒', maxLiquid: 60, multiplier: 0.12, upgradeAt: 200, desc: '瓶灵觉醒，绿液充沛' },
  { level: 4, name: '玄天掌天瓶', maxLiquid: 120, multiplier: 0.18, upgradeAt: 500, desc: '玄天之宝，夺天地造化' },
  { level: 5, name: '玄天仙瓶', maxLiquid: 250, multiplier: 0.25, upgradeAt: 1200, desc: '仙家至宝，逆转乾坤' },
];

export const LIFEBOUND_ARTIFACTS = [
  { id: 'bamboo_sword', name: '青竹蜂云剑', effect: 1.25, effectType: 'cultivation', unlockLevel: 14, desc: '韩立的本命飞剑，以青竹蜂云剑诀驱动，饮水修为 +25%' },
  { id: 'blood_armor', name: '血魔甲', effect: 15, effectType: 'breakthrough', unlockLevel: 15, desc: '魔道至宝，以精血祭炼，突破成功率 +15%' },
  { id: 'void_cauldron', name: '虚天鼎', effect: 1.40, effectType: 'explore', unlockLevel: 18, desc: '上古通天灵宝，秘境探索收益 +40%' },
  { id: 'wind_thunder_wings', name: '风雷翅', effect: 20, effectType: 'flat_bonus', unlockLevel: 22, desc: '风雷双属性翅膀法宝，每次饮水额外 +20 修为' },
];

export const BEETLE_STAGES = [
  { stage: 1, name: '幼虫', minCount: 0, effect: '每次饮水 +1 修为/只', desc: '初生的噬金虫，以灵气为食' },
  { stage: 2, name: '成虫', minCount: 50, effect: '秘境探索 +10% 收益', desc: '成熟体的噬金虫，刀枪不入' },
  { stage: 3, name: '虫王', minCount: 200, effect: '每日自动吞噬一次负面天命', desc: '虫群之王，可吞噬万物' },
  { stage: 4, name: '噬金虫王', minCount: 1000, effect: '突破天劫时自动抵消一道雷劫', desc: '传说中的噬金虫王，连天劫亦可吞噬' },
];

export const TRIBULATION_TYPES = {
  three_nine: { name: '三九天劫', strikes: 27, baseSurvival: 0.60, requiredBreakthrough: '结丹初期' },
  six_nine: { name: '六九天劫', strikes: 54, baseSurvival: 0.40, requiredBreakthrough: '元婴初期' },
  nine_nine: { name: '九九天劫', strikes: 81, baseSurvival: 0.20, requiredBreakthrough: '化神初期' },
};

export const DUNGEONS = [
  { id: 'blood_forbidden', name: '血色禁地', minLevel: 14, floors: 10, desc: '筑基期试炼之地，血色弥漫，危机四伏', rewards: { stones: [10, 50], materials: ['common_herb', 'rare_herb', 'pill_foundation'] }, boss: '血魔', bossPower: 150 },
  { id: 'void_hall', name: '虚天殿', minLevel: 18, floors: 15, desc: '上古通天灵宝遗留之地，殿内禁制重重', rewards: { stones: [30, 150], materials: ['rare_herb', 'millennium_lingzhi', 'pill_golden_core'] }, boss: '虚天殿灵', bossPower: 400 },
  { id: 'demon_valley', name: '坠魔谷', minLevel: 22, floors: 20, desc: '上古战场遗址，魔气浓郁，元婴修士亦难全身而退', rewards: { stones: [80, 400], materials: ['millennium_lingzhi', 'jiuzhuan_grass', 'pill_nascent_soul'] }, boss: '古魔残魂', bossPower: 1000 },
  { id: 'kunwu_mountain', name: '昆吾山', minLevel: 26, floors: 30, desc: '上古仙山，传说有玄天之宝镇压于此', rewards: { stones: [200, 1000], materials: ['jiuzhuan_grass', 'millennium_lingzhi', 'heavenly_drop'] }, boss: '昆吾山神', bossPower: 3000 },
];

export const SPIRIT_CONTINENTS = [
  { id: 'fengyuan', name: '风元大陆', unlockProgress: 0, desc: '灵界最大陆地，人族聚居之地，灵气浓郁无比', multiplier: 4.0, treasures: ['void_cauldron_true', 'bamboo_sword_set'] },
  { id: 'leiming', name: '雷鸣大陆', unlockProgress: 30, desc: '雷电交织之地，雷霆灵气磅礴，雷属性修士圣地', multiplier: 5.0, treasures: ['heavenly_bottle_true'] },
  { id: 'baxiong', name: '霸熊岭', unlockProgress: 50, desc: '妖族圣地，霸熊一族盘踞之处，妖兽横行', multiplier: 5.5, treasures: [] },
  { id: 'lieyang', name: '烈阳岛', unlockProgress: 65, desc: '海外火属性灵脉之地，岛上烈火常燃，火灵根修士绝佳之所', multiplier: 6.0, treasures: [] },
  { id: 'xutian', name: '虚天殿', unlockProgress: 80, desc: '上古通天灵宝降临之地，每万年一现，无数玄天之宝沉眠', multiplier: 7.0, treasures: ['five_element_mountain'] },
  { id: 'changsheng', name: '长生界', unlockProgress: 95, desc: '灵界至高之地，渡过大乘劫者方可一窥仙路', multiplier: 8.0, treasures: [] },
];

export const HEAVENLY_TREASURES = [
  { id: 'void_cauldron_true', name: '虚天鼎·真', desc: '玄天之宝，可镇压万物', bonus: 4.0, continent: 'fengyuan' },
  { id: 'bamboo_sword_set', name: '青竹蜂云剑·七十二口', desc: '韩立的本命法宝完整版', bonus: 3.5, continent: 'fengyuan' },
  { id: 'five_element_mountain', name: '元合五极山', desc: '五行合一，可镇压界面', bonus: 5.0, continent: 'leiming' },
  { id: 'heavenly_bottle_true', name: '掌天瓶·玄天', desc: '仙界遗宝，夺天地造化', bonus: 6.0, continent: 'leiming' },
];

export const SECT_WAR_REWARDS = [
  { rank: 1, stones: 5000, desc: '霸者之证', bonus: '全宗弟子饮水修为 +50%，持续一周' },
  { rank: 2, stones: 3000, desc: '强者之名', bonus: '全宗弟子饮水修为 +30%，持续一周' },
  { rank: 3, stones: 1500, desc: '勇士之荣', bonus: '全宗弟子饮水修为 +15%，持续一周' },
];

export const DIVINE_SENSE_LEVELS = [
  { level: 1, name: '神识初开', maxSplit: 1, effect: '专注饮水，修为 +10%', upgradeExp: 0, bonus: 1.1 },
  { level: 2, name: '一心二用', maxSplit: 2, effect: '饮水时可同时修炼神识', upgradeExp: 100, bonus: 1.2 },
  { level: 3, name: '神识化形', maxSplit: 3, effect: '突破成功率 +5%', upgradeExp: 300, bonus: 1.3 },
  { level: 4, name: '分魂大法', maxSplit: 5, effect: '可并行探索秘境 + 修炼', upgradeExp: 800, bonus: 1.5 },
  { level: 5, name: '神识如剑', maxSplit: 7, effect: '剑阵威力翻倍', upgradeExp: 2000, bonus: 1.8 },
  { level: 6, name: '大衍诀·大成', maxSplit: 10, effect: '天劫存活率 +15%', upgradeExp: 5000, bonus: 2.0 },
  { level: 7, name: '神识通玄', maxSplit: 20, effect: '可感知方圆千里一切动向', upgradeExp: 15000, bonus: 3.0 },
];

export const SWORD_FORMATIONS = [
  { id: 'swarm', name: '蜂群式', minSwords: 12, effect: '攻击 +30%，噬金虫数量翻倍', unlockLevel: 1 },
  { id: 'dragon', name: '游龙式', minSwords: 24, effect: '突破大境界时可抵消一道天劫', unlockLevel: 2 },
  { id: 'net', name: '天罗地网式', minSwords: 48, effect: '秘境探索必定获得双倍物品', unlockLevel: 3 },
  { id: 'storm', name: '剑雨风暴', minSwords: 72, effect: '天劫存活率 +25%，饮水修为翻倍', unlockLevel: 5 },
];

export const SPIRIT_BEASTS = [
  { id: 'blood_jade_spider', name: '血玉蜘蛛', type: '虫', desc: '韩立在血色禁地收服，可吐出血玉蛛丝', maxStage: 4, unlockLevel: 10, stages: [
    { stage: 1, name: '幼蛛', effect: '秘境探索 +5% 物品收益', evolveAt: 500 },
    { stage: 2, name: '成年蛛', effect: '自动收集灵草（每日 1-2 株）', evolveAt: 2000 },
    { stage: 3, name: '蛛王', effect: '可吐丝困住妖兽（副本 BOSS 战 +15% 胜率）', evolveAt: 8000 },
    { stage: 4, name: '血玉蛛皇', effect: '秘境中免疫陷阱伤害', evolveAt: 30000 },
  ]},
  { id: 'wailing_beast', name: '啼魂兽', type: '魂', desc: '上古魂兽，可吞噬魂魄壮大自身', maxStage: 4, unlockLevel: 18, stages: [
    { stage: 1, name: '幼魂', effect: '天劫中额外 +5% 存活率', evolveAt: 1000 },
    { stage: 2, name: '魂体', effect: '每日自动吞噬一次负面天命', evolveAt: 4000 },
    { stage: 3, name: '魂兽', effect: '突破失败时修为损失减半', evolveAt: 15000 },
    { stage: 4, name: '啼魂真身', effect: '天劫自动抵消 2 道雷劫', evolveAt: 50000 },
  ]},
  { id: 'six_wing_centipede', name: '六翼霜蚣', type: '虫', desc: '上古奇虫，六翼展开遮天蔽日', maxStage: 4, unlockLevel: 26, stages: [
    { stage: 1, name: '幼虫', effect: '冰寒灵气：饮水修为 +15%', evolveAt: 3000 },
    { stage: 2, name: '成虫', effect: '飞行：秘境探索不受地形限制 +20% 收益', evolveAt: 12000 },
    { stage: 3, name: '霜蚣王', effect: '寒气领域：每日首次饮水修为 ×3', evolveAt: 40000 },
    { stage: 4, name: '六翼冰皇', effect: '冻结天劫：天劫中每道雷可冻结一次（50%概率）', evolveAt: 100000 },
  ]},
];

export const DEMON_INVASION_PHASES = {
  warning: { name: '魔气涌动', desc: '各地出现魔气裂缝，古魔即将降临...', duration: 60 * 60 * 1000 },
  invasion: { name: '古魔降临', desc: '古魔通过裂缝降临！全界修士紧急集合！', duration: 2 * 60 * 60 * 1000 },
  defense: { name: '界面之战', desc: '人族与古魔的决战已经开始！', duration: 4 * 60 * 60 * 1000 },
};

export const SHOP_ITEMS = [
  // 通用
  { id: 'humai_pill', name: '护脉丹', type: 'consumable', effect: 0, cost: 300, desc: '护住心脉，可用于挽救断掉的连续签到', region: 'all' },

  // 凡人界
  { id: 'pill_1', name: '黄龙丹', type: 'consumable', effect: 500, cost: 50, desc: '低阶丹药，服用可增加 500 修为', region: '凡人界' },
  { id: 'common_herb', name: '普通灵草', type: 'material', effect: 0, cost: 20, desc: '常见的灵草，可用于炼制基础丹药', region: '凡人界' },
  { id: 'book_1', name: '太上感应篇', type: 'passive', effect: 1.2, cost: 800, desc: '道家经典，永久提升 20% 饮水修为获取', region: '凡人界' },

  // 天南
  { id: 'pill_foundation', name: '筑基丹', type: 'breakthrough', effect: 0, cost: 500, desc: '突破筑基期必备丹药', region: '天南' },
  { id: 'rare_herb', name: '珍稀灵草', type: 'material', effect: 0, cost: 100, desc: '罕见的灵草，蕴含充沛灵气', region: '天南' },
  { id: 'skill_1', name: '青元剑诀', type: 'skill', effect: 1.2, cost: 2000, desc: '剑修功法，饮水修为 +20%', region: '天南' },
  { id: 'book_2', name: '黄帝内经', type: 'passive', effect: 1.05, cost: 1500, desc: '上古医书，永久提升 5% 饮水修为获取', region: '天南' },

  // 乱星海
  { id: 'pill_golden_core', name: '降尘丹', type: 'breakthrough', effect: 0, cost: 2000, desc: '突破结丹期必备丹药', region: '乱星海' },
  { id: 'millennium_lingzhi', name: '千年灵芝', type: 'material', effect: 0, cost: 500, desc: '极其罕见的天材地宝', region: '乱星海' },
  { id: 'skill_2', name: '玄阴诀', type: 'skill', effect: 1.3, cost: 5000, desc: '魔修功法，饮水修为 +30%，但突破成功率 -10%', region: '乱星海' },
  { id: 'artifact_2', name: '八卦镜', type: 'passive', effect: 1.5, cost: 1200, desc: '道家法宝，永久提升 50% 饮水修为获取', region: '乱星海' },

  // 阴冥之地
  { id: 'pill_nascent_soul', name: '定灵丹', type: 'breakthrough', effect: 0, cost: 8000, desc: '突破元婴期必备丹药', region: '阴冥之地' },
  { id: 'jiuzhuan_grass', name: '九转玄草', type: 'material', effect: 0, cost: 1000, desc: '传说中的仙草，可生死人肉白骨', region: '阴冥之地' },
  { id: 'skill_3', name: '五行诀', type: 'skill', effect: 1.1, cost: 8000, desc: '平衡功法，饮水修为 +10%，突破成功率 +10%', region: '阴冥之地' },
  { id: 'skill_4', name: '长生诀', type: 'skill', effect: 1.05, cost: 10000, desc: '养生功法，饮水修为 +5%，每次突破额外增加 50 年寿元', region: '阴冥之地' },

  // 灵界
  { id: 'heavenly_drop', name: '掌天瓶绿液', type: 'consumable', effect: 1, cost: 10000, desc: '夺天地造化之液，可用于催熟或复制灵草', region: '灵界' },
  { id: 'skill_5', name: '天雷双剑', type: 'skill', effect: 1.4, cost: 20000, desc: '霸道剑法，饮水修为 +40%，但突破成功率 -20%', region: '灵界' },
  { id: 'artifact_1', name: '掌天瓶(伪)', type: 'passive', effect: 2.0, cost: 30000, desc: '玄天之宝仿制品，永久双倍饮水修为', region: '灵界' },

  // 魔渊
  { id: 'demon_crystal', name: '魔晶', type: 'material', effect: 0, cost: 0, desc: '魔修死后凝结的魔气结晶，可炼制魔功，亦可炼丹（不可买卖）', region: '魔渊' },
  { id: 'demon_skill_page', name: '魔功残页', type: 'material', effect: 0, cost: 0, desc: '《血魂炼魂经》残页，集齐 5 页可参悟魔功（不可买卖）', region: '魔渊' },
];

export const GAME_SKILLS = [
  { id: 'skill_1', name: '青元剑诀', type: 'sword', effect: 1.2, desc: '剑修功法，饮水修为 +20%' },
  { id: 'skill_2', name: '玄阴诀', type: 'demon', effect: 1.3, desc: '魔修功法，饮水修为 +30%，但突破成功率 -10%' },
  { id: 'skill_3', name: '五行诀', type: 'balance', effect: 1.1, desc: '平衡功法，饮水修为 +10%，突破成功率 +10%' },
  { id: 'skill_4', name: '长生诀', type: 'life', effect: 1.05, desc: '养生功法，饮水修为 +5%，每次突破额外增加 50 年寿元' },
  { id: 'skill_5', name: '天雷双剑', type: 'sword', effect: 1.4, desc: '霸道剑法，饮水修为 +40%，但突破成功率 -20%' },
  { id: 'skill_demon_blood', name: '血魂炼魂经', type: 'demon', effect: 1.5, desc: '魔渊残页所悟魔功，饮水修为 +50%，但寿元每月 -1 年（不可与正道功法同修）' },
];
