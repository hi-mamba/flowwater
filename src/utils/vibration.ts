// 震动工具 — 凡人修仙传风格震动模式
export type VibrationPattern = 'drop' | 'heartbeat' | 'breathe' | 'sword' | 'thunder' | 'pill' | 'alarm' | 'none';

const PATTERNS: Record<Exclude<VibrationPattern, 'none'>, number[]> = {
  drop: [100, 50, 100],
  heartbeat: [100, 100, 100, 100, 100],
  breathe: [500, 200, 500, 200, 500],
  sword: [50, 30, 50, 30, 50, 30, 200],        // 剑鸣震动
  thunder: [300, 100, 300, 100, 300, 100, 600],  // 雷劫震动
  pill: [80, 40, 80, 40, 80],                    // 炼丹震动
  alarm: [200, 100, 200, 100, 200, 100, 500],    // 提醒震动
};

export function vibrate(pattern: VibrationPattern): boolean {
  if (pattern === 'none') return false;
  if (!navigator.vibrate) return false;

  try {
    const sequence = PATTERNS[pattern] || PATTERNS.drop;
    navigator.vibrate(sequence);
    return true;
  } catch {
    return false;
  }
}

export function stopVibration(): void {
  try { navigator.vibrate(0); } catch {}
}

export function isVibrationSupported(): boolean {
  return !!navigator.vibrate;
}

// 计划提醒专用震动
export function vibratePlanReminder(planName: string): boolean {
  // 根据计划名称匹配震动模式
  const pattern: VibrationPattern =
    planName.includes('吐纳') || planName.includes('晨') ? 'breathe' :
    planName.includes('剑') || planName.includes('御') ? 'sword' :
    planName.includes('丹') || planName.includes('药') ? 'pill' :
    planName.includes('雷') || planName.includes('劫') ? 'thunder' :
    planName.includes('冥') || planName.includes('夜') ? 'heartbeat' :
    planName.includes('水') || planName.includes('泉') ? 'drop' :
    'alarm';

  return vibrate(pattern);
}
