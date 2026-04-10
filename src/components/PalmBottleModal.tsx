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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 border border-emerald-500/30 rounded-3xl p-6 w-full max-w-md flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Droplets size={24} />
            <h2 className="text-xl font-bold">掌天瓶</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-24 h-32 bg-emerald-900/50 rounded-full border-2 border-emerald-500/50 flex items-center justify-center relative overflow-hidden mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-400 to-emerald-200/80 transition-all duration-1000"
              style={{ height: `${Math.min(100, (palmBottleLiquid / 10) * 100)}%` }}
            />
            <Droplets size={32} className="text-emerald-100 relative z-10 drop-shadow-md" />
          </div>
          <p className="text-slate-300">当前绿液: <span className="text-emerald-400 font-bold text-xl">{palmBottleLiquid}</span> 滴</p>
          <p className="text-xs text-slate-500 mt-1">每日自然凝聚1滴，最多储存10滴</p>
        </div>

        <div className="space-y-3 relative z-10">
          <button 
            onClick={() => handleUseLiquid('herb')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                <Leaf size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-200">催熟灵草</p>
                <p className="text-xs text-slate-500">消耗1滴绿液，获得大量珍稀灵草</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">-1 滴</span>
          </button>

          <button 
            onClick={() => handleUseLiquid('cultivation')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-sky-500/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-200">凝练修为</p>
                <p className="text-xs text-slate-500">消耗1滴绿液，直接获得大量修为</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">-1 滴</span>
          </button>

          <button 
            onClick={() => handleUseLiquid('foundation')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                <ShieldAlert size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-200">修复根基</p>
                <p className="text-xs text-slate-500">消耗3滴绿液，修复突破失败受损的根基</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">-3 滴</span>
          </button>
        </div>

        {bottleSpiritUnlocked && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30 flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-xs">瓶灵</span>
            </div>
            <div>
              <p className="text-sm text-emerald-300 italic">"小子，这绿液可是天地造化之物，省着点用！"</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
