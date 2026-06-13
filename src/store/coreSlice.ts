import { addMinutes, format, parse, startOfDay } from 'date-fns';
import type { Plan, Log, Settings, Quest } from './types';
import { REGIONS, SECTS, BEETLE_STAGES, SHOP_ITEMS, CULTIVATION_LEVELS, BOTTLE_LEVELS, LIFEBOUND_ARTIFACTS } from './constants';

const generateDailyQuests = (): Quest[] => [
  { id: 'q1', title: '吸收灵气 (喝水)', desc: '今日请于灵泉处吸纳三次清泉', target: 3, progress: 0, reward: 50, completed: false, type: 'drink', category: 'main' },
  { id: 'q2', title: '外出历练 (4000步)', desc: '巡视宗门领地，强健体魄', target: 4000, progress: 0, reward: 30, completed: false, type: 'step', category: 'optional' },
  { id: 'q3', title: '闭关冥想 (10分钟)', desc: '聆听大道之音，稳固道心', target: 10, progress: 0, reward: 30, completed: false, type: 'meditate', category: 'optional' },
  { id: 'q4', title: '探索秘境', desc: '前往秘境寻宝1次', target: 1, progress: 0, reward: 15, completed: false, type: 'game', category: 'side' },
  { id: 'q5', title: '传音天下', desc: '分享一次修仙海报', target: 1, progress: 0, reward: 15, completed: false, type: 'share', category: 'side' },
];

export { generateDailyQuests };

export const createCoreSlice = (set: any, get: any, _store?: any) => ({
  plans: [
    {
      id: '1',
      name: '饮水修行',
      startTime: '08:00',
      endTime: '22:00',
      intervalMinutes: 120,
      active: true,
    },
    {
      id: '2',
      name: '闭关打坐',
      startTime: '22:00',
      endTime: '23:00',
      intervalMinutes: 60,
      active: true,
    },
    {
      id: '3',
      name: '晨练吐纳',
      startTime: '06:30',
      endTime: '07:30',
      intervalMinutes: 60,
      active: true,
    }
  ],
  logs: [] as Log[],
  settings: {
    vibrationMode: 'drop' as const,
    music: 'stream' as const,
    voiceCommandEnabled: true,
    dailyGoal: 2000,
    systemNotifications: false,
    drinkMultipliers: {
      water: 1,
      tea: 1.2,
      coffee: 0.8,
      milktea: 0.5
    }
  },
  streakDays: 0,
  lastActiveDate: null as string | null,
  bonusPoints: 0,
  spiritStones: 100,
  inventory: [] as string[],
  quests: generateDailyQuests(),
  pendingStreakRescue: null as number | null,
  claimedStreakRewards: [] as number[],
  isFirstTime: true,
  hasDoneFirstDrink: false,

  addPlan: (plan: Omit<Plan, 'id'>) =>
    set((state: any) => ({
      plans: [...state.plans, { ...plan, id: Date.now().toString() }],
    })),
  updatePlan: (id: string, plan: Partial<Plan>) =>
    set((state: any) => ({
      plans: state.plans.map((p: Plan) => (p.id === id ? { ...p, ...plan } : p)),
    })),
  deletePlan: (id: string) =>
    set((state: any) => ({
      plans: state.plans.filter((p: Plan) => p.id !== id),
    })),
  togglePlan: (id: string) =>
    set((state: any) => ({
      plans: state.plans.map((p: Plan) =>
        p.id === id ? { ...p, active: !p.active } : p
      ),
    })),
  addLog: (amount: number, type: 'water' | 'coffee' | 'tea' | 'milktea' = 'water') => {
    const state = get();
    const multipliers = state.settings.drinkMultipliers || { water: 1, tea: 0.9, coffee: 0.8, milktea: 0.5 };
    let finalAmount = (isNaN(amount) ? 0 : amount) * (multipliers[type] ?? 1);

    // Region Multiplier
    const regionInfo = REGIONS.find((r: any) => r.id === state.currentRegion);
    if (regionInfo) {
      finalAmount *= regionInfo.multiplier;
    }

    // Sect Bonuses
    if (state.sect && state.sectStatus === 'joined') {
      const sectInfo = SECTS.find((s: any) => s.id === state.sect);
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
    }

    set((state: any) => {
      const newLogs = [...state.logs, { id: Date.now().toString(), timestamp: Date.now(), amount: finalAmount, type }];
      const totalAmount = newLogs.reduce((sum: number, l: Log) => sum + l.amount, 0);
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
    get().updateQuestProgress('drink', 1);
    get().waterHerbs(amount);

    // V6.0: 掌天瓶 — generate green liquid on each drink
    const greenGenerated = get().collectGreenLiquid();

    // V6.0: 噬金虫 — auto spawn 1-3 beetles per drink
    set((state: any) => {
      const newCount = state.goldDevouringBeetles.count + Math.floor(Math.random() * 3) + 1;
      let newStage = state.goldDevouringBeetles.stage;
      for (let s = BEETLE_STAGES.length - 1; s >= 0; s--) {
        if (newCount >= BEETLE_STAGES[s].minCount) { newStage = s + 1; break; }
      }
      return {
        goldDevouringBeetles: {
          ...state.goldDevouringBeetles,
          count: newCount,
          stage: newStage,
          evolutionProgress: Math.min(100, (newCount / BEETLE_STAGES[newStage - 1].minCount) * 100),
        },
      };
    });

    // V6.0: 本命法宝 bonus
    const artifactBonus = get().getLifeboundArtifactBonus();
    if (state.lifeboundArtifact.id) {
      const def = LIFEBOUND_ARTIFACTS.find((a: any) => a.id === state.lifeboundArtifact.id);
      if (def?.effectType === 'cultivation') finalAmount *= artifactBonus;
      else if (def?.effectType === 'flat_bonus') finalAmount += artifactBonus;
    }

    // V6.0: 噬金虫 stage 1 bonus (+1 per beetle)
    if (state.goldDevouringBeetles.stage === 1) {
      finalAmount += state.goldDevouringBeetles.count;
    }

    // V7.0: 灵界倍率
    if (state.spiritRealm.unlocked) {
      finalAmount *= get().getSpiritRealmMultiplier();
    }

    if (state.spiritualRoot !== 'none') {
      get().washMarrow(amount);
    }

    // V13.0: 喝水获得灵力
    const spiritPowerGain = Math.floor(amount / 50);
    if (spiritPowerGain > 0) {
      get().addSpiritPower(spiritPowerGain);
    }

    return finalAmount;
  },
  removeLog: (timestamp: number) =>
    set((state: any) => ({
      logs: state.logs.filter((l: Log) => l.timestamp !== timestamp),
    })),
  updateSettings: (newSettings: Partial<Settings>) =>
    set((state: any) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setHealthData: (steps: number, temp: number | null) => {
    set(() => ({
      todaySteps: steps,
      todayTemperature: temp,
    }));
    get().updateQuestProgress('step', steps);
  },
  getNextReminder: () => {
    const { plans, logs } = get();
    const activePlans = plans.filter((p: Plan) => p.active);
    if (activePlans.length === 0) return null;

    const now = new Date();
    const today = startOfDay(now);

    const todaysLogs = logs.filter((l: Log) => l.timestamp >= today.getTime());
    const lastLogTime = todaysLogs.length > 0
      ? Math.max(...todaysLogs.map((l: Log) => l.timestamp))
      : null;

    let earliestNextReminder: number | null = null;

    for (const plan of activePlans) {
      const start = parse(plan.startTime, 'HH:mm', today);
      const end = parse(plan.endTime, 'HH:mm', today);

      let nextTime = start.getTime();

      if (lastLogTime && lastLogTime >= start.getTime() && lastLogTime <= end.getTime()) {
        nextTime = lastLogTime + plan.intervalMinutes * 60 * 1000;

        if (nextTime <= now.getTime()) {
           const elapsedFromLast = now.getTime() - lastLogTime;
           const intervalsPassed = Math.floor(elapsedFromLast / (plan.intervalMinutes * 60 * 1000));
           nextTime = lastLogTime + (intervalsPassed + 1) * plan.intervalMinutes * 60 * 1000;
        }
      } else if (now.getTime() > start.getTime()) {
        const elapsed = now.getTime() - start.getTime();
        const intervalsPassed = Math.floor(elapsed / (plan.intervalMinutes * 60 * 1000));
        nextTime = start.getTime() + (intervalsPassed + 1) * plan.intervalMinutes * 60 * 1000;
      }

      if (nextTime <= end.getTime() && nextTime > now.getTime()) {
        if (earliestNextReminder === null || nextTime < earliestNextReminder) {
          earliestNextReminder = nextTime;
        }
      } else if (now.getTime() > end.getTime()) {
         const tomorrowStart = addMinutes(start, 24 * 60).getTime();
         if (earliestNextReminder === null || tomorrowStart < earliestNextReminder) {
           earliestNextReminder = tomorrowStart;
         }
      } else if (nextTime < now.getTime()) {
         nextTime = now.getTime() + plan.intervalMinutes * 60 * 1000;
         if (nextTime <= end.getTime() && (earliestNextReminder === null || nextTime < earliestNextReminder)) {
            earliestNextReminder = nextTime;
         }
      }
    }

    return earliestNextReminder;
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
        if (streakDays > 2) {
          const penalty = Math.floor(get().bonusPoints * 0.05);
          set({ bonusPoints: Math.max(0, get().bonusPoints - penalty) });
        }
        if (streakDays > 1) {
          pendingRescue = streakDays;
        }
        newStreak = 1;
      }

      const newTitles = [...unlockedTitles];
      if (newStreak >= 30 && !newTitles.includes('持之以恒')) {
        newTitles.push('持之以恒');
      }

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
        streakDays: newStreak,
        pendingStreakRescue: pendingRescue,
        quests: generateDailyQuests(),
        dailyEncyclopediaItems: newDailyItems,
        realmExplorationsToday: 0,
        lastRealmExplorationDate: today,
        unlockedTitles: newTitles,
        age: newAge,
        lifespan: currentLifespan,
        dailyLuck: Math.max(10, Math.min(100, get().baseLuck + Math.floor(Math.random() * 41) - 20))
      });

      if (newAge > currentLifespan) {
        get().resetCultivation();
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
  setIsFirstTime: (val: boolean) => set({ isFirstTime: val }),
  setHasDoneFirstDrink: (val: boolean) => set({ hasDoneFirstDrink: val }),
  claimStreakReward: (days: number) => set((state: any) => {
    if (!state.claimedStreakRewards.includes(days)) {
      return { claimedStreakRewards: [...state.claimedStreakRewards, days] };
    }
    return state;
  }),
  addSpiritStones: (amount: number) => set((state: any) => ({ spiritStones: Math.max(0, (state.spiritStones || 0) + amount) })),
  buyItem: (id: string, cost: number, isConsumable: boolean, effect: number) => {
    const state = get();
    if ((state.spiritStones || 0) >= cost) {
      if (id === 'heavenly_drop') {
        set({
          spiritStones: state.spiritStones - cost,
          heavenlyBottleDrops: state.heavenlyBottleDrops + effect
        });
        return true;
      }

      const shopItem = SHOP_ITEMS.find((i: any) => i.id === id);
      if (shopItem?.type === 'breakthrough' || shopItem?.type === 'consumable' || shopItem?.type === 'material') {
        set({
          spiritStones: state.spiritStones - cost,
          materials: { ...state.materials, [id]: (state.materials[id] || 0) + 1 }
        });
        return true;
      }

      if (shopItem?.type === 'skill') {
        if (state.inventory.includes(id)) return false;
        if (state.skills.includes(id)) return false;
        set({
          spiritStones: state.spiritStones - cost,
          inventory: [...state.inventory, id]
        });
        return true;
      }

      if (state.inventory.includes(id)) return false;
      set({
        spiritStones: state.spiritStones - cost,
        inventory: [...state.inventory, id]
      });
      return true;
    }
    return false;
  },
  sellItem: (id: string, type: 'material' | 'inventory', amount: number, price: number) => {
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
      const count = state.inventory.filter((i: string) => i === id).length;
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
  updateQuestProgress: (type: 'drink' | 'game' | 'step', amount: number) => {
    set((state: any) => ({
      quests: state.quests.map((q: Quest) => {
        if (q.type === type && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.target);
          return { ...q, progress: newProgress };
        }
        return q;
      })
    }));
  },
  claimQuestReward: (questId: string) => {
    set((state: any) => {
      const quest = state.quests.find((q: Quest) => q.id === questId);
      if (quest && quest.progress >= quest.target && !quest.completed) {
        return {
          quests: state.quests.map((q: Quest) => q.id === questId ? { ...q, completed: true } : q),
          spiritStones: (state.spiritStones || 0) + quest.reward
        };
      }
      return state;
    });
  },
  gatherMaterials: () => set((state: any) => {
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
});
