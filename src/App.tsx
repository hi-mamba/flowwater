import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import CavePage from './pages/Cave';
import { Home, ListTodo, Settings as SettingsIcon, BarChart2, Gamepad2, Mountain } from 'lucide-react';
import HomePage from './pages/Home';
import PlansPage from './pages/Plans';
import SettingsPage from './pages/Settings';
import HistoryPage from './pages/History';
import GamesPage from './pages/Games';
import ReminderManager from './components/ReminderManager';
import { MusicPlayer } from './components/MusicPlayer';
import { useStore } from './store';
import { motion } from 'framer-motion';

export default function App() {
  const currentRegion = useStore((state) => state.currentRegion);
  const todayTemperature = useStore((state) => state.todayTemperature);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleShake = () => {
      if (appRef.current) {
        appRef.current.classList.add('animate-shake');
        setTimeout(() => appRef.current?.classList.remove('animate-shake'), 500);
      }
    };
    window.addEventListener('shake', handleShake);
    return () => window.removeEventListener('shake', handleShake);
  }, []);

  const getRegionBg = () => {
    const hour = new Date().getHours();
    let timeModifier = '';
    if (hour >= 5 && hour < 10) timeModifier = 'bg-sky-950/80'; // Morning
    else if (hour >= 10 && hour < 16) timeModifier = 'bg-blue-950/80'; // Noon
    else if (hour >= 16 && hour < 19) timeModifier = 'bg-orange-950/80'; // Dusk
    else timeModifier = 'bg-slate-950/90'; // Night

    switch (currentRegion) {
      case '天南': return `bg-emerald-950/80 ${timeModifier}`;
      case '乱星海': return `bg-cyan-950/80 ${timeModifier}`;
      case '大晋': return `bg-amber-950/80 ${timeModifier}`;
      case '阴冥之地': return `bg-purple-950/80 ${timeModifier}`;
      case '灵界': return `bg-indigo-950/80 ${timeModifier}`;
      case '仙界': return `bg-yellow-900/80 ${timeModifier}`;
      default: return `bg-slate-900/80 ${timeModifier}`;
    }
  };

  const getRegionOverlay = () => {
    const hour = new Date().getHours();
    let timeGradient = '';
    if (hour >= 5 && hour < 10) timeGradient = 'from-sky-500/10 via-transparent'; // Morning Glow
    else if (hour >= 10 && hour < 16) timeGradient = 'from-blue-400/10 via-transparent'; // Sun
    else if (hour >= 16 && hour < 19) timeGradient = 'from-rose-500/20 via-orange-500/10'; // Sunset
    else timeGradient = 'from-indigo-900/40 via-purple-900/10'; // Moonlight

    switch (currentRegion) {
      case '天南': return `bg-gradient-to-b from-emerald-900/20 to-transparent ${timeGradient}`;
      case '乱星海': return `bg-gradient-to-b from-cyan-900/30 to-transparent ${timeGradient}`;
      case '大晋': return `bg-gradient-to-b from-amber-900/20 to-transparent ${timeGradient}`;
      case '阴冥之地': return `bg-gradient-to-b from-purple-900/40 to-transparent ${timeGradient}`;
      case '灵界': return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-transparent ${timeGradient}`;
      case '仙界': return `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-amber-700/10 to-transparent ${timeGradient}`;
      default: return `bg-gradient-to-b ${timeGradient} to-transparent`;
    }
  };

  return (
    <Router>
      <div ref={appRef} className={`flex flex-col h-[100dvh] w-full ${getRegionBg()} text-slate-100 font-sans overflow-hidden transition-colors duration-1000 relative`}>
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${getRegionOverlay()}`}></div>
        
        {/* Global Spiritual Energy Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-emerald-400/20 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, -100, -200],
                x: [0, Math.random() * 50 - 25, Math.random() * 50 - 25],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10,
              }}
            />
          ))}
          {/* Cold Weather: Snow */}
          {todayTemperature !== null && todayTemperature <= 10 && Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute rounded-full bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: -10,
                left: Math.random() * 100 + '%',
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            />
          ))}
          {/* Spring Rain / Normal Weather */}
          {todayTemperature !== null && todayTemperature > 10 && todayTemperature <= 24 && Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute rounded bg-sky-200/30"
              style={{
                width: '1px',
                height: Math.random() * 20 + 10 + 'px',
                top: -30,
                left: Math.random() * 100 + '%',
                transform: 'rotate(15deg)',
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, 20],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 1 + 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2,
              }}
            />
          ))}
          {/* Hot Weather: Embers */}
          {todayTemperature !== null && todayTemperature >= 28 && Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute rounded-full bg-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                bottom: -10,
                left: Math.random() * 100 + '%',
              }}
              animate={{
                y: ['0vh', '-100vh'],
                x: [0, Math.random() * 60 - 30, Math.random() * 60 - 30],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                ease: "easeIn",
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>

        <ReminderManager />
        <MusicPlayer />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/cave" element={<CavePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 w-full bg-transparent z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
          <div className="flex justify-around items-center h-[88px] max-w-md mx-auto pointer-events-auto pb-4 px-6 gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 backdrop-blur-md border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <Home size={22} className="mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <span className="text-[10px] font-bold tracking-widest mt-0.5">主峰</span>}
                </motion.div>
              )}
            </NavLink>
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 backdrop-blur-md border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <ListTodo size={22} className="mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <span className="text-[10px] font-bold tracking-widest mt-0.5">历练</span>}
                </motion.div>
              )}
            </NavLink>
            <NavLink
              to="/cave"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 backdrop-blur-md border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <Mountain size={22} className="mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <span className="text-[10px] font-bold tracking-widest mt-0.5">洞府</span>}
                </motion.div>
              )}
            </NavLink>
            <NavLink
              to="/games"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 backdrop-blur-md border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <Gamepad2 size={22} className="mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <span className="text-[10px] font-bold tracking-widest mt-0.5">秘境</span>}
                </motion.div>
              )}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 backdrop-blur-md border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <SettingsIcon size={22} className="mb-0.5" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && <span className="text-[10px] font-bold tracking-widest mt-0.5">神识</span>}
                </motion.div>
              )}
            </NavLink>
          </div>
        </nav>
      </div>
    </Router>
  );
}
