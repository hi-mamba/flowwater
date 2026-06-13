import { CULTIVATION_LEVELS, DUNGEONS } from './constants';
import type { DungeonState } from './types';

export const createDungeonSlice = (set: any, get: any, _store?: any) => ({
  dungeon: {
    active: false,
    location: null as string | null,
    floor: 1,
    maxFloor: 10,
    hp: 100,
    maxHp: 100,
    attack: 10,
    goldEarned: 0,
    itemsFound: [] as string[],
    bossDefeated: false,
    cleared: false,
    eventType: null as 'monster' | 'treasure' | 'trap' | 'boss' | 'rest' | null,
    eventData: null as any,
    todayRuns: 0,
    bestFloor: 1,
  } as DungeonState,
  activeGame: null as string | null,

  startDungeon: (dungeonId: string) => {
    const state = get();
    if (state.dungeon.active) return { success: false, message: '已在副本中！' };
    const dungeon = DUNGEONS.find((d: any) => d.id === dungeonId);
    if (!dungeon) return { success: false, message: '未找到该副本' };
    if (state.levelIndex < dungeon.minLevel) return { success: false, message: `修为不足，需 ${CULTIVATION_LEVELS[dungeon.minLevel]?.name || '更高境界'}` };
    const maxHp = 100 + state.levelIndex * 20 + (state.lifeboundArtifact.id ? 50 : 0);
    const attack = 10 + state.levelIndex * 5;
    set({
      dungeon: {
        active: true,
        location: dungeonId,
        floor: 1,
        maxFloor: dungeon.floors,
        hp: maxHp,
        maxHp,
        attack,
        goldEarned: 0,
        itemsFound: [],
        bossDefeated: false,
        cleared: false,
        eventType: null,
        eventData: null,
        todayRuns: state.dungeon.todayRuns,
        bestFloor: state.dungeon.bestFloor,
      },
    });
    return { success: true, message: `进入【${dungeon.name}】！共 ${dungeon.floors} 层，击败 BOSS 即可通关！` };
  },
  exploreDungeon: (action: 'fight' | 'flee' | 'open' | 'rest') => {
    const state = get();
    const d = state.dungeon;
    if (!d.active) return { success: false, message: '不在副本中' };

    const dungeon = DUNGEONS.find((dg: any) => dg.id === d.location);
    if (!dungeon) return { success: false, message: '副本数据异常' };

    const isBossFloor = d.floor === d.maxFloor;
    if (isBossFloor) {
      const bossPower = dungeon.bossPower;
      const playerPower = d.attack + state.bonusPoints / 100;
      const winChance = playerPower / (playerPower + bossPower);
      const won = Math.random() < winChance;

      if (won || action === 'fight') {
        const stones = dungeon.rewards.stones[1];
        const mat = dungeon.rewards.materials[Math.floor(Math.random() * dungeon.rewards.materials.length)];
        const wonFight = Math.random() < (winChance + 0.2);
        if (wonFight) {
          set((s: any) => ({
            dungeon: { ...s.dungeon, bossDefeated: true, cleared: true, goldEarned: s.dungeon.goldEarned + stones, itemsFound: [...s.dungeon.itemsFound, mat] },
            spiritStones: s.spiritStones + stones,
            materials: { ...s.materials, [mat]: (s.materials[mat] || 0) + 1 },
          }));
          return { success: true, message: `击败【${dungeon.boss}】！获得 ${stones}💎 + ${mat}`, event: 'boss_win' };
        }
        set({ dungeon: { ...d, hp: Math.max(0, d.hp - 40) } });
        return { success: false, message: `BOSS 反击造成 40 伤害！`, event: 'boss_hit' };
      }
      set({ dungeon: { ...d, hp: Math.max(0, d.hp - 60) } });
      return { success: false, message: 'BOSS 攻击造成 60 伤害！', event: 'boss_hit' };
    }

    const roll = Math.random();
    if (roll < 0.35) {
      const monsterHp = 20 + d.floor * 10;
      const damage = d.attack + Math.floor(Math.random() * 20);
      const win = damage >= monsterHp;
      const stonesEarned = dungeon.rewards.stones[0] + Math.floor(Math.random() * dungeon.rewards.stones[1]);
      if (win) {
        set((s: any) => ({
          dungeon: { ...s.dungeon, goldEarned: s.dungeon.goldEarned + stonesEarned },
          spiritStones: s.spiritStones + stonesEarned,
        }));
        return { success: true, message: `击杀妖兽！+${stonesEarned}💎`, event: 'monster' };
      }
      const dmg = Math.floor(monsterHp / 5);
      set({ dungeon: { ...d, hp: Math.max(0, d.hp - dmg) } });
      return { success: false, message: `战斗受伤，-${dmg} HP`, event: 'monster' };
    } else if (roll < 0.55) {
      const mat = dungeon.rewards.materials[Math.floor(Math.random() * dungeon.rewards.materials.length)];
      set((s: any) => ({
        dungeon: { ...s.dungeon, itemsFound: [...s.dungeon.itemsFound, mat] },
        materials: { ...s.materials, [mat]: (s.materials[mat] || 0) + 1 },
      }));
      return { success: true, message: `发现宝箱！获得 ${mat}`, event: 'treasure' };
    } else if (roll < 0.75) {
      const dmg = 5 + Math.floor(Math.random() * 15);
      set({ dungeon: { ...d, hp: Math.max(0, d.hp - dmg) } });
      return { success: false, message: `触发禁制！-${dmg} HP`, event: 'trap' };
    } else {
      const heal = 10 + Math.floor(Math.random() * 20);
      set({ dungeon: { ...d, hp: Math.min(d.maxHp, d.hp + heal) } });
      return { success: true, message: `发现休息点，恢复 +${heal} HP`, event: 'rest' };
    }
  },
  advanceFloor: () => {
    const state = get();
    const d = state.dungeon;
    if (!d.active) return { success: false, message: '不在副本中' };
    if (!d.bossDefeated && d.floor === d.maxFloor) return { success: false, message: '必须先击败 BOSS！' };
    const nextFloor = d.floor + 1;
    if (nextFloor > d.maxFloor) return { success: false, message: '已通关！' };
    set({ dungeon: { ...d, floor: nextFloor, eventType: null } });
    return { success: true, message: `进入第 ${nextFloor} 层` };
  },
  endDungeon: () => {
    const state = get();
    const bestFloor = Math.max(state.dungeon.bestFloor, state.dungeon.floor);
    set({
      dungeon: {
        ...state.dungeon,
        active: false,
        bestFloor,
        location: null,
        floor: 1,
        eventType: null,
        eventData: null,
      },
    });
  },
  setActiveGame: (gameId: string | null) => set({ activeGame: gameId }),
});
