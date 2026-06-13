import { motion } from 'motion/react';
import { TrendingUp, Shield } from 'lucide-react';
import { useStore, BEETLE_STAGES } from '../store';
import { useState, Suspense, lazy } from 'react';

const Beetles3D = lazy(() => import('./three/Beetles3D'));

// 动画里噬金虫的标志：金黄甲壳 + 青铜光泽 + 三对足，体型小如指甲
function BeetleIcon({ size = 18, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={glow ? 'drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]' : ''}>
      <defs>
        <radialGradient id="bg-shell" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </radialGradient>
      </defs>
      {/* 触角 */}
      <path d="M9 5 L7 2 M15 5 L17 2" stroke="#713f12" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* 头 */}
      <ellipse cx="12" cy="6" rx="3" ry="2.2" fill="#a16207" />
      {/* 身体甲壳 */}
      <ellipse cx="12" cy="13" rx="5" ry="6" fill="url(#bg-shell)" />
      {/* 中线（鞘翅分割） */}
      <line x1="12" y1="8" x2="12" y2="18" stroke="#713f12" strokeWidth="0.5" />
      {/* 甲壳光泽 */}
      <ellipse cx="10" cy="11" rx="1.2" ry="2" fill="#fef3c7" opacity="0.6" />
      {/* 三对足 */}
      <path d="M7 10 L4 9 M7 13 L3 13 M7 16 L4 18 M17 10 L20 9 M17 13 L21 13 M17 16 L20 18"
        stroke="#713f12" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function GoldDevouringBeetles() {
  const { goldDevouringBeetles, spiritStones, feedBeetles, getBeetleBonus } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const stageConfig = BEETLE_STAGES[goldDevouringBeetles.stage - 1];
  const nextStage = BEETLE_STAGES[goldDevouringBeetles.stage];
  const bonus = getBeetleBonus();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // 浮动的虫群粒子（上限按数量缩放）
  const swarmCount = Math.min(12, Math.floor(goldDevouringBeetles.count / 5) + 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-yellow-950/70 via-amber-950/60 to-orange-950/60 backdrop-blur-md border border-yellow-600/30 rounded-2xl p-5 overflow-hidden shadow-[inset_0_0_30px_rgba(202,138,4,0.1)]"
    >
      {/* 蜂窝纹理背景 */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 8px, #fbbf24 8px, #fbbf24 9px, transparent 9px)`,
          backgroundSize: '20px 20px',
        }} />

      {/* 飞舞的金虫群 */}
      {Array.from({ length: swarmCount }).map((_, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          initial={{
            x: Math.random() * 280,
            y: Math.random() * 180,
          }}
          animate={{
            x: [Math.random() * 280, Math.random() * 280, Math.random() * 280],
            y: [Math.random() * 180, Math.random() * 180, Math.random() * 180],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }}>
          <BeetleIcon size={8 + Math.random() * 4} glow={false} />
        </motion.div>
      ))}

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-yellow-500/90 text-slate-900 px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {toast}
        </motion.div>
      )}

      {/* 3D 虫群视图 */}
      <div className="mb-3 rounded-xl overflow-hidden border border-yellow-700/30 relative z-10 bg-amber-950/40">
        <Suspense fallback={<div style={{ height: 180 }} className="flex items-center justify-center text-yellow-500/40 text-xs">加载虫群...</div>}>
          <Beetles3D count={goldDevouringBeetles.count} stage={goldDevouringBeetles.stage} height={180} />
        </Suspense>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-700/30 flex items-center justify-center border border-yellow-500/40 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
          >
            <BeetleIcon size={22} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-300 to-amber-200 bg-clip-text text-transparent">噬金虫</h3>
            <p className="text-[10px] text-yellow-500/70">{stageConfig.name} · 第 {goldDevouringBeetles.stage} 阶</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-yellow-300 font-mono drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]">
            {goldDevouringBeetles.count}
          </div>
          <div className="text-[9px] text-yellow-500/60">只</div>
        </div>
      </div>

      {/* 阶段效果 */}
      <div className="flex items-center space-x-1.5 mb-2 text-[10px] text-yellow-300/70 relative z-10">
        <TrendingUp size={11} />
        <span>{stageConfig.effect}</span>
      </div>

      {goldDevouringBeetles.stage >= 3 && !goldDevouringBeetles.autoDefenseUsed && (
        <div className="flex items-center space-x-1.5 mb-2 text-[10px] text-emerald-400/70 relative z-10">
          <Shield size={11} />
          <span>今日自动防御：可用</span>
        </div>
      )}

      {/* 进化条 */}
      {nextStage && (
        <div className="mb-3 relative z-10">
          <div className="flex justify-between text-[10px] text-yellow-400/60 mb-1">
            <span>进化至 {nextStage.name}</span>
            <span className="font-mono">{goldDevouringBeetles.count}/{nextStage.minCount}</span>
          </div>
          <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-yellow-700/40 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-700 via-yellow-500 to-yellow-300 rounded-full relative"
              animate={{ width: `${Math.min(100, (goldDevouringBeetles.count / nextStage.minCount) * 100)}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-pulse" />
            </motion.div>
          </div>
        </div>
      )}

      {goldDevouringBeetles.stage === 1 && bonus > 0 && (
        <p className="text-[10px] text-yellow-400/60 mb-2 relative z-10">每次饮水额外 +{bonus} 修为</p>
      )}

      {/* 喂食按钮 */}
      <button
        onClick={() => { const r = feedBeetles(100); showToast(r.message); }}
        disabled={spiritStones < 100}
        className="relative z-10 w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/40 text-yellow-200 text-xs font-medium hover:from-yellow-500/30 hover:to-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(250,204,21,0.15)]"
      >
        <BeetleIcon size={14} glow={false} />
        <span>喂食灵石 (100 💎 → +10 只)</span>
      </button>

      <p className="text-[10px] text-yellow-500/40 mt-2 text-center relative z-10 italic">"{stageConfig.desc}"</p>
    </motion.div>
  );
}
