import { useState, useMemo } from 'react';
import { useStore, CULTIVATION_LEVELS, REGIONS, SECTS } from '../store';
import { motion } from 'motion/react';
import {
  Flame, Droplets, Star, Trophy, BookOpen, Swords, Zap, Skull,
  Heart, Compass, ScrollText, TrendingUp, Sparkles,
} from 'lucide-react';

interface ChronicleEntry {
  date: string;
  title: string;
  content: string;
  type: 'breakthrough' | 'tribulation' | 'sect' | 'companion' | 'explore' | 'drink' | 'battle' | 'legendary';
  icon: typeof Flame;
  color: string;
}

export default function HistoryPage() {
  const {
    logs, bonusPoints, levelIndex, streakDays, spiritStones,
    sect, sectPosition, daoCompanion, highestLevelReached,
    tribulation, lifeboundArtifact, heavenlyBottle, goldDevouringBeetles,
    spiritRealm, dungeon, currentRegion,
  } = useStore();

  const [filter, setFilter] = useState<'all' | 'breakthrough' | 'drink' | 'story'>('all');

  const chronicle = useMemo(() => {
    const entries: ChronicleEntry[] = [];
    const now = new Date();

    entries.push({
      date: now.toLocaleDateString('zh-CN'),
      title: '当前境界',
      content: `${CULTIVATION_LEVELS[levelIndex]?.name || '凡人'}，位于${currentRegion}，灵石 ${spiritStones}，修为 ${bonusPoints.toLocaleString()}`,
      type: 'breakthrough', icon: Star, color: 'text-purple-300',
    });

    if (streakDays > 0) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: '连续修炼',
        content: `已连续修炼 ${streakDays} 天，道心坚定，天道酬勤。`,
        type: 'drink', icon: Flame, color: 'text-orange-300',
      });
    }

    if (sect) {
      const sectInfo = SECTS.find(s => s.id === sect);
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: `宗门：${sectInfo?.name || sect}`,
        content: `身为${sectPosition === 'patriarch' ? '宗主' : sectPosition === 'elder' ? '长老' : sectPosition === 'core' ? '亲传弟子' : sectPosition === 'inner' ? '内门弟子' : '外门弟子'}，肩负宗门重任。`,
        type: 'sect', icon: Swords, color: 'text-cyan-300',
      });
    }

    if (lifeboundArtifact.id) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: `本命法宝：${lifeboundArtifact.name}`,
        content: `祭炼 ${lifeboundArtifact.refinementCount}/10 次，与你心神相连。`,
        type: 'legendary', icon: Zap, color: 'text-amber-300',
      });
    }

    if (daoCompanion) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: `道侣：${daoCompanion.name}`,
        content: `好感度 ${daoCompanion.favorability}，修仙路上有你相伴。`,
        type: 'companion', icon: Heart, color: 'text-pink-300',
      });
    }

    entries.push({
      date: now.toLocaleDateString('zh-CN'),
      title: `掌天瓶 Lv.${heavenlyBottle.level}`,
      content: `绿液 ${heavenlyBottle.greenLiquid}/${heavenlyBottle.maxLiquid}，累计饮水 ${heavenlyBottle.totalDrinksFed} 次。`,
      type: 'legendary', icon: Droplets, color: 'text-emerald-300',
    });

    if (goldDevouringBeetles.count > 0) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: '噬金虫',
        content: `数量 ${goldDevouringBeetles.count} 只，${['幼虫', '成虫', '虫王', '噬金虫王'][goldDevouringBeetles.stage - 1] || '幼虫'}`,
        type: 'explore', icon: Compass, color: 'text-yellow-300',
      });
    }

    if (spiritRealm.unlocked) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: '灵界修士',
        content: `已飞升灵界，探索 ${spiritRealm.realmExplored} 次，玄天之宝 ${spiritRealm.heavenlyTreasures.length}/4`,
        type: 'breakthrough', icon: Sparkles, color: 'text-indigo-300',
      });
    }

    if (dungeon.bestFloor > 1) {
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: '秘境最高记录',
        content: `最佳探索：第 ${dungeon.bestFloor} 层`,
        type: 'battle', icon: Skull, color: 'text-red-300',
      });
    }

    const recentLogs = logs.slice(-10).reverse();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let totalToday = 0;
    for (const log of recentLogs) {
      if (log.timestamp >= todayStart) totalToday += log.amount;
    }

    if (totalToday > 0) {
      const lastLog = recentLogs[0];
      const typeLabel = lastLog?.type === 'coffee' ? '灵咖' : lastLog?.type === 'tea' ? '灵茶' : lastLog?.type === 'milktea' ? '仙奶茶' : '灵泉';
      entries.push({
        date: now.toLocaleDateString('zh-CN'),
        title: `今日修炼 · ${typeLabel}`,
        content: `今日累计汲取 ${totalToday}ml，修为随之增长。`,
        type: 'drink', icon: Droplets, color: 'text-blue-300',
      });
    }

    return entries;
  }, [logs, levelIndex, streakDays, spiritStones, sect, sectPosition, daoCompanion, lifeboundArtifact, heavenlyBottle, goldDevouringBeetles, spiritRealm, dungeon, currentRegion, bonusPoints]);

  const filtered = filter === 'all' ? chronicle :
    filter === 'breakthrough' ? chronicle.filter(e => e.type === 'breakthrough' || e.type === 'legendary' || e.type === 'tribulation') :
    filter === 'drink' ? chronicle.filter(e => e.type === 'drink') :
    chronicle.filter(e => e.type === 'breakthrough' || e.type === 'legendary' || e.type === 'tribulation' || e.type === 'sect' || e.type === 'companion');

  return (
    <div className="flex flex-col min-h-full bg-slate-900 p-4 relative overflow-y-auto pb-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-xl font-bold text-white flex items-center space-x-2 mb-1">
          <ScrollText size={20} className="text-amber-400" />
          <span>修仙日志</span>
        </h1>
        <p className="text-[10px] text-slate-500">记录你的修仙之路，从凡人到真仙</p>
      </motion.div>

      <div className="flex space-x-2 mb-4">
        {[{ id: 'all' as const, label: '全部' }, { id: 'story' as const, label: '故事' }, { id: 'breakthrough' as const, label: '突破' }, { id: 'drink' as const, label: '修炼' }].map(f => (
          <motion.button key={f.id} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/30'}`}>
            {f.label}
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: '当前修为', value: bonusPoints.toLocaleString(), icon: Flame, color: 'text-orange-400' },
          { label: '修炼境界', value: CULTIVATION_LEVELS[levelIndex]?.name || '凡人', icon: Star, color: 'text-purple-400' },
          { label: '灵石', value: spiritStones.toLocaleString(), icon: Sparkles, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-3 text-center">
            <stat.icon size={16} className={`${stat.color} mx-auto mb-1`} />
            <div className="text-sm font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="relative pl-6 border-l-2 border-slate-700/30 ml-2">
        {filtered.map((entry, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }} className="relative mb-4">
            <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
              <entry.icon size={8} className={entry.color} />
            </div>
            <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-3 hover:border-slate-600/30 transition-all">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-xs font-bold ${entry.color}`}>{entry.title}</h4>
                <span className="text-[10px] text-slate-600">{entry.date}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{entry.content}</p>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">暂无记录</p>
            <p className="text-[10px] text-slate-600 mt-1">开始修炼后，日志将自动记录你的修仙历程</p>
          </div>
        )}
      </div>
    </div>
  );
}
