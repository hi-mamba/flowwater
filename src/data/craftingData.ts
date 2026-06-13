// 凡人修仙传 · 完整炼制数据
// 按修为等级分段，覆盖全书所有可炼之物

export interface CraftingRecipe {
  id: string; name: string; tier: number; type: string;
  minLevel: number; time: number;
  cost: Record<string, number>;
  effect: string; desc: string;
}

// ============ 全灵草（灵药园可种植） ============
export const ALL_HERBS = [
  // 炼气期 (0-13)
  { id: 'common_herb', name: '凝气草', tier: 1, minLevel: 0, growthTime: 30, yield: 1, desc: '基础灵草，蕴含微量灵气', icon: '🌿', color: 'text-green-400' },
  { id: 'stone', name: '灵石矿苗', tier: 1, minLevel: 0, growthTime: 45, yield: 1, desc: '可生长出灵石的矿苗', icon: '💎', color: 'text-cyan-400' },
  { id: 'paper', name: '符纸树', tier: 1, minLevel: 0, growthTime: 20, yield: 2, desc: '树皮可制符纸的灵树', icon: '📜', color: 'text-stone-300' },
  { id: 'cinnabar', name: '朱砂果', tier: 1, minLevel: 0, growthTime: 25, yield: 2, desc: '果实可研磨成朱砂', icon: '🔴', color: 'text-red-400' },
  { id: 'monster_fur', name: '毛绒菇', tier: 2, minLevel: 3, growthTime: 50, yield: 1, desc: '表面覆绒毛的灵菇', icon: '🧶', color: 'text-yellow-400' },
  { id: 'rare_herb', name: '洗髓草', tier: 2, minLevel: 5, growthTime: 60, yield: 1, desc: '可洗毛伐髓的稀有灵草', icon: '🌱', color: 'text-emerald-400' },
  { id: 'monster_bone', name: '兽骨花', tier: 3, minLevel: 8, growthTime: 75, yield: 1, desc: '形似兽骨的奇异灵植', icon: '🦴', color: 'text-orange-400' },
  { id: 'profound_iron', name: '玄铁草', tier: 3, minLevel: 10, growthTime: 90, yield: 1, desc: '吸收金铁之气的异草', icon: '⚙️', color: 'text-slate-300' },
  // 筑基期 (14-17)
  { id: 'millennium_lingzhi', name: '千年灵芝', tier: 4, minLevel: 14, growthTime: 180, yield: 1, desc: '千年方成的珍贵灵芝', icon: '🍄', color: 'text-amber-400' },
  { id: 'blood_spirit_grass', name: '血灵草', tier: 4, minLevel: 15, growthTime: 200, yield: 1, desc: '以精血浇灌方可生长', icon: '🩸', color: 'text-red-500' },
  // 结丹期 (18-21)
  { id: 'jiuzhuan_grass', name: '九转玄草', tier: 5, minLevel: 18, growthTime: 360, yield: 1, desc: '传说中的仙草，九转轮回', icon: '✨', color: 'text-purple-400' },
  { id: 'soul_nourishing_flower', name: '养魂花', tier: 5, minLevel: 20, growthTime: 400, yield: 1, desc: '可滋养神魂的奇花', icon: '💜', color: 'text-violet-400' },
  // 元婴期 (22-25)
  { id: 'thunder_grass', name: '天雷草', tier: 5, minLevel: 24, growthTime: 480, yield: 1, desc: '只在雷击之地生长的异草', icon: '⚡', color: 'text-yellow-300' },
  // 化神期 (26-35)
  { id: 'ice_lotus', name: '冰魄莲', tier: 6, minLevel: 30, growthTime: 600, yield: 1, desc: '万年寒冰中绽放的莲花', icon: '❄️', color: 'text-blue-300' },
  { id: 'phoenix_feather_grass', name: '凤翎草', tier: 6, minLevel: 32, growthTime: 720, yield: 1, desc: '形如凤凰翎羽的仙草', icon: '🔥', color: 'text-orange-500' },
  // 炼虚期 (36-43)
  { id: 'dragon_blood_grass', name: '龙血草', tier: 7, minLevel: 38, growthTime: 900, yield: 1, desc: '沾染真龙之血的仙草', icon: '🐉', color: 'text-red-600' },
  { id: 'void_flower', name: '虚空花', tier: 7, minLevel: 40, growthTime: 1000, yield: 1, desc: '只在空间裂缝旁绽放', icon: '🌀', color: 'text-indigo-500' },
  // 合体期 (44-51)
  { id: 'dao_lotus', name: '道莲', tier: 8, minLevel: 46, growthTime: 1500, yield: 1, desc: '蕴含大道法则的莲花', icon: '🪷', color: 'text-amber-500' },
  { id: 'chaos_mushroom', name: '混沌菇', tier: 8, minLevel: 48, growthTime: 1800, yield: 1, desc: '混沌初开时诞生的灵菇', icon: '🌌', color: 'text-purple-500' },
  // 大乘期 (52-55)
  { id: 'immortal_herb', name: '仙灵草', tier: 9, minLevel: 52, growthTime: 2400, yield: 1, desc: '仙灵气凝聚而成的灵草', icon: '🌟', color: 'text-yellow-500' },
  { id: 'nirvana_fruit', name: '涅槃果', tier: 9, minLevel: 54, growthTime: 3000, yield: 1, desc: '凤凰涅槃所化之果', icon: '🔥', color: 'text-orange-600' },
];

// ============ 全丹药配方 ============
export const ALL_PILLS: CraftingRecipe[] = [
  // === 炼气期 ===
  { id: 'pill_1', name: '黄龙丹', tier: 1, type: 'pill', minLevel: 0, time: 5, cost: { common_herb: 2 }, effect: '+500 修为', desc: '炼气期修士常用丹药' },
  { id: 'juqi_pill', name: '聚气散', tier: 1, type: 'pill', minLevel: 0, time: 4, cost: { common_herb: 1, paper: 1 }, effect: '+200 修为', desc: '基础聚气丹药' },
  { id: 'bigu_pill', name: '辟谷丹', tier: 1, type: 'pill', minLevel: 1, time: 3, cost: { common_herb: 1, cinnabar: 1 }, effect: '今日饮水视为完成', desc: '服用后无需饮水' },
  { id: 'zhuyan_pill', name: '驻颜丹', tier: 2, type: 'pill', minLevel: 3, time: 8, cost: { rare_herb: 2, common_herb: 3 }, effect: '道侣好感 +50', desc: '保持容颜不老的奇丹' },
  { id: 'qingxin_pill', name: '清心丹', tier: 2, type: 'pill', minLevel: 5, time: 6, cost: { common_herb: 2, paper: 1 }, effect: '突破 +20%', desc: '静心凝神辅助突破' },
  { id: 'essence_pill', name: '精元丹', tier: 2, type: 'pill', minLevel: 7, time: 7, cost: { common_herb: 3, monster_fur: 1 }, effect: '+1000 修为', desc: '补充精元的丹药' },
  // === 筑基期 ===
  { id: 'humai_pill', name: '护脉丹', tier: 2, type: 'pill', minLevel: 10, time: 8, cost: { common_herb: 3, cinnabar: 1 }, effect: '挽救断签', desc: '护住心脉可救断签' },
  { id: 'pill_foundation', name: '筑基丹', tier: 3, type: 'pill', minLevel: 12, time: 12, cost: { common_herb: 10, rare_herb: 2 }, effect: '筑基必备', desc: '突破筑基期的关键丹药' },
  { id: 'marrow_washing_pill', name: '洗髓丹', tier: 3, type: 'pill', minLevel: 14, time: 10, cost: { rare_herb: 3, monster_bone: 2 }, effect: '+3000 修为', desc: '洗毛伐髓的珍贵丹药' },
  { id: 'spirit_eye_pill', name: '明灵丹', tier: 3, type: 'pill', minLevel: 16, time: 9, cost: { rare_herb: 2, millennium_lingzhi: 1 }, effect: '奇遇概率 +15%', desc: '短暂开启灵目的丹药' },
  // === 结丹期 ===
  { id: 'pill_golden_core', name: '降尘丹', tier: 4, type: 'pill', minLevel: 18, time: 20, cost: { rare_herb: 5, millennium_lingzhi: 1 }, effect: '结丹必备', desc: '突破结丹期的关键丹药' },
  { id: 'spirit_gathering_pill', name: '凝灵丹', tier: 4, type: 'pill', minLevel: 18, time: 12, cost: { rare_herb: 3, monster_bone: 1 }, effect: '+5000 修为', desc: '凝结灵力大幅提升' },
  { id: 'blood_essence_pill', name: '血精丹', tier: 4, type: 'pill', minLevel: 19, time: 15, cost: { blood_spirit_grass: 2, monster_bone: 3 }, effect: '+8000 修为', desc: '以精血炼制的强力丹药' },
  { id: 'golden_core_stabilizer', name: '固丹丸', tier: 4, type: 'pill', minLevel: 20, time: 18, cost: { millennium_lingzhi: 2, jiuzhuan_grass: 1 }, effect: '突破失败修为损失减半', desc: '稳固金丹的丹药' },
  // === 元婴期 ===
  { id: 'pill_nascent_soul', name: '定灵丹', tier: 5, type: 'pill', minLevel: 22, time: 30, cost: { millennium_lingzhi: 3, jiuzhuan_grass: 1 }, effect: '元婴必备', desc: '突破元婴期的关键丹药' },
  { id: 'tribulation_pill', name: '渡劫丹', tier: 5, type: 'pill', minLevel: 22, time: 25, cost: { jiuzhuan_grass: 2, millennium_lingzhi: 2, monster_bone: 2 }, effect: '天劫 +20%', desc: '渡劫保命丹药' },
  { id: 'soul_strengthening_pill', name: '强魂丹', tier: 5, type: 'pill', minLevel: 24, time: 22, cost: { soul_nourishing_flower: 2, millennium_lingzhi: 2 }, effect: '神识 +10', desc: '强化神魂的丹药' },
  { id: 'lifespan_pill', name: '延寿丹', tier: 5, type: 'pill', minLevel: 24, time: 35, cost: { millennium_lingzhi: 3, soul_nourishing_flower: 2 }, effect: '寿元 +50年', desc: '延长寿元的珍贵丹药' },
  // === 化神期 ===
  { id: 'millennium_pill', name: '千年灵丹', tier: 6, type: 'pill', minLevel: 26, time: 40, cost: { millennium_lingzhi: 5, jiuzhuan_grass: 3, blood_spirit_grass: 2 }, effect: '+50000 修为', desc: '千年药力凝聚' },
  { id: 'spirit_transformation_pill', name: '化神丹', tier: 6, type: 'pill', minLevel: 28, time: 45, cost: { jiuzhuan_grass: 5, soul_nourishing_flower: 3, thunder_grass: 2 }, effect: '化神必备', desc: '突破化神期关键丹药' },
  { id: 'thunder_body_pill', name: '雷体丹', tier: 6, type: 'pill', minLevel: 30, time: 38, cost: { thunder_grass: 3, millennium_lingzhi: 3, monster_bone: 5 }, effect: '天劫 +15%', desc: '引雷淬体的丹药' },
  // === 炼虚期 ===
  { id: 'jiuzhuan_pill', name: '九转金丹', tier: 7, type: 'pill', minLevel: 36, time: 60, cost: { jiuzhuan_grass: 5, millennium_lingzhi: 5, soul_nourishing_flower: 3, thunder_grass: 2 }, effect: '+200000 修为', desc: '传说级丹药' },
  { id: 'void_essence_pill', name: '虚空丹', tier: 7, type: 'pill', minLevel: 38, time: 55, cost: { void_flower: 3, dragon_blood_grass: 2, ice_lotus: 2 }, effect: '+300000 修为', desc: '蕴含虚空之力的丹药' },
  { id: 'dao_condensing_pill', name: '凝道丹', tier: 7, type: 'pill', minLevel: 40, time: 70, cost: { ice_lotus: 3, phoenix_feather_grass: 3, jiuzhuan_grass: 5 }, effect: '+500000 修为', desc: '凝聚大道法则的仙丹' },
  // === 合体期 ===
  { id: 'unity_pill', name: '合体丹', tier: 8, type: 'pill', minLevel: 44, time: 90, cost: { dao_lotus: 3, dragon_blood_grass: 5, phoenix_feather_grass: 3 }, effect: '合体必备', desc: '突破合体期关键丹药' },
  { id: 'chaos_pill', name: '混沌丹', tier: 8, type: 'pill', minLevel: 46, time: 100, cost: { chaos_mushroom: 3, dao_lotus: 3, void_flower: 2 }, effect: '+800000 修为', desc: '混沌之力凝聚的丹药' },
  // === 大乘期 ===
  { id: 'immortal_pill', name: '渡劫仙丹', tier: 9, type: 'pill', minLevel: 52, time: 150, cost: { immortal_herb: 5, nirvana_fruit: 3, dao_lotus: 5 }, effect: '+2000000 修为', desc: '仙家丹药夺天地造化' },
  { id: 'ascension_pill', name: '飞升丹', tier: 9, type: 'pill', minLevel: 54, time: 200, cost: { nirvana_fruit: 5, immortal_herb: 5, chaos_mushroom: 3 }, effect: '飞升必备', desc: '助你白日飞升的仙丹' },
];

// ============ 全法器配方 ============
export const ALL_ARTIFACTS: CraftingRecipe[] = [
  // === 炼气期 ===
  { id: 'flying_sword', name: '青锋剑', tier: 1, type: 'weapon', minLevel: 0, time: 10, cost: { profound_iron: 3 }, effect: '副本攻击 +10', desc: '基础飞剑' },
  { id: 'fireball_talisman', name: '火弹符', tier: 1, type: 'talisman', minLevel: 0, time: 5, cost: { paper: 1, cinnabar: 1 }, effect: '攻击 +5', desc: '基础攻击符箓' },
  { id: 'ice_talisman', name: '冰锥符', tier: 1, type: 'talisman', minLevel: 2, time: 6, cost: { paper: 1, cinnabar: 2 }, effect: '副本防御 +5', desc: '冰系攻击符箓' },
  { id: 'shield_artifact', name: '玄铁盾', tier: 1, type: 'armor', minLevel: 3, time: 12, cost: { profound_iron: 5, monster_fur: 1 }, effect: '副本防御 +5', desc: '基础防御法器' },
  { id: 'light_body_talisman', name: '轻身符', tier: 1, type: 'talisman', minLevel: 4, time: 5, cost: { paper: 2, monster_fur: 1 }, effect: '秘境探索 +10%', desc: '减轻身体重量的符箓' },
  { id: 'storage_bag_small', name: '储物袋（小）', tier: 2, type: 'accessory', minLevel: 6, time: 10, cost: { monster_fur: 3, paper: 3 }, effect: '材料上限 +5', desc: '基础储物法器' },
  { id: 'spirit_stone_ring', name: '聚灵戒', tier: 2, type: 'accessory', minLevel: 8, time: 12, cost: { profound_iron: 5, rare_herb: 2 }, effect: '饮水修为 +10%', desc: '可聚集周围灵气的戒指' },
  // === 筑基期 ===
  { id: 'bamboo_sword', name: '青竹蜂云剑（单口）', tier: 2, type: 'weapon', minLevel: 10, time: 20, cost: { profound_iron: 5, rare_herb: 3 }, effect: '剑阵 +1口', desc: '韩立本命飞剑' },
  { id: 'golden_armor', name: '金丝甲', tier: 2, type: 'armor', minLevel: 12, time: 18, cost: { profound_iron: 8, monster_bone: 3 }, effect: '天劫 +5%', desc: '金丝编织的软甲' },
  { id: 'soul_binding_ring', name: '缚魂环', tier: 2, type: 'accessory', minLevel: 14, time: 15, cost: { monster_bone: 2, cinnabar: 3 }, effect: '神识 +5', desc: '可束缚神魂的法器' },
  { id: 'spirit_shield_talisman', name: '金刚符', tier: 2, type: 'talisman', minLevel: 14, time: 8, cost: { paper: 2, cinnabar: 2, monster_bone: 1 }, effect: '副本防御 +15', desc: '金刚护体的防御符箓' },
  { id: 'escape_talisman', name: '神行符', tier: 2, type: 'talisman', minLevel: 15, time: 8, cost: { paper: 2, cinnabar: 3, monster_fur: 1 }, effect: '副本逃跑 +30%', desc: '逃命专用的符箓' },
  // === 结丹期 ===
  { id: 'thunder_sword', name: '雷音剑', tier: 3, type: 'weapon', minLevel: 18, time: 30, cost: { profound_iron: 10, millennium_lingzhi: 2, monster_bone: 3 }, effect: '副本攻击 +50', desc: '蕴含雷电之力的飞剑' },
  { id: 'spirit_armor', name: '灵光甲', tier: 3, type: 'armor', minLevel: 18, time: 28, cost: { profound_iron: 12, rare_herb: 5, monster_fur: 3 }, effect: '副本防御 +30', desc: '灵光护体的宝甲' },
  { id: 'storage_bag_medium', name: '储物袋（中）', tier: 3, type: 'accessory', minLevel: 18, time: 15, cost: { monster_fur: 5, paper: 5 }, effect: '材料上限 +10', desc: '扩展储物空间' },
  { id: 'golden_core_mirror', name: '照妖镜', tier: 3, type: 'accessory', minLevel: 20, time: 20, cost: { profound_iron: 8, millennium_lingzhi: 3, cinnabar: 3 }, effect: '秘境陷阱免疫', desc: '可照破一切虚妄' },
  // === 元婴期 ===
  { id: 'wind_thunder_blade', name: '风雷双刃', tier: 4, type: 'weapon', minLevel: 22, time: 45, cost: { profound_iron: 20, millennium_lingzhi: 5, jiuzhuan_grass: 2, thunder_grass: 1 }, effect: '副本攻击 +150', desc: '风雷交织的顶级飞剑' },
  { id: 'heavenly_silk_robe', name: '天蚕宝衣', tier: 4, type: 'armor', minLevel: 22, time: 40, cost: { monster_fur: 10, millennium_lingzhi: 3, jiuzhuan_grass: 1 }, effect: '天劫 +10%', desc: '天蚕丝编织的宝衣' },
  { id: 'spirit_eye_mirror', name: '灵眼玉', tier: 4, type: 'accessory', minLevel: 24, time: 35, cost: { millennium_lingzhi: 5, cinnabar: 5, monster_bone: 5 }, effect: '奇遇概率 +20%', desc: '可看破虚妄的灵玉' },
  { id: 'thunder_ward', name: '避雷符', tier: 4, type: 'talisman', minLevel: 24, time: 20, cost: { paper: 3, cinnabar: 5, thunder_grass: 1 }, effect: '天劫 +10%', desc: '引雷入地的避雷符箓' },
  // === 化神期 ===
  { id: 'void_cauldron_shard', name: '虚天鼎碎片', tier: 5, type: 'artifact', minLevel: 26, time: 60, cost: { jiuzhuan_grass: 5, millennium_lingzhi: 10, profound_iron: 30, soul_nourishing_flower: 3 }, effect: '修为倍率 +1.0', desc: '玄天之宝的碎片' },
  { id: 'five_element_ring', name: '五行环', tier: 5, type: 'accessory', minLevel: 28, time: 50, cost: { jiuzhuan_grass: 3, millennium_lingzhi: 5, blood_spirit_grass: 3, thunder_grass: 2 }, effect: '全属性 +20', desc: '五行相生的至宝' },
  { id: 'divine_sense_sword', name: '神念剑', tier: 5, type: 'weapon', minLevel: 30, time: 55, cost: { profound_iron: 30, soul_nourishing_flower: 5, ice_lotus: 2 }, effect: '副本攻击 +300', desc: '以神识驱动的无形之剑' },
  // === 炼虚期 ===
  { id: 'true_spirit_armor', name: '真灵甲', tier: 6, type: 'armor', minLevel: 36, time: 90, cost: { ice_lotus: 3, phoenix_feather_grass: 3, jiuzhuan_grass: 5, profound_iron: 50 }, effect: '天劫 +25%', desc: '真灵之力护体的仙甲' },
  { id: 'void_blade', name: '虚空刃', tier: 6, type: 'weapon', minLevel: 38, time: 80, cost: { void_flower: 3, dragon_blood_grass: 2, profound_iron: 50, jiuzhuan_grass: 5 }, effect: '副本攻击 +400', desc: '可斩破虚空的利刃' },
  { id: 'dragon_scale_shield', name: '龙鳞盾', tier: 6, type: 'armor', minLevel: 40, time: 85, cost: { dragon_blood_grass: 5, profound_iron: 40, ice_lotus: 3 }, effect: '天劫 +20%', desc: '以真龙鳞片炼制的神盾' },
  // === 合体期 ===
  { id: 'dao_artifact', name: '道器·雏形', tier: 7, type: 'artifact', minLevel: 44, time: 120, cost: { dao_lotus: 5, dragon_blood_grass: 5, void_flower: 3, chaos_mushroom: 2 }, effect: '修为倍率 +2.0', desc: '蕴含大道法则的道器' },
  { id: 'unity_sword', name: '合道剑', tier: 7, type: 'weapon', minLevel: 46, time: 110, cost: { dao_lotus: 3, chaos_mushroom: 2, profound_iron: 80, phoenix_feather_grass: 5 }, effect: '副本攻击 +600', desc: '以身合道的至强之剑' },
  // === 大乘期 ===
  { id: 'immortal_sword', name: '斩仙剑', tier: 8, type: 'weapon', minLevel: 52, time: 150, cost: { immortal_herb: 5, nirvana_fruit: 3, profound_iron: 100, dao_lotus: 5 }, effect: '副本攻击 +1000', desc: '可斩仙人的神剑' },
  { id: 'nirvana_robe', name: '涅槃衣', tier: 8, type: 'armor', minLevel: 54, time: 140, cost: { nirvana_fruit: 5, immortal_herb: 3, phoenix_feather_grass: 5 }, effect: '天劫 +35%', desc: '凤凰涅槃所化的仙衣' },
  { id: 'ascension_talisman', name: '飞升符', tier: 9, type: 'talisman', minLevel: 55, time: 180, cost: { immortal_herb: 10, nirvana_fruit: 5, dao_lotus: 5, chaos_mushroom: 3 }, effect: '飞升必备', desc: '助你白日飞升的仙符' },
];
