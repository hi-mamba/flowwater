import type { Puppet, PuppetAutomationConfig, GardenPlot } from './puppetSlice';

export interface Plan {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  intervalMinutes: number;
  active: boolean;
}

export interface SectNpc {
  id: string;
  name: string;
  level: string;
  cultivation: number;
}

export interface Fate {
  id: string;
  type: 'fortune' | 'disaster' | 'encounter';
  title: string;
  desc: string;
  effectType: 'cultivation_multiplier' | 'first_drink_bonus' | 'random_event' | 'none';
  value: number;
}

export interface SkillDef {
  id: string;
  name: string;
  desc: string;
  effectType: 'cultivation_multiplier' | 'first_drink_bonus' | 'streak_bonus';
  value: number;
}

export interface ArtifactDef {
  id: string;
  name: string;
  desc: string;
  effectType: 'herb_growth_speed' | 'cultivation_multiplier' | 'daily_spring_bonus';
  value: number;
}

export interface Log {
  id: string;
  timestamp: number;
  amount: number; // ml
  type?: 'water' | 'coffee' | 'tea' | 'milktea';
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  type: 'demon_invasion' | 'sect_tournament' | 'secret_realm';
  startTime: number;
  endTime: number;
  progress: number;
  target: number;
  status: 'active' | 'completed' | 'failed';
}

export interface Quest {
  id: string;
  title: string;
  target: number;
  progress: number;
  reward: number; // Spirit Stones
  completed: boolean;
  type: 'drink' | 'game' | 'step' | 'meditate' | 'share';
  category: 'main' | 'optional' | 'side';
  desc?: string;
}

export interface Settings {
  vibrationMode: 'heartbeat' | 'breathe' | 'drop' | 'none';
  music: 'stream' | 'forest' | 'boil' | 'none' | 'custom';
  customMusicUrl?: string;
  voiceCommandEnabled: boolean;
  dailyGoal: number; // ml
  systemNotifications?: boolean;
  drinkMultipliers: {
    water: number;
    tea: number;
    coffee: number;
    milktea: number;
  };
}

export interface Herb {
  id: string;
  type: string;
  stage: 'seed' | 'sprout' | 'mature';
  growth: number;
  maxGrowth: number;
  plantedAt: number;
}

export interface Talisman {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'escape';
  effect: number;
  desc: string;
}

export interface Formation {
  id: string;
  name: string;
  type: 'gathering' | 'trapping' | 'killing';
  effect: number;
  desc: string;
}

// V6.0: Heavenly Bottle
export interface HeavenlyBottleState {
  level: number;          // 1-5
  greenLiquid: number;
  maxLiquid: number;
  lastDropTime: number;
  totalDrinksFed: number; // for level-up tracking
}

// V6.0: Lifebound Artifact
export interface LifeboundArtifactState {
  id: string | null;
  name: string | null;
  level: number;
  exp: number;
  refinementCount: number;
}

// V6.0: Gold Devouring Beetles
export interface GoldDevouringBeetlesState {
  count: number;
  stage: number;         // 1-4
  fedToday: boolean;
  evolutionProgress: number;
  autoDefenseUsed: boolean; // today's auto fate negation
}

// V6.0: Heavenly Tribulation
export interface TribulationState {
  active: boolean;
  type: 'three_nine' | 'six_nine' | 'nine_nine' | null;
  currentStrike: number;
  totalStrikes: number;
  survivedStrikes: number;
  dodgeCharges: number;
  startTime: number;
  lastStrikeTime: number;
  targetLevelIndex: number; // the level we're trying to break through to
}

// V7.0: 副本系统
export interface DungeonState {
  active: boolean;
  location: string | null;
  floor: number;
  maxFloor: number;
  hp: number;
  maxHp: number;
  attack: number;
  goldEarned: number;
  itemsFound: string[];
  bossDefeated: boolean;
  cleared: boolean;
  eventType: 'monster' | 'treasure' | 'trap' | 'boss' | 'rest' | null;
  eventData: any;
  todayRuns: number;
  bestFloor: number;
}

export type SpiritContinentId = 'fengyuan' | 'leiming' | 'baxiong' | 'lieyang' | 'xutian' | 'changsheng';

// V7.0: 灵界飞升
export interface SpiritRealmState {
  unlocked: boolean;
  currentContinent: SpiritContinentId | null;
  ascensionProgress: number;
  heavenlyTreasures: string[];
  crossRealmGates: string[];
  lastGateOpen: number;
  realmExplored: number;
}

// V7.0: 宗门争霸
export interface SectWarState {
  active: boolean;
  weekNumber: number;
  startTime: number;
  endTime: number;
  contributions: Record<string, number>;
  playerContribution: number;
  playerAttacksLeft: number;
  rewardsClaimed: boolean;
  battleLog: string[];
  mvp: string | null;
}

// V9.0: 大衍诀·神识系统
export interface DivineSenseState {
  level: number;           // 1-7 层
  exp: number;
  maxSplit: number;        // 最大神识分裂数
  activeSplits: number;    // 当前分裂数
  mentalPower: number;     // 神识强度
  techniques: string[];    // 已学神识秘术
}

// V9.0: 青竹蜂云剑阵
export interface SwordFormationState {
  swords: number;          // 0-72 口飞剑
  maxSwords: number;
  formation: 'none' | 'swarm' | 'dragon' | 'net' | 'storm';
  formationLevel: number;  // 1-5
  bambooSwordsCrafted: number;
  springSwordArtLevel: number; // 青元剑诀层数
}

// V9.0: 灵兽系统
export interface SpiritBeastState {
  active: string | null;
  stabled: SpiritBeast[];
}

export interface SpiritBeast {
  id: string;
  name: string;
  nickname: string;
  type: string;
  level: number;
  exp: number;
  stage: number; // 1-4
  fed: boolean;
  affection: number;
  abilities: string[];
}

// V14.0: 魔渊系统（替换旧 V9.0 魔界入侵）
// 全局潮汐：周期 72h，开放窗口 24h，自然循环。
export interface DemonTideState {
  startTime: number;     // 周期锚点（首次启动时落点）
  cyclePeriodMs: number; // 默认 72*3600*1000
  openWindowMs: number;  // 默认 24*3600*1000
}

export type DemonAbyssDungeonId = 'demon_abyss_qi' | 'demon_abyss_core' | 'demon_abyss_void';
export type DemonAbyssStep = 'idle' | 'narrative' | 'battle' | 'rest' | 'done';

// 副本运行时状态：从入口到结算贯穿一次。
export interface DemonAbyssRunState {
  active: boolean;
  dungeonId: DemonAbyssDungeonId | null;
  bossId: string | null;        // 本次抽到的 BOSS（仅终章用）
  stage: 0 | 1 | 2 | 3;         // 0 = 未开始；1-3 = 节阶进行中
  step: DemonAbyssStep;
  currentNarrativeId: string | null;  // 节阶抽到的剧情节点
  narrativeChoiceId: string | null;   // 玩家选择
  pendingRewards: {
    spiritStones: number;
    materials: Record<string, number>;
    skillPages: number;          // 魔功残页数量（统一一种）
  };
  history: { stage: number; narrativeId: string; choiceId: string; won: boolean }[];
  startedAt: number;
  // 累计：通关次数（解锁称号、计算 buff）
  totalClears: number;
}


// V13.0 修仙奇遇录
export interface AdventureLogEntry {
  id: string;
  timestamp: number;
  regionId: string;
  nodeId: string;
  eventId: string;
  choiceId: string;
  success: boolean;
  message: string;
}

export interface AdventureCombatState {
  active: boolean;
  enemyId: string | null;
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  playerMaxHp: number;
  turn: number;
  lastAction: string;
  lastEnemyAction: string;
  victory: boolean | null; // null = ongoing
}

export interface AdventureState {
  spiritPower: number;
  maxSpiritPower: number;
  currentNode: string | null;
  currentRegion: string | null;
  visitedNodes: string[];
  activeEventId: string | null;
  completedEvents: string[];
  storyFlags: Record<string, boolean>;
  adventureLog: AdventureLogEntry[];
  combat: AdventureCombatState;
  totalExplorations: number;
  todayExplorations: number;
  lastExplorationDate: string | null;
}

export interface CaveState {
  springQi: number;
  lastSpringCollect: number;
  herbs: Herb[];
  furnace: {
    active: boolean;
    recipeId: string | null;
    startTime: number | null;
    endTime: number | null;
  };
}

export interface AppState {
  plans: Plan[];
  logs: Log[];
  settings: Settings;
  todaySteps: number;
  todayTemperature: number | null;
  streakDays: number;
  lastActiveDate: string | null;
  bonusPoints: number; // Cultivation bonus
  spiritStones: number; // Currency
  inventory: string[]; // Owned item IDs
  quests: Quest[];

  // New Lore Stats
  spiritualRoot: string | null;
  sect: string | null;
  sectStatus: 'none' | 'joined' | 'left' | 'betrayed';
  sectPosition: 'outer' | 'inner' | 'core' | 'elder' | 'patriarch';
  sectContribution: number;
  sectCompetitionWins: number;
  age: number;
  lifespan: number;
  baseLuck: number;
  dailyLuck: number;
  sealedLogs: Log[];
  marrowWashProgress: number; // For users with no root
  highestLevelReached: string | null;
  levelIndex: number;
  experience: number;
  learnedKnowledge: string[];
  dailyEncyclopediaItems: string[];
  achievements: string[];

  // V2.1 Additions
  createdAt: number;
  showMarrowWashEvent: boolean;
  setShowMarrowWashEvent: (show: boolean) => void;
  daoCompanion: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex?: number; exp?: number } | null;
  setDaoCompanion: (companion: { id: string; name: string; active: boolean; favorability?: number; dailyInteractions?: number; lastInteractionDate?: string | null; levelIndex?: number; exp?: number } | null) => void;
  marriedCompanions: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[];
  setMarriedCompanions: (companions: { id: string; name: string; active: boolean; favorability: number; dailyInteractions: number; lastInteractionDate: string | null; levelIndex: number; exp?: number }[]) => void;
  unlockedCompanions: string[];
  unlockCompanion: (id: string) => void;
  interactWithCompanion: (type: 'dual_cultivate' | 'gift', companionId?: string, giftItem?: string) => { success: boolean; message: string; reward?: number };
  breakthroughEvent: string | null;
  setBreakthroughEvent: (event: string | null) => void;

  // V3.0 Additions
  playerName: string;
  setPlayerName: (name: string) => void;
  currentRegion: string;
  setCurrentRegion: (region: string) => void;
  isFirstTime: boolean;
  setIsFirstTime: (val: boolean) => void;
  hasDoneFirstDrink: boolean;
  setHasDoneFirstDrink: (val: boolean) => void;
  claimedStreakRewards: number[];
  claimStreakReward: (days: number) => void;
  unlockedTitles: string[];
  currentTitle: string | null;
  setCurrentTitle: (title: string | null) => void;
  cave: CaveState;
  materials: Record<string, number>;
  addMaterial: (id: string, amount: number) => void;
  collectSpring: () => void;
  plantHerb: (type: string) => void;
  waterHerbs: (amount: number) => void;
  harvestHerb: (id: string) => void;
  startAlchemy: (recipeId: string) => void;
  collectPill: () => void;
  speedUpAlchemy: () => void;
  realmExplorationsToday: number;
  realmExplorationTotal: number;
  lastRealmExplorationDate: string | null;
  exploreRealm: (risk: 'low' | 'mid' | 'high') => any; // Returns event result

  activeGame: string | null;
  setActiveGame: (gameId: string | null) => void;
  // V4.0 Additions
  dailyFates: Fate[];
  selectedFate: Fate | null;
  skills: string[];
  equippedSkills: string[];
  skillProficiency: Record<string, number>;
  artifacts: string[];
  equippedArtifacts: string[];
  artifactLevels: Record<string, number>;
  chests: number;
  heavenlyBottleDrops: number;
  storyChapter: number;
  storyNode: number;
  globalEvent: GlobalEvent | null;
  sectNpcs: SectNpc[];

  // V5.0 Additions (Mortal Journey Core)
  talismans: Record<string, number>;
  formations: string[];
  monsterMaterials: Record<string, number>;
  alchemyLevel: number;
  craftingLevel: number;
  talismanLevel: number;
  formationLevel: number;
  sectContributionRank: number;
  sectLevel: number; // V5.0 Additions

  // V6.0 Additions (凡人修仙传核心系统)
  heavenlyBottle: HeavenlyBottleState;
  lifeboundArtifact: LifeboundArtifactState;
  goldDevouringBeetles: GoldDevouringBeetlesState;
  tribulation: TribulationState;
  pendingEncounterId: string | null; // V8.0: triggers encounter modal

  // V7.0 Additions
  dungeon: DungeonState;
  spiritRealm: SpiritRealmState;
  sectWar: SectWarState;

  // V9.0 Additions
  divineSense: DivineSenseState;
  swordFormation: SwordFormationState;
  spiritBeast: SpiritBeastState;

  // V14.0: 魔渊（替换旧魔界入侵）
  demonTide: DemonTideState;
  demonAbyssRun: DemonAbyssRunState;

  // V13.0 修仙奇遇录
  adventure: AdventureState;

  // Actions
  makeTalisman: (id: string) => { success: boolean; message: string };
  makePill: (id: string) => { success: boolean; message: string };
  craftArtifact: (id: string) => { success: boolean; message: string };
  setupFormation: (id: string) => { success: boolean; message: string };
  participateImmortalAssembly: () => { success: boolean; message: string };
  ascend: () => { success: boolean; message: string };
  upgradeSect: () => { success: boolean; message: string };

  // V6.0 凡人修仙传核心系统 Actions
  // 掌天瓶
  collectGreenLiquid: () => number;
  useGreenLiquidRipen: (herbId: string) => { success: boolean; message: string };
  useGreenLiquidDuplicate: (itemId: string) => { success: boolean; message: string };
  // 本命法宝
  bindLifeboundArtifact: (artifactId: string) => { success: boolean; message: string };
  refineLifeboundArtifact: () => { success: boolean; message: string };
  getLifeboundArtifactBonus: () => number;
  // 噬金虫
  feedBeetles: (spiritStones: number) => { success: boolean; message: string };
  getBeetleBonus: () => number;
  // 天劫
  startTribulation: (targetLevelIndex: number) => { success: boolean; message: string };
  surviveTribulationStrike: () => { success: boolean; message: string; survived: boolean };
  cancelTribulation: () => void;
  getTribulationSurvivalRate: () => number;
  getTribulationDiagnosis: () => {
    applied: { name: string; effect: string }[];
    missing: { name: string; effect: string; how: string }[];
    overallRate: number;
  };

  // V7.0 副本系统
  startDungeon: (dungeonId: string) => { success: boolean; message: string };
  exploreDungeon: (action: 'fight' | 'flee' | 'open' | 'rest') => { success: boolean; message: string; event?: string };
  advanceFloor: () => { success: boolean; message: string };
  endDungeon: () => void;

  // V7.0 灵界飞升
  unlockSpiritRealm: () => { success: boolean; message: string };
  exploreSpiritRealm: () => { success: boolean; message: string; reward?: any };
  collectHeavenlyTreasure: (id: string) => { success: boolean; message: string };
  getSpiritRealmMultiplier: () => number;

  // V7.0 宗门争霸
  startSectWar: () => { success: boolean; message: string };
  attackInSectWar: () => { success: boolean; message: string; damage?: number };
  claimSectWarRewards: () => { success: boolean; message: string };
  getSectWarRank: () => number;

  // V14.0 魔渊
  getDemonTidePhase: () => { phase: 'closed' | 'rising' | 'open' | 'closing'; msToNextChange: number };
  enterDemonAbyss: (dungeonId: DemonAbyssDungeonId) => { success: boolean; message: string };
  drawDemonAbyssNarrative: () => { success: boolean; message: string };
  resolveDemonAbyssNarrative: (choiceId: string) => { success: boolean; message: string };
  finishDemonAbyssBattle: (won: boolean, contribution: number) => { success: boolean; message: string };
  retreatFromDemonAbyss: () => { success: boolean; message: string };
  cancelDemonAbyss: () => void;
  devForceDemonTideOpen: () => void; // 仅 dev 模式

  // 灵根系统
  getSpiritualRootBonus: () => number;
  selectFate: (fateId: string) => void;
  generateFates: () => void;
  openChest: () => any;
  addChest: (amount: number) => void;
  gatherMaterials: () => void;
  learnSkill: (id: string) => void;
  equipSkill: (id: string) => void;
  unequipSkill: (id: string) => void;
  obtainArtifact: (id: string) => void;
  equipArtifact: (id: string) => void;
  unequipArtifact: (id: string) => void;
  gainSkillProficiency: (id: string, amount: number) => void;
  upgradeArtifact: (id: string) => void;
  useHeavenlyBottle: (action: 'duplicate' | 'accelerate', targetId?: string) => boolean;
  addHeavenlyBottleDrop: (amount: number) => void;
  advanceStory: () => void;
  contributeToGlobalEvent: (amount: number) => void;
  updateSectNpcs: () => void;

  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlan: (id: string) => void;
  addLog: (amount: number, type?: 'water' | 'coffee' | 'tea' | 'milktea') => number;
  removeLog: (timestamp: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setHealthData: (steps: number, temp: number | null) => void;
  getNextReminder: () => number | null;
  pendingStreakRescue: number | null;
  checkIn: () => void;
  rescueStreak: (usePill: boolean) => boolean;
  updateQuestProgress: (type: 'drink' | 'game' | 'step', amount: number) => void;
  claimQuestReward: (questId: string) => void;
  addSpiritStones: (amount: number) => void;
  buyItem: (id: string, cost: number, isConsumable: boolean, effect: number) => boolean;
  sellItem: (id: string, type: 'material' | 'inventory', amount: number, price: number) => boolean;

  // Lore Actions
  testSpiritualRoot: () => string;
  joinSect: (sectId?: string) => void;
  leaveSect: () => void;
  rejoinSect: (sectId?: string) => void;
  winSectCompetition: () => void;
  addSectContribution: (amount: number) => void;
  donateToSect: (itemId: string) => { success: boolean; message: string };
  promoteSectPosition: () => { success: boolean; message: string };
  addLuck: (amount: number) => void;
  washMarrow: (amount: number) => void;
  setHighestLevelReached: (levelName: string) => void;
  attemptBreakthrough: (useQingxinPill: boolean) => { success: boolean; message: string; tribulation?: boolean };
  setLevelIndex: (index: number) => void;
  resetCultivation: () => void;
  markKnowledgeLearned: (id: string) => void;
  unlockAchievement: (id: string) => void;

  // V13.0 修仙奇遇录 Actions
  addSpiritPower: (amount: number) => void;
  moveToNode: (regionId: string, nodeId: string, cost: number) => { success: boolean; message: string };
  triggerAdventureEvent: (eventId: string) => void;
  makeAdventureChoice: (choiceId: string) => { success: boolean; message: string; reward: any };
  startAdventureCombat: (enemyId: string) => void;
  adventureCombatAction: (action: 'attack' | 'defend' | 'skill' | 'flee') => { success: boolean; message: string; combatOver: boolean; victory: boolean };
  endAdventureCombat: () => void;
  closeAdventureEvent: () => void;
  setAdventureStoryFlag: (flag: string) => void;

  // 傀儡自动化系统
  puppets: Puppet[];
  puppetAutomation: PuppetAutomationConfig;
  puppetActions: number;
  puppetLastTickAt: number;
  puppetActivityLog: { ts: number; text: string }[];
  addPuppet: (p: Puppet) => void;
  removePuppet: (id: string) => void;
  togglePuppetDeployed: (id: string) => void;
  repairPuppet: (id: string) => boolean;
  setPuppetAutomation: (cfg: Partial<PuppetAutomationConfig>) => void;
  togglePuppetAutoSpring: () => void;
  togglePuppetAutoHarvest: () => void;
  togglePuppetAutoReplant: () => void;
  gardenPlots: GardenPlot[];
  plantGardenPlot: (plotId: string, herbId: string) => void;
  plantAllEmptyPlots: (herbId: string, maxPlots: number) => void;
  harvestGardenPlot: (plotId: string) => void;
  clearGardenPlot: (plotId: string) => void;
  addAlchemyQueueItem: (recipeId: string) => void;
  removeAlchemyQueueItem: (recipeId: string) => void;
  moveAlchemyQueueItem: (recipeId: string, dir: -1 | 1) => void;
  addCraftingQueueItem: (recipeId: string) => void;
  removeCraftingQueueItem: (recipeId: string) => void;
  moveCraftingQueueItem: (recipeId: string, dir: -1 | 1) => void;
  getPuppetActionsPerHour: () => number;
  getDeployedPuppetPower: () => number;
  tickPuppetAutomation: () => void;
  getPuppetTypePower: (typeId: string) => number;
}
