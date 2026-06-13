// 魔气潮汐顶部状态条
// - 仅在 rising / open / closing 阶段显示
// - 关闭阶段不渲染（避免占用屏幕）
// - 跨页面常驻（挂在 App.tsx 的全局位置）

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull } from 'lucide-react';
import { useStore } from '../../store';

function fmtMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}m`;
  const s = totalSec % 60;
  return `${m}m${s.toString().padStart(2, '0')}s`;
}

export default function DemonTideBanner() {
  const { getDemonTidePhase, levelIndex } = useStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // 14 = 筑基初期：未达到入门门槛前完全不显示，避免劝退
  if (levelIndex < 14) return null;

  const { phase, msToNextChange } = getDemonTidePhase();
  if (phase === 'closed') return null;

  const styleByPhase = {
    rising: { bg: 'from-purple-900/80 to-slate-900', text: 'text-purple-200', label: '魔气日盛 · 魔渊将启', icon: '🌑', accent: 'border-purple-500/40' },
    open:    { bg: 'from-red-900/85 to-slate-900',    text: 'text-red-200',    label: '魔渊已启 · 可入战之',  icon: '🩸', accent: 'border-red-500/50' },
    closing: { bg: 'from-amber-900/80 to-slate-900',  text: 'text-amber-200',  label: '魔气消散 · 即将关闭',  icon: '⏳', accent: 'border-amber-500/40' },
  } as const;
  const s = styleByPhase[phase as 'rising' | 'open' | 'closing'];

  return (
    <AnimatePresence>
      <motion.div
        key={phase}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-center px-3 py-1 bg-gradient-to-r ${s.bg} border-b ${s.accent} pointer-events-none`}
        style={{ fontFamily: '"Noto Serif SC", serif' }}
      >
        <span className="text-xs mr-2">{s.icon}</span>
        <Skull size={11} className={`${s.text} mr-1.5`} />
        <span className={`text-[11px] tracking-wider ${s.text}`}>{s.label}</span>
        <span className="text-[10px] text-slate-400 ml-2">{fmtMs(msToNextChange)} 后{phase === 'open' ? '关闭' : phase === 'closing' ? '关闭' : '开启'}</span>
        {/* tick 是为了 force re-render；通过赋值给一个属性让 lint 安静 */}
        <span className="hidden">{tick}</span>
      </motion.div>
    </AnimatePresence>
  );
}
