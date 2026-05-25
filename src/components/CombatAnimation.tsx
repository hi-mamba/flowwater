import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Skull, Coins, Flame, Sparkles } from 'lucide-react';

interface CombatAnimationProps {
  attackerName: string;
  defenderName: string;
  isVictory: boolean;
  message: string;
  loot?: { spiritStones?: number; itemId?: string; exp?: number; amount?: number; type?: string } | any;
  onClose: () => void;
}

const Particle = ({ color, duration, delay, x, y, size }: { color: string, duration: number, delay: number, x: number, y: number, size: number }) => (
  <motion.div
    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
    animate={{ 
      opacity: [1, 1, 0], 
      scale: [0, size, 0],
      x: x, 
      y: y 
    }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={`absolute rounded-full pointer-events-none ${color}`}
    style={{ width: '4px', height: '4px' }}
  />
);

export const CombatAnimation: React.FC<CombatAnimationProps> = ({
  attackerName,
  defenderName,
  isVictory,
  message,
  loot,
  onClose
}) => {
  const [stage, setStage] = useState<'buildUp' | 'clash' | 'result'>('buildUp');

  useEffect(() => {
    const clashTimer = setTimeout(() => setStage('clash'), 1200);
    const resultTimer = setTimeout(() => setStage('result'), 3000);
    return () => { clearTimeout(clashTimer); clearTimeout(resultTimer); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent overflow-hidden">
      <motion.div 
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
      />
      {stage !== 'result' && (
        <motion.div 
          animate={stage === 'clash' ? { opacity: [0, 1, 0, 0.5, 0] } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-red-600/30 mix-blend-overlay z-0" />
      )}
      
      <AnimatePresence mode="wait">
        {stage !== 'result' && (
          <motion.div
            key="clash"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={
              stage === 'buildUp' ? { scale: 1, opacity: 1 } : 
              { scale: [1, 1.05, 1], x: [-20, 20, -10, 10, 0], y: [-20, 20, -10, 10, 0] }
            }
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
            transition={stage === 'clash' ? { duration: 0.4, ease: "easeInOut" } : { duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center relative z-10 w-full h-full"
          >
            <motion.div initial={{ height: 0 }} animate={{ height: '30vh' }} className="absolute top-0 left-0 w-full bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-none" />
            <motion.div initial={{ height: 0 }} animate={{ height: '30vh' }} className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />
            
            <div className="flex items-center gap-6 sm:gap-10 text-4xl sm:text-6xl font-black text-slate-200 z-30 tracking-widest">
              <motion.div
                initial={{ x: -200, opacity: 0, filter: 'blur(10px)' }}
                animate={stage === 'clash' ? { x: 80, filter: 'blur(0px)' } : { x: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={stage === 'clash' ? { duration: 0.2, ease: "circIn" } : { type: 'spring', bounce: 0.2, duration: 1.5 }}
                className="text-slate-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] relative"
              >
                {attackerName}
                {stage === 'clash' && <div className="absolute inset-0 bg-white blur-2xl opacity-80 rounded-full" />}
              </motion.div>
              
              <motion.div
                animate={stage === 'clash' ? { scale: [1, 4], rotate: 360, opacity: [1, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.4 }}
                className="text-red-600 z-10 relative px-4"
              >
                <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"></div>
                <Swords size={72} strokeWidth={1.5} className="drop-shadow-[0_0_30px_rgba(220,38,38,1)] relative z-10" />
              </motion.div>

              <motion.div
                initial={{ x: 200, opacity: 0, filter: 'blur(10px)' }}
                animate={stage === 'clash' ? { x: -80, filter: 'blur(0px)' } : { x: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={stage === 'clash' ? { duration: 0.2, ease: "circIn" } : { type: 'spring', bounce: 0.2, duration: 1.5 }}
                className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] relative"
              >
                {defenderName}
                {stage === 'clash' && <div className="absolute inset-0 bg-red-600 blur-2xl opacity-80 rounded-full" />}
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={stage === 'buildUp' ? { opacity: 1, scale: 1 } : { scale: 1.5, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="mt-20 text-xl sm:text-2xl text-red-700/80 font-black tracking-[0.5em] sm:tracking-[1em] z-30 uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-800 via-red-500 to-red-800"
            >
              狭路相逢 生死难料
            </motion.div>

            {stage === 'clash' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [1, 0], scale: [1, 2] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 border-[20px] border-red-600/30 z-40 pointer-events-none mix-blend-overlay"
              />
            )}

            {stage === 'clash' && Array.from({ length: 60 }).map((_, i) => (
              <Particle 
                key={i}
                color={Math.random() > 0.5 ? 'bg-red-500' : 'bg-orange-300'}
                duration={0.4 + Math.random() * 0.4}
                delay={0}
                x={(Math.random() - 0.5) * window.innerWidth * 1.5}
                y={(Math.random() - 0.5) * window.innerHeight * 1.5}
                size={3 + Math.random() * 8}
              />
            ))}
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div
            key="result"
            initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
            className={`flex flex-col items-center p-8 rounded-3xl border z-10 ${isVictory ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.2)]' : 'bg-red-950/90 border-red-600/50 shadow-[0_0_100px_rgba(220,38,38,0.3)]'} max-w-sm sm:max-w-md w-full mx-4 backdrop-blur-xl relative overflow-hidden`}
          >
            {isVictory && (
              <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            )}

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-6 rounded-full mb-6 relative ${isVictory ? 'bg-amber-500/20 text-amber-400' : 'bg-red-900/50 text-red-500'}`}
            >
              {isVictory ? <Flame size={64} className="drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" /> : <Skull size={64} className="drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />}
              {isVictory && (
                <div className="absolute inset-0 border-2 border-amber-400 rounded-full animate-ping opacity-20" />
              )}
            </motion.div>
            
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-2xl sm:text-3xl font-black tracking-widest mb-4 text-center ${isVictory ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`}
            >
              {isVictory ? '大获全胜' : '技不如人'}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-300 text-center mb-8 leading-relaxed font-medium"
            >
              {message}
            </motion.p>

            {isVictory && loot && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="flex items-center gap-4 bg-slate-950/80 px-6 py-4 rounded-xl mb-8 border border-amber-500/30 shadow-inner w-full justify-center"
              >
                <Coins size={24} className="text-yellow-400" />
                <span className="text-sm sm:text-lg font-bold text-yellow-100 flex items-center">
                  +{(loot.spiritStones || loot.amount) ? (loot.spiritStones || loot.amount) + ' 灵石' : '珍贵战利品'} <Sparkles size={16} className="text-yellow-400 ml-2" />
                </span>
                {loot.itemId && (
                  <span className="text-sm sm:text-lg font-bold text-fuchsia-400 ml-2 flex items-center">
                    附加战利品! <Sparkles size={16} className="text-fuchsia-400 ml-1" />
                  </span>
                )}
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={onClose}
              className={`w-full py-4 font-bold text-lg rounded-xl transition-all shadow-lg ${
                isVictory 
                  ? 'bg-amber-600 hover:bg-amber-500 text-amber-50 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                  : 'bg-red-800 hover:bg-red-700 text-red-50 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              }`}
            >
              {isVictory ? '收起宝物，飘然远去' : '暗自疗伤'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
