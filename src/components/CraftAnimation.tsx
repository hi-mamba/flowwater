import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, ScrollText, Bone, Infinity as InfinityIcon } from 'lucide-react';

interface CraftAnimationProps {
  type: 'talisman' | 'puppet' | 'pill' | 'artifact' | 'formation';
  itemName: string;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}

export const CraftAnimation: React.FC<CraftAnimationProps> = ({
  type,
  itemName,
  isSuccess,
  message,
  onClose
}) => {
  const [stage, setStage] = useState<'crafting' | 'result'>('crafting');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('result');
    }, 3500); // Epic 3.5 seconds crafting sequence!
    return () => clearTimeout(timer);
  }, []);

  const getCraftingIcon = () => {
    switch (type) {
      case 'talisman': return <ScrollText size={80} className="text-yellow-400" />;
      case 'puppet': return <Bone size={80} className="text-stone-400" />;
      case 'pill': return <Flame size={80} className="text-orange-500" />;
      case 'artifact': return <Sparkles size={80} className="text-cyan-400" />;
      case 'formation': return <InfinityIcon size={80} className="text-purple-500" />;
      default: return <Flame size={80} className="text-red-500" />;
    }
  };

  const getThemeColors = () => {
    switch (type) {
      case 'talisman': return { from: 'from-yellow-900', via: 'via-amber-900/50', to: 'to-slate-950', ring: 'border-yellow-500', glow: 'shadow-[0_0_80px_rgba(234,179,8,0.5)]' };
      case 'puppet': return { from: 'from-stone-900', via: 'via-slate-800/50', to: 'to-slate-950', ring: 'border-stone-500', glow: 'shadow-[0_0_80px_rgba(168,162,158,0.5)]' };
      case 'pill': return { from: 'from-orange-900', via: 'via-red-900/50', to: 'to-slate-950', ring: 'border-orange-500', glow: 'shadow-[0_0_80px_rgba(249,115,22,0.5)]' };
      case 'artifact': return { from: 'from-cyan-900', via: 'via-blue-900/50', to: 'to-slate-950', ring: 'border-cyan-500', glow: 'shadow-[0_0_80px_rgba(6,182,212,0.5)]' };
      case 'formation': return { from: 'from-purple-900', via: 'via-fuchsia-900/50', to: 'to-slate-950', ring: 'border-purple-500', glow: 'shadow-[0_0_80px_rgba(168,85,247,0.5)]' };
      default: return { from: 'from-slate-800', via: 'via-slate-900', to: 'to-slate-950', ring: 'border-white', glow: '' };
    }
  };

  const theme = getThemeColors();

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden`}>
      <motion.div 
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${theme.from} ${theme.via} ${theme.to}`}
      />
      
      <AnimatePresence mode="wait">
        {stage === 'crafting' && (
          <motion.div
            key="crafting"
            className="relative z-10 flex flex-col items-center justify-center"
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.5 }}
          >
            {/* Spinning array/formation rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className={`absolute w-64 h-64 border-0 border-t-[3px] border-b-[3px] rounded-full opacity-50 ${theme.ring}`}
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className={`absolute w-48 h-48 border-[2px] rounded-full border-dashed opacity-70 ${theme.ring}`}
            />

            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className={`relative z-10 ${theme.glow} p-8 rounded-full bg-black/30 backdrop-blur-sm`}
            >
              {getCraftingIcon()}
            </motion.div>

            <motion.h2 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-16 text-3xl font-black text-white tracking-[0.5em] drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            >
              {type === 'talisman' ? '凌空画符，引雷聚火...' : 
               type === 'puppet' ? '熔炼灵骨，点灵启智...' : 
               type === 'pill' ? '丹火升腾，萃取精华...' : 
               type === 'formation' ? '勾连地脉，布置阵旗...' : 
               '千锤百炼，凝兵成型...'}
            </motion.h2>

            {/* Energy Particles flying to center */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 500 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], x: 0, y: 0 }}
                transition={{ duration: 1 + Math.random() * 2, repeat: Infinity }}
                className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
              />
            ))}
          </motion.div>
        )}

        {stage === 'result' && (
          <motion.div
            key="result"
            initial={{ scale: 0.2, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
            className={`flex flex-col items-center p-10 rounded-[2rem] border-2 z-10 max-w-sm w-full mx-4 backdrop-blur-xl bg-slate-900/90 ${isSuccess ? theme.ring + ' ' + theme.glow : 'border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.3)]'}`}
          >
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`p-6 rounded-full mb-6 ${isSuccess ? 'bg-white/10' : 'bg-red-900/30'}`}
            >
              {isSuccess ? getCraftingIcon() : <Flame size={64} className="text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />}
            </motion.div>
            
            <h2 className={`text-3xl font-black mb-4 tracking-wider ${isSuccess ? 'text-white' : 'text-red-400'}`}>
              {isSuccess ? '功德圆满' : '功亏一篑'}
            </h2>
            
            <p className={`text-center mb-8 font-medium px-4 ${isSuccess ? 'text-slate-200' : 'text-slate-400'}`}>
              {message}
            </p>

            {isSuccess && (
              <motion.div 
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 }}
                className={`py-3 px-6 rounded-xl border mb-6 text-xl font-bold bg-slate-950/50 flex items-center justify-center ${theme.ring} shadow-inner`}
              >
                获得: {itemName}
              </motion.div>
            )}

            <button
              onClick={onClose}
              className={`w-full py-4 text-lg font-bold rounded-xl transition-all shadow-lg ${
                isSuccess 
                  ? 'bg-slate-100/20 hover:bg-slate-100/30 text-white backdrop-blur-sm border border-white/30' 
                  : 'bg-red-900/50 hover:bg-red-800/50 text-red-100 border border-red-500/30'
              }`}
            >
              {isSuccess ? '收入储物袋' : '清扫灵渣残局'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
