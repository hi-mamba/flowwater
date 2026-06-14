import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplets, Scissors, Clock, Bot } from 'lucide-react';
import { ALL_HERBS } from '../data/craftingData';
import type { GardenPlot } from '../store/puppetSlice';

export default function HerbGarden() {
  const {
    materials, levelIndex,
    gardenPlots, plantGardenPlot, plantAllEmptyPlots, harvestGardenPlot, clearGardenPlot,
    puppetAutomation, getDeployedPuppetPower,
  } = useStore();

  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [now, setNow] = useState(Date.now());
  const maxPlots = 2 + Math.floor(levelIndex / 5);
  const hasPuppets = getDeployedPuppetPower() > 0;
  const autoOn = hasPuppets && (puppetAutomation.autoHarvest || puppetAutomation.autoReplant);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  // 实时刷新进度（每 2 秒）
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(id);
  }, []);

  const availableHerbs = ALL_HERBS.filter(h => levelIndex >= h.minLevel);
  const tiers = [...new Set(availableHerbs.map(h => h.tier))].sort((a, b) => a - b);

  const tierLabel = (t: number) =>
    t <= 2 ? '炼气' : t === 3 ? '筑基' : t === 4 ? '结丹' : t === 5 ? '元婴·化神' : t === 6 ? '炼虚' : t === 7 ? '合体' : '大乘';

  const computePlot = (p: GardenPlot) => {
    if (!p.herbId) return { growthPercent: 0, ready: false };
    const herb = ALL_HERBS.find(h => h.id === p.herbId);
    if (!herb) return { growthPercent: 0, ready: false };
    const elapsed = (now - p.plantedAt) / 1000;
    const pct = Math.min(100, (elapsed / herb.growthTime) * 100);
    return { growthPercent: pct, ready: pct >= 100 };
  };

  const plant = (plotId: string, herbId: string) => {
    const herb = ALL_HERBS.find(h => h.id === herbId);
    if (!herb) return;
    plantGardenPlot(plotId, herbId);
    setSelectedPlot(null);
    showToast(`种下 ${herb.name}`);
  };

  const plantAll = (herbId: string) => {
    const herb = ALL_HERBS.find(h => h.id === herbId);
    if (!herb) return;
    const emptyCount = gardenPlots.slice(0, maxPlots).filter(p => !p.herbId).length;
    if (emptyCount === 0) { showToast('没有空灵田'); return; }
    plantAllEmptyPlots(herbId, maxPlots);
    setSelectedPlot(null);
    showToast(`批量种下 ${herb.name} ×${emptyCount}`);
  };

  const harvest = (plotId: string) => {
    const plot = gardenPlots.find(p => p.id === plotId);
    if (!plot) return;
    const { ready } = computePlot(plot);
    if (!ready) return;
    const herb = ALL_HERBS.find(h => h.id === plot.herbId);
    harvestGardenPlot(plotId);
    if (herb) showToast(`收获 ${herb.name} ×${herb.yield}！`);
  };

  const activePlots = gardenPlots.slice(0, maxPlots).filter(p => p.herbId);
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

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={activePlots.some(p => computePlot(p).ready) ? { scale: [1, 1.2, 1] } : {}}
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
        {autoOn && (
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            <Bot size={11} className="text-amber-400" />
            <span className="text-[9px] text-amber-300">
              {puppetAutomation.autoHarvest ? '自动收' : ''}
              {puppetAutomation.autoHarvest && puppetAutomation.autoReplant ? '·' : ''}
              {puppetAutomation.autoReplant ? '自动种' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Plots */}
      <div className="space-y-1 mb-3">
        {gardenPlots.slice(0, maxPlots).map(plot => {
          const herb = ALL_HERBS.find(h => h.id === plot.herbId);
          const { growthPercent, ready } = computePlot(plot);
          const lastHerb = !plot.herbId && plot.lastHerbId ? ALL_HERBS.find(h => h.id === plot.lastHerbId) : null;

          if (!plot.herbId) {
            // Empty plot — 显示 lastHerbId 的"补种中"提示
            return (
              <motion.div key={plot.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 rounded-xl border border-dashed border-slate-700/30 bg-slate-800/20">
                <div className="w-7 h-7 rounded-lg bg-slate-700/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-600 text-xs">+</span>
                </div>
                <div className="flex-1 min-w-0">
                  {lastHerb && puppetAutomation.autoReplant && hasPuppets ? (
                    <div className="flex items-center space-x-1.5">
                      <Bot size={10} className="text-amber-400/70" />
                      <span className="text-[10px] text-amber-300/70">将自动补种 {lastHerb.name}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">空灵田</span>
                  )}
                </div>
                {lastHerb && (
                  <button onClick={() => clearGardenPlot(plot.id)}
                    className="text-[9px] text-slate-600 hover:text-red-400 px-1.5 py-1">
                    停种
                  </button>
                )}
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
                ready ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/40 border-slate-700/30'
              }`}>
              <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-base">{herb?.icon || '🌱'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className={`text-[11px] font-medium ${ready ? 'text-amber-300' : 'text-white'}`}>{herb?.name}</span>
                  {ready ? (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {puppetAutomation.autoHarvest && hasPuppets ? '待傀儡收' : '成熟'}
                    </span>
                  ) : (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{Math.round(growthPercent)}%</span>
                  )}
                </div>
                {!ready && (
                  <div className="mt-0.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-green-500 rounded-full"
                      animate={{ width: `${growthPercent}%` }} transition={{ duration: 0.5 }} />
                  </div>
                )}
              </div>
              {ready ? (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => harvest(plot.id)}
                  className="text-[10px] px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/20 whitespace-nowrap">
                  <Scissors size={10} className="inline mr-0.5" /> 收获
                </motion.button>
              ) : (
                <span className="text-[9px] text-slate-500 px-2">
                  <Clock size={10} className="inline mr-0.5" />
                  {Math.max(0, Math.ceil((herb!.growthTime * (100 - growthPercent) / 100)))}s
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tier filter */}
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

      {/* Plant selection */}
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

      <p className="text-[10px] text-green-400/30 mt-2">
        {hasPuppets && puppetAutomation.autoReplant
          ? '种过的灵田会被傀儡按上次的灵草自动补种 · 成熟后自动收获 · 「停种」可清除自动补种记忆'
          : '点击「种植」选择灵草 · 开启「批量」一键种满空灵田 · 在「洞府总管」开启自动收获/补种'}
      </p>
    </motion.div>
  );
}
