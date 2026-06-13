import { format } from 'date-fns';
import type { CaveState } from './types';

export const createCaveSlice = (set: any, get: any, _store?: any) => ({
  cave: {
    springQi: 0,
    lastSpringCollect: Date.now(),
    herbs: [],
    furnace: { active: false, recipeId: null, startTime: null, endTime: null }
  } as CaveState,
  materials: {} as Record<string, number>,
  realmExplorationsToday: 0,
  realmExplorationTotal: 0,
  lastRealmExplorationDate: null as string | null,
  alchemyLevel: 1,
  craftingLevel: 1,
  talismanLevel: 1,
  formationLevel: 1,
  talismans: {} as Record<string, number>,
  formations: [] as string[],
  monsterMaterials: {} as Record<string, number>,

  addMaterial: (id: string, amount: number) => set((state: any) => ({
    materials: { ...state.materials, [id]: (state.materials[id] || 0) + amount }
  })),
  collectSpring: () => set((state: any) => {
    const now = Date.now();
    const hoursPassed = (now - state.cave.lastSpringCollect) / (1000 * 60 * 60);
    const collected = Math.floor(Math.min(24, state.cave.springQi + hoursPassed));
    if (collected > 0) {
      return {
        bonusPoints: state.bonusPoints + collected * 10,
        cave: { ...state.cave, springQi: 0, lastSpringCollect: now }
      };
    }
    return state;
  }),
  plantHerb: (type: string) => set((state: any) => {
    if (state.cave.herbs.length >= 4) return state;

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
  waterHerbs: (amount: number) => set((state: any) => {
    const growthGained = (amount / 100) * 5;
    const newHerbs = state.cave.herbs.map((herb: any) => {
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
  harvestHerb: (id: string) => set((state: any) => {
    const herb = state.cave.herbs.find((h: any) => h.id === id);
    if (herb && herb.stage === 'mature') {
      let rewardId = herb.type;
      if (rewardId === 'common') rewardId = 'common_herb';
      if (rewardId === 'rare') rewardId = 'rare_herb';

      return {
        cave: { ...state.cave, herbs: state.cave.herbs.filter((h: any) => h.id !== id) },
        materials: { ...state.materials, [rewardId]: (state.materials[rewardId] || 0) + 1 }
      };
    }
    return state;
  }),
  startAlchemy: (recipeId: string) => set((state: any) => {
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
  collectPill: () => set((state: any) => {
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
  speedUpAlchemy: () => set((state: any) => {
    const furnace = state.cave.furnace;
    if (!furnace.active || !furnace.endTime) return state;

    if (state.spiritStones < 20) return state;

    return {
      spiritStones: state.spiritStones - 20,
      cave: {
        ...state.cave,
        furnace: { ...furnace, endTime: Date.now() }
      }
    };
  }),
  makeTalisman: (id: string) => {
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
  makePill: (id: string) => {
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
  craftArtifact: (id: string) => {
    const state = get();
    const costs: Record<string, Record<string, number>> = {
      'flying_sword': { 'profound_iron': 5, 'monster_bone': 1 },
      'shield_artifact': { 'profound_iron': 10, 'monster_fur': 2 },
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
    return { success: true, message: `炼制成功！获得 ${id === 'flying_sword' ? '飞剑' : '玄铁盾'}` };
  },
  setupFormation: (id: string) => {
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
  exploreRealm: (risk: 'low' | 'mid' | 'high') => {
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

    if (newTotal === 5) {
      get().obtainArtifact('ancient_sword');
      return { type: 'hidden_cave', reward: '上古功法/法宝' };
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
      if (state.daoCompanion.favorability >= 500) companionBonus = 2;
      else if (state.daoCompanion.favorability >= 200) companionBonus = 1.5;
      else if (state.daoCompanion.favorability >= 50) companionBonus = 1.2;
    }

    const luckFactor = 1 - ((state.dailyLuck - 50) / 100);
    const rand = Math.random() * luckFactor;

    if (risk === 'low') {
      if (!state.unlockedCompanions.includes('chenqiaoqian') && Math.random() < 0.05) {
        get().unlockCompanion('chenqiaoqian');
        return { type: 'hidden_cave', reward: '在太南小会外围，你偶然救下了一名被散修围攻的黄枫谷女修陈巧倩。她对你心生感激，已可结为道侣！' };
      }
      if (rand < 0.1) return { type: 'pill', itemId: 'pill_1', amount: 1 };
      if (rand < 0.5) return { type: 'herb', amount: Math.ceil(1 * companionBonus) };
      if (rand < 0.7) return { type: 'stone', amount: Math.ceil(10 * companionBonus) };
      if (rand < 0.8) return { type: 'profound_iron', amount: Math.ceil(1 * companionBonus) };
      return { type: 'monster', penalty: 0.01 };
    } else if (risk === 'mid') {
      if (rand < 0.05) return { type: 'skill', itemId: 'skill_3' };
      if (rand < 0.15) return { type: 'pill', itemId: 'pill_foundation', amount: 1 };
      if (rand < 0.4) return { type: 'herb', amount: Math.ceil(2 * companionBonus) };
      if (rand < 0.6) return { type: 'stone', amount: Math.ceil(30 * companionBonus) };
      if (rand < 0.8) return { type: 'millennium_lingzhi', amount: Math.ceil(1 * companionBonus) };
      return { type: 'monster', penalty: 0.02 };
    } else {
      if (state.currentRegion === '阴冥之地' && !state.unlockedCompanions.includes('yuanyao') && Math.random() < 0.3) {
        get().unlockCompanion('yuanyao');
        return { type: 'hidden_cave', reward: '在阴冥之地深处，你协助了一位名叫元瑶的女子脱困。她对你心生感激，已可结为道侣！' };
      }
      if (!state.unlockedCompanions.includes('yinyue') && Math.random() < 0.1) {
        get().unlockCompanion('yinyue');
        return { type: 'hidden_cave', reward: '你在秘境深处解救了一缕神秘神魂，名为银月。她对你心生感激，已可结为道侣！' };
      }

      if (rand < 0.02) return { type: 'inheritance', reward: '上古大能传承，修为暴涨！', exp: 50000 };
      if (rand < 0.05) return { type: 'skill', itemId: 'skill_5' };
      if (rand < 0.1) return { type: 'pill', itemId: 'pill_golden_core', amount: 1 };
      if (rand < 0.3) return { type: 'rare_herb', amount: Math.ceil(1 * companionBonus) };
      if (rand < 0.5) return { type: 'stone', amount: Math.ceil(100 * companionBonus) };
      if (rand < 0.7) return { type: 'jiuzhuan_grass', amount: Math.ceil(1 * companionBonus) };
      return { type: 'monster', penalty: 0.03 };
    }
  },
});
