import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Package, Sparkles, Gem, X } from 'lucide-react';
import HeavenlyBottle from '../components/HeavenlyBottle';
import LifeboundArtifact from '../components/LifeboundArtifact';
import GoldDevouringBeetles from '../components/GoldDevouringBeetles';
import DivineSense from '../components/DivineSense';
import SwordFormation from '../components/SwordFormation';
import SpiritBeastComponent from '../components/SpiritBeast';
import PuppetMaster from '../components/PuppetMaster';
import CaveSteward from '../components/CaveSteward';
import CultivationPathSelect from '../components/CultivationPath';
import HerbGarden from '../components/HerbGarden';
import AlchemyFurnace from '../components/AlchemyFurnace';
import CraftingTable from '../components/CraftingTable';
import SpiritRealm from '../components/SpiritRealm';
import { getRegionTheme } from '../data/regionThemes';

export default function CavePage() {
  const { cave, materials, collectSpring, spiritStones, currentRegion, spiritRealm } = useStore();
  const [showInventory, setShowInventory] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hoursPassed = (currentTime - cave.lastSpringCollect) / (1000 * 60 * 60);
  const springAmount = Math.floor(Math.min(24, cave.springQi + hoursPassed));

  const theme = getRegionTheme(currentRegion, spiritRealm?.currentContinent);
  const isSpiritRealm = currentRegion === '灵界';
  const isDemonRealm = currentRegion === '魔界';
  const isImmortalRealm = currentRegion === '仙界';

  return (
    <div className="flex flex-col min-h-full p-6 relative overflow-y-auto pb-24"
      style={{ background: theme.bgStyle }}
    >
      {/* 区域石壁纹理 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 30%, #94a3b8 1px, transparent 2px),
            radial-gradient(circle at 75% 70%, #94a3b8 1px, transparent 2px),
            radial-gradient(circle at 50% 50%, #64748b 1px, transparent 2px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px',
        }} />

      {/* 飘动的灵气雾 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-32 h-16 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${theme.glow}, transparent 70%)`,
            opacity: 0.15,
            filter: 'blur(20px)',
            top: `${10 + i * 18}%`,
            left: `${(i % 2) * 60 - 10}%`,
          }}
          animate={{
            x: [0, 40, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* 魔界专属：血色魔气流 */}
      {isDemonRealm && Array.from({ length: 4 }).map((_, i) => (
        <motion.div key={`demon-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: 120, height: 4,
            background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.4), transparent)',
            top: `${15 + i * 22}%`,
            filter: 'blur(2px)',
          }}
          animate={{ x: ['-30%', '130%'], opacity: [0, 0.8, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
        />
      ))}

      {/* 仙界专属：金色光柱 */}
      {isImmortalRealm && Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={`imm-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: 2,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(254,240,138,0.5), transparent)',
            left: `${10 + i * 15}%`,
          }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* 顶栏：地域牌匾（按当前界域） */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-10 rounded-full"
            style={{
              background: `linear-gradient(180deg, ${theme.glow}, rgba(0,0,0,0.4))`,
              boxShadow: `0 0 8px ${theme.glow}`,
            }} />
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl">{theme.icon}</span>
              <h1 className={`text-2xl font-bold ${theme.accentText} tracking-wider`}
                style={{ textShadow: `0 0 12px ${theme.glow}` }}>
                {theme.homeTitle}
              </h1>
            </div>
            <p className={`text-[10px] tracking-widest opacity-60 ${theme.accentText}`}>
              {theme.homeSubtitle}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-900/60 to-cyan-950/60 text-cyan-300 border border-cyan-700/50 shadow-[0_0_8px_rgba(34,211,238,0.15)]">
            <Gem size={13} className="mr-1.5" /> {spiritStones || 0}
          </div>
          <button onClick={() => setShowInventory(true)}
            className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border border-slate-700 text-slate-300 hover:border-emerald-500/40 transition-colors">
            <Package size={18} />
          </button>
        </div>
      </div>

      {/* 当前界域提示横条 */}
      <div className="mb-4 px-3 py-2 rounded-xl flex items-center justify-between relative z-10"
        style={{
          background: `linear-gradient(90deg, ${theme.glow}22, transparent)`,
          border: `1px solid ${theme.glow}40`,
        }}>
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] tracking-widest ${theme.accentText} opacity-70`}>{theme.ambient}</span>
          <span className="text-slate-600 text-[10px]">·</span>
          <span className="text-[10px] text-slate-400 italic">"{theme.greeting}"</span>
        </div>
        <span className={`text-[9px] ${theme.accentText} opacity-60`}>身处【{currentRegion}】</span>
      </div>

      {/* 聚灵泉 / 老井 / 仙池（按界域改名） */}
      <div className="relative bg-gradient-to-br from-slate-900/60 via-slate-950/50 to-slate-900/60 border rounded-3xl p-6 mb-6 overflow-hidden z-10"
        style={{
          borderColor: `${theme.glow}40`,
          boxShadow: `inset 0 0 30px ${theme.glow}15`,
        }}>
        {/* 涟漪 */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div key={i}
            className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full pointer-events-none"
            style={{ border: `1px solid ${theme.glow}40` }}
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute -right-4 -bottom-4 opacity-[0.08] pointer-events-none">
          <Droplets size={120} />
        </div>
        {/* 上升灵气粒子（用主题色） */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ background: theme.glow, boxShadow: `0 0 4px ${theme.glow}` }}
            initial={{ x: 30 + i * 20, y: 100 }}
            animate={{ y: -10, opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.5 + Math.random() * 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
          />
        ))}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className={`text-lg font-bold flex items-center mb-1 ${theme.accentText}`}
              style={{ textShadow: `0 0 8px ${theme.glow}` }}>
              <Droplets size={18} className="mr-2" /> {theme.springName}
            </h2>
            <p className={`text-xs opacity-60 ${theme.accentText}`}>{theme.springDesc}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${theme.accentText}`}
              style={{ textShadow: `0 0 8px ${theme.glow}` }}>
              {springAmount}<span className="text-sm opacity-60 ml-1">滴</span>
            </div>
            <div className="text-[10px] opacity-50 text-slate-400">上限 24 滴</div>
          </div>
        </div>

        <button
          onClick={collectSpring}
          disabled={springAmount === 0}
          className={`w-full mt-5 py-3 rounded-xl font-medium flex items-center justify-center transition-all relative z-10 ${
            springAmount > 0
              ? `${theme.accentText} hover:opacity-90`
              : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
          }`}
          style={springAmount > 0 ? {
            background: `linear-gradient(90deg, ${theme.glow}30, ${theme.glow}20)`,
            border: `1px solid ${theme.glow}60`,
            boxShadow: `0 0 12px ${theme.glow}30`,
          } : {}}
        >
          <Sparkles size={16} className="mr-2" /> 采集灵气
        </button>
      </div>

      {/* 灵界专属：大陆切换面板 */}
      {isSpiritRealm && (
        <div className="mb-4 relative z-10">
          <SpiritRealm />
        </div>
      )}

      {/* 洞府总管 — 傀儡自动化任务面板 */}
      <div className="mb-4 relative z-10"><CaveSteward /></div>

      {/* ===== 法宝与修炼 ===== */}
      <SectionTitle title="法宝" subtitle="本命法宝 · 助修之具" theme={theme} />

      <div className="mb-4 relative z-10"><HeavenlyBottle /></div>
      <div className="mb-4 relative z-10"><LifeboundArtifact /></div>
      <div className="mb-6 relative z-10"><GoldDevouringBeetles /></div>

      <SectionTitle title="神通" subtitle="神识 · 剑阵 · 灵兽 · 傀儡" theme={theme} />

      <div className="mb-4 relative z-10"><DivineSense /></div>
      <div className="mb-4 relative z-10"><SwordFormation /></div>
      <div className="mb-4 relative z-10"><SpiritBeastComponent /></div>
      <div className="mb-6 relative z-10"><PuppetMaster /></div>

      <SectionTitle title="道途" subtitle="修行之道" theme={theme} />

      <div className="mb-6 relative z-10"><CultivationPathSelect /></div>

      <SectionTitle title="洞府设施" subtitle="灵药 · 炼丹 · 炼器" theme={theme} />

      <div className="mb-4 relative z-10"><HerbGarden /></div>
      <div className="mb-4 relative z-10"><AlchemyFurnace /></div>
      <div className="mb-6 relative z-10"><CraftingTable /></div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Package size={18} className="mr-2 text-slate-400" /> 储物袋
                </h2>
                <button onClick={() => setShowInventory(false)} className="text-slate-400"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">材料</div>
                {Object.entries(materials).length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-xs">暂无材料</div>
                ) : (
                  Object.entries(materials).map(([id, amount]) => (
                    <div key={id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <span className="text-sm text-slate-300">
                        {id === 'common_herb' ? '普通灵草' : id === 'rare_herb' ? '珍稀灵草' : id}
                      </span>
                      <span className="text-sm font-mono text-slate-400">x{amount}</span>
                    </div>
                  ))
                )}

                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">丹药 & 道具</div>
                {Object.keys(materials).filter(id => id.includes('pill')).length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-xs">暂无丹药</div>
                ) : (
                  Object.entries(materials)
                    .filter(([id, amount]) => id.includes('pill') && amount > 0)
                    .map(([id, amount]) => (
                    <div key={id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <span className="text-sm text-amber-300">
                        {id === 'pill_1' ? '黄龙丹' : id === 'pill_foundation' ? '筑基丹' : id === 'pill_golden_core' ? '降尘丹' : id === 'pill_nascent_soul' ? '定灵丹' : id === 'zhuyan_pill' ? '驻颜丹' : id === 'juqi_pill' ? '聚气散' : id === 'humai_pill' ? '护脉丹' : id === 'qingxin_pill' ? '清心丹' : id === 'millennium_pill' ? '千年灵丹' : id === 'jiuzhuan_pill' ? '九转金丹' : id}
                      </span>
                      <span className="text-sm font-mono text-slate-400">x{amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 分组标题：按主题着色
function SectionTitle({ title, subtitle, theme }: { title: string; subtitle: string; theme: { accentText: string; glow: string } }) {
  return (
    <div className="flex items-center space-x-2 mb-3 mt-2 relative z-10">
      <div className="h-px flex-1 opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.glow}, transparent)` }} />
      <div className="flex items-baseline space-x-1.5 px-2">
        <span className={`text-xs font-bold ${theme.accentText} tracking-widest`}>· {title} ·</span>
        <span className={`text-[9px] opacity-50 ${theme.accentText} tracking-wider`}>{subtitle}</span>
      </div>
      <div className="h-px flex-1 opacity-40"
        style={{ background: `linear-gradient(270deg, transparent, ${theme.glow}, transparent)` }} />
    </div>
  );
}
