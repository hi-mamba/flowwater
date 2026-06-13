import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Droplets } from 'lucide-react';

interface QiDrawEvent {
  amount: number;
  message: string;
  timestamp: number;
}

const listeners = new Set<(evt: QiDrawEvent) => void>();

export function emitQiDraw(amount: number, message: string) {
  const evt: QiDrawEvent = { amount, message, timestamp: Date.now() };
  listeners.forEach(fn => fn(evt));
}

export default function QiDrawOverlay() {
  const [event, setEvent] = useState<QiDrawEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (evt: QiDrawEvent) => {
      setEvent(evt);
      setVisible(true);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!visible || !event) return;
    const timer = setTimeout(() => dismiss(), 5000);
    return () => clearTimeout(timer);
  }, [visible, event]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setEvent(null), 500);
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="fixed inset-0 z-[95] flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, y: 60, opacity: 0 }}
            animate={visible ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.5, y: 60, opacity: 0 }}
            exit={{ scale: 0.5, y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            onClick={e => e.stopPropagation()}
            className="relative bg-gradient-to-b from-slate-800/98 to-slate-900/98 border border-emerald-500/30 rounded-3xl p-6 max-w-[280px] w-full shadow-[0_0_60px_rgba(52,211,153,0.2)] mx-4"
          >
            {/* Close button */}
            <button onClick={dismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-700/50 transition-all">
              <X size={18} />
            </button>

            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-20 h-20 mb-4"
              >
                <motion.div className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ boxShadow: '0 0 40px rgba(52,211,153,0.4), 0 0 80px rgba(52,211,153,0.2)' }} />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
                  <Droplets size={28} className="text-white" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full"
                    style={{ left: '50%', top: '50%' }}
                    animate={{ x: [0, (Math.random() - 0.5) * 120], y: [0, (Math.random() - 0.5) * 120], opacity: [1, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.05 }} />
                ))}
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} className="text-lg font-bold text-white mb-1">
                引气入体
              </motion.h2>

              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="flex items-baseline space-x-1 mb-3">
                <span className="text-sm text-emerald-400">修为</span>
                <motion.span className="text-3xl font-bold text-emerald-300"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, delay: 0.4 }}>
                  +{event.amount}
                </motion.span>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-slate-400 text-center leading-relaxed mb-4">
                {event.message}
              </motion.p>

              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={dismiss}
                className="px-6 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
                继续修炼
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
