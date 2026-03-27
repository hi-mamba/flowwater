import { useStore, CULTIVATION_LEVELS } from '../store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { startOfDay, subDays, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Award, CalendarDays, Quote, Medal } from 'lucide-react';
import { getUniqueEmotionalMessage } from '../data/emotionalMessages';
import { useMemo } from 'react';

const ACHIEVEMENT_DEFS = [
  { id: 'daily_goal', name: '初窥门径', desc: '完成一次每日饮水目标', icon: '🎯' },
  { id: 'streak_3', name: '持之以恒', desc: '连续3天完成饮水目标', icon: '🔥' },
  { id: 'streak_7', name: '道心坚定', desc: '连续7天完成饮水目标', icon: '⚡' },
  { id: 'total_10l', name: '海纳百川', desc: '累计饮水达到10升', icon: '🌊' },
  { id: 'total_50l', name: '吞天食地', desc: '累计饮水达到50升', icon: '🐉' },
];

export default function HistoryPage() {
  const { logs, settings } = useStore();
  const emotionalMessage = useMemo(() => getUniqueEmotionalMessage(), []);

  // Calculate data for the last 7 days
  const today = startOfDay(new Date());
  
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dateStart = date.getTime();
    const dateEnd = dateStart + 24 * 60 * 60 * 1000;
    
    const amount = logs
      .filter(l => l.timestamp >= dateStart && l.timestamp < dateEnd)
      .reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount), 0);
      
    return {
      name: i === 6 ? '今天' : format(date, 'E', { locale: zhCN }),
      amount,
      date: format(date, 'MM-dd'),
      goalMet: amount >= settings.dailyGoal
    };
  });

  const totalWeekAmount = chartData.reduce((sum, day) => sum + (isNaN(day.amount) ? 0 : day.amount), 0);
  const avgWeekAmount = isNaN(totalWeekAmount) ? 0 : Math.round(totalWeekAmount / 7);
  const goalMetDays = chartData.filter(d => d.goalMet).length;

  // Calculate Cultivation Milestones
  const milestones: { level: string, date: number, color: string }[] = [];
  let runningTotal = 0;
  let currentLevelIndex = 0;

  // Sort logs chronologically
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // Always add the starting level if there are logs
  if (sortedLogs.length > 0) {
    milestones.push({
      level: CULTIVATION_LEVELS[0].name,
      date: sortedLogs[0].timestamp,
      color: CULTIVATION_LEVELS[0].color
    });
  }

  for (const log of sortedLogs) {
    runningTotal += (isNaN(log.amount) ? 0 : log.amount);
    // Check if we reached the next level
    while (currentLevelIndex < CULTIVATION_LEVELS.length - 1 && runningTotal >= CULTIVATION_LEVELS[currentLevelIndex + 1].min) {
      currentLevelIndex++;
      milestones.push({
        level: CULTIVATION_LEVELS[currentLevelIndex].name,
        date: log.timestamp,
        color: CULTIVATION_LEVELS[currentLevelIndex].color
      });
    }
  }

  const currentLevel = CULTIVATION_LEVELS[currentLevelIndex];
  const achievements = useStore.getState().achievements || [];

  // Generate Daily Summary Timeline
  const dailySummary: Record<string, { date: number, amount: number, count: number, milestones: any[] }> = {};
  
  for (const log of sortedLogs) {
    const dayStr = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!dailySummary[dayStr]) {
      dailySummary[dayStr] = { date: log.timestamp, amount: 0, count: 0, milestones: [] };
    }
    dailySummary[dayStr].amount += (isNaN(log.amount) ? 0 : log.amount);
    dailySummary[dayStr].count += 1;
  }
  
  for (const m of milestones) {
    const dayStr = format(new Date(m.date), 'yyyy-MM-dd');
    if (dailySummary[dayStr]) {
      dailySummary[dayStr].milestones.push(m);
    }
  }
  
  const timelineItems = Object.values(dailySummary).sort((a, b) => b.date - a.date);

  return (
    <div className="p-6 max-w-md mx-auto pb-24">
      <h1 className="text-2xl font-light tracking-wider text-slate-100 mb-2">饮水历史</h1>
      
      <div className="mb-6 bg-slate-800/40 px-4 py-3 rounded-xl border border-slate-700/50 flex items-start space-x-3">
        <Quote size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-300 italic leading-relaxed">
          {emotionalMessage}
        </p>
      </div>

      {/* Cultivation Status */}
      <div className={`bg-gradient-to-br ${currentLevel.bg} rounded-2xl p-5 border border-slate-700/50 mb-8 shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-slate-300 flex items-center">
            <Award size={16} className="mr-2" /> 当前境界
          </h2>
          <span className={`text-lg font-bold ${currentLevel.color}`}>{currentLevel.name}</span>
        </div>
        <div className="w-full bg-slate-900/50 rounded-full h-2 mt-4 overflow-hidden">
          <div 
            className={`h-2 rounded-full bg-current ${currentLevel.color}`} 
            style={{ width: currentLevelIndex < CULTIVATION_LEVELS.length - 1 ? `${((runningTotal - currentLevel.min) / (CULTIVATION_LEVELS[currentLevelIndex + 1].min - currentLevel.min)) * 100}%` : '100%' }}
          ></div>
        </div>
        {currentLevelIndex < CULTIVATION_LEVELS.length - 1 && (
          <p className="text-[10px] text-slate-400 mt-2 text-right">
            距 {CULTIVATION_LEVELS[currentLevelIndex + 1].name} 还需 {CULTIVATION_LEVELS[currentLevelIndex + 1].min - runningTotal} ml
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs mb-1">近7天日均</p>
          <p className="text-2xl font-light text-white">{avgWeekAmount} <span className="text-sm text-slate-500">ml</span></p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs mb-1">达标天数</p>
          <p className="text-2xl font-light text-white">{goalMetDays} <span className="text-sm text-slate-500">/ 7</span></p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-sm font-medium text-slate-300">近7天饮水量</h2>
          <span className="text-xs text-slate-500">目标: {settings.dailyGoal}ml</span>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#34d399' }}
                formatter={(value: number) => [`${value} ml`, '饮水量']}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <ReferenceLine y={settings.dailyGoal} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.goalMet ? '#34d399' : '#38bdf8'} 
                    fillOpacity={index === 6 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mb-8">
        <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
          <Medal size={16} className="mr-2" /> 修仙成就
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENT_DEFS.map(ach => {
            const isUnlocked = achievements.includes(ach.id);
            return (
              <div key={ach.id} className={`p-3 rounded-xl border flex flex-col items-center text-center transition-colors ${isUnlocked ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800/30 border-slate-700/30 opacity-50 grayscale'}`}>
                <span className="text-2xl mb-1">{ach.icon}</span>
                <span className={`text-xs font-medium ${isUnlocked ? 'text-amber-400' : 'text-slate-400'}`}>{ach.name}</span>
                <span className="text-[10px] text-slate-500 mt-1">{ach.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cultivation Timeline */}
      <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <h2 className="text-sm font-medium text-slate-300 mb-6 flex items-center">
          <CalendarDays size={16} className="mr-2" /> 修仙日志
        </h2>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
          {timelineItems.length > 0 ? timelineItems.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-slate-900 bg-slate-700 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${idx === 0 ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}`}></div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700/50 bg-slate-800/80 shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-slate-200">{format(new Date(item.date), 'yyyy年MM月dd日')}</div>
                  <time className="text-[10px] text-slate-500 font-mono">{format(new Date(item.date), 'E', { locale: zhCN })}</time>
                </div>
                <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <p>今日吸纳灵泉 <span className="text-cyan-400 font-mono">{item.count}</span> 次，共计 <span className="text-cyan-400 font-mono">{isNaN(item.amount) ? 0 : item.amount}</span> ml。</p>
                  {item.milestones.map((m: any, mIdx: number) => (
                    <p key={mIdx} className="text-amber-400 flex items-center">
                      <span className="mr-1">✨</span> 突破至 <span className={`font-bold ml-1 ${m.color}`}>{m.level}</span>！
                    </p>
                  ))}
                  {item.amount >= settings.dailyGoal && (
                    <p className="text-emerald-400 flex items-center">
                      <span className="mr-1">✓</span> 完成今日修仙目标。
                    </p>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-slate-500 text-sm py-4">暂无历程，快去喝杯水开启修仙之路吧！</div>
          )}
        </div>
      </div>
    </div>
  );
}
