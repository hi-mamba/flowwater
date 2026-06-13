import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Star, Flame, Sparkles, X, Check, Calendar } from 'lucide-react';

const WEEKLY_REWARDS = [
  { day: 1, name: '灵石', icon: '💎', amount: 100, type: 'stones' },
  { day: 2, name: '凝气草', icon: '🌿', amount: 2, type: 'material', item: 'common_herb' },
  { day: 3, name: '清心丹', icon: '💊', amount: 1, type: 'material', item: 'qingxin_pill' },
  { day: 4, name: '灵石', icon: '💎', amount: 300, type: 'stones' },
  { day: 5, name: '洗髓草', icon: '🌱', amount: 1, type: 'material', item: 'rare_herb' },
  { day: 6, name: '筑基丹碎片', icon: '✨', amount: 1, type: 'material', item: 'pill_foundation' },
  { day: 7, name: '随机法宝', icon: '🎁', amount: 1, type: 'random_artifact', special: true },
];

export default function DailyCheckIn() {
  const { streakDays, lastActiveDate, addSpiritStones, addMaterial, inventory } = useStore();
  const [visible, setVisible] = useState(false);
  const [claimedDay, setClaimedDay] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const today = new Date().toLocaleDateString('zh-CN');
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyClaimed = lastActiveDate === todayStr;
  const currentDay = ((streakDays - 1) % 7) + 1;

  // Show on mount if not claimed today
  useEffect(() => {
    if (!alreadyClaimed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [alreadyClaimed]);

  const claim = () => {
    if (alreadyClaimed || animating) return;
    setAnimating(true);

    const reward = WEEKLY_REWARDS.find(r => r.day === currentDay);
    if (!reward) return;

    const store = useStore.getState();

    switch (reward.type) {
      case 'stones':
        addSpiritStones(reward.amount);
        break;
      case 'material':
        if (reward.item) addMaterial(reward.item, reward.amount);
        break;
      case 'random_artifact':
        addSpiritStones(500);
        const artifacts = ['flying_sword', 'shield_artifact', 'spirit_stone_ring', 'storage_bag_small'];
        const r = artifacts[Math.floor(Math.random() * artifacts.length)];
        useStore.setState({ inventory: [...store.inventory, r] });
        break;
    }

    // Update lastActiveDate
    useStore.setState({ lastActiveDate: todayStr });

    setTimeout(() => {
      setClaimedDay(currentDay);
      setAnimating(false);
    }, 800);
  };

  const dismiss = () => {
    setVisible(false);
    // Still mark as active
    if (!alreadyClaimed) useStore.setState({ lastActiveDate: todayStr });
  };

  if (!visible && alreadyClaimed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 18 }}
            onClick={e => e.stopPropagation()}
            className="bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/20 rounded-3xl p-6 w-full max-w-sm relative overflow-hidden"
          >
            {/* Close */}
            <button onClick={dismiss}
              className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
              <X size={18} />
            </button>

            {/* Title */}
            <div className="text-center mb-5">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Calendar size={28} className="text-amber-400" />
              </motion.div>
              <h2 className="text-lg font-bold text-white">
                {alreadyClaimed ? '今日已签到' : '每日签到'}
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">
                {alreadyClaimed
                  ? `已连续修炼 ${streakDays} 天`
                  : `连续修炼 ${streakDays} 天 · 今日第 ${currentDay} 天`
                }
              </p>
            </div>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {WEEKLY_REWARDS.map((reward) => {
                const isToday = reward.day === currentDay;
                const isPast = reward.day < currentDay;
                const isClaimed = claimedDay && reward.day <= claimedDay;

                return (
                  <motion.div
                    key={reward.day}
                    animate={isToday && !alreadyClaimed ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isClaimed || isPast
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isToday && !alreadyClaimed
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-800/30 border-slate-700/20 opacity-60'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{reward.icon}</span>
                    <span className="text-[8px] text-slate-400">Day {reward.day}</span>
                    <span className="text-[7px] text-slate-500 truncate w-full text-center">
                      {reward.name}
                    </span>
                    {(isClaimed || isPast) && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Claim button */}
            {!alreadyClaimed && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={claim}
                disabled={animating}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <motion.div animate={animating ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}>
                  <Gift size={18} />
                </motion.div>
                <span>{animating ? '领取中...' : `签到领取奖励`}</span>
              </motion.button>
            )}

            {/* Claim success animation */}
            <AnimatePresence>
              {claimedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
                >
                  <Sparkles size={16} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-emerald-300">
                    签到成功！获得 {WEEKLY_REWARDS[claimedDay - 1]?.name}
                    {claimedDay === 7 ? ' + 随机法宝！' : ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streak warning */}
            {alreadyClaimed && (
              <p className="text-[10px] text-slate-600 text-center mt-3">
                明日继续签到，奖励更丰厚！断签将损失 5% 修为。
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
