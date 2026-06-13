import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { type Encounter, type EncounterChoice } from '../data/encounters';
import EncounterModal from './EncounterModal';
import { Sparkles } from 'lucide-react';

// Ultra-rare serendipity events that run silently in the background
export default function Serendipity() {
  const {
    logs, levelIndex, checkIn, streakDays, materials, inventory, spiritStones,
    addMaterial, addSpiritStones, heavenlyBottle, goldDevouringBeetles,
    collectGreenLiquid, spiritualRoot, testSpiritualRoot,
    setBreakthroughEvent,
  } = useStore();

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState<{ title: string; message: string; rarity: string } | null>(null);

  // Apply encounter rewards/penalties
  const handleChoice = useCallback((choice: EncounterChoice) => {
    if (!encounter) return;

    const success = Math.random() < choice.outcome.successChance;
    const outcome = success ? choice.outcome.success : choice.outcome.failure;

    const reward = 'reward' in outcome && outcome.reward ? outcome.reward : null;
    const penalty = 'penalty' in outcome && outcome.penalty ? outcome.penalty : null;

    if (reward) {
      const r = reward;
      switch (r.type) {
        case 'spiritStones':
          addSpiritStones(r.amount);
          break;
        case 'material':
          if (r.item) addMaterial(r.item, r.amount);
          break;
        case 'cultivation':
          useStore.setState(s => ({ bonusPoints: s.bonusPoints + r.amount }));
          break;
        case 'passive_boost':
          // Permanent multiplier stored as accomplishment
          addBanner(`✦ ${r.amount}%`, `饮水修为永久提升 ${r.amount}%！`, 'rare');
          break;
        case 'spiritual_root_upgrade':
          if (r.amount >= 2) {
            useStore.setState({ spiritualRoot: 'waste_genius' });
          } else {
            useStore.setState({ spiritualRoot: 'heaven' });
          }
          addBanner('灵根觉醒！', '你的灵根发生了翻天覆地的变化！', 'legendary');
          break;
        case 'level_boost':
          const newLevel = Math.min(CULTIVATION_LEVELS.length - 1, levelIndex + r.amount);
          useStore.setState({ levelIndex: newLevel });
          addBanner('连破三境！', `修为暴涨至 ${CULTIVATION_LEVELS[newLevel]?.name}！`, 'legendary');
          break;
        case 'luck':
          useStore.setState(s => ({ baseLuck: Math.min(100, s.baseLuck + r.amount) }));
          break;
        case 'formation_exp':
          useStore.setState(s => ({ formationLevel: s.formationLevel + r.amount }));
          break;
      }
    }

    if (penalty) {
      const p = penalty;
      switch (p.type) {
        case 'spiritStones':
          addSpiritStones(-p.amount);
          break;
        case 'cultivation':
          useStore.setState(s => ({ bonusPoints: Math.max(0, s.bonusPoints - p.amount) }));
          break;
        case 'luck':
          useStore.setState(s => ({ baseLuck: Math.max(10, s.baseLuck - p.amount) }));
          break;
      }
    }
  }, [encounter, levelIndex, addSpiritStones, addMaterial]);

  // Silent background serendipity checks
  const checkSilentSerendipity = useCallback(() => {
    const ultraRare = Math.random();

    // 0.1% chance: Waste genius awakening
    if (ultraRare < 0.001 && spiritualRoot === 'waste_genius' && levelIndex < 10) {
      useStore.setState(s => ({ bonusPoints: s.bonusPoints + 10000 }));
      addBanner('大器晚成', '废柴逆袭体质觉醒！修为暴涨一万点！你就是下一个韩立！', 'legendary');
    }

    // 0.05% chance: Heavenly bottle mutation
    if (ultraRare < 0.0005 && heavenlyBottle.level > 0) {
      const newLevel = Math.min(5, heavenlyBottle.level + 1);
      useStore.setState(s => ({
        heavenlyBottle: { ...s.heavenlyBottle, level: newLevel, maxLiquid: BOTTLE_LEVELS[newLevel - 1].maxLiquid },
      }));
      addBanner('瓶灵突变！', `掌天瓶自动进化为 ${BOTTLE_LEVELS[newLevel - 1].name}！`, 'legendary');
    }

    // Sleep notification
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const hoursSinceDrink = (Date.now() - lastLog.timestamp) / (1000 * 60 * 60);
      if (hoursSinceDrink > 3 && hoursSinceDrink < 4) {
        addNotification('你已经三个时辰没有饮水了，灵气正在缓缓流失...');
      }
    }
  }, [spiritualRoot, levelIndex, heavenlyBottle, logs]);

  // Run serendipity checks periodically
  useEffect(() => {
    const interval = setInterval(checkSilentSerendipity, 30000);
    return () => clearInterval(interval);
  }, [checkSilentSerendipity]);

  // Watch for pending encounters triggered from the UI
  useEffect(() => {
    const state = useStore.getState();
    if (state.pendingEncounterId) {
      import('../data/encounters').then(({ ENCOUNTERS }) => {
        const enc = ENCOUNTERS.find(e => e.id === state.pendingEncounterId);
        if (enc) setEncounter(enc);
        useStore.setState({ pendingEncounterId: null });
      });
    }
    const unsub = useStore.subscribe((s) => {
      if (s.pendingEncounterId) {
        import('../data/encounters').then(({ ENCOUNTERS }) => {
          const enc = ENCOUNTERS.find(e => e.id === s.pendingEncounterId);
          if (enc) setEncounter(enc);
          useStore.setState({ pendingEncounterId: null });
        });
      }
    });
    return unsub;
  }, []);

  const addBanner = (title: string, message: string, rarity: string) => {
    setShowBanner({ title, message, rarity });
    setTimeout(() => setShowBanner(null), 5000);
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [...prev.slice(-3), msg]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 4000);
  };

  return (
    <>
      {/* Epic banner for rare events */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15 }}
            className="fixed top-4 left-4 right-4 z-[160] mx-auto max-w-sm"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-xl ${
              showBanner.rarity === 'legendary'
                ? 'bg-amber-500/10 border-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
                : 'bg-purple-500/10 border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
            }`}>
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 30, -30, 0], scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center"
                >
                  <Sparkles size={20} className="text-amber-400" />
                </motion.div>
                <div>
                  <div className="text-sm font-bold text-amber-300">{showBanner.title}</div>
                  <div className="text-xs text-amber-400/80">{showBanner.message}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle notification bar */}
      <AnimatePresence>
        {notifications.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed z-[155] px-3 py-2 rounded-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-xs text-slate-400 shadow-lg`}
            style={{ bottom: `${100 + i * 50}px`, right: '12px' }}
          >
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Encounter modal */}
      <AnimatePresence>
        {encounter && (
          <EncounterModal
            encounter={encounter}
            onChoice={handleChoice}
            onClose={() => setEncounter(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Re-export for convenience
import { CULTIVATION_LEVELS, BOTTLE_LEVELS } from '../store';
