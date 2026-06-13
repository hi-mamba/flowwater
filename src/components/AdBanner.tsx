import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // 尝试加载 Google AdSense
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense 加载失败，不影响主流程", e);
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-8 relative flex items-center justify-center bg-slate-800/30 rounded-xl overflow-hidden min-h-[60px] border border-slate-700/30">
      {/* 广告加载失败或未配置时的占位提示 */}
      <span className="absolute text-xs text-slate-600 pointer-events-none">
        广告预留位 (第三方接入)
      </span>
      
      {/* Google AdSense 占位标签 */}
      <ins
        ref={adRef}
        className="adsbygoogle relative z-10"
        style={{ display: 'block', width: '100%', height: '60px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 替换为你的 Publisher ID
        data-ad-slot="XXXXXXXXXX" // 替换为你的 Ad Slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
