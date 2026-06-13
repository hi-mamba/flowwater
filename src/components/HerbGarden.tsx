import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplets, Scissors, Clock, Sparkles } from 'lucide-react';
import { ALL_HERBS } from '../data/craftingData';

interface GardenPlot {
  id: string;
  herbId: string;
  plantedAt: number;
  growthPercent: number;
  ready: boolean;
}

export default function HerbGarden() {
  const { materials, addMaterial, levelIndex } = useStore();
  const [plots, setPlots] = useState<GardenPlot[]>(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      id: `plot_${i}`, herbId: '', plantedAt: 0, growthPercent: 0, ready: false,
    }))
  );
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const maxPlots = 2 + Math.floor(levelIndex / 5);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const availableHerbs = ALL_HERBS.filter(h => levelIndex >= h.minLevel);
  const tiers = [...new Set(availableHerbs.map(h => h.tier))].sort((a, b) => a - b);

  const tierLabel = (t: number) =>
    t <= 2 ? '炼气' : t === 3 ? '筑基' : t === 4 ? '结丹' : t === 5 ? '元婴·化神' : t === 6 ? '炼虚' : t === 7 ? '合体' : '大乘';

  const plant = (plotId: string, herbId: string) => {
    const herb = ALL_HERBS.find(h => h.id === herbId);
    if (!herb) return;
    setPlots(prev => prev.map(p =>
      p.id === plotId ? { ...p, herbId, plantedAt: Date.now(), growthPercent: 0, ready: false } : p
    ));
    setSelectedPlot(null);
    showToast(`种下 ${herb.name}`);
  };

  const plantAll = (herbId: string) => {
    const herb = ALL_HERBS.find(h => h.id === herbId);
    if (!herb) return;
    let count = 0;
    setPlots(prev => prev.slice(0, maxPlots).map(p => {
      if (!p.herbId) {
        count++;
        return { ...p, herbId, plantedAt: Date.now(), growthPercent: 0, ready: false };
      }
      return p;
    }).concat(prev.slice(maxPlots)));
    setSelectedPlot(null);
    if (count > 0) showToast(`批量种下 ${herb.name} ×${count}`);
    else showToast('没有空灵田');
  };

  const water = (plotId: string) => {
    setPlots(prev => prev.map(p => {
      if (p.id !== plotId || !p.herbId || p.ready) return p;
      return { ...p, growthPercent: Math.min(100, p.growthPercent + 15), ready: p.growthPercent + 15 >= 100 };
    }));
    showToast('浇水成功！');
  };

  const harvest = (plotId: string) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot?.ready) return;
    const herb = ALL_HERBS.find(h => h.id === plot.herbId);
    if (!herb) return;
    addMaterial(herb.id, herb.yield);
    setPlots(prev => prev.map(p =>
      p.id === plotId ? { ...p, herbId: '', plantedAt: 0, growthPercent: 0, ready: false } : p
    ));
    showToast(`收获 ${herb.name} x${herb.yield}！`);
  };

  // Auto-grow
  useEffect(() => {
    const interval = setInterval(() => {
      setPlots(prev => prev.map(p => {
        if (!p.herbId || p.ready) return p;
        const herb = ALL_HERBS.find(h => h.id === p.herbId);
        if (!herb) return p;
        const elapsed = (Date.now() - p.plantedAt) / 1000;
        const pct = Math.min(100, (elapsed / herb.growthTime) * 100);
        return { ...p, growthPercent: pct, ready: pct >= 100 };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activePlots = plots.filter(p => p.herbId);
  const filteredPlantable = availableHerbs.filter(h => !filterTier || h.tier === filterTier);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-green-950/60 to-emerald-950/60 backdrop-blur-md border border-green-500/20 rounded-2xl p-5 overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - same style as AlchemyFurnace/CraftingTable */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={activePlots.some(p => p.ready) ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Sprout size={20} className="text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-green-300">灵药园</h3>
            <p className="text-[10px] text-green-400/50">
              {activePlots.length}/{maxPlots} 灵田 · {availableHerbs.length} 种可种
            </p>
          </div>
        </div>
      </div>

      {/* Active plots - list style like AlchemyFurnace recipes */}
      <div className="space-y-1 mb-3">
        {plots.slice(0, maxPlots).map(plot => {
          const herb = ALL_HERBS.find(h => h.id === plot.herbId);
          if (!plot.herbId) {
            // Empty plot
            return (
              <motion.div key={plot.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 rounded-xl border border-dashed border-slate-700/30 bg-slate-800/20">
                <div className="w-7 h-7 rounded-lg bg-slate-700/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 text-xs">+</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-slate-500">空灵田</span>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlot(selectedPlot === plot.id ? null : plot.id)}
                  className={`text-[10px] px-2 py-1.5 rounded-lg border font-bold whitespace-nowrap ${
                    selectedPlot === plot.id
                      ? 'bg-green-500/20 border-green-500/30 text-green-300'
                      : 'bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20'
                  }`}>
                  种植
                </motion.button>
              </motion.div>
            );
          }

          // Planted plot
          return (
            <motion.div key={plot.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`flex items-center space-x-3 p-2 rounded-xl border ${
                plot.ready ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/40 border-slate-700/30'
              }`}>
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base">{herb?.icon || '🌱'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className={`text-[11px] font-medium ${plot.ready ? 'text-amber-300' : 'text-white'}`}>{herb?.name}</span>
                  {plot.ready ? (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">成熟</span>
                  ) : (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{Math.round(plot.growthPercent)}%</span>
                  )}
                </div>
                {!plot.ready && (
                  <div className="mt-0.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-green-500 rounded-full"
                      animate={{ width: `${plot.growthPercent}%` }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </div>
              {plot.ready ? (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => harvest(plot.id)}
                  className="text-[10px] px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/20 whitespace-nowrap">
                  <Scissors size={10} className="inline mr-0.5" /> 收获
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => water(plot.id)}
                  className="text-[10px] px-2 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 font-bold hover:bg-green-500/20 whitespace-nowrap">
                  <Droplets size={10} className="inline mr-0.5" /> 浇水
                </motion.button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tier filter - same style as other components */}
      {selectedPlot && (
        <div className="flex items-center space-x-1 mb-2 overflow-x-auto relative">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setBatchMode(b => !b)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border flex-shrink-0 ${batchMode ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
            {batchMode ? '✓ 批量' : '批量'}
          </motion.button>
          <div className="w-px h-4 bg-slate-700/50 flex-shrink-0" />
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setFilterTier(null)}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border flex-shrink-0 ${!filterTier ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
            全部
          </motion.button>
          {tiers.map(t => (
            <motion.button key={t} whileTap={{ scale: 0.95 }}
              onClick={() => setFilterTier(filterTier === t ? null : t)}
              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap border flex-shrink-0 ${filterTier === t ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-slate-800/50 border-slate-700/30 text-slate-400'}`}>
              {tierLabel(t)}
            </motion.button>
          ))}
        </div>
      )}

      {/* Plant selection - list style */}
      <AnimatePresence>
        {selectedPlot && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filteredPlantable.map((herb, i) => (
                <motion.div key={herb.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center space-x-3 p-2 rounded-xl border bg-slate-800/40 border-slate-700/30 hover:border-green-500/20">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{herb.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className={`text-[11px] font-medium ${herb.color}`}>{herb.name}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{tierLabel(herb.tier)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <Clock size={8} className="text-slate-500" />
                      <span className="text-[8px] text-slate-500">{herb.growthTime}s</span>
                      <span className="text-[8px] text-green-400/60">产量 ×{herb.yield}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => batchMode ? plantAll(herb.id) : plant(selectedPlot!, herb.id)}
                    className={`text-[10px] px-2 py-1.5 rounded-lg border font-bold whitespace-nowrap ${
                      batchMode
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                        : 'bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20'
                    }`}>
                    {batchMode ? '全种' : '种植'}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-green-400/30 mt-2">点击「种植」选择灵草 · 开启「批量」一键种满空灵田 · 成熟后「收获」</p>
    </motion.div>
  );
}
