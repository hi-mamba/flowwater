import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Skull, Coins, ShieldAlert } from 'lucide-react';

interface CombatAnimationProps {
  attackerName: string;
  defenderName: string;
  isVictory: boolean;
  message: string;
  loot?: { spiritStones?: number };
  onClose: () => void;
}

export const CombatAnimation: React.FC<CombatAnimationProps> = ({
  attackerName,
  defenderName,
  isVictory,
  message,
  loot,
  onClose
}) => {
  const [stage, setStage] = useState<'clash' | 'result'>('clash');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('result');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {stage === 'clash' && (
          <motion.div
            key="clash"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-8 text-4xl font-bold text-slate-200">
              <motion.div
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-blue-400"
              >
                {attackerName}
              </motion.div>
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-red-500"
              >
                <Swords size={64} />
              </motion.div>

              <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-orange-400"
              >
                {defenderName}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-2xl text-red-500 font-bold tracking-widest"
            >
              杀人夺宝！
            </motion.div>
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex flex-col items-center p-8 rounded-2xl border ${isVictory ? 'bg-emerald-900/40 border-emerald-500/50' : 'bg-red-900/40 border-red-500/50'} max-w-md w-full mx-4`}
          >
            <div className={`p-4 rounded-full mb-4 ${isVictory ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isVictory ? <Coins size={48} /> : <Skull size={48} />}
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
              {isVictory ? '大获全胜' : '身受重伤'}
            </h2>
            
            <p className="text-slate-300 text-center mb-6 leading-relaxed">
              {message}
            </p>

            {isVictory && loot && loot.spiritStones && (
              <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg mb-6 border border-slate-700">
                <span className="text-slate-400">获得战利品:</span>
                <span className="text-amber-400 font-bold">+{loot.spiritStones} 灵石</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-600"
            >
              确定
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
