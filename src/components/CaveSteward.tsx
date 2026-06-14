import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Droplets, Flame, Hammer, Plus, X, ChevronUp, ChevronDown, Power, Sprout } from 'lucide-react';
import { ALL_PILLS, ALL_ARTIFACTS } from '../data/craftingData';

// 洞府总管 — 集中显示傀儡的自动化状态、配额、任务队列、最近活动
// 取代了"用户必须手动浇水/炼丹/炼器"的繁琐流程
export default function CaveSteward() {
  const {
    puppets,
    puppetAutomation,
    puppetActions,
    getPuppetActionsPerHour,
    getDeployedPuppetPower,
    togglePuppetAutoSpring,
    togglePuppetAutoHarvest,
    togglePuppetAutoReplant,
    addAlchemyQueueItem,
    removeAlchemyQueueItem,
    moveAlchemyQueueItem,
    addCraftingQueueItem,
    removeCraftingQueueItem,
    moveCraftingQueueItem,
    tickPuppetAutomation,
    levelIndex,
    materials,
  } = useStore();

  const [pickerOpen, setPickerOpen] = useState<null | 'pill' | 'artifact'>(null);

  // 进入洞府立即结算一次，之后每分钟跑一次 tick
  useEffect(() => {
    tickPuppetAutomation();
    const id = setInterval(() => tickPuppetAutomation(), 60_000);
    return () => clearInterval(id);
  }, [tickPuppetAutomation]);

  const power = getDeployedPuppetPower();
  const ratePerHour = getPuppetActionsPerHour();
  const deployedCount = puppets.filter(p => p.deployed).length;

  if (puppets.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-950/40 to-slate-900/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-2">
          <Bot size={16} className="text-amber-400/60" />
          <h3 className="text-sm font-bold text-amber-300/70">洞府总管</h3>
        </div>
        <p className="text-[11px] text-amber-200/50 leading-relaxed">
          炼制傀儡后，他们会代你打理洞府：满灵气自动采集、成熟灵草自动收获、按你预设的丹方与图纸自动炼丹炼器。
          下方「神通 · 傀儡术」中炼制第一个傀儡即可开启。
        </p>
      </motion.div>
    );
  }

  const alchemyQueueRecipes = puppetAutomation.alchemyQueue
    .map(id => ALL_PILLS.find(r => r.id === id))
    .filter(Boolean) as typeof ALL_PILLS;
  const craftingQueueRecipes = puppetAutomation.craftingQueue
    .map(id => ALL_ARTIFACTS.find(r => r.id === id))
    .filter(Boolean) as typeof ALL_ARTIFACTS;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={deployedCount > 0 ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"
          >
            <Bot size={18} className="text-amber-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">洞府总管</h3>
            <p className="text-[10px] text-amber-400/60">
              {deployedCount > 0 ? `${deployedCount} 名傀儡值班中` : '无傀儡出战 — 自动化暂停'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-amber-400/60">行动点</div>
          <div className="text-base font-bold text-amber-300">{Math.floor(puppetActions)}</div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-800/40 rounded-lg py-2">
          <div className="text-[9px] text-slate-500">出战战力</div>
          <div className="text-sm font-bold text-amber-300">{power}</div>
        </div>
        <div className="bg-slate-800/40 rounded-lg py-2">
          <div className="text-[9px] text-slate-500">每小时</div>
          <div className="text-sm font-bold text-amber-300">{ratePerHour.toFixed(1)} 次</div>
        </div>
        <div className="bg-slate-800/40 rounded-lg py-2">
          <div className="text-[9px] text-slate-500">离线封顶</div>
          <div className="text-sm font-bold text-amber-300">{Math.max(2, ratePerHour * 2).toFixed(0)}</div>
        </div>
      </div>

      {/* —— 免费托管：聚灵泉 / 灵药园 —— */}
      <div className="space-y-1.5 mb-3">
        <ToggleRow
          icon={<Droplets size={13} className="text-cyan-400" />}
          title="自动采集聚灵泉"
          desc="满 24 滴时自动采集，避免溢出浪费"
          on={puppetAutomation.autoSpring}
          onToggle={togglePuppetAutoSpring}
        />
        <ToggleRow
          icon={<Power size={13} className="text-green-400" />}
          title="自动收获成熟灵草"
          desc="不消耗行动点 — 灵田成熟即入袋"
          on={puppetAutomation.autoHarvest}
          onToggle={togglePuppetAutoHarvest}
        />
        <ToggleRow
          icon={<Sprout size={13} className="text-emerald-400" />}
          title="自动补种空灵田"
          desc="按灵田上次种过的灵草循环补种（手动「停种」可清除）"
          on={puppetAutomation.autoReplant}
          onToggle={togglePuppetAutoReplant}
        />
      </div>

      {/* —— 炼丹队列 —— */}
      <QueueSection
        icon={<Flame size={13} className="text-red-400" />}
        title="炼丹队列"
        accent="red"
        emptyMsg="尚未配置丹方 — 傀儡不会自动炼丹"
        items={alchemyQueueRecipes.map(r => ({
          id: r.id,
          name: r.name,
          subtitle: `${formatCost(r.cost)} · ${r.effect}`,
          available: levelIndex >= r.minLevel && Object.entries(r.cost).every(([m, n]) => (materials[m] || 0) >= (n as number)),
          missingNote: levelIndex < r.minLevel ? '修为未达' : Object.entries(r.cost).filter(([m, n]) => (materials[m] || 0) < (n as number)).map(([m]) => m).join('/') + ' 不足',
        }))}
        onAdd={() => setPickerOpen('pill')}
        onRemove={removeAlchemyQueueItem}
        onMove={moveAlchemyQueueItem}
      />

      {/* —— 炼器队列 —— */}
      <QueueSection
        icon={<Hammer size={13} className="text-purple-400" />}
        title="炼器队列"
        accent="purple"
        emptyMsg="尚未配置图纸 — 傀儡不会自动炼器"
        items={craftingQueueRecipes.map(r => ({
          id: r.id,
          name: r.name,
          subtitle: `${formatCost(r.cost)} · ${r.effect}`,
          available: levelIndex >= r.minLevel && Object.entries(r.cost).every(([m, n]) => (materials[m] || 0) >= (n as number)),
          missingNote: levelIndex < r.minLevel ? '修为未达' : Object.entries(r.cost).filter(([m, n]) => (materials[m] || 0) < (n as number)).map(([m]) => m).join('/') + ' 不足',
        }))}
        onAdd={() => setPickerOpen('artifact')}
        onRemove={removeCraftingQueueItem}
        onMove={moveCraftingQueueItem}
      />

      {/* —— 配方选择弹窗 —— */}
      <AnimatePresence>
        {pickerOpen && (
          <RecipePicker
            type={pickerOpen}
            existing={pickerOpen === 'pill' ? puppetAutomation.alchemyQueue : puppetAutomation.craftingQueue}
            levelIndex={levelIndex}
            onPick={(id) => {
              if (pickerOpen === 'pill') addAlchemyQueueItem(id);
              else addCraftingQueueItem(id);
            }}
            onClose={() => setPickerOpen(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ToggleRow({ icon, title, desc, on, onToggle }: {
  icon: React.ReactNode; title: string; desc: string; on: boolean; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle}
      className={`w-full flex items-center space-x-2.5 p-2 rounded-xl border transition-all ${
        on ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/30 border-slate-700/30'
      }`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 text-left min-w-0">
        <div className={`text-[11px] font-medium ${on ? 'text-amber-200' : 'text-slate-400'}`}>{title}</div>
        <div className="text-[9px] text-slate-500 truncate">{desc}</div>
      </div>
      <div className={`flex-shrink-0 w-8 h-4 rounded-full p-0.5 transition-colors ${on ? 'bg-amber-500/60' : 'bg-slate-700'}`}>
        <motion.div
          animate={{ x: on ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-3 h-3 rounded-full bg-white"
        />
      </div>
    </button>
  );
}

interface QueueItem { id: string; name: string; subtitle: string; available: boolean; missingNote: string; }
function QueueSection({ icon, title, accent, items, emptyMsg, onAdd, onRemove, onMove }: {
  icon: React.ReactNode; title: string; accent: 'red' | 'purple';
  items: QueueItem[]; emptyMsg: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const accentClass = accent === 'red'
    ? 'border-red-500/30 bg-red-500/5 text-red-300'
    : 'border-purple-500/30 bg-purple-500/5 text-purple-300';
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          {icon}
          <span className={`text-[11px] font-semibold ${accent === 'red' ? 'text-red-300' : 'text-purple-300'}`}>{title}</span>
          <span className="text-[9px] text-slate-500">{items.length} 项</span>
        </div>
        <button onClick={onAdd}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded-md border ${accentClass} hover:opacity-80`}>
          <Plus size={10} /><span className="text-[10px]">添加</span>
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-[10px] text-slate-500 italic px-2 py-1.5 bg-slate-800/20 rounded-lg">{emptyMsg}</div>
      ) : (
        <div className="space-y-1">
          {items.map((it, i) => (
            <div key={it.id}
              className={`flex items-center space-x-1.5 p-1.5 rounded-lg border ${
                it.available ? 'bg-slate-800/40 border-slate-700/40' : 'bg-slate-800/20 border-slate-700/20 opacity-60'
              }`}>
              <span className="text-[10px] text-slate-500 w-4 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white truncate">{it.name}</div>
                <div className="text-[9px] text-slate-500 truncate">
                  {it.available ? it.subtitle : <span className="text-amber-400/70">⏸ {it.missingNote}</span>}
                </div>
              </div>
              <button onClick={() => onMove(it.id, -1)} disabled={i === 0}
                className="p-0.5 text-slate-500 hover:text-amber-300 disabled:opacity-30">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => onMove(it.id, 1)} disabled={i === items.length - 1}
                className="p-0.5 text-slate-500 hover:text-amber-300 disabled:opacity-30">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => onRemove(it.id)}
                className="p-0.5 text-slate-500 hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipePicker({ type, existing, levelIndex, onPick, onClose }: {
  type: 'pill' | 'artifact';
  existing: string[];
  levelIndex: number;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const all = type === 'pill' ? ALL_PILLS : ALL_ARTIFACTS;
  const candidates = all.filter(r => levelIndex >= r.minLevel && !existing.includes(r.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-sm max-h-[70vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-amber-300">
            添加{type === 'pill' ? '丹方' : '图纸'}
          </h3>
          <button onClick={onClose} className="text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {candidates.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">没有可添加的{type === 'pill' ? '丹方' : '图纸'}</p>
          ) : candidates.map(r => (
            <button key={r.id}
              onClick={() => { onPick(r.id); onClose(); }}
              className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-xs text-white font-medium">{r.name}</span>
                <span className="text-[9px] text-slate-500">T{r.tier}</span>
              </div>
              <div className="text-[10px] text-slate-400">{formatCost(r.cost)}</div>
              <div className="text-[10px] text-amber-400/70 mt-0.5">{r.effect}</div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatCost(cost: Record<string, number>): string {
  return Object.entries(cost).map(([m, n]) => `${m}×${n}`).join(' ');
}
