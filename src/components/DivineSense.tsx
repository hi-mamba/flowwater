import { useState } from 'react';
import { useStore, DIVINE_SENSE_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, Eye, Sparkles, Split } from 'lucide-react';

export default function DivineSense() {
  const { divineSense, spiritStones, levelIndex, addSpiritStones } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [meditating, setMeditating] = useState(false);

  const config = DIVINE_SENSE_LEVELS[divineSense.level - 1];
  const nextLevel = DIVINE_SENSE_LEVELS[divineSense.level];
  const canTrain = levelIndex >= 5; // 炼气五层可开始修炼神识

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const train = () => {
    setMeditating(true);
    const gained = 10 + Math.floor(Math.random() * 30) + divineSense.mentalPower;
    const newExp = divineSense.exp + gained;
    let newLevel = divineSense.level;
    if (nextLevel && newExp >= nextLevel.upgradeExp) newLevel++;

    const store = useStore.getState();
    useStore.setState({
      divineSense: {
        ...store.divineSense,
        exp: newExp,
        level: newLevel,
        maxSplit: DIVINE_SENSE_LEVELS[newLevel - 1].maxSplit,
        activeSplits: Math.min(store.divineSense.activeSplits + 1, DIVINE_SENSE_LEVELS[newLevel - 1].maxSplit),
        mentalPower: store.divineSense.mentalPower + 1,
      },
    });

    setTimeout(() => setMeditating(false), 1500);
    if (newLevel > divineSense.level) {
      showToast(`神识突破！${DIVINE_SENSE_LEVELS[newLevel - 1].name}！`);
    } else {
      showToast(`神识修炼 +${gained} 经验`);
    }
  };

  if (!canTrain) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-950/60 to-purple-950/60 backdrop-blur-md border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Brain size={16} className="text-violet-400" />
          <h3 className="text-sm font-bold text-violet-300">大衍诀</h3>
        </div>
        <p className="text-[10px] text-violet-400/40">需炼气五层方可开始修炼神识</p>
      </motion.div>
    );
  }

  const expPercent = nextLevel ? (divineSense.exp / nextLevel.upgradeExp) * 100 : 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-violet-950/60 to-purple-950/60 backdrop-blur-md border border-violet-500/20 rounded-2xl p-5 overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-violet-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neural pulse particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-violet-400/40 rounded-full pointer-events-none"
          animate={{
            x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.div animate={meditating ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : { rotate: 360 }}
              transition={meditating ? { duration: 0.6 } : { duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Brain size={18} className="text-violet-400" />
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-violet-300">大衍诀</h3>
              <span className="text-[10px] text-violet-400/60">{config.name}</span>
            </div>
          </div>
          <span className="text-[10px] text-violet-400/40 font-mono">Lv.{divineSense.level}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <Split size={12} className="text-violet-400 mx-auto mb-0.5" />
            <div className="text-[10px] text-slate-500">分裂</div>
            <div className="text-xs font-bold text-violet-300">{divineSense.activeSplits}/{divineSense.maxSplit}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <Zap size={12} className="text-amber-400 mx-auto mb-0.5" />
            <div className="text-[10px] text-slate-500">神识强度</div>
            <div className="text-xs font-bold text-amber-300">{divineSense.mentalPower}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <Eye size={12} className="text-emerald-400 mx-auto mb-0.5" />
            <div className="text-[10px] text-slate-500">效果</div>
            <div className="text-xs font-bold text-emerald-300">x{config.bonus}</div>
          </div>
        </div>

        {/* Exp bar */}
        {nextLevel && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-violet-400/40 mb-1">
              <span>下一层：{nextLevel.name}</span>
              <span>{divineSense.exp}/{nextLevel.upgradeExp}</span>
            </div>
            <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden border border-violet-500/20">
              <motion.div className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                animate={{ width: `${Math.min(100, expPercent)}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        )}

        <p className="text-[10px] text-violet-400/50 mb-3">{config.effect}</p>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
          onClick={train} disabled={meditating}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold hover:bg-violet-500/20 disabled:opacity-50 transition-all">
          <motion.div animate={meditating ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: Infinity }}>
            <Sparkles size={14} />
          </motion.div>
          <span>{meditating ? '神识修炼中...' : '修炼神识'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
