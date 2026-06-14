import { CULTIVATION_LEVELS, SPIRITUAL_ROOTS } from './constants';

export const createPlayerSlice = (set: any, get: any, _store?: any) => ({
  playerName: '无名散修',
  currentRegion: '天南',
  levelIndex: 0,
  experience: 0,
  highestLevelReached: null as string | null,
  breakthroughEvent: null as string | null,
  age: 16,
  lifespan: 100,
  baseLuck: 50,
  dailyLuck: 50,
  unlockedTitles: [] as string[],
  currentTitle: null as string | null,
  learnedKnowledge: [] as string[],
  dailyEncyclopediaItems: [] as string[],
  achievements: [] as string[],
  createdAt: Date.now(),
  spiritualRoot: null as string | null,
  marrowWashProgress: 0,
  showMarrowWashEvent: false,
  sealedLogs: [] as any[],
  todaySteps: 0,
  todayTemperature: null as number | null,

  setPlayerName: (name: string) => set({ playerName: name }),
  setCurrentRegion: (region: string) => set({ currentRegion: region }),
  setLevelIndex: (index: number) => {
    // 寿元随境界增长（凡人 100 / 炼气 200 / 筑基-结丹 500 / 元婴-化神 1000 / 炼虚-合体 5000 / 大乘-渡劫 10000）
    let newLifespan = 100;
    if (index >= 1) newLifespan = 200;       // 炼气
    if (index >= 14) newLifespan = 500;      // 筑基
    if (index >= 22) newLifespan = 1000;     // 元婴
    if (index >= 26) newLifespan = 2000;     // 化神
    if (index >= 30) newLifespan = 5000;     // 炼虚（灵界）
    if (index >= 38) newLifespan = 10000;    // 大乘（灵界）
    if (index >= 42) newLifespan = 50000;    // 渡劫期

    set({ levelIndex: index, lifespan: newLifespan });
  },
  attemptBreakthrough: (useQingxinPill: boolean) => {
    const state = get();
    const currentLevel = CULTIVATION_LEVELS[state.levelIndex];
    const nextLevel = CULTIVATION_LEVELS[state.levelIndex + 1];

    if (!nextLevel) return { success: false, message: '已达此界巅峰。' };

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

    // V6.0: 天劫系统 — 大境界突破触发天劫
    const TRIBULATION_TYPES = {
      three_nine: { name: '三九天劫', strikes: 27, baseSurvival: 0.60, requiredBreakthrough: '结丹初期' },
      six_nine: { name: '六九天劫', strikes: 54, baseSurvival: 0.40, requiredBreakthrough: '元婴初期' },
      nine_nine: { name: '九九天劫', strikes: 81, baseSurvival: 0.20, requiredBreakthrough: '化神初期' },
    };
    const BEETLE_STAGES = [
      { stage: 1, name: '幼虫', minCount: 0, effect: '每次饮水 +1 修为/只', desc: '初生的噬金虫，以灵气为食' },
      { stage: 2, name: '成虫', minCount: 50, effect: '秘境探索 +10% 收益', desc: '成熟体的噬金虫，刀枪不入' },
      { stage: 3, name: '虫王', minCount: 200, effect: '每日自动吞噬一次负面天命', desc: '虫群之王，可吞噬万物' },
      { stage: 4, name: '噬金虫王', minCount: 1000, effect: '突破天劫时自动抵消一道雷劫', desc: '传说中的噬金虫王，连天劫亦可吞噬' },
    ];

    const tribType = (
      (currentLevel.name === '筑基巅峰' && nextLevel.name === '结丹初期') ? 'three_nine' :
      (currentLevel.name === '结丹巅峰' && nextLevel.name === '元婴初期') ? 'six_nine' :
      (currentLevel.name === '元婴巅峰' && nextLevel.name === '化神初期') ? 'nine_nine' :
      null
    );

    if (tribType) {
      let newMaterials = { ...state.materials };
      if (requiredPill) {
        newMaterials[requiredPill] = (newMaterials[requiredPill] || 0) - 1;
        if (newMaterials[requiredPill] <= 0) delete newMaterials[requiredPill];
      }
      if (useQingxinPill) {
        newMaterials['qingxin_pill'] = (newMaterials['qingxin_pill'] || 0) - 1;
        if (newMaterials['qingxin_pill'] <= 0) delete newMaterials['qingxin_pill'];
      }
      set({ materials: newMaterials });

      const config = TRIBULATION_TYPES[tribType as keyof typeof TRIBULATION_TYPES];
      let dodgeCharges = 0;
      if (state.goldDevouringBeetles.stage >= 4) dodgeCharges += 1;

      set({
        tribulation: {
          active: true,
          type: tribType,
          currentStrike: 1,
          totalStrikes: config.strikes,
          survivedStrikes: 0,
          dodgeCharges,
          startTime: Date.now(),
          lastStrikeTime: Date.now(),
          targetLevelIndex: state.levelIndex + 1,
        },
      });
      return { success: true, tribulation: true, message: `${config.name}降临！共 ${config.strikes} 道雷劫，请前往首页渡劫！` };
    }

    let skillBonus = 0;
    if (state.equippedSkills.includes('skill_2')) skillBonus -= 10;
    if (state.equippedSkills.includes('skill_3')) skillBonus += 10;
    if (state.equippedSkills.includes('skill_5')) skillBonus -= 20;

    const luckModifier = (state.dailyLuck - 50) / 2.5;
    const successRateBonus = useQingxinPill ? 20 : 0;
    const successChance = 50 + luckModifier + successRateBonus + skillBonus;

    const rand = Math.random() * 100;

    let newMaterials = { ...state.materials };
    if (requiredPill) {
      newMaterials[requiredPill] = (newMaterials[requiredPill] || 0) - 1;
      if (newMaterials[requiredPill] <= 0) delete newMaterials[requiredPill];
    }
    if (useQingxinPill) {
      newMaterials['qingxin_pill'] = (newMaterials['qingxin_pill'] || 0) - 1;
      if (newMaterials['qingxin_pill'] <= 0) delete newMaterials['qingxin_pill'];
    }

    if (rand <= successChance) {
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
      const penalty = Math.floor(state.bonusPoints * 0.05);
      set({
        bonusPoints: Math.max(0, state.bonusPoints - penalty),
        materials: newMaterials
      });
      return { success: false, message: `突破失败，修为受损（-${penalty}）。气运加成：${luckModifier > 0 ? '+' : ''}${luckModifier.toFixed(1)}%` };
    }
  },
  resetCultivation: () => set((state: any) => ({
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
  setHighestLevelReached: (levelName: string) => set((state: any) => {
    const newTitles = [...state.unlockedTitles];
    if (levelName === '筑基初期' && !newTitles.includes('筑基高人')) {
      newTitles.push('筑基高人');
    }
    return { highestLevelReached: levelName, unlockedTitles: newTitles };
  }),
  setBreakthroughEvent: (event: string | null) => set({ breakthroughEvent: event }),
  ascend: () => {
    const state = get();
    // 凡人修仙传设定：化神中期方可感应飞升雷劫，飞升至灵界后方修炼炼虚及以上境界
    if (state.levelIndex < 27) return { success: false, message: '修为不足，化神中期方可感应飞升雷劫。' };
    set({ currentRegion: '灵界', levelIndex: Math.max(state.levelIndex, 30) });
    return { success: true, message: '雷劫过后，你白日飞升，进入灵界！' };
  },
  testSpiritualRoot: () => {
    const rand = Math.random();
    let rootId = 'mixed';
    if (rand < 0.001) rootId = 'waste_genius';
    else if (rand < 0.006) rootId = 'mutated';
    else if (rand < 0.016) rootId = 'heaven';
    else if (rand < 0.066) rootId = 'dual';
    else if (rand < 0.216) rootId = 'triple';

    set({ spiritualRoot: rootId });
    return rootId;
  },
  getSpiritualRootBonus: () => {
    const { spiritualRoot } = get();
    if (!spiritualRoot) return 1.0;
    const root = SPIRITUAL_ROOTS.find((r: any) => r.id === spiritualRoot);
    return root ? root.bonus : 1.0;
  },
  washMarrow: (amount: number) => {
    const { marrowWashProgress, spiritualRoot } = get();
    if (spiritualRoot !== 'none') return;

    const newProgress = marrowWashProgress + amount;
    if (newProgress >= 5000) {
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
  setShowMarrowWashEvent: (show: boolean) => set({ showMarrowWashEvent: show }),
  setCurrentTitle: (title: string | null) => set({ currentTitle: title }),
  markKnowledgeLearned: (id: string) => set((state: any) => {
    if (!state.learnedKnowledge.includes(id)) {
      return {
        learnedKnowledge: [...state.learnedKnowledge, id],
        experience: state.experience + 1
      };
    }
    return state;
  }),
  unlockAchievement: (id: string) => set((state: any) => {
    if (!state.achievements.includes(id)) {
      return { achievements: [...state.achievements, id] };
    }
    return state;
  }),
  addLuck: (amount: number) => set((state: any) => ({ baseLuck: Math.min(100, state.baseLuck + amount) })),
});
