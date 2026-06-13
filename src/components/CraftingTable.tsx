import { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Shield, Swords, Gem, Sparkles, Zap } from 'lucide-react';
import { ALL_ARTIFACTS, type CraftingRecipe } from '../data/craftingData';

const typeConfig: Record<string, { icon: typeof Hammer; label: string }> = {
  weapon: { icon: Swords, label: '武器' },
  armor: { icon: Shield, label: '防具' },
  talisman: { icon: Zap, label: '符箓' },
  accessory: { icon: Gem, label: '饰品' },
  artifact: { icon: Sparkles, label: '法宝' },
};

export default function CraftingTable() {
  const { materials, addMaterial, levelIndex, inventory } = useStore();
  const [crafting, setCrafting] = useState<string | null>(null);
  const [craftProgress, setCraftProgress] = useState(0);
  const [craftResult, setCraftResult] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const available = ALL_ARTIFACTS.filter(r =>
    levelIndex >= r.minLevel &&
    (filterType === 'all' || r.type === filterType) &&
    (!filterTier || r.tier === filterTier)
  );
  const tiers = [...new Set(ALL_ARTIFACTS.filter(r => levelIndex >= r.minLevel).map(r => r.tier))].sort((a, b) => a - b);
  const tierLabel = (t: number) =>
    t <= 2 ? '炼气' : t === 3 ? '筑基' : t === 4 ? '结丹' : t === 5 ? '元婴·化神' : t === 6 ? '炼虚' : t === 7 ? '合体' : t === 8 ? '大乘' : '飞升';

  const startCraft = (recipe: CraftingRecipe) => {
    for (const [mat, amt] of Object.entries(recipe.cost)) {
      if ((materials[mat] || 0) < amt) { showToast(`材料不足：${mat}`); return; }
    }
    for (const [mat, amt] of Object.entries(recipe.cost)) addMaterial(mat, -amt);
    setCrafting(recipe.id);
    setCraftProgress(0);
    setCraftResult(null);
    const totalTime = recipe.time * 1000;
    const interval = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCrafting(null);
          const q = Math.random() < 0.08 ? '（灵宝品质！）' : Math.random() < 0.25 ? '（上品）' : '';
          const newInventory = [...useStore.getState().inventory, recipe.id];
          useStore.setState({ inventory: newInventory });
          setCraftResult(`炼制成功！获得 ${recipe.name} ${q}`);
          return 100;
        }
        return prev + (100 / (totalTime / 100));
      });
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-800/60 to-amber-950/40 backdrop-blur-md border border-amber-500/20 rounded-2xl p-5 overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {crafting && Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 bg-amber-400/60 rounded-full pointer-events-none"
          style={{ left: `${40 + Math.random() * 20}%`, top: `${20 + Math.random() * 20}%` }}
          animate={{ x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60], y: [-10, -60], opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: Math.random() * 0.3 }} />
      ))}

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-2">
          <motion.div animate={crafting ? { rotate: [0, 15, -15, 0] } : {}} transition={{ duration: 0.4, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Hammer size={20} className="text-amber-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">炼器台</h3>
            <p className="text-[10px] text-amber-400/50">
              {crafting ? '锻造中...' : `${available.length} 种图纸 · ${ALL_ARTIFACTS.filter(r => levelIndex >= r.minLevel).length} 种已解锁`}
            </p>
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex space-x-1 mb-2 overflow-x-auto relative">
        {['all', 'weapon', 'armor', 'talisman', 'accessory', 'artifact'].map(type => (
          <motion.button key={type} whileTap={{ scale: 0.95 }}
            onClick={() => setFilterType(type)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border ${filterType === type ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
            {type === 'all' ? '全部' : typeConfig[type] ? `${typeConfig[type].label}` : type}
          </motion.button>
        ))}
      </div>

      {/* Tier filter */}
      <div className="flex space-x-1 mb-3 overflow-x-auto relative">
        {tiers.map(t => (
          <motion.button key={t} whileTap={{ scale: 0.95 }}
            onClick={() => setFilterTier(filterTier === t ? null : t)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border ${filterTier === t ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
            {tierLabel(t)}
          </motion.button>
        ))}
      </div>

      {crafting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 relative">
          <div className="flex items-center justify-between text-[10px] text-amber-400/60 mb-1">
            <span>千锤百炼</span><span>{Math.round(craftProgress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400 rounded-full"
              animate={{ width: `${craftProgress}%` }} transition={{ duration: 0.1 }} />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {craftResult && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center relative">
            <Sparkles size={16} className="text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-amber-300">{craftResult}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1 max-h-[280px] overflow-y-auto relative">
        {available.map((recipe, i) => {
          const canAfford = Object.entries(recipe.cost).every(([mat, amt]) => (materials[mat] || 0) >= amt);
          const cfg = typeConfig[recipe.type];
          const Icon = cfg?.icon || Hammer;
          return (
            <motion.div key={recipe.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex items-center space-x-3 p-2 rounded-xl border ${canAfford ? 'bg-slate-800/40 border-slate-700/30 hover:border-amber-500/20' : 'bg-slate-800/20 border-slate-700/10 opacity-50'}`}>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-amber-400" />
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
                onClick={() => startCraft(recipe)}
                disabled={!canAfford || !!crafting}
                className="text-[10px] px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
                {recipe.time}s
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
