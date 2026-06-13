import type { AdventureState, AdventureLogEntry } from './types';

export const createAdventureSlice = (set: any, get: any, _store?: any) => ({
  adventure: {
    spiritPower: 0,
    maxSpiritPower: 50,
    currentNode: null as string | null,
    currentRegion: null as string | null,
    visitedNodes: [] as string[],
    activeEventId: null as string | null,
    completedEvents: [] as string[],
    storyFlags: {} as Record<string, boolean>,
    adventureLog: [] as AdventureLogEntry[],
    combat: {
      active: false,
      enemyId: null as string | null,
      enemyHp: 0,
      enemyMaxHp: 0,
      playerHp: 0,
      playerMaxHp: 0,
      turn: 0,
      lastAction: '',
      lastEnemyAction: '',
      victory: null as boolean | null,
    },
    totalExplorations: 0,
    todayExplorations: 0,
    lastExplorationDate: null as string | null,
  } as AdventureState,

  addSpiritPower: (amount: number) => {
    set((state: any) => {
      const maxSP = 50 + state.levelIndex * 5;
      const newSP = Math.min(Math.max(0, state.adventure.spiritPower + amount), maxSP);
      return {
        adventure: {
          ...state.adventure,
          spiritPower: newSP,
          maxSpiritPower: maxSP,
        },
      };
    });
  },
  moveToNode: (regionId: string, nodeId: string, cost: number) => {
    const state = get();
    if (state.adventure.spiritPower < cost) {
      return { success: false, message: `灵力不足！需要 ${cost} 点灵力，当前只有 ${state.adventure.spiritPower} 点。` };
    }
    set((state: any) => {
      const visited = state.adventure.visitedNodes.includes(nodeId)
        ? state.adventure.visitedNodes
        : [...state.adventure.visitedNodes, nodeId];
      return {
        adventure: {
          ...state.adventure,
          spiritPower: state.adventure.spiritPower - cost,
          currentNode: nodeId,
          currentRegion: regionId,
          visitedNodes: visited,
          activeEventId: null,
        },
      };
    });
    return { success: true, message: '你来到了新的地点。' };
  },
  triggerAdventureEvent: (eventId: string) => {
    set((state: any) => ({
      adventure: {
        ...state.adventure,
        activeEventId: eventId,
      },
    }));
  },
  makeAdventureChoice: (choiceId: string) => {
    const state = get();
    const eventId = state.adventure.activeEventId;
    if (!eventId) return { success: false, message: '没有活跃的事件', reward: null };

    let event: any = null;
    let choice: any = null;
    try {
      const { ADVENTURE_EVENTS } = require('../data/adventureData');
      event = ADVENTURE_EVENTS.find((e: any) => e.id === eventId);
      if (event) {
        choice = event.choices.find((c: any) => c.id === choiceId);
      }
    } catch {
      return { success: false, message: '事件数据加载失败', reward: null };
    }

    if (!event || !choice) {
      return { success: false, message: '未找到事件或选项', reward: null };
    }

    let successChance = choice.outcome.successChance;
    const rootBonus = state.getSpiritualRootBonus();
    if (rootBonus > 1) {
      successChance = Math.min(0.95, successChance + (rootBonus - 1) * 0.05);
    }
    successChance += (state.baseLuck + state.dailyLuck - 100) * 0.001;
    successChance = Math.max(0.05, Math.min(0.95, successChance));

    const isSuccess = Math.random() < successChance;
    const result = isSuccess ? choice.outcome.success : choice.outcome.failure;

    const updates: Partial<typeof state> = {};
    let spiritStones = state.spiritStones;
    let bonusPoints = state.bonusPoints;
    let luck = state.baseLuck;
    let materials = { ...state.materials };

    if (result.spiritStonesChange) spiritStones += result.spiritStonesChange;
    if (result.bonusPointsChange) bonusPoints += result.bonusPointsChange;
    if (result.luckChange) luck = Math.max(0, Math.min(100, luck + result.luckChange));
    if (result.materialReward) {
      const mid = result.materialReward.id;
      materials[mid] = (materials[mid] || 0) + result.materialReward.amount;
    }

    let spiritPower = state.adventure.spiritPower;
    if (result.spiritPowerChange) {
      spiritPower = Math.max(0, spiritPower + result.spiritPowerChange);
    }

    const storyFlags = { ...state.adventure.storyFlags };
    if (result.storyFlag) storyFlags[result.storyFlag] = true;
    if (event.rewardStoryFlag) storyFlags[event.rewardStoryFlag] = true;

    const logEntry: AdventureLogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      regionId: state.adventure.currentRegion || '',
      nodeId: state.adventure.currentNode || '',
      eventId: event.id,
      choiceId: choiceId,
      success: isSuccess,
      message: result.message,
    };

    const today = new Date().toDateString();
    const todayExplored = state.adventure.lastExplorationDate === today
      ? state.adventure.todayExplorations + 1
      : 1;

    set((state: any) => ({
      spiritStones,
      bonusPoints,
      baseLuck: luck,
      materials,
      adventure: {
        ...state.adventure,
        spiritPower,
        activeEventId: null,
        completedEvents: [...state.adventure.completedEvents, event.id],
        storyFlags,
        adventureLog: [...state.adventure.adventureLog, logEntry],
        totalExplorations: state.adventure.totalExplorations + 1,
        todayExplorations: todayExplored,
        lastExplorationDate: today,
      },
    }));

    if (state.adventure.totalExplorations + 1 >= 10 && !state.achievements.includes('adventurer_10')) {
      get().unlockAchievement('adventurer_10');
    }

    return {
      success: isSuccess,
      message: result.message,
      reward: result,
    };
  },
  startAdventureCombat: (enemyId: string) => {
    let enemy: any = null;
    try {
      const { COMBAT_ENEMIES } = require('../data/adventureData');
      enemy = COMBAT_ENEMIES[enemyId];
    } catch {}
    if (!enemy) return;

    const state = get();
    const playerHp = 100 + state.levelIndex * 20;
    set((state: any) => ({
      adventure: {
        ...state.adventure,
        combat: {
          active: true,
          enemyId: enemyId,
          enemyHp: enemy.hp,
          enemyMaxHp: enemy.hp,
          playerHp: playerHp,
          playerMaxHp: playerHp,
          turn: 1,
          lastAction: '',
          lastEnemyAction: '',
          victory: null,
        },
      },
    }));
  },
  adventureCombatAction: (action: 'attack' | 'defend' | 'skill' | 'flee') => {
    const state = get();
    if (!state.adventure.combat.active) {
      return { success: false, message: '没有进行中的战斗', combatOver: true, victory: false };
    }

    let enemy: any = null;
    try {
      const { COMBAT_ENEMIES } = require('../data/adventureData');
      enemy = COMBAT_ENEMIES[state.adventure.combat.enemyId!];
    } catch {}
    if (!enemy) {
      return { success: false, message: '敌人数据丢失', combatOver: true, victory: false };
    }

    const combat = { ...state.adventure.combat };
    let playerAttack = 10 + state.levelIndex * 5;
    let playerDefense = 5 + state.levelIndex * 3;

    if (state.equippedSkills.length > 0) {
      playerAttack += state.equippedSkills.length * 10;
    }

    let playerMessage = '';
    let damageToEnemy = 0;

    switch (action) {
      case 'attack': {
        const crit = Math.random() < 0.15;
        damageToEnemy = Math.max(1, playerAttack - enemy.defense + Math.floor(Math.random() * 10));
        if (crit) damageToEnemy = Math.floor(damageToEnemy * 1.5);
        combat.enemyHp = Math.max(0, combat.enemyHp - damageToEnemy);
        playerMessage = crit ? `暴击！你造成了 ${damageToEnemy} 点伤害！` : `你攻击了敌人，造成 ${damageToEnemy} 点伤害！`;
        break;
      }
      case 'defend': {
        playerDefense = Math.floor(playerDefense * 2);
        playerMessage = '你进入防御姿态，防御力翻倍！';
        break;
      }
      case 'skill': {
        if (state.equippedSkills.length === 0) {
          playerMessage = '你没有装备技能！普通攻击代替。';
          damageToEnemy = Math.max(1, playerAttack - enemy.defense);
          combat.enemyHp = Math.max(0, combat.enemyHp - damageToEnemy);
        } else {
          damageToEnemy = Math.max(1, Math.floor(playerAttack * 1.8) - enemy.defense);
          combat.enemyHp = Math.max(0, combat.enemyHp - damageToEnemy);
          playerMessage = `你释放了 ${state.equippedSkills[0]}，造成 ${damageToEnemy} 点伤害！`;
        }
        break;
      }
      case 'flee': {
        const fleeChance = 0.4 + state.baseLuck * 0.003;
        if (Math.random() < fleeChance) {
          set((state: any) => ({
            adventure: {
              ...state.adventure,
              combat: { ...state.adventure.combat, active: false, victory: null, lastAction: '成功逃离！', lastEnemyAction: '' },
            },
          }));
          return { success: true, message: '你成功逃离了战斗！', combatOver: true, victory: false };
        }
        playerMessage = '逃跑失败！';
        break;
      }
    }

    if (combat.enemyHp <= 0) {
      combat.victory = true;
      combat.active = false;
      combat.lastAction = playerMessage;
      const reward = enemy.victoryReward;
      set((state: any) => ({
        spiritStones: state.spiritStones + (reward.spiritStonesChange || 0),
        bonusPoints: state.bonusPoints + (reward.bonusPointsChange || 0),
        baseLuck: Math.max(0, Math.min(100, state.baseLuck + (reward.luckChange || 0))),
        adventure: { ...state.adventure, combat },
      }));
      return { success: true, message: reward.message, combatOver: true, victory: true };
    }

    let enemyMessage = '';
    const skillRoll = Math.random();
    let cumulativeChance = 0;
    let chosenSkill = enemy.skills[0];
    for (const skill of enemy.skills) {
      cumulativeChance += skill.chance;
      if (skillRoll < cumulativeChance) {
        chosenSkill = skill;
        break;
      }
    }

    if (chosenSkill.damage > 0) {
      let damageToPlayer = Math.max(1, chosenSkill.damage - playerDefense);
      damageToPlayer += Math.floor(Math.random() * 5);
      combat.playerHp = Math.max(0, combat.playerHp - damageToPlayer);
      enemyMessage = `${chosenSkill.message} 造成 ${damageToPlayer} 点伤害！`;
    } else {
      enemyMessage = chosenSkill.message;
    }

    if (combat.playerHp <= 0) {
      combat.victory = false;
      combat.active = false;
      combat.lastAction = playerMessage;
      combat.lastEnemyAction = enemyMessage;
      const penalty = enemy.defeatPenalty;
      set((state: any) => ({
        spiritStones: Math.max(0, state.spiritStones + (penalty.spiritStonesChange || 0)),
        bonusPoints: Math.max(0, state.bonusPoints + (penalty.bonusPointsChange || 0)),
        adventure: { ...state.adventure, combat },
      }));
      return { success: false, message: penalty.message, combatOver: true, victory: false };
    }

    combat.turn += 1;
    combat.lastAction = playerMessage;
    combat.lastEnemyAction = enemyMessage;

    set((state: any) => ({
      adventure: { ...state.adventure, combat },
    }));

    return { success: true, message: playerMessage, combatOver: false, victory: false };
  },
  endAdventureCombat: () => {
    set((state: any) => ({
      adventure: {
        ...state.adventure,
        combat: {
          active: false,
          enemyId: null,
          enemyHp: 0,
          enemyMaxHp: 0,
          playerHp: 0,
          playerMaxHp: 0,
          turn: 0,
          lastAction: '',
          lastEnemyAction: '',
          victory: null,
        },
      },
    }));
  },
  closeAdventureEvent: () => {
    set((state: any) => ({
      adventure: {
        ...state.adventure,
        activeEventId: null,
      },
    }));
  },
  setAdventureStoryFlag: (flag: string) => {
    set((state: any) => ({
      adventure: {
        ...state.adventure,
        storyFlags: { ...state.adventure.storyFlags, [flag]: true },
      },
    }));
  },
});
