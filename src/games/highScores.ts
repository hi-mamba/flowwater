// 本机各游戏最高分（localStorage 持久化）
// 仅本设备可见；服务端排行榜见 LeaderboardPanel

const KEY = 'flowwater_local_highscores_v1';

function read(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function write(data: Record<string, number>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 静默失败
  }
}

export function getLocalHighScore(gameId: string): number {
  return read()[gameId] || 0;
}

export function getAllLocalHighScores(): Record<string, number> {
  return read();
}

/** 若 score 高于历史，更新并返回 true，否则返回 false */
export function updateLocalHighScore(gameId: string, score: number): boolean {
  if (!score || score <= 0) return false;
  const data = read();
  if ((data[gameId] || 0) >= score) return false;
  data[gameId] = Math.floor(score);
  write(data);
  return true;
}
