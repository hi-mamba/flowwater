import React, { useState } from 'react';
import { Trophy, Users, Sword, Heart, MessageSquare, Gift, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore, CULTIVATION_LEVELS } from '../store';
import { AnimatePresence, motion } from 'motion/react';

export default function SectLeaderboard({ sectName }: { sectName: string }) {
  const { sectNpcs, playerName, levelIndex, bonusPoints, interactWithNpc } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 合并玩家和NPC，按修为排序
  const finalLeaderboard = React.useMemo(() => {
    const playerCultivation = bonusPoints;
    const playerEntry = {
      id: 'player',
      name: playerName || '我',
      level: CULTIVATION_LEVELS[levelIndex]?.name || '凡人',
      cultivation: playerCultivation,
      isPlayer: true,
      favorability: 0,
      relationship: undefined
    };

    const npcList = sectName === '宗门' 
      ? (sectNpcs || []) 
      : (sectNpcs || []).filter(n => n.sectId === sectName);

    const npcEntries = npcList.map(npc => ({
      id: npc.id,
      name: npc.name,
      level: npc.level || '未知',
      cultivation: npc.cultivation,
      isPlayer: false,
      favorability: npc.favorability || 0,
      relationship: npc.relationship
    }));

    const allEntries = [playerEntry, ...npcEntries];
    return allEntries.sort((a, b) => b.cultivation - a.cultivation).slice(0, 10);
  }, [sectNpcs, playerName, levelIndex, bonusPoints, sectName]);

  const handleInteract = (npcId: string, action: 'chat' | 'gift' | 'spar') => {
    if (!interactWithNpc) return;
    const result = interactWithNpc(npcId, action);
    if (result && result.message) {
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 w-full max-w-sm relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm shadow-xl whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2 text-emerald-400 mb-4">
        <Trophy size={20} />
        <h2 className="text-lg font-medium">{sectName} - 宗门榜</h2>
      </div>
      <div className="space-y-3">
        {finalLeaderboard.map((player, index) => (
          <div key={player.id} className="relative">
            <div 
              onClick={() => !player.isPlayer && setExpandedId(expandedId === player.id ? null : player.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${player.isPlayer ? 'bg-indigo-900/50 border-indigo-500/50 cursor-default' : 'bg-slate-900/50 border-slate-700/30 cursor-pointer hover:bg-slate-800/80'} ${expandedId === player.id ? 'rounded-b-none border-b-0 border-emerald-500/30 bg-slate-800/80' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-500 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-300'}`}>
                  {index + 1}
                </span>
                <span className={`text-sm ${player.isPlayer ? 'text-indigo-300 font-bold' : 'text-slate-200 font-medium'}`}>{player.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-400">
                <span className="flex items-center"><Users size={12} className="mr-1" /> {player.level}</span>
                {!player.isPlayer && (
                  <span className="flex items-center">
                    {expandedId === player.id ? <ChevronUp size={14} className="ml-1 text-slate-500" /> : <ChevronDown size={14} className="ml-1 text-slate-500" />}
                  </span>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {expandedId === player.id && !player.isPlayer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-800/80 border border-t-0 border-emerald-500/30 rounded-b-xl px-4 py-3 pb-4 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-400 flex items-center">
                        <Sword size={12} className="mr-1.5" /> 战力: <span className="text-slate-200 ml-1 font-mono">{Math.floor(player.cultivation)}</span>
                      </div>
                      <div className="text-slate-400 flex items-center">
                        <Heart size={12} className={`mr-1.5 ${(player.favorability || 0) < 0 ? 'text-red-400' : 'text-pink-400'}`} /> 好感: 
                        <span className={`ml-1 ${(player.favorability || 0) < 0 ? 'text-red-400' : 'text-pink-400'}`}>
                          {player.favorability || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleInteract(player.id, 'chat'); }} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 border border-slate-600 transition-colors">
                        <MessageSquare size={14} className="text-blue-400 mb-1" />
                        <span className="text-[10px] text-slate-300">论道</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleInteract(player.id, 'gift'); }} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 border border-slate-600 transition-colors">
                        <Gift size={14} className="text-pink-400 mb-1" />
                        <span className="text-[10px] text-slate-300">赠礼</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleInteract(player.id, 'spar'); }} className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 border border-slate-600 transition-colors">
                        <ShieldAlert size={14} className="text-orange-400 mb-1" />
                        <span className="text-[10px] text-slate-300">切磋</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
