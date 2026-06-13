import { useEffect, useRef, useState } from 'react';

/**
 * 测量父容器宽度，并据此计算 Phaser 画布的 (w, h)。
 *
 * - 首次挂载时立即测量
 * - 监听 window resize 增量更新
 * - 不会因尺寸变化触发 game 重建（消费方应只读 size，不要把 size.w/size.h
 *   作为 useEffect 依赖去重新创建 Phaser.Game）
 */
export function useMeasureContainer(
  min: { w: number; h: number } = { w: 280, h: 480 },
  max: { w: number; h: number } = { w: 480, h: 720 },
) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: min.w, h: min.h });

  useEffect(() => {
    if (!ref.current) return;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const parentW =
        el.parentElement?.getBoundingClientRect().width
        || el.getBoundingClientRect().width
        || min.w;
      const w = Math.max(min.w, Math.min(max.w, Math.floor(parentW)));
      const top = el.getBoundingClientRect().top;
      const availableH = window.innerHeight - top - 24;
      const h = Math.max(min.h, Math.min(max.h, Math.floor(availableH)));
      setSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // 仅挂载时初始化；min/max 通常稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, size };
}
