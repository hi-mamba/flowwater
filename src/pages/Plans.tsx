import { useState, useRef, useMemo, useEffect } from 'react';
import { useStore, Plan, CULTIVATION_LEVELS } from '../store';
import SectLeaderboard from '../components/SectLeaderboard';
import { Plus, Trash2, Edit2, Check, X, Mic, BookOpen, ChevronRight, ExternalLink, ScrollText, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ENCYCLOPEDIA_ITEMS } from '../data/encyclopedia';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LEARNING_PLANS = [
  {
    id: 'qingyuan_sword',
    title: '青元剑诀',
    desc: '黄枫谷顶阶功法，修炼至深处可凝聚青元剑芒。',
    content: `
# 青元剑诀

此乃黄枫谷李化元师祖一脉相传之顶阶功法。

## 功法特性
- **青元剑芒**：修炼至第三层，可将真元化为剑芒，锋利无比，无坚不摧。
- **护体剑盾**：剑气外放，形成护体剑盾，防御力惊人。
- **散功重修**：此功法每突破一个大境界，需散功重修一次，方能将真元提纯至极致。

## 修炼心得
修炼此功法，需辅以大量木属性灵气。若有千年灵草辅助，事半功倍。
    `,
    isEncyclopedia: false
  },
  {
    id: 'dayan_art',
    title: '大衍决',
    desc: '千竹教秘传神识功法，可分神化念，操控众多傀儡。',
    content: `
# 大衍决

千竹教创派祖师大衍神君所创之无上神识秘典。

## 功法奥妙
- **分神化念**：将神识分裂成数百上千份，每一份皆可独立思考。
- **傀儡操控**：神识越强，可操控的傀儡数量越多，等级越高。
- **神识攻击**：修炼至高深处，可直接以神识攻击敌人神魂，防不胜防。

## 修炼风险
分裂神识痛苦万分，稍有不慎便会神魂受损，走火入魔。需配合养魂木等稳固神魂之物修炼。
    `,
    isEncyclopedia: false
  },
  {
    id: 'mingqing_water',
    title: '明清灵水配方',
    desc: '洗涤双目，修炼明清灵眼之必备灵液。',
    content: `
# 明清灵水

此灵水乃是用多种珍稀灵草，辅以百年灵乳熬制而成。

## 灵水功效
- **洗涤双目**：长期滴入双目，可洗去凡尘浊气。
- **明清灵眼**：配合秘法修炼，可修成明清灵眼，看破一切虚妄幻象，洞察敌方破绽。

## 炼制要点
需以文火慢熬七七四十九日，期间不可断火，且需时刻以神识观察药液变化。
    `,
    isEncyclopedia: false
  },
  {
    id: 'repentance',
    title: '宗门秘典：浪子回头',
    desc: '洗心革面，重归宗门，继承往昔修为',
    content: `# 浪子回头金不换\n\n修仙之路崎岖，难免误入歧途。只要潜心悔过，宗门大门依然为你敞开。\n\n**参悟此秘典，即可重归宗门，并恢复被封印的修为！**`,
    isRepentance: true,
    isEncyclopedia: false
  }
];

const parseVoiceCommand = (text: string): Omit<Plan, 'id'> => {
  let startTime = '09:00';
  let endTime = '18:00';
  let intervalMinutes = 60;
  let name = '语音计划';

  // Parse interval
  const intervalMatch = text.match(/每隔?(半|一|两|二|三|四|五|六|七|八|九|十|[\d\.]+)(个)?(小时|分钟|分|钟头)/);
  if (intervalMatch) {
    const numStr = intervalMatch[1];
    const unit = intervalMatch[3];
    let num = parseFloat(numStr);
    if (isNaN(num)) {
      const numMap: Record<string, number> = { '半': 0.5, '一': 1, '两': 2, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
      num = numMap[numStr] || 1;
    }
    if (unit.includes('小时') || unit.includes('钟头')) {
      intervalMinutes = num * 60;
    } else {
      intervalMinutes = num;
    }
  }

  // Parse start time (e.g. 早上八点, 下午3点, 8点半)
  const timeRegex = /(早上|上午|中午|下午|晚上)?(\d+|一|二|两|三|四|五|六|七|八|九|十|十一|十二)点(半|一刻|三刻|\d+分)?/g;
  const matches = [...text.matchAll(timeRegex)];
  
  const parseTime = (match: RegExpMatchArray) => {
    const period = match[1];
    const hourStr = match[2];
    const minuteStr = match[3];
    
    let hour = parseInt(hourStr);
    if (isNaN(hour)) {
      const numMap: Record<string, number> = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12 };
      hour = numMap[hourStr] || 0;
    }
    
    if (period === '下午' || period === '晚上') {
      if (hour < 12) hour += 12;
    } else if (period === '早上' || period === '上午') {
      if (hour === 12) hour = 0;
    }
    
    let minute = 0;
    if (minuteStr) {
      if (minuteStr === '半') minute = 30;
      else if (minuteStr === '一刻') minute = 15;
      else if (minuteStr === '三刻') minute = 45;
      else minute = parseInt(minuteStr.replace('分', ''));
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  if (matches.length === 1) {
    startTime = parseTime(matches[0]);
    endTime = '23:59'; 
  } else if (matches.length >= 2) {
    startTime = parseTime(matches[0]);
    endTime = parseTime(matches[1]);
  }

  if (text.includes('水')) name = '喝水计划';
  if (text.includes('咖啡')) name = '咖啡计划';
  if (text.includes('茶')) name = '喝茶计划';

  return { name, startTime, endTime, intervalMinutes, active: true };
};

export default function PlansPage() {
  const { plans, addPlan, updatePlan, deletePlan, togglePlan, checkIn, sectNpcs, sectStatus, sectPosition, sectLevel, upgradeSect } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [selectedLearningPlan, setSelectedLearningPlan] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    checkIn();
  }, [checkIn]);

  const handleAdd = () => {
    addPlan({
      name: '新计划',
      startTime: '09:00',
      endTime: '18:00',
      intervalMinutes: 60,
      active: true,
    });
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceFeedback('当前浏览器不支持语音识别，请使用 Chrome/Edge 或安卓手机');
      setTimeout(() => setVoiceFeedback(''), 4000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('正在聆听... (例如："早上八点到晚上十点每隔两小时提醒我喝水")');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setVoiceFeedback(`识别中: ${interimTranscript}`);
      }

      if (finalTranscript) {
        const newPlan = parseVoiceCommand(finalTranscript);
        addPlan(newPlan as Plan);
        setVoiceFeedback(`已识别: "${finalTranscript}" -> 创建计划成功！`);
        setTimeout(() => setVoiceFeedback(''), 4000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceFeedback('请允许麦克风权限后重试');
      } else {
        setVoiceFeedback(`识别失败 (${event.error})，请重试`);
      }
      setTimeout(() => setVoiceFeedback(''), 4000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceFeedback.startsWith('正在聆听')) {
        setVoiceFeedback('');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setVoiceFeedback('语音服务启动失败，请刷新页面重试');
      setTimeout(() => setVoiceFeedback(''), 4000);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm(plan);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      updatePlan(editingId, editForm);
      setEditingId(null);
    }
  };

  const applyTemplate = (template: Partial<Plan>) => {
    setEditForm({ ...editForm, ...template });
  };

  return (
    <div className="p-6 max-w-md mx-auto pb-24 relative">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light tracking-wider text-slate-100">饮水计划</h1>
        <div className="flex space-x-3">
          <button
            onClick={startVoiceRecognition}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500/20 text-red-400 animate-pulse' 
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}
            title="语音创建计划"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={handleAdd}
            className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/30 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {voiceFeedback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm text-slate-300 text-center"
        >
          {voiceFeedback}
        </motion.div>
      )}

      <div className="space-y-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            layout
            className={`p-5 rounded-2xl border ${
              plan.active ? 'border-emerald-500/30 bg-slate-800/80' : 'border-slate-700/50 bg-slate-800/40'
            } backdrop-blur-sm transition-colors`}
          >
            {editingId === plan.id ? (
              <div className="space-y-4">
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  <button onClick={() => applyTemplate({ name: '早九晚六', startTime: '09:00', endTime: '18:00', intervalMinutes: 60 })} className="whitespace-nowrap px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs hover:bg-slate-600">早九晚六</button>
                  <button onClick={() => applyTemplate({ name: '上午半天', startTime: '09:00', endTime: '12:00', intervalMinutes: 30 })} className="whitespace-nowrap px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs hover:bg-slate-600">上午半天</button>
                  <button onClick={() => applyTemplate({ name: '下午半天', startTime: '14:00', endTime: '18:00', intervalMinutes: 30 })} className="whitespace-nowrap px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs hover:bg-slate-600">下午半天</button>
                  <button onClick={() => applyTemplate({ name: '全天补水', startTime: '08:00', endTime: '22:00', intervalMinutes: 90 })} className="whitespace-nowrap px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs hover:bg-slate-600">全天补水</button>
                </div>
                <div className="flex space-x-3">
                  <select
                    value={editForm.type || 'water'}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="water">饮水</option>
                    <option value="cultivation">修炼</option>
                  </select>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="计划名称"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">开始时间</label>
                    <input
                      type="time"
                      value={editForm.startTime || ''}
                      onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1 block">结束时间</label>
                    <input
                      type="time"
                      value={editForm.endTime || ''}
                      onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">间隔 (分钟)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="15"
                      value={editForm.intervalMinutes || 60}
                      onChange={(e) => setEditForm({ ...editForm, intervalMinutes: parseInt(e.target.value) })}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-mono w-12 text-right">{editForm.intervalMinutes || 60}m</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-medium ${plan.active ? 'text-white' : 'text-slate-400'}`}>
                      {plan.name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 font-mono">
                      {plan.intervalMinutes}m
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-mono">
                    {plan.startTime} - {plan.endTime}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => togglePlan(plan.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      plan.active ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        plan.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        
        {plans.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>暂无饮水计划</p>
            <p className="text-sm mt-2">点击右上角添加</p>
          </div>
        )}
      </div>

      <div className="mt-12 mb-6">
        <h2 className="text-xl font-light tracking-wider text-slate-100 flex items-center">
          <BookOpen size={20} className="mr-2 text-indigo-400" /> 藏经阁 (修仙典籍)
        </h2>
        <p className="text-xs text-slate-400 mt-2">修仙不忘学习，提升自我境界</p>
      </div>

      <div className="space-y-4 mb-8">
        {LEARNING_PLANS.filter(p => !p.isRepentance || sectStatus === 'betrayed').map((plan) => (
          <motion.div
            key={plan.id}
            className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-800/80 transition-colors cursor-pointer group"
            onClick={() => setSelectedLearningPlan(plan)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-indigo-300 group-hover:text-indigo-200 transition-colors">{plan.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.desc}</p>
              </div>
              <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-light tracking-wider text-slate-100 flex items-center">
            <Users size={20} className="mr-2 text-blue-400" /> 宗门人物志
          </h2>
          <p className="text-xs text-slate-400 mt-2">凡人修仙传人物表及其修为，随时间自动提升</p>
        </div>
        {sectPosition === 'patriarch' && (
          <button 
            onClick={() => {
              const result = upgradeSect();
              showToast(result.message);
            }}
            className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs hover:bg-amber-500/30 transition-colors"
          >
            提升宗门 (Lv.{sectLevel})
          </button>
        )}
      </div>
      <div className="space-y-3 mb-8">
        <SectLeaderboard sectName="宗门" />
      </div>

      <div className="mt-8 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-light tracking-wider text-slate-100 flex items-center">
            <ScrollText size={20} className="mr-2 text-amber-400" /> 万象百科 (今日机缘)
          </h2>
          <p className="text-xs text-slate-400 mt-2">每日随机降临10卷典籍，研读获取经历</p>
        </div>
        <div className="text-sm text-amber-400 font-mono">
          经历: {useStore.getState().experience || 0}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {ENCYCLOPEDIA_ITEMS.filter(item => useStore.getState().dailyEncyclopediaItems?.includes(item.id)).map((item) => {
          const isLearned = useStore.getState().learnedKnowledge?.includes(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => {
                setSelectedLearningPlan({
                  id: item.id,
                  title: item.title,
                  desc: `分类: ${item.category}`,
                  content: `# ${item.title}\n\n${item.content}`,
                  isEncyclopedia: true
                });
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-colors flex justify-between items-center ${
                isLearned 
                  ? 'border-emerald-500/20 bg-emerald-900/10' 
                  : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">{item.category}</span>
                  <h4 className={`text-sm font-medium ${isLearned ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                </div>
              </div>
              {isLearned && <Check size={16} className="text-emerald-500" />}
            </div>
          );
        })}
        {(!useStore.getState().dailyEncyclopediaItems || useStore.getState().dailyEncyclopediaItems.length === 0) && (
          <div className="text-center py-8 text-slate-500 text-sm">
            今日机缘尚未降临，请前往首页吐纳灵气 (刷新页面)
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedLearningPlan && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-slate-900 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-lg font-medium text-indigo-300">{selectedLearningPlan.title}</h2>
              <button onClick={() => setSelectedLearningPlan(null)} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pb-24 prose prose-invert prose-indigo max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedLearningPlan.content}
              </ReactMarkdown>
              
              {selectedLearningPlan.isEncyclopedia && !useStore.getState().learnedKnowledge?.includes(selectedLearningPlan.id) && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      useStore.getState().markKnowledgeLearned(selectedLearningPlan.id);
                      setSelectedLearningPlan(null);
                      showToast('念头通达！获得 1 点经历。');
                    }}
                    className="px-6 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-xl hover:bg-amber-500/30 transition-colors flex items-center"
                  >
                    <Check size={18} className="mr-2" /> 参悟完毕
                  </button>
                </div>
              )}
              {selectedLearningPlan.isRepentance && sectStatus === 'betrayed' && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => {
                      useStore.getState().rejoinSect();
                      setSelectedLearningPlan(null);
                      showToast('重归宗门！修为已恢复。');
                    }}
                    className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center"
                  >
                    <Check size={18} className="mr-2" /> 参悟完毕，重归宗门
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
