import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  drift: number;
}

export default function RegionAmbient() {
  const { currentRegion, levelIndex, tribulation } = useStore();
  const [particles, setParticles] = useState<Particle[]>([]);

  const config = useMemo(() => {
    switch (currentRegion) {
      case '天南':
        return { count: 15, colors: ['#34d399', '#6ee7b7', '#a7f3d0'], size: [2, 6], speed: [8, 20], label: '灵雾弥漫', bg: 'from-emerald-950/0' };
      case '乱星海':
        return { count: 20, colors: ['#22d3ee', '#67e8f9', '#a5f3fc'], size: [1, 4], speed: [10, 25], label: '海风拂面', bg: 'from-cyan-950/0' };
      case '阴冥之地':
        return { count: 12, colors: ['#c084fc', '#e879f9', '#f0abfc'], size: [3, 8], speed: [5, 15], label: '阴气缭绕', bg: 'from-purple-950/0' };
      case '灵界':
        return { count: 30, colors: ['#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'], size: [2, 10], speed: [5, 30], label: '仙灵之气', bg: 'from-indigo-950/0' };
      default:
        return { count: 8, colors: ['#94a3b8'], size: [1, 3], speed: [15, 25], label: '', bg: 'from-slate-950/0' };
    }
  }, [currentRegion]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < config.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        speed: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
        opacity: 0.1 + Math.random() * 0.3,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        drift: (Math.random() - 0.5) * 2,
      });
    }
    setParticles(newParticles);
  }, [currentRegion, config.count]);

  if (currentRegion === '凡人界') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Region label */}
      <div className="absolute top-2 left-4 text-[10px] text-white/20 tracking-[0.3em]">
        {config.label}
      </div>

      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}40`,
          }}
          animate={{
            y: ['-5%', '105%'],
            x: [`${p.x}%`, `${p.x + p.drift * 10}%`],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * p.speed,
          }}
        />
      ))}

      {/* Tribulation overlay */}
      {tribulation.active && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.2) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
