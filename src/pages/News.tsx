import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Sparkles, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { fetchNews, subscribeNews } from '../news/client';
import type { NewsItem } from '../news/types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  return `${Math.floor(m / 60)} 小时前`;
}

export default function NewsPage() {
  const navigate = useNavigate();
  const newsEnabled = useStore((s) => s.settings.newsEnabled);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useMemo(
    () => () => {
      setLoading(true);
      fetchNews()
        .then((list) => {
          setItems(list);
          setError(null);
        })
        .catch((e) => setError(e?.message || '加载失败'))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    if (!newsEnabled) return;
    refresh();
    // 订阅实时推送（同局域网其他设备写入即可看到）
    const unsub = subscribeNews((list) => {
      setItems(list);
      setLoading(false);
    });
    return unsub;
  }, [newsEnabled, refresh]);

  if (!newsEnabled) {
    return (
      <div className="p-6 max-w-md mx-auto pb-24">
        <button onClick={() => navigate('/settings')} className="flex items-center gap-1 text-slate-400 mb-8">
          <ArrowLeft size={18} /> 返回设置
        </button>
        <div className="text-center text-slate-400 mt-20 space-y-3">
          <Newspaper size={40} className="mx-auto opacity-40" />
          <p>新闻资讯已关闭</p>
          <p className="text-xs text-slate-500">请在「设置」中开启新闻资讯入口</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/settings')} className="flex items-center gap-1 text-slate-400">
          <ArrowLeft size={18} /> 返回
        </button>
        <h1 className="text-xl font-light tracking-wider text-slate-100 flex items-center gap-2">
          <Newspaper size={20} className="text-emerald-400" /> 新闻资讯
        </h1>
        <button onClick={refresh} className="text-slate-400 p-1" aria-label="刷新">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 mb-4">仅展示近 1 小时内容 · 实时同步同局域网其他设备</p>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center text-slate-500 mt-16">
          <Newspaper size={36} className="mx-auto opacity-30 mb-3" />
          <p className="text-sm">暂无近 1 小时的新闻</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((n) => {
          const open = expanded === n.id;
          return (
            <article key={n.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <button
                onClick={() => setExpanded(open ? null : n.id)}
                className="w-full text-left"
              >
                <h2 className="text-slate-100 font-medium leading-snug">{n.title}</h2>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <Clock size={12} /> {timeAgo(n.createdAt)}
                </div>
              </button>

              {open && (
                <div className="mt-3 space-y-3">
                  {n.content && (
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  )}

                  {n.aiAnalysis && (
                    <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-3">
                      <div className="flex items-center gap-1 text-indigo-300 text-xs font-medium mb-1">
                        <Sparkles size={13} /> AI 分析
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{n.aiAnalysis}</p>
                    </div>
                  )}

                  {n.sourceUrl && (
                    <a
                      href={n.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 text-xs hover:underline break-all"
                    >
                      <ExternalLink size={13} /> {n.sourceUrl}
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
