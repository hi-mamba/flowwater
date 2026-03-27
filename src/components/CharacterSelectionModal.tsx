import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, Shield, Zap, BookOpen, ChevronRight, X } from 'lucide-react';
import { PRESET_CHARACTERS } from '../store';

interface CharacterSelectionModalProps {
  isOpen: boolean;
  onSelect: (characterId: string, customData?: any) => void;
}

export default function CharacterSelectionModal({ isOpen, onSelect }: CharacterSelectionModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleSelect = () => {
    if (isCustom) {
      if (!customName.trim()) return;
      onSelect('custom', { name: customName });
    } else if (selectedId) {
      onSelect(selectedId);
    }
  };

  const selectedPreset = PRESET_CHARACTERS.find(c => c.id === selectedId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700/50 rounded-[40px] w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] my-8"
          >
            {/* Left: Character List */}
            <div className="lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-slate-700/50 bg-slate-900/50">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">选择你的道途</h2>
                <p className="text-slate-400 text-sm mt-2">大道三千，尔欲何往？</p>
              </div>

              <div className="space-y-3">
                {PRESET_CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setSelectedId(char.id);
                      setIsCustom(false);
                    }}
                    className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between group ${
                      selectedId === char.id 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedId === char.id ? 'bg-blue-500/20' : 'bg-slate-700/50'
                      }`}>
                        <User size={24} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg">{char.name}</div>
                        <div className="text-[10px] uppercase tracking-widest opacity-60">{char.growthPath.split('：')[0]}</div>
                      </div>
                    </div>
                    <ChevronRight size={20} className={`transition-transform ${selectedId === char.id ? 'translate-x-1' : 'opacity-0'}`} />
                  </button>
                ))}

                <button
                  onClick={() => {
                    setIsCustom(true);
                    setSelectedId(null);
                  }}
                  className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between group ${
                    isCustom 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isCustom ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Sparkles size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">自定义角色</div>
                      <div className="text-[10px] uppercase tracking-widest opacity-60">自由自在 · 凡人修仙</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className={`transition-transform ${isCustom ? 'translate-x-1' : 'opacity-0'}`} />
                </button>
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:w-2/3 p-10 bg-slate-950/30 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {isCustom ? (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-4xl font-black text-white mb-4">自定义你的修仙者</h3>
                      <p className="text-slate-400 leading-relaxed">
                        你将扮演一名初入修仙界的凡人，一切皆由你自己决定。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 block">道号 / 姓名</span>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="请输入你的名字"
                          className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                          <Zap size={20} className="text-emerald-400" />
                          <span className="text-white font-bold">初始天赋</span>
                        </div>
                        <p className="text-sm text-slate-400">自由自在：探索秘境收益提升10%。</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                          <Shield size={20} className="text-emerald-400" />
                          <span className="text-white font-bold">初始资源</span>
                        </div>
                        <p className="text-sm text-slate-400">100 灵石，基础法衣一套。</p>
                      </div>
                    </div>
                  </motion.div>
                ) : selectedPreset ? (
                  <motion.div
                    key={selectedPreset.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/30">
                          {selectedPreset.growthPath.split('：')[0]}
                        </span>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/30">
                          {selectedPreset.spiritualRoot === 'heaven' ? '天灵根' : '异灵根'}
                        </span>
                      </div>
                      <h3 className="text-5xl font-black text-white mb-6">{selectedPreset.name}</h3>
                      <p className="text-slate-400 text-lg leading-relaxed italic font-serif border-l-4 border-blue-500/30 pl-6">
                        “{selectedPreset.background}”
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Zap size={18} />
                          <span className="text-sm font-bold uppercase tracking-widest">天赋神通</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedPreset.talent}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-amber-400">
                          <BookOpen size={18} />
                          <span className="text-sm font-bold uppercase tracking-widest">成长路径</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{selectedPreset.growthPath}</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-[32px] bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">初始灵石</div>
                          <div className="text-xl font-mono text-white">{selectedPreset.initialSpiritStones}</div>
                        </div>
                        <div className="w-px h-10 bg-slate-800" />
                        <div className="text-center">
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">初始法宝</div>
                          <div className="text-xl font-mono text-white">{selectedPreset.initialArtifacts.length} 件</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                    <User size={80} className="text-slate-500" />
                    <p className="text-2xl font-bold text-slate-500">请在左侧选择一名角色</p>
                  </div>
                )}
              </AnimatePresence>

              <div className="mt-12">
                <button
                  onClick={handleSelect}
                  disabled={!selectedId && !isCustom}
                  className={`w-full py-6 rounded-[32px] font-black text-xl tracking-widest transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${
                    !selectedId && !isCustom
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : isCustom
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  }`}
                >
                  踏上仙途
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
