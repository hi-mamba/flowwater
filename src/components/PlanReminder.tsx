import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Droplets, Swords, Flame, Brain, Moon, Coffee, Sunrise, Zap } from 'lucide-react';
import { vibratePlanReminder, stopVibration, type VibrationPattern } from '../utils/vibration';

const PLAN_ICONS: Record<string, typeof Droplets> = {
  '晨间吐纳': Sunrise,
  '御剑术修炼': Swords,
  '炼丹研习': Flame,
  '神识冥想': Brain,
  '子夜打坐': Moon,
  '灵泉汲水': Droplets,
  '灵咖提神': Coffee,
};

export default function PlanReminder() {
  const { plans, settings, addLog } = useStore();
  const [activeReminder, setActiveReminder] = useState<{ id: string; name: string; planId: string } | null>(null);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTriggered = useRef<Record<string, string>>({});

  const checkPlans = useCallback(() => {
    if (activeReminder || (snoozeUntil && Date.now() < snoozeUntil)) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const plan of plans) {
      if (!plan.active) continue;

      const [sh, sm] = plan.startTime.split(':').map(Number);
      const [eh, em] = plan.endTime.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (currentMinutes < startMin || currentMinutes > endMin) continue;

      const elapsedSinceStart = currentMinutes - startMin;
      const intervalsPassed = Math.floor(elapsedSinceStart / plan.intervalMinutes);
      const nextTriggerMin = startMin + (intervalsPassed + 1) * plan.intervalMinutes;

      if (nextTriggerMin > endMin) continue;

      const diff = Math.abs(currentMinutes - nextTriggerMin);
      if (diff <= 1) {
        const triggerKey = `${plan.id}_${nextTriggerMin}`;
        const lastKey = lastTriggered.current[plan.id];

        if (lastKey !== triggerKey) {
          lastTriggered.current[plan.id] = triggerKey;

          // Vibration!
          vibratePlanReminder(plan.name);

          // Play sound
          try {
            if (!audioRef.current) {
              audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
              audioRef.current.volume = 0.5;
            }
            audioRef.current.play().catch(() => {});
          } catch {}

          setActiveReminder({ id: triggerKey, name: plan.name, planId: plan.id });
        }
      }
    }
  }, [plans, activeReminder, snoozeUntil]);

  useEffect(() => {
    const interval = setInterval(checkPlans, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkPlans]);

  const handleDrink = () => {
    if (activeReminder) {
      addLog(250);
      stopVibration();
      setActiveReminder(null);
    }
  };

  const handleSnooze = () => {
    stopVibration();
    setActiveReminder(null);
    setSnoozeUntil(Date.now() + 5 * 60 * 1000); // 5 min snooze
  };

  const handleDismiss = () => {
    stopVibration();
    setActiveReminder(null);
  };

  if (!activeReminder) return null;

  const planName = activeReminder.name;
  const Icon = PLAN_ICONS[planName] || Bell;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
      >
        <button onClick={handleDismiss}
          className="absolute top-8 right-8 text-slate-400 hover:text-white z-10">
          <X size={32} />
        </button>

        <div className="flex flex-col items-center text-center max-w-sm">
          {/* Animated icon */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 via-orange-400/20 to-red-400/10 flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.3)] mb-8"
          >
            <Icon size={48} className="text-amber-300" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-light text-white mb-2">修炼时辰已到</h2>
          <p className="text-amber-400/80 mb-2 font-medium">{planName}</p>
          <p className="text-slate-400 mb-10 text-sm">道心不可懈怠，把握每个修炼时机</p>

          {/* Vibration indicator */}
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="flex items-center space-x-2 text-amber-400/60 mb-8"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <Zap size={14} />
            </motion.div>
            <span className="text-[10px]">震动提醒中...</span>
          </motion.div>

          {/* Actions */}
          <div className="flex space-x-3 w-full">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleDrink}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-emerald-500/20 transition-colors"
            >
              开始修炼
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSnooze}
              className="px-6 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-2xl py-4 text-sm font-medium border border-slate-600 transition-colors"
            >
              稍后 (5分钟)
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
