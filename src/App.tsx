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
import { useStore } from './store';
import { motion } from 'framer-motion';

export default function App() {
  const currentRegion = useStore((state) => state.currentRegion);
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
    switch (currentRegion) {
      case '天南': return 'bg-emerald-950';
      case '乱星海': return 'bg-cyan-950';
      case '大晋': return 'bg-amber-950';
      case '阴冥之地': return 'bg-purple-950';
      case '灵界': return 'bg-indigo-950';
      case '仙界': return 'bg-yellow-900';
      default: return 'bg-slate-900';
    }
  };

  const getRegionOverlay = () => {
    switch (currentRegion) {
      case '天南': return 'bg-gradient-to-b from-emerald-900/20 to-transparent';
      case '乱星海': return 'bg-gradient-to-b from-cyan-900/30 to-transparent';
      case '大晋': return 'bg-gradient-to-b from-amber-900/20 to-transparent';
      case '阴冥之地': return 'bg-gradient-to-b from-purple-900/40 to-transparent';
      case '灵界': return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-transparent';
      case '仙界': return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-amber-700/10 to-transparent';
      default: return '';
    }
  };

  return (
    <Router>
      <div ref={appRef} className={`flex flex-col h-[100dvh] w-full ${getRegionBg()} text-slate-100 font-sans overflow-hidden transition-colors duration-1000 relative`}>
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${getRegionOverlay()}`}></div>
        <ReminderManager />
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

        <nav className="flex-none w-full bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 pb-safe z-50 absolute bottom-0">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                <Home size={24} />
                <span className="text-[10px] mt-1 font-medium">首页</span>
              </motion.div>
            </NavLink>
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                <ListTodo size={24} />
                <span className="text-[10px] mt-1 font-medium">计划</span>
              </motion.div>
            </NavLink>
            <NavLink
              to="/cave"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                <Mountain size={24} />
                <span className="text-[10px] mt-1 font-medium">洞府</span>
              </motion.div>
            </NavLink>
            <NavLink
              to="/games"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                <Gamepad2 size={24} />
                <span className="text-[10px] mt-1 font-medium">秘境</span>
              </motion.div>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                <SettingsIcon size={24} />
                <span className="text-[10px] mt-1 font-medium">设置</span>
              </motion.div>
            </NavLink>
          </div>
        </nav>
      </div>
    </Router>
  );
}
