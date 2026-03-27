import React from 'react';
import { Trophy, Users, Sword } from 'lucide-react';
import { useStore, CULTIVATION_LEVELS } from '../store';

export default function SectLeaderboard({ sectName }: { sectName: string }) {
  const { sectNpcs, playerName, levelIndex, bonusPoints } = useStore();

  // 合并玩家和NPC，按修为排序
  const leaderboard = React.useMemo(() => {
    const playerCultivation = bonusPoints;
    const playerEntry = {
      id: 'player',
      name: playerName || '我',
      level: CULTIVATION_LEVELS[levelIndex]?.name || '凡人',
      cultivation: playerCultivation,
      isPlayer: true
    };

    const npcEntries = (sectNpcs || []).map(npc => ({
      id: npc.id,
      name: npc.name,
      level: npc.level || '未知',
      cultivation: npc.cultivation,
      isPlayer: false
    }));

    const allEntries = [playerEntry, ...npcEntries];
    return allEntries.sort((a, b) => b.cultivation - a.cultivation).slice(0, 10);
  }, [sectNpcs, playerName, levelIndex, bonusPoints]);

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 w-full max-w-sm">
      <div className="flex items-center space-x-2 text-emerald-400 mb-4">
        <Trophy size={20} />
        <h2 className="text-lg font-medium">{sectName} - 宗门修为榜</h2>
      </div>
      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div key={player.id} className={`flex items-center justify-between p-3 rounded-xl border ${player.isPlayer ? 'bg-indigo-900/50 border-indigo-500/50' : 'bg-slate-900/50 border-slate-700/30'}`}>
            <div className="flex items-center space-x-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-500 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-300'}`}>
                {index + 1}
              </span>
              <span className={`text-sm ${player.isPlayer ? 'text-indigo-300 font-bold' : 'text-slate-200'}`}>{player.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center"><Users size={12} className="mr-1" /> {player.level}</span>
              <span className="flex items-center"><Sword size={12} className="mr-1" /> {Math.floor(player.cultivation)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
