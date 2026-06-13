import { useState, useEffect, useCallback } from 'react';
import { useStore, SECTS, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Flame, AlertTriangle, Star, Sparkles, Users, Gift, ScrollText, Zap, Shield, Skull } from 'lucide-react';

interface SectEventChoice {
  id: string; text: string; reward: string; action: () => void;
}

interface SectEvent {
  id: string;
  type: 'tournament' | 'invasion' | 'festival' | 'realm_open' | 'betrayal' | 'alliance' | 'discovery';
  title: string;
  narrative: string;
  choices: SectEventChoice[];
  severity: 'minor' | 'major' | 'epic';
  duration: number;
}

interface SectEventTemplate {
  id: string;
  type: SectEvent['type'];
  title: string;
  narrative: string;
  choices: Omit<SectEventChoice, 'action'>[];
  severity: 'minor' | 'major' | 'epic';
}

const EVENT_TEMPLATES: SectEventTemplate[] = [
  {
    id: 't1', type: 'tournament', title: '宗门大比', severity: 'major',
    narrative: '七派会武的钟声已经敲响！各宗弟子摩拳擦掌，准备在演武场上一较高下。你的宗门需要你！',
    choices: [
      { id: 'participate', text: '报名参赛', reward: '宗门贡献 +200，可能获得功法奖励' },
      { id: 'watch', text: '观战学习', reward: '神识经验 +10' },
    ],
  },
  {
    id: 't2', type: 'tournament', title: '斗法大会', severity: 'minor',
    narrative: '宗门内部举办斗法大会，长老们正在选拔有潜力的弟子。',
    choices: [
      { id: 'fight', text: '上台比试', reward: '灵石 +100，宗门贡献 +50' },
      { id: 'skip', text: '继续修炼', reward: '修为 +200' },
    ],
  },
  {
    id: 'i1', type: 'invasion', title: '魔修来袭', severity: 'epic',
    narrative: '警报！大批魔道修士正在逼近山门！护山大阵已启动，所有弟子立刻备战！',
    choices: [
      { id: 'defend', text: '守卫山门（消耗 30% HP）', reward: '宗门贡献 +500，灵石 +300' },
      { id: 'support', text: '输送灵力维持大阵', reward: '宗门贡献 +200，阵法经验 +5' },
      { id: 'evacuate', text: '护送低阶弟子撤离', reward: '宗门贡献 +150，获得宗门好感' },
    ],
  },
  {
    id: 'i2', type: 'invasion', title: '妖兽潮', severity: 'major',
    narrative: '宗门领地边缘出现大量妖兽，正在向宗门涌来！若不及时阻止，药园和灵脉将遭受破坏。',
    choices: [
      { id: 'hunt', text: '出宗猎杀妖兽', reward: '灵石 +200，妖兽材料 +3' },
      { id: 'trap', text: '布置陷阱防线', reward: '阵法经验 +3，宗门贡献 +100' },
    ],
  },
  {
    id: 'f1', type: 'festival', title: '灵脉庆典', severity: 'minor',
    narrative: '宗门发现了一处新的灵脉！宗主决定举办庆典，所有弟子皆可进入灵脉修炼一日。',
    choices: [
      { id: 'cultivate', text: '进入灵脉修炼', reward: '修为 +1000' },
      { id: 'collect', text: '采集灵脉伴生矿', reward: '灵石 +300，灵材 +2' },
    ],
  },
  {
    id: 'f2', type: 'festival', title: '祖师诞辰', severity: 'minor',
    narrative: '今天是宗门开派祖师的诞辰。宗门举行了盛大的祭祀仪式，并发放丹药给所有弟子。',
    choices: [
      { id: 'attend', text: '参加祭祀', reward: '获得黄龙丹 x2' },
      { id: 'help', text: '帮忙筹备仪式', reward: '宗门贡献 +100' },
    ],
  },
  {
    id: 'r1', type: 'realm_open', title: '上古秘境', severity: 'epic',
    narrative: '一道空间裂缝在宗门附近裂开！长老们探查后发现——这是上古某位大修士遗留的洞府秘境！',
    choices: [
      { id: 'enter', text: '进入秘境探索', reward: '灵石 +500，有概率获得稀有法宝' },
      { id: 'guard', text: '协助长老封印入口', reward: '宗门贡献 +300，阵法经验 +8' },
    ],
  },
  {
    id: 'b1', type: 'betrayal', title: '叛徒！', severity: 'major',
    narrative: '宗门内一名核心弟子被发现在暗中和魔道勾结，盗取宗门秘典！长老会正在商议处置。',
    choices: [
      { id: 'report', text: '向长老会举报', reward: '宗门贡献 +300，宗门地位提升' },
      { id: 'confront', text: '亲自出手阻止', reward: '可能获得叛徒的储物袋（灵石 +500）或受伤' },
      { id: 'ignore', text: '装作不知', reward: '什么也不发生...但道心受染' },
    ],
  },
  {
    id: 'a1', type: 'alliance', title: '宗门联姻', severity: 'minor',
    narrative: '邻宗派遣使者前来，提议两家宗门联姻结盟。若成，两宗弟子可互相交流功法。',
    choices: [
      { id: 'support', text: '支持联姻', reward: '获得邻宗功法加成 +5%' },
      { id: 'oppose', text: '反对（需要宗主权限）', reward: '维持宗门独立性' },
    ],
  },
  {
    id: 'd1', type: 'discovery', title: '古修士遗骸', severity: 'major',
    narrative: '弟子在后山采药时发现了一具古修士遗骸！骸骨旁散落着几件法宝碎片和一枚玉简。',
    choices: [
      { id: 'study', text: '参悟玉简内容', reward: '获得随机功法或秘术' },
      { id: 'collect', text: '收集法宝碎片', reward: '获得稀有炼器材料 x3' },
    ],
  },
];

export default function SectEvents() {
  const { sect, sectStatus, sectContribution, addSectContribution, addSpiritStones, addMaterial, spiritStones, materials, levelIndex } = useStore();
  const [currentEvent, setCurrentEvent] = useState<SectEvent | null>(null);
  const [eventResult, setEventResult] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<{ title: string; result: string; time: number }[]>([]);
  const [cooldown, setCooldown] = useState(0);

  const triggerRandomEvent = useCallback(() => {
    if (!sect || sectStatus !== 'joined' || currentEvent || cooldown > 0) return;

    const weights: Record<string, number> = {
      minor: 50, major: 35, epic: 15,
    };
    const roll = Math.random() * 100;
    let severity: 'minor' | 'major' | 'epic' = 'minor';
    if (roll < 15) severity = 'epic';
    else if (roll < 50) severity = 'major';

    const eligible = EVENT_TEMPLATES.filter(e => e.severity === severity);
    const template = eligible[Math.floor(Math.random() * eligible.length)];

    const event: SectEvent = {
      ...template,
      duration: severity === 'epic' ? 30000 : severity === 'major' ? 20000 : 10000,
      choices: template.choices.map(c => ({
        ...c,
        action: () => {
          handleEventChoice(template.type, c.id);
        },
      })),
    };

    setCurrentEvent(event);
    // Auto-resolve after duration
    setTimeout(() => {
      if (currentEvent) {
        setCurrentEvent(null);
        setCooldown(30);
      }
    }, event.duration);
  }, [sect, sectStatus, currentEvent, cooldown]);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [cooldown]);

  // Auto-trigger events periodically
  useEffect(() => {
    const interval = setInterval(triggerRandomEvent, 45000);
    return () => clearInterval(interval);
  }, [triggerRandomEvent]);

  const handleEventChoice = (type: string, choiceId: string) => {
    let result = '';
    const store = useStore.getState();

    switch (type) {
      case 'tournament':
        if (choiceId === 'participate') {
          const won = Math.random() < 0.5;
          addSectContribution(200);
          result = won ? '你在宗门大比中连胜三场！获得功法奖励！' : '你在大比中表现不俗，虽败犹荣。';
        } else {
          result = '你细心观摩各路高手的对决，对功法有了新的领悟。';
        }
        break;
      case 'invasion':
        if (choiceId === 'defend') {
          const win = Math.random() < 0.6;
          addSectContribution(500);
          addSpiritStones(300);
          result = win ? '你奋勇杀敌，成功击退了魔修主力！' : '你受了些伤，但成功守住了阵地。';
        } else if (choiceId === 'support') {
          addSectContribution(200);
          result = '你的灵力注入大阵，护山大阵光芒四射，将所有来犯之敌挡在门外。';
        } else {
          addSectContribution(150);
          result = '你安全护送低阶弟子撤离，获得了宗门上下的一致称赞。';
        }
        break;
      case 'festival':
        if (choiceId === 'cultivate') {
          useStore.setState(s => ({ bonusPoints: s.bonusPoints + 1000 }));
          result = '灵脉中的浓郁灵气让你修为大增！';
        } else {
          addSpiritStones(300);
          addMaterial('common_herb', 2);
          result = '你采集到了不少灵脉伴生的珍贵矿石。';
        }
        break;
      case 'realm_open':
        if (choiceId === 'enter') {
          const found = Math.random() < 0.3;
          addSpiritStones(500);
          result = found ? '你在秘境中发现了一件上古法宝！' : '秘境探索收获颇丰，获得了不少灵石。';
        } else {
          addSectContribution(300);
          result = '你协助长老们成功封印了秘境入口，防止了空间崩塌。';
        }
        break;
      case 'betrayal':
        if (choiceId === 'report') {
          addSectContribution(300);
          result = '长老会雷霆出手，将叛徒当场擒获。你因举报有功，获得宗门嘉奖。';
        } else if (choiceId === 'confront') {
          const win = Math.random() < 0.4;
          if (win) { addSpiritStones(500); result = '你击败了叛徒，夺回了被盗的秘典！'; }
          else result = '叛徒实力不弱，你未能将其制服。但长老们随后赶到。';
        } else {
          result = '你选择了明哲保身。但内心深处，你知道自己做了一个懦弱的选择。';
        }
        break;
      case 'alliance':
        if (choiceId === 'support') {
          result = '联姻成功！两宗弟子互通有无，你的修炼之路更加宽广。';
        } else {
          result = '你力排众议反对联姻，保持了宗门的独立性。';
        }
        break;
      case 'discovery':
        if (choiceId === 'study') {
          result = '玉简中记载了一门失传已久的秘术！你对修炼有了新的理解。';
        } else {
          addMaterial('profound_iron', 3);
          result = '法宝碎片虽然残破，但材质极为珍贵，可以用来炼制新的法器。';
        }
        break;
      default:
        result = '事件已处理。';
    }

    setEventResult(result);
    setEventHistory(prev => [{ title: currentEvent?.title || '未知事件', result, time: Date.now() }, ...prev].slice(0, 20));

    setTimeout(() => {
      setCurrentEvent(null);
      setEventResult(null);
      setCooldown(30);
    }, 3000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Swords;
      case 'invasion': return Skull;
      case 'festival': return Sparkles;
      case 'realm_open': return Zap;
      case 'betrayal': return AlertTriangle;
      case 'alliance': return Users;
      case 'discovery': return Star;
      default: return ScrollText;
    }
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'epic': return { bg: 'from-amber-500/20 to-red-500/10', border: 'border-amber-500/30', text: 'text-amber-300', badge: '史诗' };
      case 'major': return { bg: 'from-purple-500/20 to-blue-500/10', border: 'border-purple-500/30', text: 'text-purple-300', badge: '重大' };
      default: return { bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: '日常' };
    }
  };

  if (!sect || sectStatus !== 'joined') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <ScrollText size={16} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-300">宗门大事件</h3>
        </div>
        <p className="text-[10px] text-slate-500">加入宗门后，将在此处接收宗门实时事件</p>
      </motion.div>
    );
  }

  const canTrigger = !currentEvent && cooldown === 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden">

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ScrollText size={18} className="text-amber-400" />
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">宗门大事件</h3>
              <p className="text-[10px] text-amber-400/50">
                {SECTS.find(s => s.id === sect)?.name || '宗门'}
                {cooldown > 0 ? ` · 下次事件 ${cooldown}s` : ' · 等待事件中'}
              </p>
            </div>
          </div>
          {canTrigger && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={triggerRandomEvent}
              className="text-[10px] px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
              探查
            </motion.button>
          )}
        </div>

        {/* Active event */}
        <AnimatePresence>
          {currentEvent && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${getSeverityColor(currentEvent.severity).bg} border ${getSeverityColor(currentEvent.severity).border} mb-4`}>
              {/* Event type badge */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getSeverityColor(currentEvent.severity).bg} border ${getSeverityColor(currentEvent.severity).border} ${getSeverityColor(currentEvent.severity).text}`}>
                  {getSeverityColor(currentEvent.severity).badge}
                </span>
                <span className="text-[10px] text-slate-500">
                  {currentEvent.type === 'tournament' ? '比武' :
                   currentEvent.type === 'invasion' ? '外敌' :
                   currentEvent.type === 'festival' ? '庆典' :
                   currentEvent.type === 'realm_open' ? '秘境' :
                   currentEvent.type === 'betrayal' ? '内乱' :
                   currentEvent.type === 'alliance' ? '外交' : '发现'}
                </span>
              </div>

              {!eventResult ? (
                <>
                  <h4 className={`text-sm font-bold ${getSeverityColor(currentEvent.severity).text} mb-2`}>
                    {currentEvent.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{currentEvent.narrative}</p>

                  {/* Choices */}
                  <div className="space-y-1.5">
                    {currentEvent.choices.map(choice => (
                      <motion.button key={choice.id}
                        whileHover={{ scale: 1.01, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={choice.action}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-amber-500/20 transition-all text-left">
                        <span className="text-xs text-white">{choice.text}</span>
                        <span className="text-[10px] text-amber-400/60 ml-2 flex-shrink-0">{choice.reward}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
                  <Trophy size={24} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300">{eventResult}</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event history */}
        {eventHistory.length > 0 && (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            <div className="text-[10px] text-slate-600 mb-1">事件记录</div>
            {eventHistory.slice(0, 8).map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start space-x-2 p-2 rounded-lg bg-slate-800/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-400 font-medium">{entry.title}</div>
                  <div className="text-[10px] text-slate-600 truncate">{entry.result}</div>
                </div>
                <span className="text-[8px] text-slate-700 flex-shrink-0">
                  {new Date(entry.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
