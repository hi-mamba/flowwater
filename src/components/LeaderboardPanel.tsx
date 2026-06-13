import { useEffect, useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { getSocket, connectSocket } from '../socket';
import { useStore, CULTIVATION_LEVELS } from '../store';

interface Entry {
  name: string;
  score: number;
  level?: string;
  ts: number;
}

interface Props {
  gameId: string;
  gameName: string;
}

/**
 * 实时排行榜面板。订阅 socket leaderboard_updated 事件。
 * 自动在挂载时拉一次最新榜。
 */
export default function LeaderboardPanel({ gameId, gameName }: Props) {
  const { playerName } = useStore();
  const [list, setList] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    const sock = getSocket() || connectSocket();
    setLoading(true);
    setError(null);
    if (sock.connected) {
      sock.emit('get_leaderboard', gameId);
    } else {
      // 等连接成功再请求
      const onConnect = () => {
        sock.emit('get_leaderboard', gameId);
        sock.off('connect', onConnect);
      };
      sock.on('connect', onConnect);
    }
    // 兜底：3 秒还没数据就显示离线提示
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('暂无法连接道友通讯，稍后再试');
    }, 3000);
    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    const sock = getSocket() || connectSocket();
    const onUpdate = (data: { gameId: string; top: Entry[] }) => {
      if (data.gameId !== gameId) return;
      setList(data.top || []);
      setLoading(false);
      setError(null);
    };
    sock.on('leaderboard_updated', onUpdate);
    const cleanup = refresh();
    return () => {
      sock.off('leaderboard_updated', onUpdate);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return (
    <div className="bg-slate-800/60 border border-amber-700/30 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-300 flex items-center">
          <Trophy size={14} className="mr-1.5" /> {gameName} · 道友排行榜
        </h3>
        <button onClick={refresh} className="text-slate-400 hover:text-slate-200 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>
      {loading ? (
        <p className="text-xs text-slate-500 text-center py-4">召唤天机镜中...</p>
      ) : error ? (
        <p className="text-xs text-rose-400 text-center py-4">{error}</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">尚无道友登榜，去抢占第一席！</p>
      ) : (
        <ol className="space-y-1.5">
          {list.slice(0, 10).map((e, i) => {
            const isMe = e.name === playerName;
            const medal = i === 0 ? 'bg-amber-500 text-slate-900' :
                          i === 1 ? 'bg-slate-300 text-slate-900' :
                          i === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-300';
            return (
              <li key={`${e.name}-${e.ts}`}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${
                    isMe ? 'bg-indigo-900/40 border border-indigo-500/40' : 'bg-slate-900/40'
                  }`}>
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${medal}`}>
                    {i + 1}
                  </span>
                  <span className={isMe ? 'text-indigo-300 font-bold' : 'text-slate-200'}>
                    {e.name}{isMe ? ' (你)' : ''}
                  </span>
                  {e.level && <span className="text-[10px] text-slate-500">{e.level}</span>}
                </div>
                <span className="text-amber-400 font-bold">{e.score}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** 提交分数到服务端（带本地缓存的当前角色信息） */
export function submitScore(gameId: string, score: number) {
  if (!score || score <= 0) return;
  try {
    const sock = getSocket() || connectSocket();
    const state = useStore.getState();
    const level = CULTIVATION_LEVELS[state.levelIndex]?.name || '凡人';
    const send = () => sock.emit('submit_score', {
      gameId,
      score: Math.floor(score),
      name: state.playerName || '无名道友',
      level,
    });
    if (sock.connected) send();
    else sock.once('connect', send);
  } catch (e) {
    console.warn('[Leaderboard] submitScore failed', e);
  }
}

/**
 * 大厅风云榜：列出所有有人登榜的游戏的 Top1。
 * games: 提供 id → 显示名映射。
 */
export function HallTopBoard({ games }: { games: { id: string; name: string }[] }) {
  const { playerName } = useStore();
  const [summary, setSummary] = useState<Record<string, { name: string; score: number; level?: string }>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sock = getSocket() || connectSocket();
    const onUpdate = (data: Record<string, { name: string; score: number; level?: string }>) => {
      setSummary(data || {});
      setLoaded(true);
    };
    sock.on('all_top_updated', onUpdate);

    const ask = () => sock.emit('get_all_top');
    if (sock.connected) ask();
    else sock.once('connect', ask);

    // 兜底：3 秒还没数据就显示空态
    const t = setTimeout(() => setLoaded(true), 3000);

    return () => {
      sock.off('all_top_updated', onUpdate);
      clearTimeout(t);
    };
  }, []);

  const entries = games
    .map(g => ({ ...g, top: summary[g.id] }))
    .filter(g => g.top); // 只展示有人登榜的

  if (!loaded) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 mb-4 text-center">
        <p className="text-xs text-slate-500">召唤天机镜中...</p>
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-amber-700/30 rounded-2xl p-4 mb-4 text-center">
        <Trophy size={18} className="text-amber-400 mx-auto mb-1" />
        <p className="text-xs text-slate-400">秘境风云榜虚位以待，谁先登顶？</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-amber-700/30 rounded-2xl p-3 mb-4">
      <h3 className="text-xs font-bold text-amber-300 flex items-center mb-2">
        <Trophy size={12} className="mr-1.5" /> 秘境风云榜 · 各路榜首
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        {entries.slice(0, 6).map(({ id, name, top }) => {
          const isMe = top!.name === playerName;
          return (
            <div key={id} className={`px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between ${
              isMe ? 'bg-indigo-900/40 border border-indigo-500/40' : 'bg-slate-900/50'
            }`}>
              <div className="flex flex-col min-w-0">
                <span className="text-slate-400 truncate">{name}</span>
                <span className={`font-bold truncate ${isMe ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {top!.name}{isMe ? ' (你)' : ''}
                </span>
              </div>
              <span className="text-amber-400 font-bold ml-2 flex-shrink-0">{top!.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
