const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// Helper to replace an array in the file
function replaceArray(arrayName, newContent) {
  const regex = new RegExp(`export const ${arrayName}(?:\\s*:\\s*[a-zA-Z\\[\\]]+)?\\s*=\\s*\\[[\\s\\S]*?\\];`);
  if (regex.test(content)) {
    content = content.replace(regex, `export const ${arrayName} = [\n${newContent}\n];`);
    console.log(`Replaced ${arrayName}`);
  } else {
    console.log(`Could not find ${arrayName}`);
  }
}

const newSects = `
  // 凡人界
  { id: 'qixuan', name: '七玄门', desc: '凡俗武林大派，每日步数修为提升20%', bonusType: 'step_cultivation', bonusValue: 1.2 },
  { id: 'siping', name: '四平帮', desc: '凡俗帮派，每日俸禄增加20%', bonusType: 'daily_salary', bonusValue: 1.2 },
  { id: 'yelang', name: '野狼帮', desc: '凶悍帮派，战斗胜率提升5%', bonusType: 'combat_win_rate', bonusValue: 0.05 },
  { id: 'jingjiao', name: '惊蛟会', desc: '墨大夫创立，毒术暗器防不胜防', bonusType: 'combat_win_rate', bonusValue: 0.05 },
  // 天南
  { id: 'huangfeng', name: '黄枫谷', desc: '擅长炼丹，每次饮水额外获得1点炼丹经验', bonusType: 'alchemy_exp', bonusValue: 1 },
  { id: 'yanyue', name: '掩月宗', desc: '双修大宗，道侣互动效果提升50%', bonusType: 'companion_bonus', bonusValue: 1.5 },
  { id: 'lingshou', name: '灵兽山', desc: '御兽宗门，秘境探索获得材料概率提升20%', bonusType: 'explore_material', bonusValue: 1.2 },
  { id: 'qingxu', name: '清虚门', desc: '道家正统，早晨饮水修为翻倍', bonusType: 'morning_double', bonusValue: 2 },
  { id: 'huadao', name: '化刀坞', desc: '刀修门派，突破成功率额外提升5%', bonusType: 'breakthrough_rate', bonusValue: 0.05 },
  { id: 'tianque', name: '天阙堡', desc: '擅长阵法，聚灵阵效果提升30%', bonusType: 'formation_bonus', bonusValue: 1.3 },
  { id: 'jujian', name: '巨剑门', desc: '剑修门派，每次饮水固定额外增加5点修为', bonusType: 'flat_cultivation', bonusValue: 5 },
  { id: 'guiling', name: '鬼灵门', desc: '魔道六宗之一，擅长驱鬼，战斗胜率提升15%', bonusType: 'combat_win_rate', bonusValue: 0.15 },
  { id: 'hehuan', name: '合欢宗', desc: '魔道第一大宗，双修收益提升100%', bonusType: 'companion_bonus', bonusValue: 2.0 },
  { id: 'yuling', name: '御灵宗', desc: '魔道六宗之一，灵兽培养速度提升30%', bonusType: 'pet_growth', bonusValue: 1.3 },
  { id: 'moyan', name: '魔焰门', desc: '魔道六宗之一，擅长魔火，炼器成功率提升15%', bonusType: 'crafting_rate', bonusValue: 0.15 },
  { id: 'tiansha', name: '天煞宗', desc: '魔道六宗之一，煞气极重，战斗胜率提升10%', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  { id: 'qianhuan', name: '千幻宗', desc: '魔道六宗之一，擅长幻术，探索秘境免伤概率提升', bonusType: 'explore_material', bonusValue: 1.1 },
  { id: 'taizhen', name: '太真门', desc: '正道盟首领，突破心魔概率降低10%', bonusType: 'reduce_demon_heart', bonusValue: 0.1 },
  { id: 'haoran', name: '浩然阁', desc: '正道大宗，浩然正气，每日俸禄增加30%', bonusType: 'daily_salary', bonusValue: 1.3 },
  { id: 'luoyun', name: '落云宗', desc: '擅长灵药培育，每日灵草生长速度提升20%', bonusType: 'herb_growth', bonusValue: 1.2 },
  { id: 'baiqiao', name: '百巧院', desc: '擅长炼器，炼制法宝成功率提升10%', bonusType: 'crafting_rate', bonusValue: 0.1 },
  { id: 'gujian', name: '古剑门', desc: '上古剑修传承，大比胜率提升10%', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  // 乱星海
  { id: 'xinggong', name: '星宫', desc: '乱星海霸主，每日俸禄增加50%', bonusType: 'daily_salary', bonusValue: 1.5 },
  { id: 'nixing', name: '逆星盟', desc: '反抗星宫的联盟，击败敌人获得战利品增加20%', bonusType: 'loot_bonus', bonusValue: 1.2 },
  { id: 'miaoyin', name: '妙音门', desc: '擅长音律与双修，结识道侣概率提升', bonusType: 'companion_chance', bonusValue: 1.5 },
  { id: 'jiyin', name: '极阴岛', desc: '魔道宗门，修炼魔功速度提升20%', bonusType: 'demon_skill_exp', bonusValue: 1.2 },
  { id: 'xingchen', name: '星辰阁', desc: '乱星海商盟，购买物品价格降低10%', bonusType: 'shop_discount', bonusValue: 0.9 },
  { id: 'kuixing', name: '魁星岛', desc: '乱星海外岛，海产丰富，水属性功法修炼提升', bonusType: 'water_skill_exp', bonusValue: 1.2 },
  { id: 'qingyang', name: '青阳门', desc: '魔道宗门，青阳魔火威力巨大', bonusType: 'combat_win_rate', bonusValue: 0.1 },
  { id: 'liulian', name: '六连殿', desc: '乱星海商会联盟，交易收益提升15%', bonusType: 'shop_discount', bonusValue: 0.85 },
  // 大晋
  { id: 'yinluo', name: '阴罗宗', desc: '大晋魔道十宗之一，击败敌人可吸取少量修为', bonusType: 'lifesteal_cultivation', bonusValue: 10 },
  { id: 'taiyi', name: '太一门', desc: '大晋正道大宗，突破心魔概率降低20%', bonusType: 'reduce_demon_heart', bonusValue: 0.2 },
  { id: 'xiaoji', name: '小极宫', desc: '北夜小极宫，冰属性功法修炼速度提升30%', bonusType: 'ice_skill_exp', bonusValue: 1.3 },
  { id: 'wanyao', name: '万妖谷', desc: '妖修圣地，妖兽材料掉落率提升30%', bonusType: 'monster_material_drop', bonusValue: 1.3 },
  { id: 'tianmo', name: '天魔宗', desc: '大晋魔道第一宗，呼老魔坐镇', bonusType: 'demon_skill_exp', bonusValue: 1.5 },
  { id: 'huaxian', name: '化仙宗', desc: '大晋神秘宗门，擅长符箓，制符成功率提升20%', bonusType: 'crafting_rate', bonusValue: 0.2 },
  { id: 'jingang', name: '金刚宗', desc: '佛宗门派，肉身强悍，免伤提升', bonusType: 'body_cultivation', bonusValue: 1.2 },
  { id: 'shuiying', name: '水影宗', desc: '大晋宗门，水属性功法修炼提升', bonusType: 'water_skill_exp', bonusValue: 1.2 },
  // 灵界
  { id: 'tianyuan', name: '天渊城', desc: '人妖两族圣地，所有基础收益提升10%', bonusType: 'all_stats_bonus', bonusValue: 1.1 },
  { id: 'longjia', name: '真龙世家', desc: '身负真龙血脉，肉身强悍，突破失败不掉落修为', bonusType: 'safe_breakthrough', bonusValue: 1 },
  { id: 'feiling', name: '飞灵族', desc: '灵界大族，身负真灵血脉，风属性功法修炼提升', bonusType: 'wind_skill_exp', bonusValue: 1.3 },
  { id: 'jiaochi', name: '角蚩族', desc: '灵界超级大族，底蕴深厚，宗门威望获取提升', bonusType: 'prestige_bonus', bonusValue: 1.5 },
  { id: 'tianpeng', name: '天鹏族', desc: '飞灵族分支，速度极快，探索秘境消耗减少', bonusType: 'explore_cost', bonusValue: 0.8 },
  { id: 'yecha', name: '夜叉族', desc: '灵界大族，擅长暗杀，战斗暴击率提升', bonusType: 'combat_crit', bonusValue: 1.2 },
  { id: 'muzu', name: '木族', desc: '灵界大族，木属性功法修炼极快', bonusType: 'wood_skill_exp', bonusValue: 1.5 },
  { id: 'yingzu', name: '影族', desc: '灵界大族，行踪诡秘，闪避率提升', bonusType: 'combat_dodge', bonusValue: 1.2 },
  // 仙界
  { id: 'jiuyuan', name: '九元观', desc: '仙界大派，底蕴深不可测', bonusType: 'all_stats_bonus', bonusValue: 1.2 },
  { id: 'lunhui', name: '轮回殿', desc: '仙界神秘势力，对抗天庭，死亡损失减少50%', bonusType: 'death_penalty_reduce', bonusValue: 0.5 },
  { id: 'zhulong', name: '烛龙道', desc: '北寒仙域大宗，擅长时间法则，闭关收益提升30%', bonusType: 'offline_bonus', bonusValue: 1.3 },
  { id: 'cangliu', name: '苍流宫', desc: '北寒仙域大宗，水属性功法修炼极快', bonusType: 'water_skill_exp', bonusValue: 1.5 },
  { id: 'fuling', name: '伏凌宗', desc: '北寒仙域大宗，体修圣地，肉身强度提升', bonusType: 'body_cultivation', bonusValue: 1.4 },
  { id: 'tianting', name: '天庭', desc: '仙界正统，掌控法则，每日俸禄极高', bonusType: 'daily_salary', bonusValue: 3.0 },
  { id: 'zhenyan', name: '真言化门', desc: '仙界古宗，时间法则发源地', bonusType: 'offline_bonus', bonusValue: 2.0 },
  { id: 'baizao', name: '百造山', desc: '仙界炼器圣地，炼器成功率极高', bonusType: 'crafting_rate', bonusValue: 0.5 }
`;

const newCompanions = `
  { id: 'nangongwan', name: '南宫婉', sect: '掩月宗', reqLevel: '结丹初期', effect: 2.0, desc: '掩月宗长老，修炼素女轮回功。双修可大幅提升修为。', strategy: '需加入掩月宗或修为达到结丹期方可结为道侣。' },
  { id: 'ziling', name: '紫灵仙子', sect: '妙音门', reqLevel: '筑基后期', effect: 1.5, desc: '乱星海第一美女，精通魅术与阵法。', strategy: '需赠送稀有驻颜丹或灵石打动其心。' },
  { id: 'yinyue', name: '银月', sect: '无', reqLevel: '元婴初期', effect: 1.8, desc: '妖族皇族，精通各种秘术，可辅助战斗与修炼。', strategy: '需在秘境中解救其神魂。' },
  { id: 'yuanyao', name: '元瑶', sect: '无', reqLevel: '筑基中期', effect: 1.3, desc: '重情重义，修炼鬼道功法。', strategy: '需在阴冥之地相遇并协助其脱困。' },
  { id: 'dongxuaner', name: '董萱儿', sect: '黄枫谷', reqLevel: '炼气十层', effect: 1.1, desc: '红拂仙子之徒，修炼化春诀。', strategy: '需同属黄枫谷且在宗门大比中展露头角(胜场≥5)。' },
  { id: 'chenqiaoqian', name: '陈巧倩', sect: '黄枫谷', reqLevel: '炼气九层', effect: 1.1, desc: '陈家大小姐，性格刚烈。', strategy: '需在太南小会或门派任务中结识并相救。' },
  { id: 'yanruyan', name: '燕如嫣', sect: '鬼灵门', reqLevel: '筑基初期', effect: 1.2, desc: '燕家堡天骄，天灵根资质。', strategy: '需在燕家堡大会上展露实力。' },
  { id: 'lingyuling', name: '凌玉灵', sect: '星宫', reqLevel: '结丹后期', effect: 1.6, desc: '星宫双圣之女，聪慧过人。', strategy: '需加入星宫并立下大功。' },
  { id: 'mupeiling', name: '慕沛灵', sect: '落云宗', reqLevel: '结丹初期', effect: 1.2, desc: '落云宗女修，温婉可人。', strategy: '需加入落云宗并多次指点其修炼。' },
  { id: 'baohua', name: '宝花', sect: '无', reqLevel: '大乘期', effect: 3.0, desc: '魔界始祖之一，风华绝代。', strategy: '需在魔界之战中相助。' },
  { id: 'baisuyuan', name: '白素媛', sect: '烛龙道', reqLevel: '金仙后期', effect: 2.5, desc: '烛龙道真传弟子，天赋异禀。', strategy: '需在仙界烛龙道中结识。' },
  { id: 'ganjiuzhen', name: '甘九真', sect: '轮回殿', reqLevel: '大罗初期', effect: 2.8, desc: '轮回殿核心成员，神秘莫测。', strategy: '需加入轮回殿并共同执行任务。' }
`;

const newNpcs = `
  // 凡人界
  { id: 'npc_hanli', name: '韩立', level: '凡人', cultivation: 500, sectId: 'huangfeng' },
  { id: 'npc_lifeiyu', name: '厉飞雨', level: '凡人', cultivation: 800, sectId: 'qixuan' },
  { id: 'npc_wangjuechu', name: '王绝楚', level: '凡人', cultivation: 1000, sectId: 'qixuan' },
  { id: 'npc_modafu', name: '墨大夫', level: '凡人', cultivation: 1200, sectId: 'qixuan' },
  { id: 'npc_zhangtie', name: '张铁', level: '凡人', cultivation: 600, sectId: 'qixuan' },
  { id: 'npc_sunergou', name: '孙二狗', level: '凡人', cultivation: 200, sectId: 'siping' },
  { id: 'npc_jiaming', name: '贾天龙', level: '凡人', cultivation: 900, sectId: 'yelang' },
  // 天南
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
  { id: 'npc_yanruyan', name: '燕如嫣', level: '筑基初期', cultivation: 18000, sectId: 'guiling' },
  { id: 'npc_wangchan', name: '王蝉', level: '筑基中期', cultivation: 22000, sectId: 'guiling' },
  { id: 'npc_kuangren', name: '狂人', level: '结丹后期', cultivation: 85000, sectId: 'yuling' },
  { id: 'npc_yunlu', name: '云露老魔', level: '元婴中期', cultivation: 250000, sectId: 'hehuan' },
  { id: 'npc_wangtiansheng', name: '王天胜', level: '元婴初期', cultivation: 150000, sectId: 'guiling' },
  { id: 'npc_hehuanshou', name: '合欢老魔', level: '元婴后期', cultivation: 300000, sectId: 'hehuan' },
  { id: 'npc_dongmen', name: '东门图', level: '元婴初期', cultivation: 160000, sectId: 'yuling' },
  { id: 'npc_yankuang', name: '燕狂', level: '结丹初期', cultivation: 35000, sectId: 'guiling' },
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
  { id: 'npc_fengxi', name: '风希', level: '元婴后期', cultivation: 200000, sectId: 'none' },
  { id: 'npc_jin_yan', name: '金蛟王', level: '元婴巅峰', cultivation: 240000, sectId: 'none' },
  { id: 'npc_wan_tian_ming', name: '万天明', level: '元婴中期', cultivation: 230000, sectId: 'none' },
  { id: 'npc_yi_tian_du', name: '易天都', level: '元婴中期', cultivation: 210000, sectId: 'none' },
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
  { id: 'npc_tian_mo_zong_zhu', name: '天魔宗主', level: '元婴后期', cultivation: 320000, sectId: 'tianmo' },
  { id: 'npc_qi_ling_xian_zi', name: '七灵仙子', level: '元婴初期', cultivation: 140000, sectId: 'none' },
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
  { id: 'npc_jinyue', name: '金悦', level: '合体后期', cultivation: 20000000, sectId: 'tianpeng' },
  { id: 'npc_leiyunzi', name: '雷云子', level: '合体中期', cultivation: 12000000, sectId: 'none' },
  // 仙界
  { id: 'npc_ma', name: '马良', level: '真仙', cultivation: 100000000, sectId: 'jiuyuan' },
  { id: 'npc_guhu', name: '古或今', level: '道祖', cultivation: 999999999, sectId: 'tianting' },
  { id: 'npc_lunhui', name: '轮回殿主', level: '道祖', cultivation: 999999999, sectId: 'lunhui' },
  { id: 'npc_mizhu', name: '弥罗老祖', level: '大罗后期', cultivation: 500000000, sectId: 'zhenyan' },
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
  { id: 'npc_wuyang', name: '武阳', level: '大罗初期', cultivation: 160000000, sectId: 'jiuyuan' }
`;

const newShopItems = `
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
  { id: 'skill_zhenyan', name: '真言化轮经', type: 'skill', effect: 2.2, cost: 400000, desc: '时间法则基础功法，饮水修为 +120%', region: '仙界' },
  { id: 'skill_shuiyan', name: '水衍四时诀', type: 'skill', effect: 2.0, cost: 300000, desc: '水属性仙界功法，饮水修为 +100%', region: '仙界' },
  { id: 'skill_mantian', name: '漫天星诀', type: 'skill', effect: 1.9, cost: 250000, desc: '星辰法则功法，饮水修为 +90%', region: '仙界' },
  
  // 更多法宝
  { id: 'artifact_jinlei', name: '金雷竹', type: 'material', effect: 0, cost: 15000, desc: '辟邪神雷载体，绝顶炼器材料', region: '大晋' },
  { id: 'artifact_qingzhu', name: '青竹蜂云剑', type: 'passive', effect: 2.5, cost: 80000, desc: '韩立本命法宝，威力无穷，饮水修为 +150%', region: '灵界' },
  { id: 'artifact_poxu', name: '破虚剑', type: 'passive', effect: 2.2, cost: 60000, desc: '空间法则之剑，饮水修为 +120%', region: '仙界' },
  { id: 'artifact_suiyue', name: '岁月神灯', type: 'passive', effect: 2.8, cost: 150000, desc: '时间法则至宝，饮水修为 +180%', region: '仙界' }
`;

replaceArray('SECTS', newSects);
replaceArray('DAO_COMPANIONS', newCompanions);
replaceArray('sectNpcs', newNpcs);
replaceArray('SHOP_ITEMS', newShopItems);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete.');
