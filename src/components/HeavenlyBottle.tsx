import { motion } from 'motion/react';
import { Zap, Copy } from 'lucide-react';
import { useStore, BOTTLE_LEVELS } from '../store';
import { useState, Suspense, lazy } from 'react';

const Bottle3D = lazy(() => import('./three/Bottle3D'));

// 掌天瓶 — 青玉葫芦造型，瓶口窄、腹部圆，翠绿液体可见
function BottleSvg({ fillPercent, level }: { fillPercent: number; level: number }) {
  const liquidY = 70 - (fillPercent / 100) * 50; // 60..110 内的水位
  const isAdvanced = level >= 3;
  return (
    <svg viewBox="0 0 60 90" width="56" height="84" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
      <defs>
        <linearGradient id="bottle-glaze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="bottle-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="bottle-shine" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bottle-clip">
          {/* 葫芦轮廓：上小下大 */}
          <path d="M24 18 Q24 12 30 12 Q36 12 36 18 L36 28
                   Q44 32 44 42 Q44 56 38 64
                   Q40 70 35 76 Q30 82 25 76
                   Q20 70 22 64 Q16 56 16 42 Q16 32 24 28 Z" />
        </clipPath>
      </defs>

      {/* 瓶身轮廓 */}
      <path d="M24 18 Q24 12 30 12 Q36 12 36 18 L36 28
               Q44 32 44 42 Q44 56 38 64
               Q40 70 35 76 Q30 82 25 76
               Q20 70 22 64 Q16 56 16 42 Q16 32 24 28 Z"
        fill="url(#bottle-glaze)" stroke="#064e3b" strokeWidth="0.8" />

      {/* 液体（裁剪到瓶身） */}
      <g clipPath="url(#bottle-clip)">
        <rect x="0" y={liquidY} width="60" height="90" fill="url(#bottle-liquid)" opacity="0.85" />
        {/* 液面波纹 */}
        <path d={`M0 ${liquidY} Q15 ${liquidY - 2} 30 ${liquidY} T60 ${liquidY} L60 ${liquidY + 4} L0 ${liquidY + 4} Z`}
          fill="#a7f3d0" opacity="0.6" />
      </g>

      {/* 高光 */}
      <ellipse cx="22" cy="35" rx="3" ry="8" fill="url(#bottle-shine)" />

      {/* 瓶塞 / 顶 */}
      <rect x="26" y="6" width="8" height="6" rx="1" fill="#854d0e" />
      <rect x="25" y="9" width="10" height="2" rx="0.5" fill="#fbbf24" />

      {/* 高阶时的符文环 */}
      {isAdvanced && (
        <>
          <circle cx="30" cy="46" r="14" fill="none" stroke="#fde047" strokeWidth="0.4" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="30" cy="46" r="11" fill="none" stroke="#a7f3d0" strokeWidth="0.3" strokeDasharray="1 3" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

export default function HeavenlyBottle() {
  const { heavenlyBottle, cave, useGreenLiquidRipen, useGreenLiquidDuplicate, materials, inventory } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const config = BOTTLE_LEVELS[heavenlyBottle.level - 1];
  const fillPercent = (heavenlyBottle.greenLiquid / heavenlyBottle.maxLiquid) * 100;
  const nextLevel = BOTTLE_LEVELS.find(b => b.level === heavenlyBottle.level + 1);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleRipen = () => {
    const unripe = cave.herbs.find(h => h.stage !== 'mature');
    if (!unripe) { showToast('没有需要催熟的灵草'); return; }
    const r = useGreenLiquidRipen(unripe.id);
    showToast(r.message);
  };

  const handleDuplicate = () => {
    const allItems = [
      ...Object.entries(materials).filter(([_, v]) => v > 0).map(([k]) => k),
      ...inventory,
    ];
    if (allItems.length === 0) { showToast('背包中没有可复制的物品'); return; }
    const target = allItems[0];
    const r = useGreenLiquidDuplicate(target);
    showToast(r.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-emerald-950/70 via-teal-950/60 to-slate-900/60 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 overflow-hidden shadow-[inset_0_0_25px_rgba(16,185,129,0.08)]"
    >
      {/* 翠绿灵气粒子 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-emerald-300/40 rounded-full pointer-events-none"
          initial={{ x: 30 + Math.random() * 40, y: 100 }}
          animate={{ y: -10, opacity: [0, 0.7, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
        />
      ))}

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {toast}
        </motion.div>
      )}

      {/* 3D 葫芦视图 */}
      <div className="mb-3 rounded-xl overflow-hidden border border-emerald-700/30 relative z-10 bg-emerald-950/40">
        <Suspense fallback={<div style={{ height: 220 }} className="flex items-center justify-center text-emerald-500/40 text-xs">加载法器...</div>}>
          <Bottle3D level={heavenlyBottle.level} fillPercent={fillPercent} height={220} />
        </Suspense>
      </div>

      {/* Header + 葫芦造型（保留小预览） */}
      <div className="flex items-start space-x-4 mb-4 relative z-10">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <BottleSvg fillPercent={fillPercent} level={heavenlyBottle.level} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-bold bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              {config.name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Lv.{heavenlyBottle.level}
            </span>
          </div>
          <p className="text-[10px] text-emerald-500/70 mb-2">{config.desc}</p>

          {/* 液量进度条 */}
          <div className="flex items-center justify-between text-[10px] text-emerald-400/70 mb-1">
            <span>翠绿灵液</span>
            <span className="font-mono">{heavenlyBottle.greenLiquid}/{heavenlyBottle.maxLiquid}</span>
          </div>
          <div className="relative h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-emerald-700/40">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-300 rounded-full"
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

      {nextLevel && (
        <p className="text-[10px] text-amber-400/60 mb-3 relative z-10">
          下一阶：{nextLevel.name}（饮水累计 {heavenlyBottle.totalDrinksFed}/{nextLevel.upgradeAt}）
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-2 relative z-10">
        <button
          onClick={handleRipen}
          disabled={heavenlyBottle.greenLiquid < 5}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Zap size={13} />
          <span>催熟 (5💧)</span>
        </button>
        <button
          onClick={handleDuplicate}
          disabled={heavenlyBottle.greenLiquid < 10}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium hover:bg-teal-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Copy size={13} />
          <span>复制 (10💧)</span>
        </button>
      </div>
    </motion.div>
  );
}
