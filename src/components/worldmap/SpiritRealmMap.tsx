// src/components/worldmap/SpiritRealmMap.tsx
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

export default function SpiritRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick,
}: RealmMapProps) {
  // 灵气粒子
  const particles = useMemo(
    () => Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
      color: ['#34d399', '#22d3ee', '#818cf8', '#a78bfa'][Math.floor(Math.random() * 4)],
    })),
    []
  );

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 深紫蓝径向背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950/80 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(129,140,248,0.18),transparent_60%)]" />

      {/* 星空 */}
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
          }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* 灵气粒子（底→顶） */}
      {particles.map(p => (
        <motion.div
          key={`p-${p.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
          animate={{ y: ['105%', '-5%'], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
        />
      ))}

      {/* 仙鹤剪影（30s 一次） */}
      <motion.div
        className="absolute text-2xl pointer-events-none"
        style={{ top: '15%' }}
        animate={{ x: ['-10%', '110%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 5 }}
      >
        🦤
      </motion.div>

      {/* 地点（六边形灵脉印记） */}
      {locations.map(loc => {
        const Icon = ICON_MAP[loc.iconKey];
        const unlocked = unlockedLocationIds.has(loc.id);
        const isCurrent = currentLocationId === loc.id;

        return (
          <motion.button
            key={loc.id}
            onClick={() => onLocationClick(loc)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: unlocked ? [0, -4, 0] : 0,
            }}
            transition={{
              scale: { delay: Math.random() * 0.5 },
              y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: unlocked ? 1.15 : 1 }}
            whileTap={{ scale: unlocked ? 0.95 : 1 }}
          >
            {isCurrent && (
              <motion.span
                className="absolute rounded-full border-2 border-indigo-300/70"
                style={{ width: 56, height: 56, left: -14, top: -14 }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            {/* 六边形 */}
            <div
              className={`relative w-7 h-7 flex items-center justify-center transition-all ${unlocked ? 'opacity-100' : 'opacity-50'}`}
              style={{
                clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                background: unlocked
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(34,211,238,0.55))'
                  : 'rgba(100,116,139,0.3)',
                border: 'none',
                boxShadow: unlocked ? '0 0 10px rgba(168,85,247,0.5)' : 'none',
              }}
            >
              {unlocked
                ? <Icon size={13} className="text-amber-200" />
                : <Lock size={12} className="text-slate-400" />}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                unlocked
                  ? 'bg-indigo-950/85 text-indigo-100 border border-indigo-400/40 font-medium'
                  : 'bg-slate-900/70 text-slate-500'
              }`}>
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
