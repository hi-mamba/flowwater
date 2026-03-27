import { useStore } from '../store';
import { Bell, Music, Mic, Target, Download, Smartphone, BarChart2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SettingsPage() {
  const { settings, updateSettings, logs } = useStore();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Date,Time,Amount(ml),Type\n"
      + logs.map(l => {
          const d = new Date(l.timestamp);
          return `${l.timestamp},${d.toLocaleDateString()},${d.toLocaleTimeString()},${l.amount},${l.type || 'water'}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "flowwater_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLogsJSON = () => {
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", "flowwater_logs.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearData = () => {
    useStore.getState().resetCultivation();
    setShowClearConfirm(false);
    setToastMessage('数据已清除');
    setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto pb-24 relative">
      <h1 className="text-2xl font-light tracking-wider text-slate-100 mb-8">偏好设置</h1>

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

      {/* Clear Data Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle size={20} />
                <h2 className="text-lg font-medium">警告</h2>
              </div>
              <button onClick={() => setShowClearConfirm(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            <p className="text-slate-300 mb-6">确定要清除所有数据吗？此操作不可恢复，您的修为将重置为零！</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium"
              >
                取消
              </button>
              <button 
                onClick={clearData}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/50 font-medium"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Goal */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Target size={20} />
            <h2 className="text-lg font-medium text-white">每日目标</h2>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">目标饮水量 (ml)</span>
              <input
                type="number"
                value={settings.dailyGoal}
                onChange={(e) => updateSettings({ dailyGoal: parseInt(e.target.value) || 2000 })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-right w-24 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* Drink Settings */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Target size={20} />
            <h2 className="text-lg font-medium text-white">饮品吸收率</h2>
          </div>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-300">灵茶吸收率</span>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.drinkMultipliers?.tea || 0.9}
                  onChange={(e) => updateSettings({ drinkMultipliers: { ...settings.drinkMultipliers, tea: parseFloat(e.target.value) } })}
                  className="w-24 accent-emerald-500"
                />
                <span className="text-emerald-400 font-mono w-12 text-right">{Math.round((settings.drinkMultipliers?.tea || 0.9) * 100)}%</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-300">灵咖吸收率</span>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.drinkMultipliers?.coffee || 0.8}
                  onChange={(e) => updateSettings({ drinkMultipliers: { ...settings.drinkMultipliers, coffee: parseFloat(e.target.value) } })}
                  className="w-24 accent-amber-500"
                />
                <span className="text-amber-400 font-mono w-12 text-right">{Math.round((settings.drinkMultipliers?.coffee || 0.8) * 100)}%</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-300">仙奶茶吸收率</span>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.drinkMultipliers?.milktea || 0.5}
                  onChange={(e) => updateSettings({ drinkMultipliers: { ...settings.drinkMultipliers, milktea: parseFloat(e.target.value) } })}
                  className="w-24 accent-rose-500"
                />
                <span className="text-rose-400 font-mono w-12 text-right">{Math.round((settings.drinkMultipliers?.milktea || 0.5) * 100)}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* System Notifications */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Smartphone size={20} />
            <h2 className="text-lg font-medium text-white">系统通知</h2>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">开启桌面/系统级弹窗提醒</span>
              <button
                onClick={async () => {
                  const newValue = !settings.systemNotifications;
                  if (newValue) {
                    if ('Notification' in window) {
                      const perm = await Notification.requestPermission();
                      if (perm === 'granted') {
                        updateSettings({ systemNotifications: true });
                      } else {
                        setToastMessage('请在系统或浏览器设置中允许通知权限');
                        setTimeout(() => setToastMessage(null), 2000);
                      }
                    } else {
                      setToastMessage('您的设备不支持系统通知');
                      setTimeout(() => setToastMessage(null), 2000);
                    }
                  } else {
                    updateSettings({ systemNotifications: false });
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.systemNotifications ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              开启后，即使应用在后台，时间一到也会通过系统通知提醒你喝水。
            </p>
          </div>
        </section>

        {/* Feedback */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Bell size={20} />
            <h2 className="text-lg font-medium text-white">感知反馈</h2>
          </div>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-300">多态震动</span>
              <select
                value={settings.vibrationMode}
                onChange={(e) => updateSettings({ vibrationMode: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="drop">水滴 (轻柔)</option>
                <option value="heartbeat">心跳 (节奏)</option>
                <option value="breathe">呼吸 (渐进)</option>
                <option value="none">关闭</option>
              </select>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music size={16} className="text-slate-400" />
                <span className="text-slate-300">背景音乐</span>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={settings.music}
                  onChange={(e) => updateSettings({ music: e.target.value as any })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="stream">流水 (默认)</option>
                  <option value="forest">森林</option>
                  <option value="boil">煮沸声</option>
                  <option value="custom">自定义</option>
                  <option value="none">关闭</option>
                </select>
                {settings.music === 'custom' && (
                  <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 text-sm transition-colors">
                    上传
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const dataUrl = e.target?.result as string;
                            updateSettings({ customMusicUrl: dataUrl });
                            setToastMessage('自定义音乐上传成功！');
                            setTimeout(() => setToastMessage(null), 2000);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Voice */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Mic size={20} />
            <h2 className="text-lg font-medium text-white">智能交互</h2>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">离线语音指令</span>
              <button
                onClick={() => updateSettings({ voiceCommandEnabled: !settings.voiceCommandEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.voiceCommandEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.voiceCommandEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              开启后，当提醒响起时，直接说“喝了”或“搞定”，App 将自动记录并关闭提醒。语音识别完全在本地进行，保护隐私。
            </p>
          </div>
        </section>

        {/* History Link */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-indigo-400">
            <BarChart2 size={20} />
            <h2 className="text-lg font-medium text-white">修炼记录</h2>
          </div>
          <button 
            onClick={() => navigate('/history')}
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between transition-colors"
          >
            <span className="text-slate-300">查看历史修仙日志</span>
            <span className="text-indigo-400">&rarr;</span>
          </button>
        </section>

        {/* Data */}
        <section>
          <div className="flex items-center space-x-3 mb-4 text-emerald-400">
            <Download size={20} />
            <h2 className="text-lg font-medium text-white">数据管理</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={exportLogs}
              className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-2xl p-4 border border-slate-700/50 transition-colors text-left flex justify-between items-center"
            >
              <span>导出饮水日志 (CSV)</span>
              <span className="text-xs text-slate-500">{logs.length} 条记录</span>
            </button>
            <button
              onClick={exportLogsJSON}
              className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-2xl p-4 border border-slate-700/50 transition-colors text-left flex justify-between items-center"
            >
              <span>导出饮水日志 (JSON)</span>
              <span className="text-xs text-slate-500">完整数据备份</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-2xl p-4 border border-red-900/50 transition-colors text-left flex justify-between items-center"
            >
              <span>清除所有数据</span>
              <span className="text-xs text-red-500/70">修为将重置</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
