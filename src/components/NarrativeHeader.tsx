import { useStore, LIFE_STAGES } from '../store';
import { Droplets, Sparkles } from 'lucide-react';

export const NarrativeHeader = () => {
  const { currentStageId, palmBottleLiquid, bottleSpiritUnlocked } = useStore();
  const stage = LIFE_STAGES.find(s => s.id === currentStageId) || LIFE_STAGES[0];

  return (
    <div className="w-full mb-10 px-2 mt-4 flex justify-between items-end border-b border-white/5 pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-light tracking-widest text-slate-100">{stage.name}</h2>
        <p className="text-sm text-slate-500 font-serif italic">{stage.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 group">
          <Droplets className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm font-mono tracking-wider text-cyan-200/80">{palmBottleLiquid} <span className="text-xs text-slate-500">灵液</span></span>
        </div>
        {bottleSpiritUnlocked && (
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-purple-400/60 font-medium">
            <Sparkles className="w-3 h-3" />
            瓶灵激活
          </div>
        )}
      </div>
    </div>
  );
};
