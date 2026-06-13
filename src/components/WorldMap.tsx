import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore, CULTIVATION_LEVELS, REGIONS, DUNGEONS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Compass, Sparkles, Zap, Mountain, Waves, Cloud, Star, Skull, Gem, Castle } from 'lucide-react';

interface MapLocation {
  id: string; name: string; x: number; y: number; type: 'region' | 'dungeon' | 'city' | 'secret' | 'gate';
  icon: typeof MapPin; color: string; glow: string; size: number;
  unlocked: boolean; levelReq?: number; desc: string;
}

const generateLocations = (levelIndex: number, currentRegion: string): MapLocation[] => [
  { id: 'mortal', name: '凡人界', x: 50, y: 92, type: 'city', icon: Castle, color: '#94a3b8', glow: '#64748b', size: 14, unlocked: true, desc: '凡人居住之地' },
  { id: 'tiannan', name: '天南', x: 38, y: 65, type: 'region', icon: Mountain, color: '#34d399', glow: '#059669', size: 22, unlocked: true, desc: '修仙界偏僻之地，灵气稀薄' },
  { id: 'huangfeng', name: '黄枫谷', x: 32, y: 58, type: 'city', icon: Castle, color: '#fbbf24', glow: '#d97706', size: 12, unlocked: levelIndex >= 0, desc: '天南七派之一' },
  { id: 'yanyue', name: '掩月宗', x: 44, y: 55, type: 'city', icon: Castle, color: '#e879f9', glow: '#c026d3', size: 12, unlocked: levelIndex >= 0, desc: '双修大宗' },
  { id: 'blood_forbidden', name: '血色禁地', x: 28, y: 70, type: 'dungeon', icon: Skull, color: '#ef4444', glow: '#dc2626', size: 16, unlocked: levelIndex >= 14, levelReq: 14, desc: '筑基试炼' },
  { id: 'luanxinghai', name: '乱星海', x: 72, y: 38, type: 'region', icon: Waves, color: '#22d3ee', glow: '#0891b2', size: 22, unlocked: levelIndex >= 14, desc: '海外修仙界，妖兽众多' },
  { id: 'void_hall', name: '虚天殿', x: 68, y: 28, type: 'dungeon', icon: Gem, color: '#a78bfa', glow: '#7c3aed', size: 16, unlocked: levelIndex >= 18, levelReq: 18, desc: '上古通天灵宝' },
  { id: 'starsea_city', name: '星城', x: 76, y: 42, type: 'city', icon: Star, color: '#fde68a', glow: '#f59e0b', size: 12, unlocked: levelIndex >= 14, desc: '乱星海最大坊市' },
  { id: 'yinming', name: '阴冥之地', x: 15, y: 42, type: 'region', icon: Cloud, color: '#c084fc', glow: '#9333ea', size: 20, unlocked: levelIndex >= 18, desc: '阴气缭绕之地' },
  { id: 'demon_valley', name: '坠魔谷', x: 10, y: 35, type: 'dungeon', icon: Skull, color: '#f97316', glow: '#ea580c', size: 16, unlocked: levelIndex >= 22, levelReq: 22, desc: '古魔战场' },
  { id: 'lingjie', name: '灵界', x: 50, y: 12, type: 'region', icon: Sparkles, color: '#818cf8', glow: '#4f46e5', size: 26, unlocked: levelIndex >= 36, desc: '更高层次的世界' },
  { id: 'kunwu', name: '昆吾山', x: 55, y: 18, type: 'dungeon', icon: Mountain, color: '#fbbf24', glow: '#b45309', size: 18, unlocked: levelIndex >= 26, levelReq: 26, desc: '上古仙山' },
  { id: 'ascension_gate', name: '飞升台', x: 50, y: 5, type: 'gate', icon: Zap, color: '#facc15', glow: '#eab308', size: 20, unlocked: levelIndex >= 55, levelReq: 55, desc: '通往真仙界' },
];

export default function WorldMap() {
  const { levelIndex, currentRegion, setCurrentRegion, startDungeon, dungeon } = useStore();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [teleporting, setTeleporting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour < 6 ? 'night' : hour < 9 ? 'dawn' : hour < 18 ? 'day' : hour < 21 ? 'dusk' : 'night');
  }, []);

  useEffect(() => {
    setLocations(generateLocations(levelIndex, currentRegion));
  }, [levelIndex, currentRegion]);

  const currentLoc = locations.find(l =>
    (l.id === 'tiannan' && currentRegion === '天南') ||
    (l.id === 'luanxinghai' && currentRegion === '乱星海') ||
    (l.id === 'yinming' && currentRegion === '阴冥之地') ||
    (l.id === 'lingjie' && currentRegion === '灵界')
  );

  const handleLocClick = (loc: MapLocation) => {
    if (!loc.unlocked) {
      setToast(`需要 ${loc.levelReq ? CULTIVATION_LEVELS[loc.levelReq]?.name : '更高境界'} 方可进入`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    if (loc.type === 'region') {
      setTeleporting(loc.id);
      setTimeout(() => {
        setCurrentRegion(
          loc.id === 'tiannan' ? '天南' : loc.id === 'luanxinghai' ? '乱星海' :
          loc.id === 'yinming' ? '阴冥之地' : loc.id === 'lingjie' ? '灵界' : '天南'
        );
        setTeleporting(null);
        setToast(`传送至 ${loc.name}`);
        setTimeout(() => setToast(null), 2000);
      }, 800);
    } else if (loc.type === 'dungeon') {
      const dungeonId = loc.id === 'blood_forbidden' ? 'blood_forbidden' : loc.id === 'void_hall' ? 'void_hall' : loc.id === 'demon_valley' ? 'demon_valley' : 'kunwu_mountain';
      const r = startDungeon(dungeonId);
      setToast(r.message);
      setTimeout(() => setToast(null), 2500);
    } else {
      setSelectedLoc(loc);
    }
  };

  const skyGradient = {
    dawn: 'from-rose-950/60 via-amber-950/40 to-slate-950',
    day: 'from-sky-950/60 via-slate-950/40 to-slate-950',
    dusk: 'from-purple-950/60 via-orange-950/40 to-slate-950',
    night: 'from-indigo-950/80 via-slate-950/60 to-slate-950',
  }[timeOfDay];

  const ambientParticles = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      speed: 8 + Math.random() * 30,
      opacity: 0.1 + Math.random() * 0.4,
      color: ['#34d399', '#22d3ee', '#818cf8', '#fbbf24', '#e879f9'][Math.floor(Math.random() * 5)],
    })), []
  );

  if (dungeon.active) return null;

  return (
    <div className="relative w-full h-[50vh] min-h-[320px] max-h-[450px] mb-4 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl select-none">
      {/* Sky gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-all duration-[2000ms]`} />

      {/* Star field */}
      {timeOfDay === 'night' && Array.from({ length: 50 }).map((_, i) => (
        <motion.div key={`star-${i}`} className="absolute rounded-full bg-white"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`, width: 1 + Math.random() * 2, height: 1 + Math.random() * 2 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
      ))}

      {/* Terrain layers */}
      <div className="absolute inset-0">
        {/* Mountains silhouette */}
        <svg className="absolute bottom-0 w-full h-[35%] opacity-20" viewBox="0 0 100 35" preserveAspectRatio="none">
          <path d="M0,35 L5,20 L12,28 L18,15 L25,22 L30,10 L38,18 L42,8 L48,16 L55,5 L60,14 L68,8 L75,18 L82,10 L90,20 L95,12 L100,25 L100,35Z" fill="#0f172a" />
          <path d="M0,35 L8,25 L15,30 L22,20 L28,28 L35,18 L42,25 L50,15 L58,22 L65,12 L72,20 L80,15 L88,25 L95,18 L100,28 L100,35Z" fill="#1e293b" opacity="0.7" />
        </svg>

        {/* Region-specific terrain features */}
        {currentRegion === '天南' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div key={`tree-${i}`} className="absolute text-emerald-800/40 text-lg"
                style={{ left: `${5 + Math.random() * 85}%`, bottom: `${20 + Math.random() * 15}%` }}
                animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}>
                🌲
              </motion.div>
            ))}
          </motion.div>
        )}
        {currentRegion === '乱星海' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={`wave-${i}`} className="absolute h-2 bg-cyan-500/10 rounded-full"
                style={{ left: `${Math.random() * 90}%`, bottom: `${25 + i * 4}%`, width: `${10 + Math.random() * 30}%` }}
                animate={{ x: [0, 10, -5, 0], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
            ))}
          </motion.div>
        )}
        {currentRegion === '阴冥之地' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={`mist-${i}`} className="absolute bg-purple-500/10 rounded-full blur-xl"
                style={{ left: `${Math.random() * 80}%`, bottom: `${10 + Math.random() * 30}%`, width: `${20 + Math.random() * 40}px`, height: `${10 + Math.random() * 20}px` }}
                animate={{ x: [-20, 20, -20], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4 + Math.random() * 4, repeat: Infinity }} />
            ))}
          </motion.div>
        )}
        {currentRegion === '灵界' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={`spirit-${i}`} className="absolute bg-indigo-400/20 rounded-full blur-sm"
                style={{ left: `${Math.random() * 90}%`, top: `${Math.random() * 70}%`, width: 2 + Math.random() * 4, height: 2 + Math.random() * 4 }}
                animate={{ y: ['100%', '-10%'], opacity: [0, 0.8, 0] }}
                transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4 }} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Paths between regions */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {[
          ['tiannan', 'luanxinghai'], ['tiannan', 'yinming'],
          ['luanxinghai', 'lingjie'], ['tiannan', 'blood_forbidden'],
          ['luanxinghai', 'void_hall'], ['yinming', 'demon_valley'],
          ['lingjie', 'kunwu'], ['lingjie', 'ascension_gate'],
        ].map(([from, to]) => {
          const f = locations.find(l => l.id === from);
          const t = locations.find(l => l.id === to);
          if (!f || !t || !t.unlocked) return null;
          return (
            <motion.line key={`${from}-${to}`}
              x1={`${f.x}%`} y1={`${f.y}%`} x2={`${t.x}%`} y2={`${t.y}%`}
              stroke="rgba(148,163,184,0.12)" strokeWidth="1" strokeDasharray="3 5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }} />
          );
        })}
      </svg>

      {/* Floating ambient particles */}
      {ambientParticles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, opacity: p.opacity, zIndex: 1 }}
          animate={{ y: ['105%', '-5%'], x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 10}%`] }}
          transition={{ duration: p.speed, repeat: Infinity, ease: 'linear', delay: Math.random() * p.speed }} />
      ))}

      {/* Map locations */}
      {locations.map(loc => {
        const isCurrentRegion = (loc.id === 'tiannan' && currentRegion === '天南') ||
          (loc.id === 'luanxinghai' && currentRegion === '乱星海') ||
          (loc.id === 'yinming' && currentRegion === '阴冥之地') ||
          (loc.id === 'lingjie' && currentRegion === '灵界');
        const isTeleporting = teleporting === loc.id;

        return (
          <motion.div key={loc.id} className="absolute cursor-pointer group z-10"
            style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={isTeleporting ? { scale: [1, 2, 0], opacity: [1, 0.8, 0], rotate: 360 } : { scale: 1, opacity: 1 }}
            transition={isTeleporting ? { duration: 0.8 } : { delay: Math.random() * 1.5 }}
            onClick={() => handleLocClick(loc)}
            whileHover={{ scale: loc.unlocked ? 1.15 : 1 }}
          >
            {/* Glow ring */}
            {loc.unlocked && (
              <motion.div className="absolute inset-0 rounded-full"
                style={{
                  width: loc.size * 2.5, height: loc.size * 2.5,
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 ${loc.size * 2}px ${loc.glow}40, 0 0 ${loc.size * 3}px ${loc.glow}20`,
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }} />
            )}

            {/* Current region pulse */}
            {isCurrentRegion && (
              <motion.div className="absolute inset-0 rounded-full"
                style={{
                  width: loc.size * 4, height: loc.size * 4,
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                  border: `2px solid ${loc.glow}40`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
            )}

            {/* Location dot */}
            <div className="relative flex items-center justify-center"
              style={{
                width: loc.size, height: loc.size,
                background: loc.unlocked ? `radial-gradient(circle, ${loc.color}40, ${loc.color}10)` : 'rgba(100,116,139,0.2)',
                borderRadius: loc.type === 'city' ? '4px' : '50%',
                border: `1.5px solid ${loc.unlocked ? loc.color + '60' : 'rgba(100,116,139,0.3)'}`,
              }}>
              <loc.icon size={loc.size * 0.55} color={loc.unlocked ? loc.color : '#64748b'} />
            </div>

            {/* Name label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap transition-all ${
                loc.unlocked
                  ? isCurrentRegion ? 'bg-white/10 text-white font-bold' : 'bg-slate-900/80 text-slate-300 backdrop-blur-sm'
                  : 'bg-slate-900/40 text-slate-600'
              }`}>
                {loc.unlocked ? loc.name : '???'}
              </span>
            </div>

            {/* Level requirement badge */}
            {!loc.unlocked && loc.levelReq && (
              <div className="absolute -top-2 -right-2">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Lv.{loc.levelReq}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Location detail popup */}
      <AnimatePresence>
        {selectedLoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl"
            onClick={() => setSelectedLoc(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 max-w-[240px] text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${selectedLoc.color}20`, border: `2px solid ${selectedLoc.color}40` }}>
                <selectedLoc.icon size={24} color={selectedLoc.color} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{selectedLoc.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{selectedLoc.desc}</p>
              <button onClick={() => setSelectedLoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 text-white text-xs">关闭</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-800/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs border border-slate-600 shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay info bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-400">{currentRegion}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-600">{CULTIVATION_LEVELS[levelIndex]?.name || '凡人'}</span>
        </div>
        <div className="text-[8px] text-slate-600 bg-slate-900/80 backdrop-blur-md rounded-lg px-2 py-1">
          {timeOfDay === 'dawn' ? '🌅 晨曦' : timeOfDay === 'day' ? '☀️ 白昼' : timeOfDay === 'dusk' ? '🌇 黄昏' : '🌙 深夜'}
        </div>
      </div>
    </div>
  );
}
