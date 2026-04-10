const fs = require('fs');

// 1. Patch store.ts
let storeContent = fs.readFileSync('./src/store.ts', 'utf8');

// Update REGIONS to include maxPower
storeContent = storeContent.replace(
  /export const REGIONS = \[[\s\S]*?\];/,
  `export const REGIONS = [
  { id: '凡人界', name: '凡人界', minLevel: 0, maxPower: 600000, description: '凡人居住之地，灵气稀薄。', cost: 0, multiplier: 1.0 },
  { id: '天南', name: '天南', minLevel: 2000, maxPower: 600000, description: '修仙界偏僻之地，资源匮乏。', cost: 100, multiplier: 1.2 },
  { id: '乱星海', name: '乱星海', minLevel: 10000, maxPower: 600000, description: '海外修仙界，妖兽众多，资源丰富。需通过古传送阵前往。', cost: 1000, multiplier: 1.5 },
  { id: '阴冥之地', name: '阴冥之地', minLevel: 50000, maxPower: 600000, description: '阴气极重之地，传闻有鬼修出没。', cost: 5000, multiplier: 1.8 },
  { id: '大晋', name: '大晋', minLevel: 100000, maxPower: 600000, description: '人界修炼圣地，宗门林立，资源极度丰富。', cost: 10000, multiplier: 2.2 },
  { id: '灵界', name: '灵界', minLevel: 300000, maxPower: 80000000, description: '更高层次的世界，灵气浓郁，强者如云。', cost: 100000, multiplier: 3.0 },
  { id: '仙界', name: '仙界', minLevel: 80000000, maxPower: Infinity, description: '真仙界，长生久视。', cost: 10000000, multiplier: 5.0 },
];`
);

// Update annihilateSect and interactWithNpc
storeContent = storeContent.replace(
  /annihilateSect: \(sectId\) => \{[\s\S]*?interactWithNpc: \(npcId, action\) => \{[\s\S]*?\},/g,
  `annihilateSect: (sectId) => {
        const state = get();
        const sect = SECTS.find(s => s.id === sectId);
        if (!sect) return { success: false, message: '宗门不存在' };
        
        let sectPower = 50000;
        if (sect.id.includes('qixuan') || sect.id.includes('yelang')) sectPower = 10000;
        else if (sect.id.includes('huangfeng') || sect.id.includes('yanyue')) sectPower = 100000;
        else if (sect.id.includes('xinggong') || sect.id.includes('nixing')) sectPower = 500000;
        else if (sect.id.includes('yinluo') || sect.id.includes('xiaoji')) sectPower = 2000000;
        else if (sect.id.includes('tianyuan') || sect.id.includes('jiuyuan')) sectPower = 10000000;
        else sectPower = 500000;

        const basePower = state.logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0) + state.bonusPoints;
        const region = REGIONS.find(r => r.id === state.currentRegion);
        const maxPower = region?.maxPower || Infinity;
        const playerPower = Math.min(basePower, maxPower);
        
        if (playerPower > sectPower * 1.2) {
          const lootStones = Math.floor(sectPower * 0.1);
          set({
            destroyedSects: [...(state.destroyedSects || []), sectId],
            spiritStones: state.spiritStones + lootStones,
            experience: state.experience + Math.floor(sectPower * 0.05)
          });
          return { success: true, message: \`你以绝对实力覆灭了\${sect.name}，搜刮了宗门宝库！(你的战力:\${Math.floor(playerPower)} vs 宗门底蕴:\${sectPower})\`, loot: { spiritStones: lootStones } };
        } else {
          set({
            experience: Math.max(0, state.experience - Math.floor(state.experience * 0.1))
          });
          return { success: false, message: \`你试图覆灭\${sect.name}，却被其护宗大阵和底蕴重创，修为大损！(你的战力被界面法则压制在:\${Math.floor(playerPower)} vs 宗门底蕴:\${sectPower})\` };
        }
      },

      interactWithNpc: (npcId, action) => {
        const state = get();
        const npc = sectNpcs.find(n => n.id === npcId);
        if (!npc) return { message: 'NPC不存在' };
        if (state.deadNpcs?.includes(npcId)) return { message: '此人已身死道消' };

        if (action === 'chat') {
          return { message: \`你与\${npc.name}论道一番，颇有感悟。\` };
        } else if (action === 'gift') {
          if (state.spiritStones < 100) return { message: '灵石不足' };
          set({ spiritStones: state.spiritStones - 100 });
          return { message: \`你赠予\${npc.name} 100灵石，对方颇为喜悦。\` };
        } else if (action === 'spar') {
          return { message: \`你与\${npc.name}切磋了一番，印证了所学。\` };
        } else if (action === 'rob' || action === 'kill') {
          const basePower = state.logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0) + state.bonusPoints;
          const region = REGIONS.find(r => r.id === state.currentRegion);
          const maxPower = region?.maxPower || Infinity;
          const playerPower = Math.min(basePower, maxPower);
          const npcPower = npc.cultivation;
          
          if (playerPower > npcPower) {
            const lootStones = Math.floor(npcPower * 0.1) + 100;
            set({
              deadNpcs: [...(state.deadNpcs || []), npcId],
              spiritStones: state.spiritStones + lootStones,
              experience: state.experience + Math.floor(npcPower * 0.05)
            });
            return { success: true, message: \`你击杀了\${npc.name}，夺取了其储物袋！(你的战力:\${Math.floor(playerPower)} vs 对方:\${npcPower})\`, loot: { spiritStones: lootStones } };
          } else {
            set({
              experience: Math.max(0, state.experience - Math.floor(state.experience * 0.1))
            });
            return { success: false, message: \`你试图杀人夺宝，却不敌\${npc.name}，重伤逃遁，修为大损！(你的战力被界面法则压制在:\${Math.floor(playerPower)} vs 对方:\${npcPower})\` };
          }
        }
      },`
);

// Update exploreRealm to include NPC combat
storeContent = storeContent.replace(
  /if \(rand < 0\.1\) return applyReward\(\{ type: 'pill', itemId: 'pill_1', amount: 1 \}\);/,
  `if (rand < 0.15) {
            const region = REGIONS.find(r => r.id === state.currentRegion);
            const maxPower = region?.maxPower || 600000;
            const minPower = region?.minLevel || 0;
            const enemyPower = minPower + Math.random() * (maxPower - minPower) * 0.5;
            
            const basePower = state.logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0) + state.bonusPoints;
            const playerPower = Math.min(basePower, maxPower);
            
            const isVictory = playerPower > enemyPower;
            const lootStones = isVictory ? Math.floor(enemyPower * 0.1) + 50 : 0;
            
            if (isVictory) {
              set({ spiritStones: state.spiritStones + lootStones });
            } else {
              set({ experience: Math.max(0, state.experience - Math.floor(state.experience * 0.05)) });
            }
            
            return { 
              type: 'combat', 
              enemyName: state.currentRegion + '修士', 
              isVictory, 
              message: isVictory ? \`你在秘境中遭遇\${state.currentRegion}修士，一番激战后将其击杀！(战力:\${Math.floor(playerPower)} vs \${Math.floor(enemyPower)})\` : \`你在秘境中遭遇强敌，不敌败退，修为受损！(战力:\${Math.floor(playerPower)} vs \${Math.floor(enemyPower)})\`,
              loot: isVictory ? { spiritStones: lootStones } : undefined
            };
          }
          if (rand < 0.2) return applyReward({ type: 'pill', itemId: 'pill_1', amount: 1 });`
);

// Update ascend logic
storeContent = storeContent.replace(
  /ascend: \(\) => \{[\s\S]*?\},/,
  `ascend: () => {
        const state = get();
        const basePower = state.logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0) + state.bonusPoints;
        
        if (state.currentRegion === '灵界') {
          if (basePower < 80000000) return { success: false, message: '修为不足渡劫期，无法感应仙界雷劫。' };
          set({ currentRegion: '仙界' });
          return { success: true, message: '雷劫过后，你白日飞升，进入仙界！' };
        } else if (state.currentRegion !== '仙界') {
          if (basePower < 300000) return { success: false, message: '修为不足化神期，无法打破人界壁垒。' };
          set({ currentRegion: '灵界' });
          return { success: true, message: '你打破了人界壁垒，成功飞升灵界！' };
        }
        return { success: false, message: '你已在最高位面。' };
      },`
);

fs.writeFileSync('./src/store.ts', storeContent, 'utf8');

// 2. Patch Home.tsx
let homeContent = fs.readFileSync('./src/pages/Home.tsx', 'utf8');

// Handle combat result in exploreRealm
homeContent = homeContent.replace(
  /const res = exploreRealm\('low'\);\n\s*setExploreResult\(res\);/,
  `const res = exploreRealm('low');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }`
);

homeContent = homeContent.replace(
  /const res = exploreRealm\('mid'\);\n\s*setExploreResult\(res\);/,
  `const res = exploreRealm('mid');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }`
);

homeContent = homeContent.replace(
  /const res = exploreRealm\('high'\);\n\s*setExploreResult\(res\);/,
  `const res = exploreRealm('high');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }`
);

// Render combat result in exploreResult UI
homeContent = homeContent.replace(
  /\{exploreResult\.type === 'monster' \? <Swords size=\{32\} className="text-rose-400" \/> : <Sparkles size=\{32\} className="text-amber-400" \/>\}/,
  `{exploreResult.type === 'monster' || exploreResult.type === 'combat' ? <Swords size={32} className="text-rose-400" /> : <Sparkles size={32} className="text-amber-400" />}`
);

fs.writeFileSync('./src/pages/Home.tsx', homeContent, 'utf8');

console.log('Patch complete.');
