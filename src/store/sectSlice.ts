import { SECTS, CULTIVATION_LEVELS } from './constants';
import type { SectNpc, GlobalEvent } from './types';

export const createSectSlice = (set: any, get: any, _store?: any) => ({
  sect: null as string | null,
  sectStatus: 'none' as 'none' | 'joined' | 'left' | 'betrayed',
  sectPosition: 'outer' as 'outer' | 'inner' | 'core' | 'elder' | 'patriarch',
  sectContribution: 0,
  sectCompetitionWins: 0,
  sectContributionRank: 0,
  sectLevel: 1,
  sectNpcs: [
    { id: 'npc1', name: '韩立', level: '炼气十层', cultivation: 6000 },
    { id: 'npc2', name: '厉飞雨', level: '凡人', cultivation: 500 },
    { id: 'npc3', name: '南宫婉', level: '结丹初期', cultivation: 30000 },
    { id: 'npc4', name: '陆师兄', level: '炼气十层', cultivation: 6500 },
    { id: 'npc5', name: '王绝楚', level: '凡人', cultivation: 800 },
    { id: 'npc6', name: '紫灵', level: '结丹初期', cultivation: 32000 },
    { id: 'npc7', name: '银月', level: '元婴初期', cultivation: 150000 },
    { id: 'npc8', name: '元瑶', level: '结丹后期', cultivation: 80000 },
    { id: 'npc9', name: '董萱儿', level: '筑基初期', cultivation: 12000 },
    { id: 'npc10', name: '陈巧倩', level: '筑基初期', cultivation: 11000 },
    { id: 'npc11', name: '李化元', level: '结丹中期', cultivation: 50000 },
    { id: 'npc12', name: '红拂', level: '结丹后期', cultivation: 90000 },
    { id: 'npc13', name: '穹老怪', level: '元婴初期', cultivation: 180000 },
    { id: 'npc14', name: '向之礼', level: '化神中期', cultivation: 400000 },
  ] as SectNpc[],
  globalEvent: {
    id: 'demon_invasion_1',
    title: '魔修入侵',
    description: '大批魔修正在集结，意图攻破宗门护山大阵。全宗弟子需齐心协力，共御外敌！',
    type: 'demon_invasion' as const,
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
    progress: 35,
    target: 100,
    status: 'active' as const
  } as GlobalEvent | null,
  pendingEncounterId: null as string | null,
  storyChapter: 1,
  storyNode: 0,
  sectWar: {
    active: false,
    weekNumber: 1,
    startTime: 0,
    endTime: 0,
    contributions: {} as Record<string, number>,
    playerContribution: 0,
    playerAttacksLeft: 5,
    rewardsClaimed: false,
    battleLog: [] as string[],
    mvp: null as string | null,
  },
  divineSense: {
    level: 1,
    exp: 0,
    maxSplit: 1,
    activeSplits: 1,
    mentalPower: 10,
    techniques: [] as string[],
  },
  swordFormation: {
    swords: 0,
    maxSwords: 72,
    formation: 'none' as const,
    formationLevel: 1,
    bambooSwordsCrafted: 0,
    springSwordArtLevel: 1,
  },
  spiritBeast: {
    active: null as string | null,
    stabled: [] as any[],
  },

  joinSect: (sectId?: string) => {
    const { spiritualRoot } = get();
    if (!spiritualRoot || spiritualRoot === 'none') return;

    const sectToJoin = sectId || SECTS[Math.floor(Math.random() * SECTS.length)].id;
    set({ sect: sectToJoin, sectStatus: 'joined', sectPosition: 'outer', sectContribution: 0, sectCompetitionWins: 0 });
  },
  leaveSect: () => {
    set((state: any) => ({
      sect: null,
      sectStatus: 'left',
      sectPosition: 'outer',
      sectContribution: 0,
      sectCompetitionWins: 0,
      sealedLogs: state.logs,
      logs: [],
      highestLevelReached: null,
    }));
  },
  rejoinSect: (sectId?: string) => {
    set((state: any) => ({
      sect: sectId || SECTS[Math.floor(Math.random() * SECTS.length)].id,
      sectStatus: 'joined',
      sectPosition: 'outer',
      sectContribution: 0,
      sectCompetitionWins: 0,
      logs: [...state.logs, ...state.sealedLogs],
      sealedLogs: [],
    }));
  },
  addSectContribution: (amount: number) => set((state: any) => ({ sectContribution: state.sectContribution + amount })),
  donateToSect: (itemId: string) => {
    const state = get();
    if (state.sectStatus !== 'joined') return { success: false, message: '未加入宗门' };

    const isMaterial = (state.materials[itemId] || 0) > 0;
    const isInventory = state.inventory.includes(itemId);

    if (!isMaterial && !isInventory) {
      return { success: false, message: '缺少该物品' };
    }

    let contributionGain = 10;
    if (itemId === 'zhuyan_pill') contributionGain = 500;
    else if (itemId === 'jiuzhuan_grass') contributionGain = 200;
    else if (itemId === 'rare_herb') contributionGain = 50;
    else if (itemId === 'pill_1') contributionGain = 100;
    else if (itemId === 'pill_foundation') contributionGain = 500;
    else if (itemId === 'pill_golden_core') contributionGain = 2000;
    else if (itemId.startsWith('skill_')) contributionGain = 1000;
    else contributionGain = 10;

    if (isMaterial) {
      get().addMaterial(itemId, -1);
    } else if (isInventory) {
      set({ inventory: state.inventory.filter((i: string) => i !== itemId) });
    }

    set({ sectContribution: state.sectContribution + contributionGain });
    return { success: true, message: `捐献成功，获得 ${contributionGain} 点宗门贡献！` };
  },
  winSectCompetition: () => set((state: any) => ({ sectCompetitionWins: (state.sectCompetitionWins || 0) + 1 })),
  promoteSectPosition: () => {
    const state = get();
    const levelIndex = state.levelIndex;

    if (state.sectPosition === 'outer') {
      if (levelIndex < 14) return { success: false, message: '修为不足，需达到筑基期方可晋升内门弟子。' };
      if (state.sectContribution < 1000) return { success: false, message: '宗门贡献不足 1000，无法晋升。' };
      set({ sectPosition: 'inner', sectContribution: state.sectContribution - 1000 });
      return { success: true, message: '修为突破，晋升为内门弟子！' };
    } else if (state.sectPosition === 'inner') {
      if (levelIndex < 18) return { success: false, message: '修为不足，需达到结丹期方可晋升亲传弟子。' };
      if (state.sectContribution < 5000) return { success: false, message: '宗门贡献不足 5000，无法晋升。' };
      set({ sectPosition: 'core', sectContribution: state.sectContribution - 5000 });
      return { success: true, message: '修为突破，晋升为亲传弟子！' };
    } else if (state.sectPosition === 'core') {
      if (levelIndex < 22) return { success: false, message: '修为不足，需达到元婴期方可晋升宗门长老。' };
      if (state.sectContribution < 20000) return { success: false, message: '宗门贡献不足 20000，无法晋升。' };
      set({ sectPosition: 'elder', sectContribution: state.sectContribution - 20000 });
      return { success: true, message: '修为突破，晋升为宗门长老！' };
    } else if (state.sectPosition === 'elder') {
      if (levelIndex < 26) return { success: false, message: '修为不足，需达到化神期方可继任宗主。' };
      if (state.sectContribution < 100000) return { success: false, message: '宗门贡献不足 100000，无法晋升。' };
      set({ sectPosition: 'patriarch', sectContribution: state.sectContribution - 100000 });
      return { success: true, message: '众望所归，继任宗主之位！' };
    }
    return { success: false, message: '已达宗门最高职位。' };
  },
  upgradeSect: () => {
    const state = get();
    if (state.sectPosition !== 'patriarch') {
      return { success: false, message: '只有宗主才能提升宗门能力！' };
    }
    const cost = state.sectLevel * 100000;
    if (state.spiritStones < cost) {
      return { success: false, message: `灵石不足！提升宗门需要 ${cost} 灵石。` };
    }
    set({
      spiritStones: state.spiritStones - cost,
      sectLevel: state.sectLevel + 1
    });
    return { success: true, message: `宗门等级提升至 ${state.sectLevel + 1} 级！全宗门修炼速度提升！` };
  },
  participateImmortalAssembly: () => {
    const state = get();
    if (state.levelIndex < 1) return { success: false, message: '凡人之躯，无法参加升仙大会。' };
    if (!state.spiritualRoot || state.spiritualRoot === 'none') return { success: false, message: '尚未测试灵根，无法参加升仙大会。请先测试灵根。' };
    if (state.sect) return { success: false, message: '你已在宗门之中。' };

    const rand = Math.random();
    let chance = 0.1;
    if (state.spiritualRoot === 'heaven') chance = 1.0;
    else if (state.spiritualRoot === 'dual') chance = 0.8;
    else if (state.spiritualRoot === 'triple') chance = 0.4;

    if (rand < chance) {
      get().joinSect();
      return { success: true, message: '你在升仙大会中表现优异，成功加入宗门！' };
    }
    return { success: false, message: '很遗憾，你未能通过宗门考核。' };
  },
  updateSectNpcs: () => set((state: any) => {
    // 人界天花板 = 化神巅峰（凡人修仙传设定：人界最高化神，突破炼虚必飞升灵界）
    // 化神巅峰 min = 600000，炼虚初期 min = 700000 → 触及 700000 = 飞升灵界
    const ASCEND_THRESHOLD = 700000;  // 炼虚初期门槛 — 触及即飞升
    const ELDER_CAP = 600000;          // 老一辈名 NPC 修为上限（化神巅峰）
    const REPLACEMENT_NAMES = ['新弟子·赵', '新弟子·钱', '新弟子·孙', '新弟子·李', '新弟子·周', '新弟子·吴', '新弟子·郑', '新弟子·王'];

    const updated = state.sectNpcs.map((npc: SectNpc) => {
      let growth = Math.floor(Math.random() * 50);
      if (npc.name === '韩立') {
        growth = Math.floor(Math.random() * 500) + 200;
      } else if (['南宫婉', '紫灵', '银月', '元瑶', '董萱儿', '陈巧倩', '李化元', '红拂', '穹老怪', '向之礼'].includes(npc.name)) {
        growth = Math.floor(Math.random() * 200) + 100;
      } else if (npc.name === '厉飞雨') {
        growth = Math.floor(Math.random() * 10);
      } else if (npc.name.startsWith('新弟子')) {
        growth = Math.floor(Math.random() * 150) + 50;
      }

      let newCultivation = npc.cultivation + growth;

      // 飞升灵界：达到炼虚门槛者飞升，由新弟子递补
      if (newCultivation >= ASCEND_THRESHOLD) {
        const replacementName = REPLACEMENT_NAMES[Math.floor(Math.random() * REPLACEMENT_NAMES.length)] +
          String.fromCharCode(0x4e00 + Math.floor(Math.random() * 100));
        return {
          ...npc,
          name: replacementName,
          cultivation: 500 + Math.floor(Math.random() * 2000),
          level: '凡人',
          ascendedFrom: npc.name,
        };
      }

      // 老一辈名 NPC 卡在化神巅峰（人界天花板）
      const isElder = ['南宫婉', '紫灵', '银月', '元瑶', '李化元', '红拂', '穹老怪', '向之礼'].includes(npc.name);
      if (isElder && newCultivation > ELDER_CAP) {
        newCultivation = ELDER_CAP;
      }

      let newLevel = npc.level;
      for (let i = CULTIVATION_LEVELS.length - 1; i >= 0; i--) {
        if (newCultivation >= CULTIVATION_LEVELS[i].min) {
          newLevel = CULTIVATION_LEVELS[i].name;
          break;
        }
      }

      return {
        ...npc,
        cultivation: newCultivation,
        level: newLevel,
      };
    });

    return { sectNpcs: updated };
  }),
  advanceStory: () => set((state: any) => {
    if (state.storyNode >= 3) {
      return { storyChapter: state.storyChapter + 1, storyNode: 0 };
    }
    return { storyNode: state.storyNode + 1 };
  }),
  contributeToGlobalEvent: (amount: number) => set((state: any) => {
    if (!state.globalEvent || state.globalEvent.status !== 'active') return state;
    if (state.spiritStones < amount) return state;

    const newProgress = Math.min(state.globalEvent.target, state.globalEvent.progress + amount);
    const newStatus = newProgress >= state.globalEvent.target ? 'completed' : 'active';
    return {
      spiritStones: state.spiritStones - amount,
      globalEvent: {
        ...state.globalEvent,
        progress: newProgress,
        status: newStatus
      }
    };
  }),
  // V7.0: 宗门争霸
  startSectWar: () => {
    const state = get();
    if (!state.sect) return { success: false, message: '需要加入宗门' };
    if (state.sectWar.active) return { success: false, message: '宗门战已在进行中' };
    const now = Date.now();
    const contributions: Record<string, number> = {};
    SECTS.forEach((s: any) => { contributions[s.id] = 0; });
    set({
      sectWar: {
        active: true,
        weekNumber: state.sectWar.weekNumber,
        startTime: now,
        endTime: now + 7 * 24 * 60 * 60 * 1000,
        contributions,
        playerContribution: 0,
        playerAttacksLeft: 5,
        rewardsClaimed: false,
        battleLog: [`【宗门战】第 ${state.sectWar.weekNumber} 周七派会武正式开始！`],
        mvp: null,
      },
    });
    return { success: true, message: '七派会武开始！进攻其他宗门为本宗争光！' };
  },
  attackInSectWar: () => {
    const state = get();
    if (!state.sectWar.active) return { success: false, message: '宗门战未开启' };
    if (!state.sect) return { success: false, message: '需要加入宗门' };
    if (state.sectWar.playerAttacksLeft <= 0) return { success: false, message: '今日进攻次数已用完' };

    const SECT_WAR_REWARDS = [
      { rank: 1, stones: 5000, desc: '霸者之证', bonus: '全宗弟子饮水修为 +50%，持续一周' },
      { rank: 2, stones: 3000, desc: '强者之名', bonus: '全宗弟子饮水修为 +30%，持续一周' },
      { rank: 3, stones: 1500, desc: '勇士之荣', bonus: '全宗弟子饮水修为 +15%，持续一周' },
    ];

    const enemies = SECTS.filter((s: any) => s.id !== state.sect);
    const target = enemies[Math.floor(Math.random() * enemies.length)];

    const playerPower = state.bonusPoints / 100 + state.levelIndex * 10;
    const damage = Math.floor(Math.random() * playerPower) + 10;

    const newContributions = { ...state.sectWar.contributions };
    newContributions[state.sect!] = (newContributions[state.sect!] || 0) + damage;

    set((s: any) => ({
      sectWar: {
        ...s.sectWar,
        contributions: newContributions,
        playerContribution: s.sectWar.playerContribution + damage,
        playerAttacksLeft: s.sectWar.playerAttacksLeft - 1,
        battleLog: [...s.sectWar.battleLog, `你进攻【${target.name}】，造成 ${damage} 点伤害！`].slice(-20),
      },
      sectContribution: s.sectContribution + Math.floor(damage / 10),
    }));

    return { success: true, message: `进攻【${target.name}】成功！造成 ${damage} 点伤害`, damage };
  },
  claimSectWarRewards: () => {
    const state = get();
    const SECT_WAR_REWARDS = [
      { rank: 1, stones: 5000, desc: '霸者之证', bonus: '全宗弟子饮水修为 +50%，持续一周' },
      { rank: 2, stones: 3000, desc: '强者之名', bonus: '全宗弟子饮水修为 +30%，持续一周' },
      { rank: 3, stones: 1500, desc: '勇士之荣', bonus: '全宗弟子饮水修为 +15%，持续一周' },
    ];
    if (!state.sect || state.sectWar.rewardsClaimed) return { success: false, message: '奖励已领取或不在宗门' };

    const rank = get().getSectWarRank();
    const reward = SECT_WAR_REWARDS.find(r => r.rank === rank);
    if (!reward) return { success: false, message: '未获得排名' };

    set((s: any) => ({
      sectWar: { ...s.sectWar, rewardsClaimed: true },
      spiritStones: s.spiritStones + reward.stones,
    }));
    return { success: true, message: `你的宗门排名第 ${rank}！获得 ${reward.stones}💎！${reward.bonus}` };
  },
  getSectWarRank: () => {
    const state = get();
    if (!state.sect) return 7;
    const sorted = Object.entries(state.sectWar.contributions)
      .sort(([, a], [, b]) => (b as number) - (a as number));
    const idx = sorted.findIndex(([id]) => id === state.sect);
    return idx + 1;
  },
});
