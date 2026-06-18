import { getSocket, connectSocket, getServerUrl } from '../socket';
import type { NewsItem, NewsInput } from './types';
import { NEWS_RETENTION_MS } from './types';

/** 过滤掉超过 1 小时的条目，并按时间倒序。 */
function freshSorted(items: NewsItem[]): NewsItem[] {
  const cutoff = Date.now() - NEWS_RETENTION_MS;
  return items
    .filter((n) => typeof n.createdAt === 'number' && n.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** 通过 HTTP 拉取当前新闻列表（仅近 1 小时）。 */
export async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(`${getServerUrl()}/api/news`);
  if (!res.ok) throw new Error(`fetchNews failed: ${res.status}`);
  const data = await res.json();
  return freshSorted((data?.items as NewsItem[]) || []);
}

/** 写入一条新闻（供调试/演示，正式数据由其他人按接口契约写入）。 */
export async function postNews(input: NewsInput): Promise<NewsItem> {
  const res = await fetch(`${getServerUrl()}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) throw new Error(data?.error || `postNews failed: ${res.status}`);
  return data.item as NewsItem;
}

/**
 * 订阅新闻实时推送（同局域网其他设备写入时会推送过来）。
 * 回调收到「完整的最新列表」。返回取消订阅函数。
 */
export function subscribeNews(onChange: (items: NewsItem[]) => void): () => void {
  const sock = getSocket() || connectSocket();
  let current: NewsItem[] = [];

  const emit = () => onChange(freshSorted(current));

  const onList = (payload: { items: NewsItem[] }) => {
    current = payload?.items || [];
    emit();
  };
  const onAdded = (payload: { item: NewsItem }) => {
    if (!payload?.item) return;
    current = [payload.item, ...current.filter((n) => n.id !== payload.item.id)];
    emit();
  };
  const onConnect = () => sock.emit('get_news');

  sock.on('news_list', onList);
  sock.on('news_added', onAdded);
  sock.on('connect', onConnect);

  // 立即请求一次
  if (sock.connected) sock.emit('get_news');

  return () => {
    sock.off('news_list', onList);
    sock.off('news_added', onAdded);
    sock.off('connect', onConnect);
  };
}
