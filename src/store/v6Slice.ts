import { BOTTLE_LEVELS, LIFEBOUND_ARTIFACTS, BEETLE_STAGES, TRIBULATION_TYPES, CULTIVATION_LEVELS } from './constants';
import type { HeavenlyBottleState, LifeboundArtifactState, GoldDevouringBeetlesState, TribulationState } from './types';

export const createV6Slice = (set: any, get: any, _store?: any) => ({
  heavenlyBottle: {
    level: 1,
    greenLiquid: 0,
    maxLiquid: 10,
    lastDropTime: Date.now(),
    totalDrinksFed: 0,
  } as HeavenlyBottleState,
  lifeboundArtifact: {
    id: null,
    name: null,
    level: 0,
    exp: 0,
    refinementCount: 0,
  } as LifeboundArtifactState,
  goldDevouringBeetles: {
    count: 0,
    stage: 1,
    fedToday: false,
    evolutionProgress: 0,
    autoDefenseUsed: false,
  } as GoldDevouringBeetlesState,
  tribulation: {
    active: false,
    type: null,
    currentStrike: 0,
    totalStrikes: 0,
    survivedStrikes: 0,
    dodgeCharges: 0,
    startTime: 0,
    lastStrikeTime: 0,
    targetLevelIndex: 0,
  } as TribulationState,
  heavenlyBottleDrops: 0,

  collectGreenLiquid: () => {
    const state = get();
    const bottle = state.heavenlyBottle;
    const config = BOTTLE_LEVELS[bottle.level - 1];
    const generated = Math.floor((bottle.totalDrinksFed + 1) * config.multiplier) + 1;
    const newLiquid = Math.min(bottle.maxLiquid, bottle.greenLiquid + generated);
    const newTotalDrinks = bottle.totalDrinksFed + 1;

    let newLevel = bottle.level;
    let newMax = bottle.maxLiquid;
    const nextLevel = BOTTLE_LEVELS.find((b: any) => b.level === bottle.level + 1);
    if (nextLevel && newTotalDrinks >= nextLevel.upgradeAt) {
      newLevel = nextLevel.level;
      newMax = nextLevel.maxLiquid;
    }

    set({
      heavenlyBottle: {
        ...bottle,
        level: newLevel,
        greenLiquid: newLiquid,
        maxLiquid: newMax,
        lastDropTime: Date.now(),
        totalDrinksFed: newTotalDrinks,
      },
    });
    return generated;
  },
  useGreenLiquidRipen: (herbId: string) => {
    const state = get();
    const herb = state.cave.herbs.find((h: any) => h.id === herbId);
    if (!herb) return { success: false, message: '未找到该灵草' };
    if (herb.stage === 'mature') return { success: false, message: '该灵草已经成熟' };
    if (state.heavenlyBottle.greenLiquid < 5) return { success: false, message: '绿液不足，需要 5 滴' };

    set({
      heavenlyBottle: { ...state.heavenlyBottle, greenLiquid: state.heavenlyBottle.greenLiquid - 5 },
      cave: {
        ...state.cave,
        herbs: state.cave.herbs.map((h: any) =>
          h.id === herbId ? { ...h, growth: h.maxGrowth || 1000, stage: 'mature' as const } : h
        ),
      },
    });
    return { success: true, message: '绿液催熟成功！灵草瞬间成熟！' };
  },
  useGreenLiquidDuplicate: (itemId: string) => {
    const state = get();
    const cost = 10;
    if (state.heavenlyBottle.greenLiquid < cost) return { success: false, message: `绿液不足，需要 ${cost} 滴` };

    const isMaterial = (state.materials[itemId] || 0) > 0;
    const isInventory = state.inventory.includes(itemId);
    if (!isMaterial && !isInventory) return { success: false, message: '背包中没有该物品可复制' };

    if (isMaterial) {
      set({
        heavenlyBottle: { ...state.heavenlyBottle, greenLiquid: state.heavenlyBottle.greenLiquid - cost },
        materials: { ...state.materials, [itemId]: (state.materials[itemId] || 0) + 1 },
      });
    } else {
      set({
        heavenlyBottle: { ...state.heavenlyBottle, greenLiquid: state.heavenlyBottle.greenLiquid - cost },
        inventory: [...state.inventory, itemId],
      });
    }
    return { success: true, message: '绿液复制成功！获得额外一份！' };
  },
  useHeavenlyBottle: (action: 'duplicate' | 'accelerate', targetId?: string) => {
    const state = get();
    if (state.heavenlyBottleDrops <= 0) return false;

    if (action === 'accelerate') {
      const herb = targetId
        ? state.cave.herbs.find((h: any) => h.id === targetId)
        : state.cave.herbs.find((h: any) => h.stage !== 'mature');

      if (herb && herb.stage !== 'mature') {
        set((state: any) => ({
          heavenlyBottleDrops: state.heavenlyBottleDrops - 1,
          cave: {
            ...state.cave,
            herbs: state.cave.herbs.map((h: any) => h.id === herb.id ? { ...h, growth: h.maxGrowth || 1000, stage: 'mature' } : h)
          }
        }));
        return true;
      }
    } else if (action === 'duplicate') {
      const herb = targetId
        ? state.cave.herbs.find((h: any) => h.id === targetId)
        : state.cave.herbs[0];

      if (herb && state.cave.herbs.length < 4) {
        set((state: any) => ({
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
  addHeavenlyBottleDrop: (amount: number) => set((state: any) => ({ heavenlyBottleDrops: state.heavenlyBottleDrops + amount })),
  bindLifeboundArtifact: (artifactId: string) => {
    const state = get();
    if (state.lifeboundArtifact.id) return { success: false, message: '已绑定本命法宝，不可更换！' };
    const artifact = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === artifactId);
    if (!artifact) return { success: false, message: '未找到该法宝' };
    if (state.levelIndex < artifact.unlockLevel) return { success: false, message: `修为不足，需要 ${CULTIVATION_LEVELS[artifact.unlockLevel]?.name || '更高境界'}` };

    set({
      lifeboundArtifact: {
        id: artifact.id,
        name: artifact.name,
        level: 1,
        exp: 0,
        refinementCount: 0,
      },
    });
    return { success: true, message: `成功绑定本命法宝【${artifact.name}】！` };
  },
  refineLifeboundArtifact: () => {
    const state = get();
    const art = state.lifeboundArtifact;
    if (!art.id) return { success: false, message: '尚未绑定本命法宝' };
    if (art.refinementCount >= 10) return { success: false, message: '已达祭炼上限' };
    const cost = 500 * (art.refinementCount + 1);
    if (state.spiritStones < cost) return { success: false, message: `灵石不足，需要 ${cost} 灵石` };

    set({
      spiritStones: state.spiritStones - cost,
      lifeboundArtifact: { ...art, refinementCount: art.refinementCount + 1 },
    });
    return { success: true, message: `祭炼成功！本命法宝效果 +2%（当前额外 ${(art.refinementCount + 1) * 2}%）` };
  },
  getLifeboundArtifactBonus: () => {
    const state = get();
    const art = state.lifeboundArtifact;
    if (!art.id) return 0;
    const def = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === art.id);
    if (!def) return 0;
    return def.effect + art.refinementCount * 0.02;
  },
  feedBeetles: (spiritStones: number) => {
    const state = get();
    if (spiritStones < 100) return { success: false, message: '至少需要 100 灵石' };
    if (state.spiritStones < spiritStones) return { success: false, message: '灵石不足' };

    const newCount = state.goldDevouringBeetles.count + Math.floor(spiritStones / 10);
    let newStage = state.goldDevouringBeetles.stage;
    for (let s = BEETLE_STAGES.length - 1; s >= 0; s--) {
      if (newCount >= BEETLE_STAGES[s].minCount) { newStage = s + 1; break; }
    }

    set({
      spiritStones: state.spiritStones - spiritStones,
      goldDevouringBeetles: {
        ...state.goldDevouringBeetles,
        count: newCount,
        stage: newStage,
        fedToday: true,
        evolutionProgress: Math.min(100, (newCount / BEETLE_STAGES[newStage - 1].minCount) * 100),
      },
    });
    return { success: true, message: `喂食成功！噬金虫数量 +${Math.floor(spiritStones / 10)}（总计 ${newCount} 只）` };
  },
  getBeetleBonus: () => {
    const state = get();
    const beetles = state.goldDevouringBeetles;
    if (beetles.stage === 1) return beetles.count;
    return 0;
  },
  startTribulation: (targetLevelIndex: number) => {
    const state = get();
    if (state.tribulation.active) return { success: false, message: '天劫已在进行中！' };
    const currentLevel = CULTIVATION_LEVELS[state.levelIndex];
    const targetLevel = CULTIVATION_LEVELS[targetLevelIndex];
    if (!targetLevel) return { success: false, message: '无效的突破目标' };

    let tribType: 'three_nine' | 'six_nine' | 'nine_nine' | null = null;
    if (currentLevel.name === '筑基巅峰' && targetLevel.name === '结丹初期') tribType = 'three_nine';
    else if (currentLevel.name === '结丹巅峰' && targetLevel.name === '元婴初期') tribType = 'six_nine';
    else if (currentLevel.name === '元婴巅峰' && targetLevel.name === '化神初期') tribType = 'nine_nine';
    if (!tribType) return { success: false, message: '当前突破不需要渡天劫' };

    const config = TRIBULATION_TYPES[tribType];

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
        targetLevelIndex,
      },
    });
    return { success: true, message: `${config.name}降临！共 ${config.strikes} 道雷劫，准备渡劫！` };
  },
  surviveTribulationStrike: () => {
    const state = get();
    const trib = state.tribulation;
    if (!trib.active) return { success: false, message: '没有进行中的天劫', survived: false };

    const config = trib.type ? TRIBULATION_TYPES[trib.type] : null;
    if (!config) return { success: false, message: '天劫数据异常', survived: false };

    // baseSurvival 视作"整场天劫整体存活率"，单道雷存活率 = 整体^(1/总道数)
    let overallRate = config.baseSurvival;
    const hasQingxin = (state.materials['qingxin_pill'] || 0) > 0;
    if (hasQingxin) overallRate += 0.10;
    const artBonus = get().getLifeboundArtifactBonus();
    if (state.lifeboundArtifact.id) {
      const def = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === state.lifeboundArtifact.id);
      if (def?.effectType === 'breakthrough') overallRate += artBonus / 100;
    }
    overallRate = Math.min(0.98, Math.max(0.05, overallRate));
    const perStrikeRate = Math.pow(overallRate, 1 / Math.max(1, trib.totalStrikes));

    if (trib.dodgeCharges > 0 && Math.random() < 0.5) {
      const nextStrike = trib.currentStrike + 1;
      const finished = nextStrike > trib.totalStrikes;
      set({
        tribulation: {
          ...trib,
          currentStrike: nextStrike,
          survivedStrikes: trib.survivedStrikes + 1,
          dodgeCharges: trib.dodgeCharges - 1,
          lastStrikeTime: Date.now(),
          ...(finished ? { active: false } : {}),
        },
      });
      if (finished) {
        get().setLevelIndex(trib.targetLevelIndex);
        set({ bonusPoints: state.bonusPoints + 500 });
        return { success: true, message: `最后一道雷被噬金虫王吞噬！${CULTIVATION_LEVELS[trib.targetLevelIndex]?.name || ''} —— 突破成功！`, survived: true };
      }
      return { success: true, message: '噬金虫王吞噬了这道雷劫！', survived: true };
    }

    const survived = Math.random() < perStrikeRate;
    const nextStrike = trib.currentStrike + 1;
    const finished = nextStrike > trib.totalStrikes;

    if (survived) {
      set({
        tribulation: {
          ...trib,
          currentStrike: nextStrike,
          survivedStrikes: trib.survivedStrikes + 1,
          lastStrikeTime: Date.now(),
          ...(finished ? { active: false } : {}),
        },
      });
      if (finished) {
        get().setLevelIndex(trib.targetLevelIndex);
        set({ bonusPoints: state.bonusPoints + 500 });
        const targetName = CULTIVATION_LEVELS[trib.targetLevelIndex]?.name || '新境界';
        return { success: true, message: `天劫渡过！雷劫淬体，修为大增！踏入【${targetName}】！`, survived: true };
      }
      return { success: true, message: `第 ${trib.currentStrike} 道雷劫渡过！`, survived: true };
    } else {
      const penalty = Math.floor(state.bonusPoints * 0.20);
      const diagnosis = get().getTribulationDiagnosis();
      const suggestions = diagnosis.missing.length > 0
        ? '\n\n下次想突破，建议加强：\n' + diagnosis.missing.map((m: any) => `• ${m.name}（${m.effect}）— ${m.how}`).join('\n')
        : '\n\n所有可用增益均已生效，仅是运气差，再来一次即可。';
      set({
        tribulation: { ...trib, active: false },
        bonusPoints: Math.max(0, state.bonusPoints - penalty),
      });
      return { success: false, message: `渡劫失败！第 ${trib.currentStrike}/${trib.totalStrikes} 道雷劫未能抵挡，修为倒退 ${penalty} 点。境界停留在原处。${suggestions}`, survived: false };
    }
  },
  cancelTribulation: () => {
    set({
      tribulation: {
        active: false,
        type: null,
        currentStrike: 0,
        totalStrikes: 0,
        survivedStrikes: 0,
        dodgeCharges: 0,
        startTime: 0,
        lastStrikeTime: 0,
        targetLevelIndex: 0,
      },
    });
  },
  getTribulationSurvivalRate: () => {
    const state = get();
    const trib = state.tribulation;
    if (!trib.active || !trib.type) return 0;
    const config = TRIBULATION_TYPES[trib.type];
    let rate = config.baseSurvival;
    if ((state.materials['qingxin_pill'] || 0) > 0) rate += 0.10;
    if (state.lifeboundArtifact.id) {
      const def = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === state.lifeboundArtifact.id);
      if (def?.effectType === 'breakthrough') rate += def.effect / 100;
    }
    return Math.min(0.95, rate);
  },
  // 渡劫诊断：返回每项加成是否生效 + 未生效项的强化建议（用于 UI 展示和失败提示）
  getTribulationDiagnosis: () => {
    const state = get();
    const trib = state.tribulation;
    if (!trib.type) return { applied: [], missing: [], overallRate: 0 };
    const config = TRIBULATION_TYPES[trib.type];

    const applied: { name: string; effect: string }[] = [];
    const missing: { name: string; effect: string; how: string }[] = [];

    let overallRate = config.baseSurvival;
    applied.push({ name: '基础存活率', effect: `${Math.round(config.baseSurvival * 100)}%` });

    const hasQingxin = (state.materials['qingxin_pill'] || 0) > 0;
    if (hasQingxin) {
      overallRate += 0.10;
      applied.push({ name: '清心丹', effect: '+10%' });
    } else {
      missing.push({ name: '清心丹', effect: '+10% 整体存活率', how: '在炼丹炉炼制 / 集市购买，渡劫前持有即可' });
    }

    if (state.lifeboundArtifact.id) {
      const def = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === state.lifeboundArtifact.id);
      if (def?.effectType === 'breakthrough') {
        const bonus = get().getLifeboundArtifactBonus();
        overallRate += bonus / 100;
        applied.push({ name: `本命法宝·${def.name}`, effect: `+${bonus}%` });
      } else if (def) {
        missing.push({ name: '突破型本命法宝', effect: '最高 +15% 存活率', how: `当前法宝【${def.name}】非突破型，可在本命法宝面板更换为「血魔甲」等突破型` });
      }
    } else {
      missing.push({ name: '本命法宝', effect: '+15% 存活率（突破型）', how: '在本命法宝面板炼化「血魔甲」等突破型法宝' });
    }

    const beetleStage = state.goldDevouringBeetles.stage;
    if (beetleStage >= 4) {
      applied.push({ name: '噬金虫王', effect: '可吞噬 1 道雷劫' });
    } else {
      missing.push({
        name: '噬金虫王（第4阶）',
        effect: '渡劫时 50% 几率自动吞噬 1 道雷',
        how: `当前噬金虫为第${beetleStage}阶（${state.goldDevouringBeetles.count}只），需进化至第4阶（≥1000只）`,
      });
    }

    overallRate = Math.min(0.98, Math.max(0.05, overallRate));
    return { applied, missing, overallRate };
  },
});
