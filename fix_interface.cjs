const fs = require('fs');

let content = fs.readFileSync('./src/store.ts', 'utf8');

const missingInterfaceMethods = "  getNextReminder: () => any;\n" +
"  addLog: (amount: number, type: string) => void;\n" +
"  removeLog: (id: string) => void;\n" +
"  setHealthData: (steps: number, temp: number | null) => void;\n" +
"  checkIn: () => void;\n" +
"  pendingStreakRescue: boolean;\n" +
"  rescueStreak: (rescue: boolean) => void;\n" +
"  claimQuestReward: (questId: string) => void;\n" +
"  claimSectMissionReward: (missionId: string) => void;\n" +
"  buyItem: (itemId: string) => void;\n" +
"  sellItem: (itemId: string) => void;\n" +
"  promoteSectPosition: () => void;\n" +
"  testSpiritualRoot: () => void;\n" +
"  joinSect: (sectId: string) => void;\n" +
"  leaveSect: () => void;\n" +
"  addSectContribution: (amount: number) => void;\n" +
"  donateToSect: (amount: number) => void;\n" +
"  setHighestLevelReached: (level: string) => void;\n" +
"  unlockAchievement: (id: string) => void;\n" +
"  attemptBreakthrough: () => void;\n" +
"  setLevelIndex: (index: number) => void;\n" +
"  addSpiritStones: (amount: number) => void;\n" +
"  winSectCompetition: () => void;\n" +
"  togglePlan: (id: string) => void;\n" +
"  markKnowledgeLearned: (id: string) => void;\n" +
"  rejoinSect: (sectId: string) => void;\n" +
"  updateSettings: (settings: any) => void;\n" +
"  resetCultivation: () => void;\n" +
"  updateQuestProgress: (type: string, amount: number) => void;\n" +
"  washMarrow: () => void;\n" +
"  claimDailyReward: () => void;\n" +
"  claimOfflineGains: () => void;\n";

const missingFunctions = "const generateDailyQuests = (): Quest[] => {\n" +
"  return DAILY_QUESTS.map(q => ({ ...q }));\n" +
"};\n";

// Remove duplicate companionDailyEvent if any
content = content.replace(/companionDailyEvent: \(\) => void;\n\s*companionDailyEvent: \(\) => void;/g, 'companionDailyEvent: () => void;');

// Insert missing interface methods before the closing brace of AppState
const appStateEnd = content.indexOf('}\n\nexport const DAILY_QUESTS: Quest[] = [');
if (appStateEnd !== -1) {
  content = content.substring(0, appStateEnd) + missingInterfaceMethods + content.substring(appStateEnd);
}

// Insert missing functions after DAILY_QUESTS
const dailyQuestsEnd = content.indexOf('];', appStateEnd) + 2;
if (dailyQuestsEnd !== -1) {
  content = content.substring(0, dailyQuestsEnd) + '\n' + missingFunctions + content.substring(dailyQuestsEnd);
}

fs.writeFileSync('./src/store.ts', content, 'utf8');
console.log('Fixed missing interface methods');
