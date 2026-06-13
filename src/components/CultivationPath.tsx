import { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Moon, CloudSun, Sparkles, Skull, Compass, Check } from 'lucide-react';

export const CULTIVATION_PATHS = [
  {
    id: 'righteous' as const,
    name: '正道',
    desc: '秉持天地正气，以德服人。修炼稳扎稳打，突破成功率更高。',
    color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30',
    textColor: 'text-blue-300', iconColor: 'text-blue-400', icon: Sword,
    bonuses: { breakthrough: 10, sectContribution: 1.3, luckBonus: 5 },
    penalty: '魔道宗门无法加入',
  },
  {
    id: 'demonic' as const,
    name: '魔道',
    desc: '以力证道，不拘小节。修为增长迅猛，但突破风险更高。',
    color: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/30',
    textColor: 'text-red-300', iconColor: 'text-red-400', icon: Skull,
    bonuses: { cultivationMultiplier: 1.3, spiritStoneBonus: 1.5, attackBonus: 30 },
    penalty: '突破成功率 -10%，正道宗门无法加入',
  },
  {
    id: 'rogue' as const,
    name: '散修',
    desc: '无门无派，逍遥自在。灵活多变，机遇更多。',
    color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30',
    textColor: 'text-emerald-300', iconColor: 'text-emerald-400', icon: Compass,
    bonuses: { encounterRate: 2, exploreBonus: 1.5, chestRate: 2 },
    penalty: '无宗门庇护，渡劫时无助战加成',
  },
] as const;

export type CultivationPath = typeof CULTIVATION_PATHS[number]['id'];

export default function CultivationPathSelect() {
  const { bonusPoints, levelIndex, spiritStones, addSpiritStones } = useStore();
  const [selected, setSelected] = useState<CultivationPath | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const canChoose = levelIndex >= 5; // 炼气五层可择道

  const choose = (pathId: CultivationPath) => {
    setSelected(pathId);
  };

  const confirm = () => {
    if (!selected) return;
    setConfirmed(true);
    setShowModal(false);
  };

  const pathBonuses = selected ? CULTIVATION_PATHS.find(p => p.id === selected) : null;

  if (!canChoose && !confirmed) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Compass size={16} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-300">修行之道</h3>
        </div>
        <p className="text-[10px] text-slate-500">需炼气五层方可选择修行之道</p>
      </motion.div>
    );
  }

  if (confirmed && pathBonuses) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${pathBonuses.color} backdrop-blur-md border ${pathBonuses.border} rounded-2xl p-5`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <pathBonuses.icon size={16} className={pathBonuses.iconColor} />
            <h3 className={`text-sm font-bold ${pathBonuses.textColor}`}>{pathBonuses.name}修士</h3>
          </div>
          <span className="text-[10px] text-slate-500">已择道</span>
        </div>
        <p className="text-[10px] text-slate-400">{pathBonuses.desc}</p>
        <div className="mt-2 space-y-0.5">
          {Object.entries(pathBonuses.bonuses).map(([key, val]) => (
            <div key={key} className="text-[10px] text-slate-400">
              + {key === 'breakthrough' ? `突破率 +${val}%` :
                  key === 'cultivationMultiplier' ? `修为倍率 x${val}` :
                  key === 'spiritStoneBonus' ? `灵石收益 x${val}` :
                  key === 'encounterRate' ? `奇遇概率 x${val}` :
                  key === 'exploreBonus' ? `探索收益 x${val}` :
                  key === 'chestRate' ? `宝箱掉落 x${val}` :
                  key === 'attackBonus' ? `攻击 +${val}` :
                  key === 'luckBonus' ? `气运 +${val}` :
                  key === 'sectContribution' ? `宗门贡献 x${val}` : `${key} x${val}`}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl p-5 text-left hover:border-amber-500/30 transition-all"
      >
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300">选择修行之道</h3>
        </div>
        <p className="text-[10px] text-amber-400/50">正道、魔道或散修——你的选择将改变一切</p>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl p-5 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-1">选择修行之道</h2>
              <p className="text-[10px] text-slate-500 mb-4">此选择不可更改，将影响你的修仙之路</p>

              <div className="space-y-2 mb-4">
                {CULTIVATION_PATHS.map(path => (
                  <motion.button
                    key={path.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => choose(path.id)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r ${path.color} border text-left transition-all ${
                      selected === path.id ? path.border + ' shadow-lg' : 'border-slate-700/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0 ${selected === path.id ? 'ring-2 ring-white/20' : ''}`}>
                      <path.icon size={20} className={path.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${path.textColor}`}>{path.name}</div>
                      <p className="text-[10px] text-slate-400">{path.desc}</p>
                      <p className="text-[8px] text-slate-600 mt-0.5">⚠ {path.penalty}</p>
                    </div>
                    {selected === path.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                onClick={confirm}
                disabled={!selected}
                className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                确定此道
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
