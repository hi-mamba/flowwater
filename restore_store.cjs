const fs = require('fs');

let content = fs.readFileSync('./src/store.ts', 'utf8');

const corruptedStart = content.indexOf('  ascend: () => {\\n        const state = get();'.replace(/\\n/g, '\n'));
const corruptedEnd = content.indexOf("  { id: 'q2', title: '外出历练 (4000步)'");

if (corruptedStart !== -1 && corruptedEnd !== -1) {
  const restoredBlock = "  ascend: () => { success: boolean; message: string };\n" +
"  upgradeSect: () => { success: boolean; message: string };\n" +
"  \n" +
"  activateSectFormation: () => { success: boolean; message: string };\n" +
"  sectBuff: { type: string; expiresAt: number } | null;\n" +
"  \n" +
"  // 灵根系统\n" +
"  getSpiritualRootBonus: () => number;\n" +
"  selectFate: (fateId: string) => void;\n" +
"  generateFates: () => void;\n" +
"  openChest: () => any;\n" +
"  addChest: (amount: number) => void;\n" +
"  gatherMaterials: () => void;\n" +
"  learnSkill: (id: string) => void;\n" +
"  equipSkill: (id: string) => void;\n" +
"  unequipSkill: (id: string) => void;\n" +
"  obtainArtifact: (id: string) => void;\n" +
"  equipArtifact: (id: string) => void;\n" +
"  unequipArtifact: (id: string) => void;\n" +
"  gainSkillProficiency: (id: string, amount: number) => void;\n" +
"  upgradeArtifact: (id: string) => void;\n" +
"  useHeavenlyBottle: (action: 'duplicate' | 'accelerate', targetId?: string) => boolean;\n" +
"  addHeavenlyBottleDrop: (amount: number) => void;\n" +
"  advanceStory: () => void;\n" +
"  contributeToGlobalEvent: (amount: number) => void;\n" +
"  updateSectNpcs: () => void;\n" +
"\n" +
"  // V6.0 Actions\n" +
"  selectCharacter: (characterId: string, customData?: any) => void;\n" +
"  die: (reason: string) => void;\n" +
"  rebirth: (newTalent?: string) => void;\n" +
"  completeStoryNode: (nodeId: string) => void;\n" +
"  consultHeavens: (query: string) => Promise<string>;\n" +
"\n" +
"  addPlan: (plan: Omit<Plan, 'id'>) => void;\n" +
"  updatePlan: (id: string, plan: Partial<Plan>) => void;\n" +
"  deletePlan: (id: string) => void;\n" +
"  companionDailyEvent: () => void;\n" +
"}\n" +
"\n" +
"export const DAILY_QUESTS: Quest[] = [\n" +
"  { id: 'q1', title: '每日吐纳 (1000步)', desc: '吸收天地灵气，稳固根基', target: 1000, progress: 0, reward: 50, completed: false, type: 'step', category: 'main' },\n";

  content = content.substring(0, corruptedStart) + restoredBlock + content.substring(corruptedEnd);
}

const ascendImplStart = content.indexOf('      ascend: () => {\n        const state = get();\n        if (state.levelIndex < 54)');
if (ascendImplStart !== -1) {
  const ascendImplEnd = content.indexOf('      },', ascendImplStart) + 8;
  const newAscendImpl = "      ascend: () => {\n" +
"        const state = get();\n" +
"        const basePower = state.logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0) + state.bonusPoints;\n" +
"        \n" +
"        if (state.currentRegion === '灵界') {\n" +
"          if (basePower < 80000000) return { success: false, message: '修为不足渡劫期，无法感应仙界雷劫。' };\n" +
"          set({ currentRegion: '仙界' });\n" +
"          return { success: true, message: '雷劫过后，你白日飞升，进入仙界！' };\n" +
"        } else if (state.currentRegion !== '仙界') {\n" +
"          if (basePower < 300000) return { success: false, message: '修为不足化神期，无法打破人界壁垒。' };\n" +
"          set({ currentRegion: '灵界' });\n" +
"          return { success: true, message: '你打破了人界壁垒，成功飞升灵界！' };\n" +
"        }\n" +
"        return { success: false, message: '你已在最高位面。' };\n" +
"      },";
  content = content.substring(0, ascendImplStart) + newAscendImpl + content.substring(ascendImplEnd);
}

fs.writeFileSync('./src/store.ts', content, 'utf8');
console.log('Restored store.ts');
