import { useState, Suspense, lazy } from 'react';
import type { ReactElement } from 'react';
import { useStore, SPIRIT_BEASTS, type SpiritBeast as SpiritBeastType } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, PawPrint } from 'lucide-react';

const SpiritBeast3D = lazy(() => import('./three/SpiritBeast3D'));

// ===== 各灵兽 SVG =====

// 血玉蜘蛛：暗红蛛身 + 八腿 + 玉色光泽（韩立在血色禁地收服）
function BloodJadeSpider({ size = 32, stage = 1 }: { size?: number; stage?: number }) {
  const intensity = 0.4 + stage * 0.15;
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}
      style={{ filter: `drop-shadow(0 0 ${stage * 2}px rgba(220,38,38,${intensity}))` }}>
      <defs>
        <radialGradient id="spider-body" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
      </defs>
      {/* 八条腿 */}
      {[
        'M20 20 Q12 10 4 6', 'M20 20 Q10 14 2 14', 'M20 20 Q10 20 2 24', 'M20 20 Q12 26 4 34',
        'M20 20 Q28 10 36 6', 'M20 20 Q30 14 38 14', 'M20 20 Q30 20 38 24', 'M20 20 Q28 26 36 34',
      ].map((d, i) => (
        <path key={i} d={d} stroke="#7f1d1d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ))}
      {/* 头胸 */}
      <ellipse cx="20" cy="15" rx="5" ry="4" fill="url(#spider-body)" />
      {/* 腹部 */}
      <ellipse cx="20" cy="23" rx="7" ry="6" fill="url(#spider-body)" />
      {/* 玉色光斑（血玉特征） */}
      <ellipse cx="18" cy="22" rx="1.5" ry="2" fill="#fca5a5" opacity="0.8" />
      <ellipse cx="22" cy="24" rx="1.2" ry="1.5" fill="#fee2e2" opacity="0.6" />
      {/* 眼 */}
      <circle cx="18" cy="14" r="0.8" fill="#fef2f2" />
      <circle cx="22" cy="14" r="0.8" fill="#fef2f2" />
      <circle cx="18" cy="14" r="0.4" fill="#7f1d1d" />
      <circle cx="22" cy="14" r="0.4" fill="#7f1d1d" />
    </svg>
  );
}

// 啼魂兽：紫黑魂体 + 飘渺魂气 + 哀嚎口形（上古魂兽）
function WailingBeast({ size = 32, stage = 1 }: { size?: number; stage?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}
      style={{ filter: `drop-shadow(0 0 ${stage * 2}px rgba(168,85,247,0.5))` }}>
      <defs>
        <radialGradient id="wail-body" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="50%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
      </defs>
      {/* 飘渺魂气尾迹 */}
      <path d="M20 30 Q15 35 10 38 Q22 36 26 38 Q30 35 30 30 Z"
        fill="url(#wail-body)" opacity="0.4" />
      {/* 主体（半透明魂形） */}
      <path d="M20 8 Q10 8 8 18 Q8 28 14 30 Q20 32 26 30 Q32 28 32 18 Q30 8 20 8 Z"
        fill="url(#wail-body)" opacity="0.9" />
      {/* 双角 */}
      <path d="M14 10 L11 4 M26 10 L29 4" stroke="#4c1d95" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* 哀嚎张口（O 形） */}
      <ellipse cx="20" cy="22" rx="2.5" ry="3" fill="#1e1b4b" />
      <ellipse cx="20" cy="21" rx="1.8" ry="2.2" fill="#581c87" />
      {/* 双眼（无瞳） */}
      <ellipse cx="15" cy="16" rx="1.5" ry="2" fill="#fef3c7" />
      <ellipse cx="25" cy="16" rx="1.5" ry="2" fill="#fef3c7" />
      {/* 高阶光晕 */}
      {stage >= 3 && (
        <circle cx="20" cy="20" r="18" fill="none" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.5" />
      )}
    </svg>
  );
}

// 六翼霜蚣：蓝白冰体 + 多体节 + 六翼展开（上古奇虫）
function SixWingCentipede({ size = 32, stage = 1 }: { size?: number; stage?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}
      style={{ filter: `drop-shadow(0 0 ${stage * 2}px rgba(186,230,253,0.6))` }}>
      <defs>
        <linearGradient id="centi-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="centi-wing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* 六翼（上下各三对） */}
      {[
        { x: 12, y: 8, rot: -30 }, { x: 20, y: 6, rot: 0 }, { x: 28, y: 8, rot: 30 },
        { x: 12, y: 32, rot: 30 }, { x: 20, y: 34, rot: 0 }, { x: 28, y: 32, rot: -30 },
      ].map((w, i) => (
        <ellipse key={i} cx={w.x} cy={w.y} rx="6" ry="3"
          fill="url(#centi-wing)" stroke="#bae6fd" strokeWidth="0.3"
          transform={`rotate(${w.rot} ${w.x} ${w.y})`} />
      ))}
      {/* 多体节身体 */}
      {[10, 16, 22, 28].map((cx) => (
        <circle key={cx} cx={cx} cy="20" r="3.5" fill="url(#centi-body)" stroke="#0c4a6e" strokeWidth="0.4" />
      ))}
      {/* 头部 */}
      <ellipse cx="32" cy="20" rx="3.5" ry="3" fill="url(#centi-body)" stroke="#0c4a6e" strokeWidth="0.4" />
      {/* 触须 */}
      <path d="M34 18 L37 14 M34 22 L37 26" stroke="#0c4a6e" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* 眼 */}
      <circle cx="33" cy="19" r="0.6" fill="#1e1b4b" />
      <circle cx="33" cy="21" r="0.6" fill="#1e1b4b" />
      {/* 冰晶光斑 */}
      <circle cx="16" cy="19" r="0.8" fill="#f0f9ff" opacity="0.8" />
      <circle cx="22" cy="19" r="0.6" fill="#f0f9ff" opacity="0.6" />
    </svg>
  );
}

const BEAST_RENDER: Record<string, (props: { size?: number; stage?: number }) => ReactElement> = {
  blood_jade_spider: BloodJadeSpider,
  wailing_beast: WailingBeast,
  six_wing_centipede: SixWingCentipede,
};

const BEAST_THEME: Record<string, { from: string; border: string; text: string; glow: string }> = {
  blood_jade_spider: { from: 'from-red-950/60', border: 'border-red-500/30', text: 'text-red-300', glow: 'rgba(220,38,38,0.3)' },
  wailing_beast: { from: 'from-purple-950/60', border: 'border-purple-500/30', text: 'text-purple-300', glow: 'rgba(168,85,247,0.3)' },
  six_wing_centipede: { from: 'from-sky-950/60', border: 'border-sky-500/30', text: 'text-sky-300', glow: 'rgba(56,189,248,0.3)' },
};

export default function SpiritBeastComponent() {
  const { spiritBeast, spiritStones, levelIndex } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [showAdopt, setShowAdopt] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const adopt = (beastId: string) => {
    const def = SPIRIT_BEASTS.find(b => b.id === beastId);
    if (!def) return;
    if (levelIndex < def.unlockLevel) { showToast(`需要 ${def.unlockLevel} 级以上`); return; }
    if (spiritBeast.stabled.find(b => b.id === beastId)) { showToast('已经拥有此灵兽'); return; }

    const newBeast: SpiritBeastType = {
      id: def.id, name: def.name, nickname: def.name, type: def.type,
      level: 1, exp: 0, stage: 1, fed: false, affection: 0, abilities: [def.stages[0].effect],
    };

    useStore.setState(s => ({
      spiritBeast: {
        ...s.spiritBeast,
        stabled: [...s.spiritBeast.stabled, newBeast],
        active: s.spiritBeast.active || beastId,
      },
    }));
    showToast(`收养了${def.name}！`);
    setShowAdopt(false);
  };

  const feed = (beastId: string) => {
    if (spiritStones < 50) { showToast('需要 50 灵石'); return; }
    const beast = spiritBeast.stabled.find(b => b.id === beastId);
    if (!beast) return;
    const def = SPIRIT_BEASTS.find(b => b.id === beastId);
    if (!def) return;

    const newExp = beast.exp + 100 + Math.floor(Math.random() * 100);
    let newStage = beast.stage;
    const stageConfig = def.stages[newStage];
    if (stageConfig && newExp >= stageConfig.evolveAt) newStage = Math.min(def.maxStage, newStage + 1);

    useStore.setState(s => ({
      spiritBeast: {
        ...s.spiritBeast,
        stabled: s.spiritBeast.stabled.map(b => b.id === beastId
          ? { ...b, exp: newExp, stage: newStage, fed: true, affection: b.affection + 1, abilities: [def.stages[newStage - 1].effect] }
          : b),
      },
      spiritStones: s.spiritStones - 50,
    }));

    if (newStage > beast.stage) {
      showToast(`${beast.name}进化到${def.stages[newStage - 1].name}！`);
    } else {
      showToast(`喂食成功！${beast.name}好感度 +1`);
    }
  };

  const setActive = (beastId: string) => {
    useStore.setState(s => ({ spiritBeast: { ...s.spiritBeast, active: beastId } }));
    const b = spiritBeast.stabled.find(be => be.id === beastId);
    if (b) showToast(`${b.name}已设为出战灵兽`);
  };

  const availableBeasts = SPIRIT_BEASTS.filter(b => !spiritBeast.stabled.find(sb => sb.id === b.id));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-teal-950/70 via-emerald-950/60 to-slate-900/60 backdrop-blur-md border border-teal-500/20 rounded-2xl p-5 overflow-hidden">

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-teal-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 兽栏氛围粒子 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-teal-400/30 rounded-full pointer-events-none"
          animate={{ x: [Math.random() * 280, Math.random() * 280], y: [Math.random() * 200, Math.random() * 200], opacity: [0, 0.5, 0] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PawPrint size={16} className="text-teal-400" />
            <h3 className="text-sm font-bold bg-gradient-to-r from-teal-300 to-emerald-200 bg-clip-text text-transparent">灵兽</h3>
            <span className="text-[10px] text-teal-400/40">{spiritBeast.stabled.length}/{SPIRIT_BEASTS.length}</span>
          </div>
          {availableBeasts.length > 0 && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdopt(!showAdopt)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300">
              {showAdopt ? '收起' : '收养灵兽'}
            </motion.button>
          )}
        </div>

        {/* 收养列表 */}
        <AnimatePresence>
          {showAdopt && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-3 space-y-1.5 overflow-hidden">
              {availableBeasts.map(b => {
                const Render = BEAST_RENDER[b.id];
                const theme = BEAST_THEME[b.id] || BEAST_THEME.blood_jade_spider;
                const unlocked = levelIndex >= b.unlockLevel;
                return (
                  <motion.button key={b.id} whileTap={{ scale: 0.98 }}
                    onClick={() => adopt(b.id)}
                    disabled={!unlocked}
                    className={`w-full flex items-center space-x-3 p-2.5 rounded-xl text-left border transition-all ${
                      unlocked ? `bg-gradient-to-r ${theme.from} to-slate-900/40 ${theme.border}` : 'bg-slate-800/20 border-slate-700/20 opacity-40'
                    }`}>
                    <div className="flex-shrink-0">
                      {Render ? <Render size={28} stage={1} /> : <PawPrint size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${unlocked ? theme.text : 'text-slate-500'}`}>{b.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{b.desc}</div>
                    </div>
                    {!unlocked && <span className="text-[10px] text-slate-500 flex-shrink-0">Lv.{b.unlockLevel}</span>}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 已收养 */}
        {spiritBeast.stabled.length === 0 ? (
          <p className="text-[10px] text-teal-400/40 mb-3">还没有灵兽，点击上方收养</p>
        ) : (
          <div className="space-y-2 mb-1">
            {spiritBeast.stabled.map(beast => {
              const def = SPIRIT_BEASTS.find(b => b.id === beast.id);
              const stageConfig = def?.stages[beast.stage - 1];
              const nextStage = def?.stages[beast.stage];
              const isActive = spiritBeast.active === beast.id;
              const Render = BEAST_RENDER[beast.id];
              const theme = BEAST_THEME[beast.id] || BEAST_THEME.blood_jade_spider;

              return (
                <motion.div key={beast.id}
                  className={`p-3 rounded-xl border transition-all bg-gradient-to-br ${theme.from} to-slate-900/40 ${
                    isActive ? `${theme.border} shadow-[0_0_12px_${theme.glow}]` : 'border-slate-700/30'
                  }`}
                  style={isActive ? { boxShadow: `0 0 16px ${theme.glow}` } : {}}>
                  {/* 出战灵兽显示 3D 视图 */}
                  {isActive && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-slate-700/40 bg-slate-950/60">
                      <Suspense fallback={<div style={{ height: 200 }} className="flex items-center justify-center text-slate-500 text-xs">召唤中...</div>}>
                        <SpiritBeast3D beastId={beast.id} stage={beast.stage} active={isActive} height={200} />
                      </Suspense>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    {/* 灵兽形象（小预览） */}
                    <motion.div
                      className="flex-shrink-0"
                      animate={isActive ? { y: [0, -2, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {Render ? <Render size={44} stage={beast.stage} /> : <PawPrint size={32} />}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className={`text-xs font-bold ${theme.text}`}>{beast.name}</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40">
                            {stageConfig?.name}
                          </span>
                          {isActive && <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 ${theme.text} border border-teal-500/30`}>出战</span>}
                        </div>
                        <div className="flex items-center space-x-0.5 flex-shrink-0">
                          <Heart size={10} className={beast.affection > 10 ? 'text-pink-400 fill-pink-400/40' : 'text-slate-500'} />
                          <span className="text-[10px] text-slate-400">{beast.affection}</span>
                        </div>
                      </div>

                      {stageConfig && (
                        <p className="text-[10px] text-slate-300/70 mb-1.5 leading-snug">{stageConfig.effect}</p>
                      )}

                      {nextStage && (
                        <div className="mb-1.5">
                          <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                            <span>进化至 {nextStage.name}</span>
                            <span className="font-mono">{beast.exp}/{nextStage.evolveAt}</span>
                          </div>
                          <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/40">
                            <motion.div className={`h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full`}
                              animate={{ width: `${Math.min(100, (beast.exp / nextStage.evolveAt) * 100)}%` }}
                              transition={{ duration: 0.5 }} />
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-1.5">
                        <button onClick={() => feed(beast.id)}
                          className="flex-1 text-[10px] py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 hover:bg-teal-500/20">
                          喂食 (50💎)
                        </button>
                        {!isActive && (
                          <button onClick={() => setActive(beast.id)}
                            className="text-[10px] px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400">
                            出战
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
