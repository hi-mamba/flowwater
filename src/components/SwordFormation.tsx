import { useState, Suspense, lazy } from 'react';
import { useStore, SWORD_FORMATIONS, type SwordFormationState } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Hammer } from 'lucide-react';

const SwordFormation3D = lazy(() => import('./three/SwordFormation3D'));

// 单口青竹蜂云剑：竹节剑身 + 翠绿光晕，剑柄黄铜
function BambooSword({ size = 16, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg viewBox="0 0 12 36" width={size * 0.4} height={size}
      className={glow ? 'drop-shadow-[0_0_3px_rgba(34,211,238,0.7)]' : ''}>
      <defs>
        <linearGradient id="bs-blade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      {/* 剑尖 */}
      <path d="M6 0 L8 4 L4 4 Z" fill="#a7f3d0" />
      {/* 剑身 - 竹节 */}
      <rect x="4.5" y="4" width="3" height="22" fill="url(#bs-blade)" />
      {/* 三道竹节 */}
      <rect x="4" y="9" width="4" height="0.8" fill="#065f46" />
      <rect x="4" y="15" width="4" height="0.8" fill="#065f46" />
      <rect x="4" y="21" width="4" height="0.8" fill="#065f46" />
      {/* 护手 */}
      <rect x="2.5" y="26" width="7" height="1.5" fill="#fbbf24" />
      {/* 剑柄 */}
      <rect x="4.5" y="27.5" width="3" height="6" fill="#92400e" />
      {/* 柄尾穗 */}
      <circle cx="6" cy="34" r="1.2" fill="#fbbf24" />
    </svg>
  );
}

export default function SwordFormation() {
  const { swordFormation, spiritStones, levelIndex, materials } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [crafting, setCrafting] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const canCraft = levelIndex >= 10;
  const craftCost = 50 + swordFormation.bambooSwordsCrafted * 10;

  const craftSword = () => {
    setCrafting(true);
    const bamboo = materials['common_herb'] || 0;
    if (bamboo < 1) { showToast('需要灵草作为材料'); setCrafting(false); return; }
    if (spiritStones < craftCost) { showToast(`灵石不足，需要 ${craftCost}`); setCrafting(false); return; }

    const newSwords = Math.min(72, swordFormation.swords + 1);
    const newCrafted = swordFormation.bambooSwordsCrafted + 1;

    useStore.setState(s => ({
      swordFormation: { ...s.swordFormation, swords: newSwords, bambooSwordsCrafted: newCrafted },
      spiritStones: s.spiritStones - craftCost,
      materials: { ...s.materials, common_herb: Math.max(0, (s.materials['common_herb'] || 0) - 1) },
    }));

    setTimeout(() => {
      setCrafting(false);
      if (newSwords === 12) showToast('第一口青竹蜂云剑炼制成功！');
      else if (newSwords === 24) showToast('二十四口飞剑！可布游龙式剑阵！');
      else if (newSwords === 48) showToast('四十八口飞剑！天罗地网式解锁！');
      else if (newSwords === 72) showToast('七十二口飞剑齐备！剑雨风暴降临！');
      else showToast(`炼制成功！${newSwords}/72 口飞剑`);
    }, 1200);
  };

  const setFormation = (fid: string) => {
    const formation = SWORD_FORMATIONS.find(f => f.id === fid);
    if (!formation) return;
    if (swordFormation.swords < formation.minSwords) {
      showToast(`需要 ${formation.minSwords} 口飞剑`); return;
    }

    useStore.setState(s => ({
      swordFormation: {
        ...s.swordFormation,
        formation: fid as SwordFormationState['formation'],
        formationLevel: Math.max(s.swordFormation.formationLevel, formation.unlockLevel),
      },
    }));
    showToast(`剑阵切换：${formation.name}`);
  };

  const currentFormation = SWORD_FORMATIONS.find(f => f.id === swordFormation.formation);
  const nextFormation = SWORD_FORMATIONS.find(f => swordFormation.swords < f.minSwords);

  if (!canCraft) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-950/60 to-emerald-950/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Swords size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-cyan-300">青竹蜂云剑阵</h3>
        </div>
        <p className="text-[10px] text-cyan-400/40">需炼气十层方可开始炼制本命飞剑</p>
      </motion.div>
    );
  }

  // 剑阵环形展示数（最多 12 口围绕中心）
  const ringCount = Math.min(12, swordFormation.swords);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-cyan-950/70 via-emerald-950/60 to-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 overflow-hidden shadow-[inset_0_0_25px_rgba(34,211,238,0.08)]">

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-cyan-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D 剑阵视图 */}
      <div className="mb-3 rounded-xl overflow-hidden border border-cyan-700/30 relative z-10 bg-cyan-950/40">
        <Suspense fallback={<div style={{ height: 240 }} className="flex items-center justify-center text-cyan-500/40 text-xs">凝聚剑阵...</div>}>
          <SwordFormation3D
            swords={swordFormation.swords}
            formation={swordFormation.formation as 'swarm' | 'dragon' | 'net' | 'storm'}
            height={240}
          />
        </Suspense>
      </div>

      {/* 头部 + 剑阵中心展示 */}
      <div className="flex items-start space-x-4 mb-4 relative z-10">
        {/* 中心剑阵：竹剑环绕 */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            {Array.from({ length: ringCount }).map((_, i) => {
              const angle = (i / ringCount) * Math.PI * 2;
              const r = 38;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <div key={i}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${(angle * 180) / Math.PI + 90}deg)`,
                  }}>
                  <BambooSword size={20} />
                </div>
              );
            })}
          </motion.div>
          {/* 中心符文 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border border-cyan-400/40 flex items-center justify-center"
              style={{ boxShadow: '0 0 16px rgba(34,211,238,0.4) inset' }}
            >
              <Swords size={16} className="text-cyan-300" />
            </motion.div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-300 to-emerald-200 bg-clip-text text-transparent">
            青竹蜂云剑阵
          </h3>
          <p className="text-[10px] text-cyan-400/60 mb-2">韩立本命飞剑 · {swordFormation.swords}/72 口</p>

          {/* 飞剑数量 - 网格化 */}
          <div className="grid grid-cols-12 gap-0.5 mb-1">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i}
                className={`h-1.5 rounded-sm ${
                  i < swordFormation.swords
                    ? 'bg-gradient-to-b from-cyan-300 to-emerald-500 shadow-[0_0_2px_rgba(34,211,238,0.8)]'
                    : 'bg-slate-800/60'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-cyan-400/40">
            <span>12</span><span>24</span><span>48</span><span>72</span>
          </div>
        </div>
      </div>

      {/* 当前剑阵 */}
      {currentFormation && (
        <div className="mb-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 relative z-10">
          <div className="flex items-center space-x-2">
            <Shield size={12} className="text-cyan-400" />
            <span className="text-xs font-medium text-cyan-300">当前剑阵：{currentFormation.name}</span>
          </div>
          <p className="text-[10px] text-cyan-400/60 mt-0.5">{currentFormation.effect}</p>
        </div>
      )}

      {/* 剑阵切换 */}
      <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
        {SWORD_FORMATIONS.map(f => {
          const active = swordFormation.formation === f.id;
          const available = swordFormation.swords >= f.minSwords;
          return (
            <motion.button key={f.id} whileTap={{ scale: 0.95 }}
              onClick={() => setFormation(f.id)}
              disabled={!available}
              className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all ${
                active ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.3)]' :
                available ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-cyan-500/30' :
                'bg-slate-800/20 border-slate-700/20 text-slate-600 cursor-not-allowed'
              }`}>
              {f.name} <span className="opacity-60">({f.minSwords})</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
        onClick={craftSword} disabled={crafting || swordFormation.swords >= 72}
        className="relative z-10 w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 border border-cyan-500/40 text-cyan-200 text-xs font-bold hover:from-cyan-500/25 hover:to-emerald-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(34,211,238,0.15)]">
        <motion.div animate={crafting ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity }}>
          <Hammer size={13} />
        </motion.div>
        <span>{crafting ? '炼制中...' : `炼制飞剑 (${craftCost}💎 + 灵草×1)`}</span>
      </motion.button>

      {nextFormation && (
        <p className="text-[10px] text-cyan-400/40 mt-2 text-center relative z-10">
          下一剑阵：{nextFormation.name}（需 {nextFormation.minSwords} 口）
        </p>
      )}
    </motion.div>
  );
}
