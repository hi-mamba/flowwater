import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Sparkles, Leaf, ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

interface PalmBottleModalProps {
  onClose: () => void;
}

export const PalmBottleModal: React.FC<PalmBottleModalProps> = ({ onClose }) => {
  const { palmBottleLiquid, usePalmBottleLiquid, bottleSpiritUnlocked } = useStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleUseLiquid = (type: 'herb' | 'cultivation' | 'foundation') => {
    const result = usePalmBottleLiquid(type);
    showToast(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-emerald-300 px-6 py-3 rounded-2xl shadow-xl border border-emerald-500/20 z-[60] text-sm font-medium text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)]"
      >
        {/* Animated background rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(16,185,129,0.1)_350deg,transparent_360deg)]"
          />
        </div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-emerald-500/20 via-emerald-900/40 to-transparent pointer-events-none z-0" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-2 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
            <Droplets size={28} className="animate-pulse" />
            <h2 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">掌天大瓶</h2>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} className="text-emerald-500 hover:text-emerald-300 p-2 bg-emerald-900/30 rounded-full transition-colors border border-emerald-500/30">
            <X size={20} />
          </motion.button>
        </div>

        <div className="flex flex-col items-center mb-10 relative z-10 mt-4">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-40 bg-gradient-to-b from-emerald-900/60 to-slate-900 rounded-[40%] border-[3px] border-emerald-400/60 flex items-center justify-center relative overflow-hidden mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4),inset_0_0_20px_rgba(16,185,129,0.4)] backdrop-blur-sm"
          >
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-300 via-emerald-500/80 to-emerald-200/40 transition-all duration-1000 blur-sm"
              style={{ height: `${Math.min(100, (palmBottleLiquid / 10) * 100)}%` }}
            />
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-400 to-emerald-300/80 transition-all duration-1000"
              style={{ height: `${Math.min(100, (palmBottleLiquid / 10) * 100)}%` }}
            />
            {/* Inner glowing core */}
            <div className="absolute inset-0 bg-emerald-400/20 mix-blend-overlay"></div>
            <Droplets size={44} className="text-emerald-50 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </motion.div>
          
          <div className="text-center">
            <p className="text-emerald-100 text-lg tracking-widest">造化参天绿液: <span className="text-emerald-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">{palmBottleLiquid}</span> / 10</p>
            <p className="text-xs text-emerald-500/70 mt-2 tracking-widest uppercase">天地灵气 聚月华之精</p>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => handleUseLiquid('herb')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-900/40 rounded-xl text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                <Leaf size={22} className="group-hover:animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-emerald-50 tracking-wide">催熟万年灵草</p>
                <p className="text-xs text-emerald-200/50 mt-1 drop-shadow-sm">突破年份限制，逆天生发</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-emerald-400 bg-emerald-900/50 border border-emerald-500/30 px-3 py-1 rounded-lg">消耗 1 滴</span>
            </div>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => handleUseLiquid('cultivation')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-sky-900/40 rounded-xl text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all border border-sky-500/20">
                <Sparkles size={22} className="group-hover:animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-sky-50 tracking-wide">强行灌顶修为</p>
                <p className="text-xs text-sky-200/50 mt-1 drop-shadow-sm">造化之力直接转化为灵力</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-sky-400 bg-sky-900/50 border border-sky-500/30 px-3 py-1 rounded-lg">消耗 1 滴</span>
            </div>
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} 
            onClick={() => handleUseLiquid('foundation')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-900/40 rounded-xl text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all border border-amber-500/20">
                <ShieldAlert size={22} className="group-hover:animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-amber-50 tracking-wide">重塑破损道基</p>
                <p className="text-xs text-amber-200/50 mt-1 drop-shadow-sm">弥补大道之痕，再起征程</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-amber-400 bg-amber-900/50 border border-amber-500/30 px-3 py-1 rounded-lg">消耗 3 滴</span>
            </div>
          </motion.button>
        </div>

        {bottleSpiritUnlocked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center space-x-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
            <div className="w-12 h-12 rounded-full bg-emerald-900/50 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="text-emerald-300 text-sm font-black">瓶灵</span>
            </div>
            <div>
              <p className="text-sm text-emerald-200/90 italic tracking-wider leading-relaxed">「 小子，这绿液乃开天辟地之造化，你可省着点用，莫要暴殄天物！ 」</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
