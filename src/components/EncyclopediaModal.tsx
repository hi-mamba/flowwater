import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, Users, Landmark, Sword, Scroll, Grid3X3, Search } from 'lucide-react';
import { SECTS, sectNpcs, GAME_SKILLS, TALISMANS, FORMATIONS, PRESET_CHARACTERS } from '../store';

interface EncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'characters' | 'sects' | 'skills' | 'talismans' | 'formations';

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('characters');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'characters', name: '人物', icon: Users },
    { id: 'sects', name: '宗门', icon: Landmark },
    { id: 'skills', name: '功法', icon: Sword },
    { id: 'talismans', name: '符箓', icon: Scroll },
    { id: 'formations', name: '阵法', icon: Grid3X3 },
  ];

  const getFilteredData = () => {
    let data: any[] = [];
    switch (activeCategory) {
      case 'characters':
        data = [...PRESET_CHARACTERS.map(c => ({ ...c, type: '主角' })), ...sectNpcs.map(n => ({ ...n, type: 'NPC' }))];
        break;
      case 'sects':
        data = SECTS;
        break;
      case 'skills':
        data = GAME_SKILLS;
        break;
      case 'talismans':
        data = TALISMANS;
        break;
      case 'formations':
        data = FORMATIONS;
        break;
    }

    if (!searchQuery) return data;
    return data.filter(item => 
      (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.desc || item.background || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredData = getFilteredData();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl h-[80vh] bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Book className="text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">修仙百科</h2>
                <p className="text-xs text-slate-400">凡人修仙传：人物、宗门、功法全录</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="px-6 py-4 bg-slate-900/30 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="搜索名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as Category)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <cat.icon size={16} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map((item, idx) => (
                  <motion.div
                    key={`${item.id || 'item'}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {item.name || item.title}
                      </h3>
                      {item.level && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {item.level}
                        </span>
                      )}
                      {item.type && activeCategory === 'characters' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.type === '主角' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {item.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.desc || item.background || item.description}
                    </p>
                    {item.talent && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <p className="text-[10px] text-indigo-400 font-medium">天赋: {item.talent}</p>
                      </div>
                    )}
                    {item.effect && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-[10px] text-emerald-400 font-bold">效果值: {item.effect}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                <Book size={48} className="mb-4 opacity-20" />
                <p>未找到相关记录</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              凡人修仙传 · 悦泉修仙录
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
