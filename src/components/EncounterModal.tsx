import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { type Encounter, type EncounterChoice } from '../data/encounters';
import { Skull, Gift, Shield, Sparkles, Zap } from 'lucide-react';

interface Props {
  encounter: Encounter;
  onChoice: (choice: EncounterChoice) => void;
  onClose: () => void;
}

export default function EncounterModal({ encounter, onChoice, onClose }: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChoice = (choice: EncounterChoice) => {
    setSelectedChoice(choice.id);
    const success = Math.random() < choice.outcome.successChance;

    setTimeout(() => {
      setResult({
        success,
        message: success ? choice.outcome.success.message : choice.outcome.failure.message,
      });
      onChoice(choice);
    }, 1500);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: '常见' };
      case 'uncommon': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: '罕见' };
      case 'rare': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: '稀有' };
      case 'legendary': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: '传说' };
      default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: '' };
    }
  };

  const rarityStyle = getRarityBadge(encounter.rarity);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Rarity glow */}
        <div className={`h-1 ${rarityStyle.bg} ${rarityStyle.border}`} />

        {/* Title */}
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between mb-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border}`}
            >
              {rarityStyle.label}奇遇
            </motion.span>
            {encounter.rarity === 'legendary' && (
              <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}>
                <Sparkles size={16} className="text-amber-400" />
              </motion.div>
            )}
          </div>

          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white mb-3"
          >
            {encounter.title}
          </motion.h2>

          {/* Narrative text — typewriter effect */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-300 leading-relaxed mb-5"
          >
            {encounter.narrative}
          </motion.p>
        </div>

        {/* Choices */}
        {!selectedChoice && (
          <div className="px-5 pb-5 space-y-2">
            {encounter.choices.map((choice, i) => (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChoice(choice)}
                className={`w-full flex items-center space-x-3 p-4 rounded-2xl text-left transition-all border ${
                  choice.risk === 'safe'
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                    : choice.risk === 'risky'
                    ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40'
                    : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  choice.risk === 'safe' ? 'bg-emerald-500/10' :
                  choice.risk === 'risky' ? 'bg-amber-500/10' :
                  'bg-red-500/10'
                }`}>
                  {choice.risk === 'safe' ? <Shield size={16} className="text-emerald-400" /> :
                   choice.risk === 'risky' ? <Gift size={16} className="text-amber-400" /> :
                   <Skull size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white font-medium">{choice.text}</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className={`text-[10px] ${
                      choice.risk === 'safe' ? 'text-emerald-400/60' :
                      choice.risk === 'risky' ? 'text-amber-400/60' :
                      'text-red-400/60'
                    }`}>
                      成功率 {Math.round(choice.outcome.successChance * 100)}%
                    </span>
                  </div>
                </div>
                <span className="text-slate-500 text-lg">→</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-5 pb-5"
            >
              <div className={`p-4 rounded-2xl border ${
                result.success
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {result.success ? (
                    <Gift size={16} className="text-emerald-400" />
                  ) : (
                    <Skull size={16} className="text-amber-400" />
                  )}
                  <span className={`text-sm font-bold ${result.success ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {result.success ? '成功！' : '失败...'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.message}</p>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full mt-3 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white text-sm font-medium"
              >
                继续修行
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button (only before choice is made) */}
        {!selectedChoice && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="w-full py-3 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            无视此事，继续修炼
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

// Hook to check/trigger encounters
export function useEncounter(
  onEncounter: (encounter: Encounter) => void
) {
  const { levelIndex, currentRegion, bonusPoints, attemptBreakthrough } = useStore();

  const checkForEncounter = () => {
    // Check for random encounters on app resume or periodic interval
    const roll = Math.random() * 100;
    // Higher luck = slightly more encounters
    const threshold = 30; // ~30% chance per check

    if (roll < threshold) {
      // Dynamic import to get fresh encounters
      import('../data/encounters').then(({ ENCOUNTERS, pickRandomEncounter }) => {
        const hasDrunk = useStore.getState().logs.length > 0 &&
          useStore.getState().logs[useStore.getState().logs.length - 1].timestamp > Date.now() - 24 * 60 * 60 * 1000;

        const recentBreakthrough = useStore.getState().breakthroughEvent !== null;

        const available = ENCOUNTERS.filter(e => {
          if (e.minLevel && levelIndex < e.minLevel) return false;
          if (e.region && e.region !== currentRegion) return false;
          if (e.trigger === 'drink' && !hasDrunk) return false;
          if (e.trigger === 'breakthrough' && !recentBreakthrough) return false;
          return true;
        });

        const encounter = pickRandomEncounter(available);
        if (encounter) onEncounter(encounter);
      });
    }
  };

  return { checkForEncounter };
}
