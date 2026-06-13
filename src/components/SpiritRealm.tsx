import { useState } from 'react';
import { useStore, SPIRIT_CONTINENTS, HEAVENLY_TREASURES, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Gem, Star, Map, Sparkles, Globe, Zap, Trophy } from 'lucide-react';

export default function SpiritRealm() {
  const { spiritRealm, levelIndex, unlockSpiritRealm, exploreSpiritRealm, collectHeavenlyTreasure, getSpiritRealmMultiplier, bonusPoints } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [exploring, setExploring] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const canUnlock = levelIndex >= 36 && !spiritRealm.unlocked;

  // Not unlocked yet
  if (!spiritRealm.unlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 overflow-hidden relative"
      >
        {/* Mystical particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} className="absolute w-1.5 h-1.5 bg-purple-400/40 rounded-full"
            animate={{ y: ['100%', '-10%'], x: [Math.random() * 100 + '%', Math.random() * 100 + '%'], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4 }} />
        ))}

        <div className="relative flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Globe size={16} className="text-indigo-400" />
            </motion.div>
            <h3 className="text-sm font-bold text-indigo-300">灵界</h3>
          </div>
          {canUnlock ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { const r = unlockSpiritRealm(); showToast(r.message); }}
              className="text-[10px] px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold"
            >
              感应灵界
            </motion.button>
          ) : (
            <span className="text-[10px] text-indigo-400/40">
              {levelIndex < 36 ? `需 ${CULTIVATION_LEVELS[36]?.name || '化神期'}` : ''}
            </span>
          )}
        </div>
        <p className="text-[10px] text-indigo-400/40">化神期修士可感应灵界召唤，飞升更高层次世界</p>
      </motion.div>
    );
  }

  // Unlocked — show spirit realm
  const continent = SPIRIT_CONTINENTS.find(c => c.id === spiritRealm.currentContinent);
  const multiplier = getSpiritRealmMultiplier();
  const continentTreasures = continent ? HEAVENLY_TREASURES.filter(t => t.continent === continent.id && !spiritRealm.heavenlyTreasures.includes(t.id)) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 overflow-hidden relative"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-indigo-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
            <Globe size={18} className="text-indigo-300" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-indigo-300">{continent?.name || '灵界'}</h3>
            <span className="text-[10px] text-purple-400/60">灵气倍率 x{multiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Ascension progress */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-indigo-400/50 mb-1">
          <span>飞升进度</span>
          <span>{spiritRealm.ascensionProgress}%</span>
        </div>
        <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-indigo-500/20">
          <motion.div className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-full"
            animate={{ width: `${Math.min(100, spiritRealm.ascensionProgress)}%` }}
            transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-2 text-center">
          <Star size={12} className="text-amber-400 mx-auto mb-1" />
          <div className="text-[10px] text-slate-400">探索</div>
          <div className="text-xs font-bold text-white">{spiritRealm.realmExplored}</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2 text-center">
          <Gem size={12} className="text-purple-400 mx-auto mb-1" />
          <div className="text-[10px] text-slate-400">玄天之宝</div>
          <div className="text-xs font-bold text-purple-300">{spiritRealm.heavenlyTreasures.length}/4</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2 text-center">
          <Map size={12} className="text-emerald-400 mx-auto mb-1" />
          <div className="text-[10px] text-slate-400">传送门</div>
          <div className="text-xs font-bold text-emerald-300">{spiritRealm.crossRealmGates.length}</div>
        </div>
      </div>

      {/* Continents */}
      <div className="flex space-x-2 mb-4">
        {SPIRIT_CONTINENTS.map(c => {
          const unlocked = spiritRealm.crossRealmGates.includes(c.id);
          const active = c.id === spiritRealm.currentContinent;
          return (
            <button
              key={c.id}
              disabled={!unlocked}
              onClick={() => {
                if (unlocked && !active) {
                  useStore.setState(s => ({ spiritRealm: { ...s.spiritRealm, currentContinent: c.id as any } }));
                  showToast(`传送至${c.name}`);
                }
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                active ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300' :
                unlocked ? 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-indigo-500/20' :
                'bg-slate-800/20 border border-slate-700/20 text-slate-600 cursor-not-allowed'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Available treasures */}
      {continentTreasures.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <span className="text-[10px] text-amber-400/60">可收集的玄天之宝：</span>
          {continentTreasures.map(t => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { const r = collectHeavenlyTreasure(t.id); showToast(r.message); }}
              className="w-full flex items-center space-x-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-all"
            >
              <Trophy size={14} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-amber-200">{t.name}</div>
                <div className="text-[10px] text-amber-400/40 truncate">x{t.bonus} 修为倍率</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Explore button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setExploring(true);
          const r = exploreSpiritRealm();
          showToast(r.message);
          setTimeout(() => setExploring(false), 1000);
        }}
        disabled={exploring}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
      >
        <motion.div animate={exploring ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}>
          <Compass size={16} />
        </motion.div>
        <span>{exploring ? '探索中...' : '探索灵界'}</span>
      </motion.button>

      {/* Collected treasures showcase */}
      {spiritRealm.heavenlyTreasures.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {spiritRealm.heavenlyTreasures.map(id => {
            const t = HEAVENLY_TREASURES.find(tr => tr.id === id);
            return t ? (
              <motion.span key={id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                ✦ {t.name}
              </motion.span>
            ) : null;
          })}
        </div>
      )}
    </motion.div>
  );
}
