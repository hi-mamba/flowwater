import { format } from 'date-fns';
import { CULTIVATION_LEVELS } from './constants';

export const createCompanionSlice = (set: any, get: any, _store?: any) => ({
  daoCompanion: null as { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex?: number; exp?: number } | null,
  marriedCompanions: [] as { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[],
  unlockedCompanions: [] as string[],

  setDaoCompanion: (companion: { id: string; name: string; active: boolean; favorability?: number; dailyInteractions?: number; lastInteractionDate?: string | null; levelIndex?: number; exp?: number } | null) => set((state: any) => {
    if (!companion) return { daoCompanion: null };
    const existing = state.marriedCompanions.find((c: any) => c.id === companion.id);
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
  setMarriedCompanions: (companions: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[]) => set({ marriedCompanions: companions }),
  unlockCompanion: (id: string) => set((state: any) => ({
    unlockedCompanions: state.unlockedCompanions.includes(id) ? state.unlockedCompanions : [...state.unlockedCompanions, id]
  })),
  interactWithCompanion: (type: 'dual_cultivate' | 'gift', companionId?: string, giftItem?: string) => {
    const state = get();
    const targetId = companionId || state.daoCompanion?.id;
    if (!targetId) return { success: false, message: '尚未结识道侣' };

    const companionIndex = state.marriedCompanions.findIndex((c: any) => c.id === targetId);
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
      } else if (itemToGift.startsWith('artifact_') || itemToGift === 'flying_sword' || itemToGift === 'shield_artifact') {
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
        dailyInteractions: currentInteractions,
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
});
