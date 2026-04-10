const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Update AppState interface
content = content.replace(
  /interactWithNpc\?: \(npcId: string, action: 'chat' \| 'gift' \| 'spar'\) => \{ message: string \} \| void;/,
  `interactWithNpc?: (npcId: string, action: 'chat' | 'gift' | 'spar' | 'rob' | 'kill') => { message: string, success?: boolean, loot?: any } | void;
  annihilateSect?: (sectId: string) => { success: boolean; message: string; loot?: { spiritStones: number } };
  deadNpcs: string[];
  destroyedSects: string[];`
);

// 2. Update initialState type
content = content.replace(
  /\| 'storyProgress'>> = \{/,
  `| 'storyProgress' | 'deadNpcs' | 'destroyedSects'>> = {`
);

// 3. Update initialState values
content = content.replace(
  /pendingStreakRescue: null,/,
  `pendingStreakRescue: null,
  deadNpcs: [],
  destroyedSects: [],`
);

// 4. Add implementations to useStore
const implementation = `
      annihilateSect: (sectId) => {
        const state = get();
        const sect = SECTS.find(s => s.id === sectId);
        if (!sect) return { success: false, message: '宗门不存在' };
        
        // Simple combat logic: player cultivation vs sect's assumed power (based on region)
        const regionPower = {
          '凡人界': 10000,
          '天南': 100000,
          '乱星海': 500000,
          '大晋': 2000000,
          '灵界': 10000000,
          '仙界': 100000000
        };
        const sectPower = regionPower[sect.region as keyof typeof regionPower] || 50000;
        
        if (state.experience > sectPower * 1.5) {
          // Success
          const lootStones = Math.floor(sectPower * 0.1);
          set({
            destroyedSects: [...state.destroyedSects, sectId],
            spiritStones: state.spiritStones + lootStones,
            experience: state.experience + Math.floor(sectPower * 0.05)
          });
          return { success: true, message: \`你以绝对实力覆灭了\${sect.name}，搜刮了宗门宝库！\`, loot: { spiritStones: lootStones } };
        } else {
          // Fail
          set({
            experience: Math.max(0, state.experience - Math.floor(state.experience * 0.1))
          });
          return { success: false, message: \`你试图覆灭\${sect.name}，却被其护宗大阵和底蕴重创，修为大损！\` };
        }
      },

      interactWithNpc: (npcId, action) => {
        const state = get();
        // Need to reference sectNpcs from the file context, assuming it's imported or defined above
        const npc = sectNpcs.find(n => n.id === npcId);
        if (!npc) return { message: 'NPC不存在' };
        if (state.deadNpcs.includes(npcId)) return { message: '此人已身死道消' };

        if (action === 'chat') {
          return { message: \`你与\${npc.name}论道一番，颇有感悟。\` };
        } else if (action === 'gift') {
          if (state.spiritStones < 100) return { message: '灵石不足' };
          set({ spiritStones: state.spiritStones - 100 });
          return { message: \`你赠予\${npc.name} 100灵石，对方颇为喜悦。\` };
        } else if (action === 'spar') {
          return { message: \`你与\${npc.name}切磋了一番，印证了所学。\` };
        } else if (action === 'rob' || action === 'kill') {
          const playerPower = state.experience;
          const npcPower = npc.cultivation;
          
          if (playerPower > npcPower) {
            const lootStones = Math.floor(npcPower * 0.1) + 100;
            set({
              deadNpcs: [...state.deadNpcs, npcId],
              spiritStones: state.spiritStones + lootStones,
              experience: state.experience + Math.floor(npcPower * 0.05)
            });
            return { success: true, message: \`你击杀了\${npc.name}，夺取了其储物袋！\`, loot: { spiritStones: lootStones } };
          } else {
            set({
              experience: Math.max(0, state.experience - Math.floor(state.experience * 0.1))
            });
            return { success: false, message: \`你试图杀人夺宝，却不敌\${npc.name}，重伤逃遁，修为大损！\` };
          }
        }
      },
`;

content = content.replace(
  /activateSectFormation: \(\) => \{/,
  implementation + '\n      activateSectFormation: () => {'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch combat store complete.');
