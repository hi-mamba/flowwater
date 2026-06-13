import { SPIRIT_CONTINENTS, HEAVENLY_TREASURES } from './constants';
import type { SpiritRealmState } from './types';

export const createSpiritRealmSlice = (set: any, get: any, _store?: any) => ({
  spiritRealm: {
    unlocked: false,
    currentContinent: null as 'fengyuan' | 'leiming' | null,
    ascensionProgress: 0,
    heavenlyTreasures: [] as string[],
    crossRealmGates: [] as string[],
    lastGateOpen: 0,
    realmExplored: 0,
  } as SpiritRealmState,

  unlockSpiritRealm: () => {
    const state = get();
    if (state.spiritRealm.unlocked) return { success: false, message: '灵界已解锁' };
    if (state.levelIndex < 36) return { success: false, message: '需达到化神期方可感应灵界' };
    set({
      spiritRealm: {
        ...state.spiritRealm,
        unlocked: true,
        currentContinent: 'fengyuan',
        ascensionProgress: 0,
        crossRealmGates: ['fengyuan'],
      },
      currentRegion: '灵界',
    });
    return { success: true, message: '你感应到灵界的召唤！时空裂缝在你面前打开，你踏入风元大陆！' };
  },
  exploreSpiritRealm: () => {
    const state = get();
    const sr = state.spiritRealm;
    if (!sr.unlocked) return { success: false, message: '灵界未解锁' };
    const continent = SPIRIT_CONTINENTS.find((c: any) => c.id === sr.currentContinent);
    if (!continent) return { success: false, message: '当前所在大陆未知' };

    const newProgress = sr.ascensionProgress + Math.floor(Math.random() * 10) + 5;
    const stones = Math.floor(Math.random() * 200) + 100;
    const mat = Math.random() < 0.3 ? (Math.random() < 0.5 ? 'millennium_lingzhi' : 'jiuzhuan_grass') : 'rare_herb';

    set((s: any) => ({
      spiritRealm: { ...s.spiritRealm, ascensionProgress: newProgress, realmExplored: s.spiritRealm.realmExplored + 1 },
      spiritStones: s.spiritStones + stones,
      materials: { ...s.materials, [mat]: (s.materials[mat] || 0) + 1 },
    }));

    if (newProgress >= 50 && !sr.crossRealmGates.includes('leiming')) {
      set((s: any) => ({
        spiritRealm: { ...s.spiritRealm, crossRealmGates: [...s.spiritRealm.crossRealmGates, 'leiming'] },
      }));
      return { success: true, message: `探索中...获得 ${stones}💎 + ${mat}。雷鸣大陆的传送门已开启！`, reward: { stones, mat } };
    }

    return { success: true, message: `探索灵界...获得 ${stones}💎 + ${mat}。飞升进度 ${newProgress}%`, reward: { stones, mat } };
  },
  collectHeavenlyTreasure: (id: string) => {
    const state = get();
    if (state.spiritRealm.heavenlyTreasures.includes(id)) return { success: false, message: '已拥有此宝' };
    const treasure = HEAVENLY_TREASURES.find((t: any) => t.id === id);
    if (!treasure) return { success: false, message: '未找到此宝' };
    const continent = SPIRIT_CONTINENTS.find((c: any) => c.id === state.spiritRealm.currentContinent);
    if (!continent || !continent.treasures.includes(id as any)) return { success: false, message: '此宝不在当前大陆' };

    set((s: any) => ({
      spiritRealm: { ...s.spiritRealm, heavenlyTreasures: [...s.spiritRealm.heavenlyTreasures, id] },
    }));
    return { success: true, message: `获得玄天之宝【${treasure.name}】！饮水修为加成 x${treasure.bonus}！` };
  },
  getSpiritRealmMultiplier: () => {
    const state = get();
    if (!state.spiritRealm.unlocked) return 1.0;
    const continent = SPIRIT_CONTINENTS.find((c: any) => c.id === state.spiritRealm.currentContinent);
    let mult = continent ? continent.multiplier : 1.0;
    for (const tId of state.spiritRealm.heavenlyTreasures) {
      const t = HEAVENLY_TREASURES.find((tr: any) => tr.id === tId);
      if (t) mult *= t.bonus;
    }
    return mult;
  },
});
