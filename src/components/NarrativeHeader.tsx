import { useStore, LIFE_STAGES } from '../store';
import { Droplets } from 'lucide-react';

export const NarrativeHeader = () => {
  const { currentStageId, palmBottleLiquid, bottleSpiritUnlocked } = useStore();
  const stage = LIFE_STAGES.find(s => s.id === currentStageId) || LIFE_STAGES[0];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-emerald-400">{stage.name}</h2>
          <p className="text-sm text-slate-400">{stage.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-blue-200">{palmBottleLiquid} 滴灵液</span>
          </div>
          {bottleSpiritUnlocked && (
            <div className="text-xs text-purple-400">瓶灵已激活</div>
          )}
        </div>
      </div>
    </div>
  );
};
