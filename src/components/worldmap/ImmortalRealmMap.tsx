// src/components/worldmap/ImmortalRealmMap.tsx
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { RealmMapProps } from './types';
import { ICON_MAP } from './types';

interface ImmortalRealmMapProps extends RealmMapProps {
  mistOverlay?: boolean;  // 未飞升时，整界灰雾遮蔽
}

export default function ImmortalRealmMap({
  locations, currentLocationId, unlockedLocationIds, onLocationClick, mistOverlay = false,
}: ImmortalRealmMapProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* 金色 + 米白渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-amber-50/20 to-amber-200/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(252,211,77,0.35),transparent_70%)]" />

      {/* 云海层（多层模糊圆） */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`yun-${i}`}
          className="absolute rounded-full bg-white/40 blur-3xl pointer-events-none"
          style={{
            width: `${100 + i * 30}px`,
            height: `${30 + i * 12}px`,
            top: `${30 + i * 9}%`,
            left: `${(i * 18) % 90}%`,
          }}
          animate={{ x: ['0%', '15%', '0%'], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 18 + i * 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* 漂浮仙宫剪影 */}
      <svg className="absolute inset-x-0 top-[20%] w-full h-[40%] opacity-25 pointer-events-none" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M20,30 L22,18 L24,22 L26,15 L28,22 L30,18 L32,30 Z M55,32 L57,15 L60,20 L63,12 L66,20 L69,15 L71,32 Z M80,30 L82,20 L84,24 L86,16 L88,24 L90,20 L92,30 Z" fill="#854d0e" />
      </svg>

      {/* 地点 */}
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
            whileHover={{ scale: unlocked && !mistOverlay ? 1.15 : 1 }}
            whileTap={{ scale: unlocked && !mistOverlay ? 0.95 : 1 }}
          >
            {isCurrent && (
              <motion.span
                className="absolute rounded-full border-2 border-amber-400/80"
                style={{ width: 56, height: 56, left: -14, top: -14 }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <div
              className={`relative w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-200/95 to-amber-400/85 border-amber-700/70 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'bg-slate-700/40 border-slate-500/40 opacity-50'
              }`}
              style={{ transform: 'rotate(45deg)' }}
            >
              <div style={{ transform: 'rotate(-45deg)' }}>
                {unlocked
                  ? <Icon size={14} className="text-amber-900" />
                  : <Lock size={12} className="text-slate-400" />}
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 whitespace-nowrap">
              <span className={`text-[10px] px-2 py-0.5 rounded ${
                unlocked
                  ? 'bg-amber-50/95 text-amber-900 font-bold border border-amber-700/40'
                  : 'bg-slate-900/70 text-slate-500'
              }`}>
                {unlocked ? loc.name : '???'}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* 灰雾遮蔽（未飞升时） */}
      {mistOverlay && (
        <div className="absolute inset-0 backdrop-blur-md bg-slate-100/40 flex items-center justify-center pointer-events-auto">
          <div className="text-center px-6">
            <p className="text-sm text-slate-700 font-bold tracking-widest mb-2">仙凡之隔</p>
            <p className="text-xs text-slate-600">渡劫飞升后方可一窥仙界</p>
          </div>
        </div>
      )}
    </div>
  );
}
