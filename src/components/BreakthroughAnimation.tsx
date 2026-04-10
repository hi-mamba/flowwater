import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreakthroughAnimationProps {
  isOpen: boolean;
  levelIndex: number;
  levelName: string;
  onComplete: () => void;
}

export const BreakthroughAnimation: React.FC<BreakthroughAnimationProps> = ({
  isOpen,
  levelIndex,
  levelName,
  onComplete
}) => {
  useEffect(() => {
    if (isOpen) {
      // Play audio
      const audio = document.getElementById('bgm-audio') as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Duration scales with levelIndex (e.g., 3s to 8s)
      const duration = Math.min(8000, 3000 + levelIndex * 100);
      const timer = setTimeout(() => {
        onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, levelIndex, onComplete]);

  if (!isOpen) return null;

  // Complexity scales with levelIndex
  const particleCount = Math.min(100, 20 + levelIndex * 2);
  const colors = [
    ['#ffffff', '#e2e8f0'], // Qi Condensation
    ['#86efac', '#22c55e'], // Foundation
    ['#fde047', '#eab308'], // Core
    ['#c084fc', '#9333ea'], // Nascent Soul
    ['#f9a8d4', '#db2777'], // Spirit Severing
    ['#fca5a5', '#dc2626'], // Void Refinement
    ['#67e8f9', '#0891b2'], // Body Integration
    ['#fbbf24', '#d97706'], // Mahayana
    ['#e879f9', '#c026d3'], // Tribulation
    ['#ffffff', '#fbbf24', '#c084fc', '#67e8f9'] // Immortal
  ];
  
  const colorPalette = colors[Math.min(colors.length - 1, Math.floor(levelIndex / 9))] || colors[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden"
      >
        {/* Particles */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const size = Math.random() * 10 + 5;
          const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
          return (
            <motion.div
              key={i}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: (Math.random() - 0.5) * window.innerWidth, 
                y: (Math.random() - 0.5) * window.innerHeight,
                opacity: [0, 1, 0],
                scale: [0, Math.random() * 2 + 1, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: '50%',
                boxShadow: `0 0 ${size * 2}px ${color}`
              }}
            />
          );
        })}

        {/* Center Aura */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ 
            scale: [1, 1.5 + levelIndex * 0.1, 1.2 + levelIndex * 0.05, 2 + levelIndex * 0.2], 
            opacity: [0, 0.8, 0.5, 0],
            rotate: 360
          }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute rounded-full blur-3xl"
          style={{ 
            backgroundColor: colorPalette[0],
            width: 256 + levelIndex * 10,
            height: 256 + levelIndex * 10
          }}
        />

        {/* Inner rings for higher levels */}
        {levelIndex > 5 && (
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute border-4 border-dashed rounded-full opacity-50"
            style={{
              borderColor: colorPalette[1] || colorPalette[0],
              width: 300 + levelIndex * 10,
              height: 300 + levelIndex * 10,
            }}
          />
        )}
        
        {levelIndex > 15 && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute border-2 border-dotted rounded-full opacity-70"
            style={{
              borderColor: colorPalette[2] || colorPalette[0],
              width: 350 + levelIndex * 15,
              height: 350 + levelIndex * 15,
            }}
          />
        )}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1 }}
          className="relative z-10 text-center"
        >
          <motion.h2 
            animate={{ textShadow: [`0 0 10px ${colorPalette[0]}`, `0 0 30px ${colorPalette[0]}`, `0 0 10px ${colorPalette[0]}`] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 mb-4"
          >
            境界突破
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white tracking-widest"
            style={{ textShadow: `0 0 10px ${colorPalette[0]}` }}
          >
            晋升 {levelName}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
