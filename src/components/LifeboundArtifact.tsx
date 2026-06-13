import { motion } from 'motion/react';
import { Sword, Shield, Gem, Sparkles, Hammer } from 'lucide-react';
import { useStore, LIFEBOUND_ARTIFACTS, CULTIVATION_LEVELS } from '../store';
import { useState } from 'react';

const ARTIFACT_ICONS: Record<string, typeof Sword> = {
  bamboo_sword: Sword,
  blood_armor: Shield,
  void_cauldron: Gem,
  wind_thunder_wings: Sparkles,
};

export default function LifeboundArtifact() {
  const { lifeboundArtifact, levelIndex, spiritStones, bindLifeboundArtifact, refineLifeboundArtifact } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const [showSelect, setShowSelect] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Already bound
  if (lifeboundArtifact.id) {
    const def = LIFEBOUND_ARTIFACTS.find(a => a.id === lifeboundArtifact.id);
    const Icon = ARTIFACT_ICONS[lifeboundArtifact.id] || Gem;
    const bonusText = def
      ? def.effectType === 'cultivation' ? `+${Math.round(def.effect * 100)}% 饮水修为`
      : def.effectType === 'breakthrough' ? `+${def.effect}% 突破成功率`
      : def.effectType === 'flat_bonus' ? `+${def.effect} 每次饮水修为`
      : `+${Math.round(def.effect * 100)}% 秘境收益`
      : '';
    const refineBonus = lifeboundArtifact.refinementCount * 2;
    const refineCost = 500 * (lifeboundArtifact.refinementCount + 1);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-amber-950/60 to-orange-950/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 overflow-hidden"
      >
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Icon size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">{lifeboundArtifact.name}</h3>
              <p className="text-[10px] text-amber-500/70">Lv.{lifeboundArtifact.level} · 祭炼 {lifeboundArtifact.refinementCount}/10</p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-amber-400/60 mb-1">{bonusText}</p>
        {refineBonus > 0 && <p className="text-[10px] text-amber-400/40 mb-3">祭炼加成：+{refineBonus}%</p>}

        {lifeboundArtifact.refinementCount < 10 && (
          <button
            onClick={() => { const r = refineLifeboundArtifact(); showToast(r.message); }}
            disabled={spiritStones < refineCost}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Hammer size={14} />
            <span>祭炼法宝 ({refineCost} 💎)</span>
          </button>
        )}
      </motion.div>
    );
  }

  // Not bound yet — show selection
  const currentLevelName = CULTIVATION_LEVELS[levelIndex]?.name || '凡人';
  const available = LIFEBOUND_ARTIFACTS.filter(a => levelIndex >= a.unlockLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-amber-950/60 to-orange-950/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 overflow-hidden"
    >
      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {toast}
        </motion.div>
      )}

      <div className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Gem size={16} className="text-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-amber-300">本命法宝</h3>
      </div>

      {levelIndex < 14 ? (
        <p className="text-[10px] text-amber-400/50">需达到筑基期方可绑定本命法宝（当前：{currentLevelName}）</p>
      ) : (
        <>
          <button
            onClick={() => setShowSelect(!showSelect)}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all mb-3"
          >
            {showSelect ? '收起法宝列表' : '选择本命法宝'}
          </button>

          {showSelect && (
            <div className="space-y-2">
              {available.length === 0 && <p className="text-[10px] text-amber-400/50">暂无可选法宝</p>}
              {available.map(a => {
                const Icon = ARTIFACT_ICONS[a.id] || Gem;
                return (
                  <button
                    key={a.id}
                    onClick={() => { const r = bindLifeboundArtifact(a.id); showToast(r.message); if (r.success) setShowSelect(false); }}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/15 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-amber-200">{a.name}</div>
                      <div className="text-[10px] text-amber-400/50 truncate">{a.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
