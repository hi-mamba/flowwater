import { useState, useEffect } from 'react';
import { useStore, SECTS, SECT_WAR_REWARDS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Trophy, Flame, Users, Zap } from 'lucide-react';

export default function SectWar() {
  const { sectWar, sect, startSectWar, attackInSectWar, claimSectWarRewards, getSectWarRank, sectStatus } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [attackAnim, setAttackAnim] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const rank = getSectWarRank();
  const myContribution = sect ? (sectWar.contributions[sect] || 0) : 0;
  const sortedSects = Object.entries(sectWar.contributions)
    .sort(([, a], [, b]) => b - a)
    .map(([id, score]) => ({ id, name: SECTS.find(s => s.id === id)?.name || id, score }));

  // Not in sect
  if (!sect || sectStatus !== 'joined') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-950/60 to-red-950/60 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Swords size={16} className="text-orange-400" />
          <h3 className="text-sm font-bold text-orange-300">七派会武</h3>
        </div>
        <p className="text-[10px] text-orange-400/40">加入宗门后方可参与七派会武</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-950/60 to-red-950/60 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 overflow-hidden relative">

      {/* Battle particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2 bg-orange-400/60 rounded-full pointer-events-none"
                initial={{ x: '50%', y: '50%', opacity: 1 }}
                animate={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0, scale: 0 }}
                transition={{ duration: 0.8 + Math.random() }}
                onAnimationComplete={() => i === 9 && setShowParticles(false)} />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-orange-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.div animate={sectWar.active ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
            <Swords size={18} className="text-orange-300" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-orange-300">七派会武</h3>
            <span className="text-[10px] text-orange-400/50">
              {sectWar.active ? `第 ${sectWar.weekNumber} 周` : '等待开战'}
            </span>
          </div>
        </div>
        {!sectWar.active && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { const r = startSectWar(); showToast(r.message); }}
            className="text-[10px] px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold">
            开战
          </motion.button>
        )}
      </div>

      {/* My stats */}
      {sectWar.active && (
        <div className="mb-4 p-3 bg-slate-800/60 rounded-xl border border-orange-500/10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
            <span>你的贡献</span>
            <span className="text-orange-300 font-bold">{sectWar.playerContribution}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>剩余进攻次数</span>
            <span className={`font-bold ${sectWar.playerAttacksLeft > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {sectWar.playerAttacksLeft}/5
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mb-4 space-y-1">
        {sortedSects.map((entry, i) => (
          <motion.div key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
              entry.id === sect ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-slate-800/40'
            }`}>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i === 0 ? 'bg-amber-500 text-slate-900' :
                i === 1 ? 'bg-slate-400 text-slate-900' :
                i === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-400'
              }`}>
                {i + 1}
              </span>
              <span className={entry.id === sect ? 'text-orange-300 font-bold' : 'text-slate-300'}>
                {entry.name}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-mono">{entry.score}</span>
              <Flame size={12} className={i === 0 ? 'text-amber-400' : 'text-slate-600'} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      {sectWar.active && (
        <div className="flex space-x-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAttackAnim(true); setShowParticles(true);
              const r = attackInSectWar(); showToast(r.message);
              setTimeout(() => setAttackAnim(false), 500);
            }}
            disabled={sectWar.playerAttacksLeft <= 0}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold hover:bg-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <motion.div animate={attackAnim ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.4 }}>
              <Zap size={14} />
            </motion.div>
            <span>进攻</span>
          </motion.button>
          {sectWar.playerAttacksLeft <= 0 && !sectWar.rewardsClaimed && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              onClick={() => { const r = claimSectWarRewards(); showToast(r.message); }}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all">
              <Trophy size={14} />
              <span>领奖</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Rewards */}
      {sectWar.rewardsClaimed && rank <= 3 && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <Trophy size={14} className="text-amber-400 mx-auto mb-1" />
          <div className="text-[10px] text-amber-300 font-bold">排名 #{rank}</div>
          <div className="text-[10px] text-amber-400/60">{SECT_WAR_REWARDS[rank - 1]?.bonus}</div>
        </motion.div>
      )}

      {/* Battle log */}
      {sectWar.battleLog.length > 0 && (
        <div className="mt-3 max-h-20 overflow-y-auto space-y-0.5">
          {sectWar.battleLog.slice(-5).map((line, i) => (
            <div key={i} className="text-[10px] text-slate-500">{line}</div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
