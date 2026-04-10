const fs = require('fs');
const path = './src/pages/Home.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Import CombatAnimation
content = content.replace(
  /import \{ PalmBottleModal \} from '\.\.\/components\/PalmBottleModal';/,
  `import { PalmBottleModal } from '../components/PalmBottleModal';\nimport { CombatAnimation } from '../components/CombatAnimation';`
);

// 2. Add combatState
content = content.replace(
  /const \[toastMessage, setToastMessage\] = useState<string \| null>\(null\);/,
  `const [toastMessage, setToastMessage] = useState<string | null>(null);\n  const [combatState, setCombatState] = useState<{ isOpen: boolean; attackerName: string; defenderName: string; isVictory: boolean; message: string; loot?: { spiritStones?: number } } | null>(null);`
);

// 3. Add 'factions' to activeQuestTab type
content = content.replace(
  /const \[activeQuestTab, setActiveQuestTab\] = useState<'quests' \| 'ranking' \| 'competition' \| 'sectWar' \| 'hall' \| 'members'>\('quests'\);/,
  `const [activeQuestTab, setActiveQuestTab] = useState<'quests' | 'ranking' | 'competition' | 'sectWar' | 'hall' | 'members' | 'factions'>('quests');`
);

// 4. Add Factions tab button
content = content.replace(
  /<button \n\s*onClick=\{\(\) => setActiveQuestTab\('members'\)\}/,
  `<button 
                      onClick={() => setActiveQuestTab('factions')}
                      className={\`text-sm font-bold flex items-center transition-colors whitespace-nowrap \${activeQuestTab === 'factions' ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'}\`}
                    >
                      <Skull size={16} className="mr-1" /> 天下势力
                    </button>
                    <button 
                      onClick={() => setActiveQuestTab('members')}`
);

// 5. Add "杀人夺宝" button to members tab
content = content.replace(
  /切磋\n\s*<\/button>\n\s*<\/div>/g,
  `切磋
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'rob');
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: npc.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors"
                          >
                            杀人夺宝
                          </button>
                        </div>`
);

// 6. Add factions tab content
const factionsContent = `
              ) : activeQuestTab === 'factions' ? (
                <div className="space-y-4">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-rose-400 font-bold mb-1">天下势力</h3>
                    <p className="text-[10px] text-slate-400">修仙界弱肉强食，实力为尊。若实力足够，可覆灭宗门夺取底蕴。</p>
                  </div>
                  
                  <div className="space-y-3">
                    {SECTS.filter(s => !useStore.getState().destroyedSects?.includes(s.id)).map(s => (
                      <div key={s.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-rose-300 mr-2">{s.name}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{s.region}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {s.desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => {
                              const result = useStore.getState().annihilateSect?.(s.id);
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: s.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                          >
                            <Skull size={14} className="mr-1" /> 覆灭宗门
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
`;

content = content.replace(
  /\) : activeQuestTab === 'members' \? \(/,
  factionsContent + `) : activeQuestTab === 'members' ? (`
);

// 7. Render CombatAnimation
content = content.replace(
  /\{showQuests && \(/,
  `{combatState && combatState.isOpen && (
        <CombatAnimation
          attackerName={combatState.attackerName}
          defenderName={combatState.defenderName}
          isVictory={combatState.isVictory}
          message={combatState.message}
          loot={combatState.loot}
          onClose={() => setCombatState(null)}
        />
      )}
      {showQuests && (`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch Home.tsx combat complete.');
