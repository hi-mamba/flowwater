// src/components/worldmap/MortalRealmMap.tsx
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

const SKY_GRADIENT: Record<RealmMapProps['timeOfDay'], string> = {
  dawn:  'from-orange-200/30 via-emerald-200/15 to-emerald-900/40',
  day:   'from-sky-200/25 via-emerald-200/10 to-emerald-900/40',
  dusk:  'from-rose-300/30 via-amber-200/15 to-emerald-950/45',
  night: 'from-slate-700/40 via-emerald-900/25 to-emerald-950/55',
};

export default function MortalRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick, timeOfDay,
}: RealmMapProps) {
  const sky = SKY_GRADIENT[timeOfDay];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 天空 */}
      <div className={`absolute inset-0 bg-gradient-to-b ${sky} transition-colors duration-1000`} />

      {/* 远山（仿千里江山图层叠） */}
      <svg className="absolute inset-x-0 bottom-0 w-full h-[70%]" viewBox="0 0 100 70" preserveAspectRatio="none">
        <defs>
          <linearGradient id="m-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a6c4d" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1f3a2a" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="m-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f8c5e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a2f20" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="m-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ba874" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0e1f14" />
          </linearGradient>
        </defs>
        {/* 远山 */}
        <path d="M0,40 L8,30 L18,38 L28,22 L38,32 L48,18 L58,28 L68,20 L78,32 L88,24 L100,34 L100,70 L0,70 Z" fill="url(#m-far)" />
        {/* 中山 */}
        <path d="M0,50 L10,40 L22,46 L32,32 L44,42 L54,30 L66,38 L76,28 L86,40 L100,34 L100,70 L0,70 Z" fill="url(#m-mid)" />
        {/* 近山 */}
        <path d="M0,62 L12,52 L24,58 L36,48 L48,55 L60,46 L72,54 L84,46 L100,56 L100,70 L0,70 Z" fill="url(#m-near)" />
      </svg>

      {/* 缓动云雾 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute rounded-full bg-white/15 blur-2xl pointer-events-none"
          style={{ width: `${60 + i * 20}px`, height: `${20 + i * 8}px`, top: `${20 + i * 12}%` }}
          animate={{ x: ['-10%', '110%'] }}
          transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear', delay: i * 5 }}
        />
      ))}

      {/* 地点标记 */}
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
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.5 }}
            whileHover={{ scale: unlocked ? 1.15 : 1 }}
            whileTap={{ scale: unlocked ? 0.95 : 1 }}
          >
            {/* 当前位置脉冲圈 */}
            {isCurrent && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-amber-300/70"
                style={{ width: 48, height: 48, left: -10, top: -10 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            {/* 玉印章 */}
            <div
              className={`relative w-7 h-7 flex items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all ${
                unlocked
                  ? 'bg-amber-50/90 border-rose-700/70 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                  : 'bg-slate-800/60 border-slate-600/50 opacity-50'
              }`}
            >
              {unlocked
                ? <Icon size={14} className="text-rose-800" />
                : <Lock size={12} className="text-slate-400" />}
            </div>
            {/* 篆体地名 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap">
              <span
                className={`text-[10px] px-2 py-0.5 rounded ${
                  unlocked
                    ? 'bg-stone-100/85 text-stone-900 font-bold shadow-sm'
                    : 'bg-slate-900/70 text-slate-500'
                }`}
                style={{ fontFamily: '"STZhongsong", "KaiTi", "STKaiti", serif' }}
              >
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
