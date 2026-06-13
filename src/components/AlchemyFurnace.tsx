import { useState } from 'react';
import { useStore, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Beaker, Sparkles } from 'lucide-react';
import { ALL_PILLS, type CraftingRecipe } from '../data/craftingData';

export default function AlchemyFurnace() {
  const { materials, addMaterial, levelIndex } = useStore();
  const [cooking, setCooking] = useState(false);
  const [cookProgress, setCookProgress] = useState(0);
  const [cookResult, setCookResult] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const available = ALL_PILLS.filter(r => levelIndex >= r.minLevel && (!filterTier || r.tier === filterTier));
  const tiers = [...new Set(ALL_PILLS.filter(r => levelIndex >= r.minLevel).map(r => r.tier))].sort((a, b) => a - b);

  const tierLabel = (t: number) =>
    t <= 2 ? '炼气' : t === 3 ? '筑基' : t === 4 ? '结丹' : t === 5 ? '元婴·化神' : t === 6 ? '炼虚' : t === 7 ? '合体' : t === 8 ? '大乘' : '飞升';

  const startCooking = (recipe: CraftingRecipe) => {
    for (const [mat, amt] of Object.entries(recipe.cost)) {
      if ((materials[mat] || 0) < amt) { showToast(`材料不足：${mat}`); return; }
    }
    for (const [mat, amt] of Object.entries(recipe.cost)) addMaterial(mat, -amt);
    setCooking(true);
    setCookProgress(0);
    setCookResult(null);
    const totalTime = recipe.time * 1000;
    const interval = setInterval(() => {
      setCookProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCooking(false);
          const q = Math.random() < 0.08 ? '（灵宝品质！）' : Math.random() < 0.25 ? '（上品）' : '';
          addMaterial(recipe.id, 1);
          setCookResult(`炼制成功！获得 ${recipe.name} ${q}`);
          return 100;
        }
        return prev + (100 / (totalTime / 100));
      });
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-red-950/60 to-orange-950/60 backdrop-blur-md border border-red-500/20 rounded-2xl p-5 overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-red-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {cooking && Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} className="absolute w-2 h-2 bg-orange-400/60 rounded-full pointer-events-none"
          style={{ left: `${30 + Math.random() * 40}%`, top: `${30 + Math.random() * 40}%` }}
          animate={{ y: [-20, -80, -20], opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: Math.random() }} />
      ))}

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-2">
          <motion.div animate={cooking ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Flame size={20} className="text-red-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-red-300">炼丹炉</h3>
            <p className="text-[10px] text-red-400/50">
              {cooking ? '炼制中...' : `${available.length} 种丹方可炼 · ${ALL_PILLS.filter(r => levelIndex >= r.minLevel).length} 种已解锁`}
            </p>
          </div>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex space-x-1 mb-3 overflow-x-auto relative">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => setFilterTier(null)}
          className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border ${!filterTier ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
          全部
        </motion.button>
        {tiers.map(t => (
          <motion.button key={t} whileTap={{ scale: 0.95 }}
            onClick={() => setFilterTier(filterTier === t ? null : t)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border ${filterTier === t ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
            {tierLabel(t)}
          </motion.button>
        ))}
      </div>

      {cooking && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 relative">
          <div className="flex items-center justify-between text-[10px] text-red-400/60 mb-1">
            <span>炉火纯青</span><span>{Math.round(cookProgress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full"
              animate={{ width: `${cookProgress}%` }} transition={{ duration: 0.1 }} />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {cookResult && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center relative">
            <Sparkles size={16} className="text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-amber-300">{cookResult}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 max-h-[280px] overflow-y-auto relative">
        {available.map((recipe, i) => {
          const canAfford = Object.entries(recipe.cost).every(([mat, amt]) => (materials[mat] || 0) >= amt);
          return (
            <motion.div key={recipe.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex items-center space-x-3 p-2 rounded-xl border ${canAfford ? 'bg-slate-800/40 border-slate-700/30 hover:border-red-500/20' : 'bg-slate-800/20 border-slate-700/10 opacity-50'}`}>
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Beaker size={13} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-medium text-white">{recipe.name}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{tierLabel(recipe.tier)}</span>
                </div>
                <div className="flex flex-wrap gap-x-1.5 mt-0.5">
                  {Object.entries(recipe.cost).map(([mat, amt]) => (
                    <span key={mat} className="text-[8px] text-slate-500">{mat}×{amt}</span>
                  ))}
                  <span className="text-[8px] text-amber-400/60">{recipe.effect}</span>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => startCooking(recipe)}
                disabled={!canAfford || cooking}
                className="text-[10px] px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 font-bold hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
                {recipe.time}s
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
