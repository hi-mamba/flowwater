// ============================================================================
// 新闻资讯模块 —— 数据契约（供其他人实现数据写入）
// ----------------------------------------------------------------------------
// 数据存储在 APP 内置数据库（服务端 ./data/news.json，见 server.ts）。
// 数据只保留「近 1 小时」，超过即被自动清理。
//
// 数据写入接口（任何人都可以按此契约往里灌数据）：
//   POST  {SERVER}/api/news        请求体 = NewsInput，返回 { ok, item }
//   GET   {SERVER}/api/news        返回 { ok, items: NewsItem[] }   （仅近 1 小时）
//
// 写入成功后，服务端会通过 socket 事件 `news_added` 把这条新闻
// 实时推送给「同一局域网内」所有已连接的设备，从而其他设备无需刷新即可看到。
// socket 事件：
//   client -> server : `get_news`                 请求拉取列表
//   server -> client : `news_list` { items }      返回当前列表
//   server -> client : `news_added` { item }      新增推送
// ============================================================================

/** 新闻条目（服务端持久化与对外返回的完整结构）。 */
export interface NewsItem {
  /** 唯一 ID，由服务端生成（写入时可不传）。 */
  id: string;
  /** 标题。 */
  title: string;
  /** 详细内容（支持 Markdown）。 */
  content: string;
  /** AI 分析（支持 Markdown）。 */
  aiAnalysis: string;
  /** 源地址（原文链接）。 */
  sourceUrl: string;
  /** 创建时间（Unix 毫秒时间戳）。 */
  createdAt: number;
  /** 其他扩展字段（来源名称、标签、封面图等，自由扩展）。 */
  extra?: Record<string, unknown>;
}

/**
 * 写入新闻时的入参。其他人实现数据写入时按此结构 POST 即可。
 * id / createdAt 可省略，服务端会自动补全。
 */
export interface NewsInput {
  title: string;
  content: string;
  aiAnalysis: string;
  sourceUrl: string;
  id?: string;
  createdAt?: number;
  extra?: Record<string, unknown>;
}

/** 数据只保留最近多长时间（毫秒）。1 小时。 */
export const NEWS_RETENTION_MS = 60 * 60 * 1000;
