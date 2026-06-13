// 宗门 · Sect Hub
import SectLeaderboard from '../components/SectLeaderboard';
import SectWar from '../components/SectWar';
import SectEvents from '../components/SectEvents';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Swords, Trophy, ScrollText, Users } from 'lucide-react';

export default function SectPage() {
  const { sect, sectStatus } = useStore();

  return (
    <motion.div
      className="min-h-full p-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚔️</span>
        <div>
          <h1 className="text-lg font-bold text-amber-300">宗门</h1>
          <p className="text-xs text-slate-500">
            {sect ? `${sect} · 同门修行` : '拜入宗门，共赴大道'}
          </p>
        </div>
      </div>

      {!sect || sectStatus !== 'joined' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={48} className="text-slate-600 mb-4" />
          <p className="text-sm text-slate-500 mb-2">尚未加入宗门</p>
          <p className="text-xs text-slate-600">在首页加入宗门后，可参与宗门活动</p>
        </div>
      ) : (
        <>
          {/* 宗门修为榜 */}
          <div className="mb-6">
            <SectLeaderboard sectName={sect} />
          </div>

          {/* 七派会武 */}
          <div className="mb-6">
            <SectWar />
          </div>

          {/* 宗门大事件 */}
          <div className="mb-6">
            <SectEvents />
          </div>
        </>
      )}
    </motion.div>
  );
}
