import { useState, useEffect, useMemo } from 'react';
import { useStore, CULTIVATION_LEVELS, SECTS, Plan } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Clock, Flame, BookOpen, Calendar, Zap, Target,
  Sparkles, Coffee, Droplets, Moon, Sunrise, Sunset, Swords,
  Brain, ScrollText, Bell, Timer, ChevronDown, ChevronUp,
  Star, CheckCircle, AlertCircle, X, Check,
} from 'lucide-react';

// 凡人修仙传风格修炼计划模板
const CULTIVATION_TEMPLATES = [
  {
    id: 'morning_breath',
    name: '晨间吐纳',
    icon: Sunrise,
    desc: '卯时起床，面对东方，吐纳天地灵气。炼气期修士每日必修。',
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    textColor: 'text-amber-300',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    startTime: '06:00', endTime: '08:00', interval: 60,
  },
  {
    id: 'sword_practice',
    name: '御剑术修炼',
    icon: Swords,
    desc: '以青竹蜂云剑诀御使飞剑，练习剑阵操控。',
    color: 'from-cyan-500/20 to-blue-500/10',
    border: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    startTime: '09:00', endTime: '12:00', interval: 90,
  },
  {
    id: 'alchemy_session',
    name: '炼丹研习',
    icon: Flame,
    desc: '于洞府丹房中炼制丹药，参悟草木药理之精微。',
    color: 'from-red-500/20 to-rose-500/10',
    border: 'border-red-500/30',
    textColor: 'text-red-300',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    startTime: '13:00', endTime: '15:00', interval: 120,
  },
  {
    id: 'divine_sense',
    name: '神识冥想',
    icon: Brain,
    desc: '修炼大衍诀，分裂神识，淬炼精神力。',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/30',
    textColor: 'text-violet-300',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    startTime: '15:00', endTime: '17:00', interval: 120,
  },
  {
    id: 'night_cultivation',
    name: '子夜打坐',
    icon: Moon,
    desc: '子时阴气最盛，正是修炼玄功的最佳时机。',
    color: 'from-indigo-500/20 to-blue-500/10',
    border: 'border-indigo-500/30',
    textColor: 'text-indigo-300',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    startTime: '22:00', endTime: '23:30', interval: 60,
  },
  {
    id: 'water_cultivation',
    name: '灵泉汲水',
    icon: Droplets,
    desc: '饮水即修行，每饮一口灵泉，修为便增进一分。',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    startTime: '08:00', endTime: '22:00', interval: 120,
  },
  {
    id: 'coffee_elixir',
    name: '灵咖提神',
    icon: Coffee,
    desc: '以灵咖替代灵茶，提神醒脑，适合连夜研习功法。',
    color: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/30',
    textColor: 'text-yellow-300',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
    startTime: '09:00', endTime: '21:00', interval: 180,
  },
];

// 宗门修炼任务
const SECT_MISSIONS = [
  { id: 'patrol', name: '巡视山门', desc: '巡逻宗门领地，驱赶低阶妖兽', reward: '宗门贡献 +50', icon: Swords, color: 'text-amber-300' },
  { id: 'herb_garden', name: '照看药园', desc: '为宗门药园浇水除草', reward: '灵草 +2', icon: Droplets, color: 'text-emerald-300' },
  { id: 'teaching', name: '指点后辈', desc: '为新入门弟子讲解基础功法', reward: '宗门贡献 +30', icon: BookOpen, color: 'text-blue-300' },
  { id: 'refining', name: '炼制丹药', desc: '为宗门炼制日常所需丹药', reward: '灵石 +100', icon: Flame, color: 'text-red-300' },
  { id: 'formation', name: '维护阵法', desc: '检查并加固宗门护山大阵', reward: '阵法经验 +5', icon: Zap, color: 'text-purple-300' },
];

export default function PlansPage() {
  const {
    plans, addPlan, updatePlan, deletePlan, togglePlan, checkIn,
    sect, sectStatus, sectContribution, addSectContribution,
    levelIndex, bonusPoints, spiritStones, addSpiritStones,
    materials, addMaterial, logs, sectNpcs, settings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'schedule' | 'templates' | 'missions' | 'progress'>('schedule');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', startTime: '09:00', endTime: '18:00', intervalMinutes: 60 });
  const [toast, setToast] = useState<string | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  useEffect(() => { checkIn(); }, [checkIn]);

  // Today's stats
  const todayLogs = logs.filter(l => l.timestamp > Date.now() - 24 * 60 * 60 * 1000);
  const todayWater = todayLogs.reduce((s, l) => s + l.amount, 0);
  const todayGoal = settings.dailyGoal;
  const todayProgress = Math.min(100, (todayWater / todayGoal) * 100);
  const activePlans = plans.filter(p => p.active);

  const currentLevel = CULTIVATION_LEVELS[levelIndex];
  const nextLevel = CULTIVATION_LEVELS[levelIndex + 1];
  const levelProgress = nextLevel
    ? Math.min(100, ((bonusPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  const handleAddTemplate = (tpl: typeof CULTIVATION_TEMPLATES[0]) => {
    addPlan({
      name: tpl.name,
      startTime: tpl.startTime,
      endTime: tpl.endTime,
      intervalMinutes: tpl.interval,
      active: true,
    });
    showToast(`已添加修炼日程：${tpl.name}`);
  };

  const handleSaveEdit = (id: string) => {
    updatePlan(id, editForm);
    setEditingId(null);
    showToast('修炼日程已更新');
  };

  const completeMission = (missionId: string) => {
    if (completedMissions.includes(missionId)) return;
    setCompletedMissions(prev => [...prev, missionId]);
    const mission = SECT_MISSIONS.find(m => m.id === missionId);
    if (mission) {
      if (missionId === 'patrol' || missionId === 'teaching') {
        addSectContribution(missionId === 'patrol' ? 50 : 30);
      } else if (missionId === 'herb_garden') {
        addMaterial('common_herb', 2);
      } else if (missionId === 'refining') {
        addSpiritStones(100);
      }
      showToast(`完成宗门任务：${mission.name}！${mission.reward}`);
    }
  };

  // Current time indicator
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col min-h-full bg-slate-900 p-4 relative overflow-y-auto pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <ScrollText size={20} className="text-emerald-400" />
            <span>修炼日程</span>
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {currentLevel?.name || '凡人'} · {activePlans.length} 项修行中
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
        >
          <Plus size={14} />
          <span>新增修行</span>
        </motion.button>
      </div>

      {/* Card-style tabs */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {([
          { id: 'schedule' as const, label: '今日修行', icon: Clock, color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', desc: '修炼计划' },
          { id: 'templates' as const, label: '功法模板', icon: BookOpen, color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', text: 'text-amber-300', desc: '一键添加' },
          { id: 'missions' as const, label: '宗门任务', icon: Target, color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30', text: 'text-cyan-300', desc: '每日历练' },
          { id: 'progress' as const, label: '修行进度', icon: Flame, color: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/30', text: 'text-purple-300', desc: '境界突破' },
        ] as const).map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === tab.id
                ? `bg-gradient-to-br ${tab.color} ${tab.border} shadow-lg`
                : 'bg-slate-800/30 border-slate-700/20 hover:bg-slate-800/50'
            }`}
          >
            <motion.div
              animate={activeTab === tab.id ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <tab.icon size={20} className={activeTab === tab.id ? tab.text : 'text-slate-500'} />
            </motion.div>
            <span className={`text-[11px] font-bold mt-1.5 ${activeTab === tab.id ? tab.text : 'text-slate-500'}`}>
              {tab.label}
            </span>
            <span className={`text-[8px] ${activeTab === tab.id ? `${tab.text}/60` : 'text-slate-600'}`}>
              {tab.desc}
            </span>
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />
            )}
          </motion.button>
        ))}
      </div>

      {/* === SCHEDULE TAB === */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          {/* Today's water progress card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-950/60 to-teal-950/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden"
          >
            {/* Progress ring */}
            <div className="absolute top-3 right-3">
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <motion.circle cx="28" cy="28" r="24" fill="none" stroke="#34d399" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - todayProgress / 100) }}
                  transition={{ duration: 1 }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {Math.round(todayProgress)}%
              </span>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <Droplets size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-300">今日灵泉汲取</h3>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{todayWater} / {todayGoal} ml</div>
            <p className="text-[10px] text-emerald-400/50">
              {todayProgress >= 100 ? '今日修行圆满！' :
               todayProgress >= 50 ? '道心坚定，继续努力！' :
               '道友，莫要懈怠了修行。'}
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative pl-6 border-l-2 border-slate-700/50 ml-2">
            {/* Current time marker */}
            <motion.div
              className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] z-10"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ top: `${((currentHour * 60 + currentMinute) / (24 * 60)) * 100}%` }}
            />

            {activePlans.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-8 text-center">
                <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-2">暂无修炼计划</p>
                <p className="text-[10px] text-slate-600">点击右上角「新增修行」或从「功法模板」中添加</p>
              </motion.div>
            ) : (
              activePlans.map((plan, i) => {
                const isActive = plan.active;
                const isEditing = editingId === plan.id;
                const startHour = parseInt(plan.startTime.split(':')[0]);
                const endHour = parseInt(plan.endTime.split(':')[0]);
                const isCurrentlyActive = isActive && currentHour >= startHour && currentHour < endHour;
                const template = CULTIVATION_TEMPLATES.find(t => t.name === plan.name);
                const Icon = template?.icon || Clock;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative mb-3 p-4 rounded-2xl border transition-all ${
                      isCurrentlyActive
                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]'
                        : isActive
                        ? 'bg-slate-800/40 border-slate-700/30'
                        : 'bg-slate-800/20 border-slate-700/10 opacity-50'
                    }`}
                  >
                    {/* Active pulse */}
                    {isCurrentlyActive && (
                      <motion.div className="absolute inset-0 rounded-2xl border border-emerald-400/20"
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          animate={isCurrentlyActive ? { rotate: 360 } : {}}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            template?.iconBg || 'bg-slate-700/50'
                          }`}
                        >
                          <Icon size={18} className={template?.iconColor || 'text-slate-400'} />
                        </motion.div>
                        <div>
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                value={editForm.name || plan.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white w-28"
                              />
                              <input
                                type="time" value={editForm.startTime || plan.startTime}
                                onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white w-20"
                              />
                              <input
                                type="time" value={editForm.endTime || plan.endTime}
                                onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white w-20"
                              />
                              <input
                                type="number" value={editForm.intervalMinutes || plan.intervalMinutes}
                                onChange={e => setEditForm({ ...editForm, intervalMinutes: parseInt(e.target.value) || 60 })}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white w-14"
                                min="5"
                              />
                              <button onClick={() => handleSaveEdit(plan.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg bg-slate-700 text-slate-400">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-white">{plan.name}</h4>
                                {isCurrentlyActive && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 animate-pulse">
                                    修行中
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                                <Clock size={10} />
                                <span>{plan.startTime} - {plan.endTime}</span>
                                <span>·</span>
                                <Timer size={10} />
                                <span>每 {plan.intervalMinutes} 分钟</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center space-x-1">
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              togglePlan(plan.id);
                              showToast(plan.active ? '已暂停此修行' : '已恢复此修行');
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
                            }`}
                          >
                            <Bell size={14} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => { setEditingId(plan.id); setEditForm({}); }}
                            className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 flex items-center justify-center">
                            <span className="text-xs">✎</span>
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => { deletePlan(plan.id); showToast('已删除此修行计划'); }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                            <Trash2 size={12} />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Template description */}
                    {template && !isEditing && (
                      <p className="text-[10px] text-slate-500 mt-2 ml-13 pl-0.5">{template.desc}</p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* === TEMPLATES TAB === */}
      {activeTab === 'templates' && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 mb-2">点击模板即可添加到今日修行日程</p>
          {CULTIVATION_TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            const alreadyAdded = plans.some(p => p.name === tpl.name);
            return (
              <motion.button
                key={tpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!alreadyAdded) handleAddTemplate(tpl);
                  else showToast('此功法已在修炼中');
                }}
                disabled={alreadyAdded}
                className={`w-full flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r ${tpl.color} border ${tpl.border} transition-all text-left ${
                  alreadyAdded ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${tpl.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={tpl.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${tpl.textColor}`}>{tpl.name}</span>
                    {alreadyAdded && <span className="text-[10px] text-slate-500">已添加</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{tpl.desc}</p>
                  <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500">
                    <span>{tpl.startTime} - {tpl.endTime}</span>
                    <span>·</span>
                    <span>每 {tpl.interval} 分钟</span>
                  </div>
                </div>
                {!alreadyAdded && <Plus size={14} className="text-slate-400 flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* === MISSIONS TAB === */}
      {activeTab === 'missions' && (
        <div className="space-y-3">
          {!sect || sectStatus !== 'joined' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12">
              <Target size={40} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-1">尚未加入宗门</p>
              <p className="text-[10px] text-slate-600">加入宗门后可领取每日修炼任务</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">宗门贡献：{sectContribution}</span>
                <span className="text-[10px] text-slate-500">{completedMissions.length}/{SECT_MISSIONS.length} 已完成</span>
              </div>
              {SECT_MISSIONS.map((mission, i) => {
                const Icon = mission.icon;
                const done = completedMissions.includes(mission.id);
                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      done
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                        : 'bg-slate-800/40 border-slate-700/30 hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl ${done ? 'bg-emerald-500/10' : 'bg-slate-700/50'} flex items-center justify-center`}>
                          {done ? <CheckCircle size={18} className="text-emerald-400" /> : <Icon size={18} className={mission.color} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{mission.name}</h4>
                          <p className="text-[10px] text-slate-500">{mission.desc}</p>
                          <span className="text-[10px] text-amber-400/60">{mission.reward}</span>
                        </div>
                      </div>
                      {!done && (
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => completeMission(mission.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium whitespace-nowrap"
                        >
                          接取
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* === PROGRESS TAB === */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          {/* Level progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-950/60 to-indigo-950/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-purple-400" />
                <h3 className="text-sm font-bold text-purple-300">境界突破进度</h3>
              </div>
              <span className="text-[10px] text-purple-400/50">{currentLevel?.name}</span>
            </div>
            {nextLevel ? (
              <>
                <div className="flex justify-between text-[10px] text-purple-400/50 mb-1.5">
                  <span>{currentLevel.name}</span>
                  <span>→ {nextLevel.name}</span>
                </div>
                <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden border border-purple-500/20 mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-purple-400/60">{bonusPoints.toLocaleString()} 修为</span>
                  <span className="text-purple-400/40">{nextLevel.min.toLocaleString()} 修为</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-purple-400/60">已达此界巅峰！</p>
            )}
          </motion.div>

          {/* Streak & stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: '今日饮水', value: `${todayWater}ml`, icon: Droplets, color: 'text-emerald-400' },
              { label: '修炼计划', value: `${activePlans.length} 项`, icon: BookOpen, color: 'text-amber-400' },
              { label: '当前修为', value: bonusPoints.toLocaleString(), icon: Flame, color: 'text-orange-400' },
              { label: '灵石余额', value: spiritStones.toLocaleString(), icon: Sparkles, color: 'text-yellow-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4">
                <stat.icon size={16} className={`${stat.color} mb-2`} />
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Sect NPCs progress */}
          {sect && sectNpcs?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4"
            >
              <h3 className="text-xs font-bold text-slate-300 mb-3">同门修为榜</h3>
              <div className="space-y-2">
                {sectNpcs.slice(0, 5).map((npc, i) => {
                  const npcLevel = CULTIVATION_LEVELS.find(l => l.name === npc.level);
                  const npcIndex = CULTIVATION_LEVELS.findIndex(l => l.name === npc.level);
                  return (
                    <div key={npc.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-600 w-4">{i + 1}</span>
                        <span className="text-xs text-slate-300">{npc.name}</span>
                      </div>
                      <span className={`text-[10px] ${npcLevel?.color || 'text-slate-400'}`}>{npc.level}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">新增修行计划</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">修行名称</label>
                  <input
                    value={newPlan.name}
                    onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="如：晨间吐纳"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">开始时间</label>
                    <input type="time" value={newPlan.startTime}
                      onChange={e => setNewPlan({ ...newPlan, startTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 mb-1 block">结束时间</label>
                    <input type="time" value={newPlan.endTime}
                      onChange={e => setNewPlan({ ...newPlan, endTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">提醒间隔（分钟）</label>
                  <input type="number" value={newPlan.intervalMinutes}
                    onChange={e => setNewPlan({ ...newPlan, intervalMinutes: parseInt(e.target.value) || 60 })}
                    min="5" max="480"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!newPlan.name.trim()) { showToast('请输入修行名称'); return; }
                  addPlan({ name: newPlan.name, startTime: newPlan.startTime, endTime: newPlan.endTime, intervalMinutes: newPlan.intervalMinutes, active: true });
                  setNewPlan({ name: '', startTime: '09:00', endTime: '18:00', intervalMinutes: 60 });
                  setShowAddModal(false);
                  showToast('修行计划已添加！');
                }}
                className="w-full mt-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold"
              >
                开始修行
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
