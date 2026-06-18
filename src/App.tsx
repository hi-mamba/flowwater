import { Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Settings as SettingsIcon, Mountain, Compass, Swords } from 'lucide-react';
import ReminderManager from './components/ReminderManager';
import Serendipity from './components/Serendipity';
import ThemeSong from './components/ThemeSong';
import RegionAmbient from './components/RegionAmbient';
import DemonTideBanner from './components/DemonAbyss/DemonTideBanner';
import PlanReminder from './components/PlanReminder';
import QiDrawOverlay from './components/QiDraw';
import DailyCheckIn from './components/DailyCheckIn';
import { useStore } from './store';
import { initSocketLifecycle } from './socket';
import { initNotifications } from './notifications';

const HomePage = lazy(() => import('./pages/Home'));
const PlansPage = lazy(() => import('./pages/Plans'));
const HistoryPage = lazy(() => import('./pages/History'));
const CavePage = lazy(() => import('./pages/Cave'));
const GamesPage = lazy(() => import('./pages/Games'));
const AdventurePage = lazy(() => import('./pages/Adventure'));
const SectPage = lazy(() => import('./pages/Sect'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const NewsPage = lazy(() => import('./pages/News'));

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/adventure', label: '奇遇', icon: Compass },
  { to: '/cave', label: '洞府', icon: Mountain },
  { to: '/sect', label: '宗门', icon: Swords },
  { to: '/settings', label: '设置', icon: SettingsIcon },
] as const;

export default function App() {
  const currentRegion = useStore((state) => state.currentRegion);
  const tickPuppetAutomation = useStore((state) => state.tickPuppetAutomation);

  // Initialize socket lifecycle and native notifications on mount
  useEffect(() => {
    const cleanupSocket = initSocketLifecycle();
    initNotifications().catch(() => {});
    return () => {
      cleanupSocket();
    };
  }, []);

  // 全局傀儡 tick — 无论在哪个页面，都按一定频率推进自动化任务
  // 进入应用即结算一次（兑现离线收益），之后每 60 秒推进
  useEffect(() => {
    tickPuppetAutomation();
    const id = setInterval(() => tickPuppetAutomation(), 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') tickPuppetAutomation(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [tickPuppetAutomation]);

  const getRegionBg = () => {
    switch (currentRegion) {
      case '天南':
        return 'bg-emerald-950';
      case '乱星海':
        return 'bg-cyan-950';
      case '阴冥之地':
        return 'bg-purple-950';
      case '灵界':
        return 'bg-indigo-950';
      default:
        return 'bg-slate-900';
    }
  };

  return (
    <Router>
      <div className={`flex flex-col h-[100dvh] w-full ${getRegionBg()} text-slate-100 font-sans overflow-hidden transition-colors duration-1000`}>
        <RegionAmbient />
        <ReminderManager />
        <Serendipity />
        <ThemeSong />
        <DemonTideBanner />
        <PlanReminder />
        <QiDrawOverlay />
        <DailyCheckIn />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative pb-20">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center px-6 text-center">
                <div className="space-y-3">
                  <div className="mx-auto h-10 w-10 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                  <p className="text-sm tracking-[0.2em] text-slate-400">正在进入修行界面</p>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/adventure" element={<AdventurePage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/cave" element={<CavePage />} />
              <Route path="/sect" element={<SectPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/news" element={<NewsPage />} />
            </Routes>
          </Suspense>
        </main>

        <nav className="flex-none w-full bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 pb-safe z-50 absolute bottom-0">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-[10px] mt-1 font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </Router>
  );
}
