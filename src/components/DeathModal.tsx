import { motion, AnimatePresence } from 'motion/react';
import { Skull, Sparkles, RefreshCcw, ChevronRight, X } from 'lucide-react';

interface DeathModalProps {
  isOpen: boolean;
  reason: string | null;
  rebirthCount: number;
  onRebirth: (talent?: string) => void;
}

export default function DeathModal({ isOpen, reason, rebirthCount, onRebirth }: DeathModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-900 border border-rose-500/30 rounded-[48px] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(244,63,94,0.2)]"
          >
            {/* Header */}
            <div className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                  <Skull size={48} className="text-rose-500 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-white tracking-tighter">道消身死</h2>
                <p className="text-rose-400 font-serif italic mt-4 text-lg">
                  “{reason || '修仙之路，步步惊心，终究是难逃一劫。'}”
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="px-12 py-8 bg-slate-950/50 border-y border-slate-800 flex justify-center space-x-12">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">轮回次数</div>
                <div className="text-3xl font-mono text-white">{rebirthCount}</div>
              </div>
              <div className="w-px h-12 bg-slate-800" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">宿命点数</div>
                <div className="text-3xl font-mono text-amber-400">+{rebirthCount * 100}</div>
              </div>
            </div>

            {/* Rebirth Options */}
            <div className="p-12 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">选择你的转世天赋</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => onRebirth('heaven')}
                  className="group p-6 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">天灵根转世</div>
                      <div className="text-xs text-slate-400 mt-1">修炼速度大幅提升，突破瓶颈几率增加。</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>

                <button
                  onClick={() => onRebirth()}
                  className="group p-6 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                      <RefreshCcw size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">宿命轮回</div>
                      <div className="text-xs text-slate-400 mt-1">继承前世部分因果，获得随机机缘。</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  “身死道不消，轮回再寻仙。”
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
