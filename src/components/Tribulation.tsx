import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Skull, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStore, TRIBULATION_TYPES } from '../store';
import { useEffect, useRef, useState, useCallback } from 'react';

const STRIKE_INTERVAL_MS = 80; // 单道雷之间的间隔（视觉节奏，不再阻塞玩家）

export default function Tribulation() {
  const {
    tribulation,
    surviveTribulationStrike,
    cancelTribulation,
    getTribulationDiagnosis,
  } = useStore();
  const [result, setResult] = useState<{ success: boolean; message: string; survived: boolean } | null>(null);
  const [phase, setPhase] = useState<'preview' | 'running'>('preview');
  const [isAnimating, setIsAnimating] = useState(false);
  const runningRef = useRef(false);

  // 当一次新的天劫被触发，重置到 preview 阶段
  useEffect(() => {
    if (tribulation.active && tribulation.currentStrike === 1 && tribulation.survivedStrikes === 0) {
      setPhase('preview');
      setResult(null);
      runningRef.current = false;
    }
  }, [tribulation.active, tribulation.currentStrike, tribulation.survivedStrikes]);

  // 自动连击：进入 running 阶段后，每 STRIKE_INTERVAL_MS 触发一道雷，直到结束
  useEffect(() => {
    if (phase !== 'running' || !tribulation.active || runningRef.current) return;
    runningRef.current = true;

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setIsAnimating(true);
      const r = surviveTribulationStrike();
      const stillActive = useStore.getState().tribulation.active;
      // 短暂高亮后继续下一道；结束则展示结果
      setTimeout(() => {
        setIsAnimating(false);
        if (cancelled) return;
        if (!stillActive) {
          setResult(r);
          runningRef.current = false;
        } else {
          tick();
        }
      }, STRIKE_INTERVAL_MS);
    };
    tick();

    return () => { cancelled = true; runningRef.current = false; };
  }, [phase, tribulation.active, surviveTribulationStrike]);

  const handleStartAuto = useCallback(() => {
    setPhase('running');
  }, []);

  const handleDismissResult = useCallback(() => {
    setResult(null);
    setPhase('preview');
    cancelTribulation();
  }, [cancelTribulation]);

  if (!tribulation.active && !result) return null;

  const config = tribulation.type ? TRIBULATION_TYPES[tribulation.type] : null;
  const diagnosis = tribulation.type ? getTribulationDiagnosis() : { applied: [], missing: [], overallRate: 0 };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-sm p-6 overflow-y-auto"
      >
        <div className="flex flex-col items-center max-w-sm w-full my-auto">
          {/* Result overlay */}
          {result && !tribulation.active && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center w-full"
            >
              {result.survived ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle size={48} className="text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-300 mb-2">渡劫成功！</h2>
                  <p className="text-sm text-emerald-400/80 text-center mb-6 max-w-xs whitespace-pre-line">{result.message}</p>
                  <button
                    onClick={handleDismissResult}
                    className="w-full py-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-200 text-base font-bold hover:bg-emerald-500/30 transition-all"
                  >
                    踏入新境界
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                    <Skull size={48} className="text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-2">渡劫失败</h2>
                  <p className="text-xs text-red-300/90 text-left mb-6 w-full whitespace-pre-line bg-red-950/30 border border-red-500/20 rounded-xl p-3 max-h-64 overflow-y-auto">{result.message}</p>
                  <button
                    onClick={handleDismissResult}
                    className="w-full py-3 rounded-2xl bg-red-500/20 border-2 border-red-500/40 text-red-200 text-base font-bold hover:bg-red-500/30 transition-all"
                  >
                    我已知晓
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* === Preview 阶段：展示诊断面板 + 一键开始 === */}
          {tribulation.active && phase === 'preview' && config && (
            <>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-red-500/10 flex items-center justify-center mb-4 shadow-[0_0_80px_rgba(234,179,8,0.3)]"
              >
                <Zap size={48} className="text-yellow-400" />
              </motion.div>

              <h2 className="text-xl font-bold text-yellow-300 mb-1">{config.name}降临</h2>
              <p className="text-sm text-yellow-400/60 mb-4">共 {config.strikes} 道雷劫</p>

              {/* 整体存活率 */}
              <div className="w-full bg-slate-800/60 rounded-xl p-4 mb-3 text-center">
                <div className="text-[10px] text-slate-400 mb-1">整体渡劫成功率</div>
                <div className={`text-3xl font-bold ${diagnosis.overallRate >= 0.7 ? 'text-emerald-400' : diagnosis.overallRate >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(diagnosis.overallRate * 100)}%
                </div>
              </div>

              {/* 已生效加成 */}
              {diagnosis.applied.length > 0 && (
                <div className="w-full mb-3">
                  <div className="text-[11px] text-emerald-400/80 mb-1.5 font-semibold">✅ 已生效</div>
                  <div className="space-y-1">
                    {diagnosis.applied.map((a, i) => (
                      <div key={i} className="flex justify-between text-[11px] bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                        <span className="text-emerald-200">{a.name}</span>
                        <span className="text-emerald-300/80">{a.effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 缺失项 / 强化建议 */}
              {diagnosis.missing.length > 0 && (
                <div className="w-full mb-4">
                  <div className="text-[11px] text-amber-400/80 mb-1.5 font-semibold flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    可加强（提升成功率）
                  </div>
                  <div className="space-y-1.5">
                    {diagnosis.missing.map((m, i) => (
                      <div key={i} className="text-[11px] bg-amber-950/20 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-amber-200 font-semibold">{m.name}</span>
                          <span className="text-amber-300/80">{m.effect}</span>
                        </div>
                        <div className="text-amber-100/50 text-[10px] leading-snug">{m.how}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 行动按钮 */}
              <button
                onClick={handleStartAuto}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500/40 text-yellow-300 text-base font-bold hover:bg-yellow-500/30 transition-all shadow-[0_0_30px_rgba(234,179,8,0.15)] mb-2"
              >
                <Shield size={20} />
                <span>开始渡劫（一键直至结束）</span>
              </button>
              <button
                onClick={() => { cancelTribulation(); setPhase('preview'); }}
                className="w-full py-2.5 rounded-2xl bg-slate-700/40 border border-slate-600/40 text-slate-300 text-sm hover:bg-slate-700/60 transition-all"
              >
                暂缓渡劫（返回准备）
              </button>
            </>
          )}

          {/* === Running 阶段：自动连击进度 === */}
          {tribulation.active && phase === 'running' && config && (
            <>
              <motion.div
                animate={isAnimating ? { scale: [1, 1.3, 0.9, 1], rotate: [0, 5, -5, 0] } : { scale: [1, 1.05, 1] }}
                transition={isAnimating ? { duration: 0.15 } : { duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-red-500/10 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(234,179,8,0.3)]"
              >
                <Zap size={56} className="text-yellow-400" />
              </motion.div>

              <h2 className="text-xl font-bold text-yellow-300 mb-1">{config.name}</h2>
              <p className="text-sm text-yellow-400/60 mb-6">
                第 {tribulation.currentStrike} / {tribulation.totalStrikes} 道
              </p>

              <div className="w-full h-3 bg-slate-800/80 rounded-full mb-6 overflow-hidden border border-yellow-500/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-400 rounded-full"
                  animate={{ width: `${(tribulation.survivedStrikes / tribulation.totalStrikes) * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 mb-1">已渡过</div>
                  <div className="text-lg font-bold text-emerald-400">{tribulation.survivedStrikes}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 mb-1">剩余闪避</div>
                  <div className="text-lg font-bold text-purple-400">{tribulation.dodgeCharges}</div>
                </div>
              </div>

              <div className="text-xs text-yellow-300/60 text-center">
                雷劫连续降临中…
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
