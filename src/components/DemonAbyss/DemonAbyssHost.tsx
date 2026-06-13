// 魔渊副本主容器
// 统一管理 idle → narrative → battle → rest → done 状态机
// 由 Games 页或主页通过 <DemonAbyssHost open onClose=... /> 控制显隐

import { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Trophy, AlertTriangle, X, ChevronRight, Shield, ScrollText, ArrowRight } from 'lucide-react';
import { useStore } from '../../store';
import {
  DEMON_ABYSS_DUNGEONS,
  getDemonAbyssDungeon,
  getNarrativeNode,
  getBossById,
  type NarrativeNode,
} from '../../data/demonAbyss';
import { stopBgm } from '../../games/audio';

const FONT = '"Noto Serif SC", serif';

interface Props {
  open: boolean;
  onClose: () => void;
}

// 已学功法 → 战斗中可用的技能槽
const SKILL_TEMPLATES: Record<string, { id: string; name: string; desc: string; cooldown: number; type: any; color: string; dmgRatio: number }> = {
  skill_1: { id: 'skill_1', name: '青元剑诀', desc: '一道剑气穿透同路魔兵', cooldown: 4500, type: 'pierce', color: '#34d399', dmgRatio: 5 },
  skill_2: { id: 'skill_2', name: '玄阴诀', desc: '魔修吸血', cooldown: 6500, type: 'lifesteal', color: '#a78bfa', dmgRatio: 8 },
  skill_3: { id: 'skill_3', name: '五行诀', desc: '五行 AOE', cooldown: 6000, type: 'aoe_small', color: '#fbbf24', dmgRatio: 6 },
  skill_5: { id: 'skill_5', name: '天雷双剑', desc: '全屏巨伤', cooldown: 12000, type: 'aoe_big', color: '#60a5fa', dmgRatio: 10 },
  skill_demon_blood: { id: 'skill_demon_blood', name: '血魂炼魂', desc: '血魂大伤回血', cooldown: 5000, type: 'lifesteal', color: '#f43f5e', dmgRatio: 12 },
};

const DemonAbyssBattle = lazy(() => import('./DemonAbyssBattleHost'));

export default function DemonAbyssHost({ open, onClose }: Props) {
  const {
    demonAbyssRun,
    levelIndex,
    enterDemonAbyss,
    drawDemonAbyssNarrative,
    resolveDemonAbyssNarrative,
    finishDemonAbyssBattle,
    retreatFromDemonAbyss,
    cancelDemonAbyss,
    getDemonTidePhase,
  } = useStore();

  const { phase: tidePhase } = getDemonTidePhase();
  const tideOpen = tidePhase === 'open' || tidePhase === 'closing';

  // 进入副本 / 结束副本时管理 BGM
  useEffect(() => {
    if (!open) stopBgm();
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[180] bg-slate-950/97 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ fontFamily: FONT }}
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => {
            if (demonAbyssRun.active) {
              // 战斗中关闭：保留进度
              onClose();
            } else {
              cancelDemonAbyss();
              onClose();
            }
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/70 flex items-center justify-center text-slate-400 hover:text-white z-10"
        >
          <X size={16} />
        </button>

        {/* 状态机 */}
        {!demonAbyssRun.active && (
          <DungeonPicker
            tideOpen={tideOpen}
            tidePhase={tidePhase}
            playerLevelIndex={levelIndex}
            onPick={(id) => {
              const r = enterDemonAbyss(id);
              if (!r.success) alert(r.message);
            }}
          />
        )}

        {demonAbyssRun.active && demonAbyssRun.step === 'narrative' && (
          <NarrativeView
            onChoose={(choiceId) => resolveDemonAbyssNarrative(choiceId)}
          />
        )}

        {demonAbyssRun.active && demonAbyssRun.step === 'battle' && (
          <Suspense fallback={
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-400">魔气汇聚...</p>
            </div>
          }>
            <DemonAbyssBattle
              skillTemplates={SKILL_TEMPLATES}
              onResult={(won, contrib) => finishDemonAbyssBattle(won, contrib)}
            />
          </Suspense>
        )}

        {demonAbyssRun.active && demonAbyssRun.step === 'rest' && (
          <RestView
            onContinue={() => drawDemonAbyssNarrative()}
            onRetreat={() => retreatFromDemonAbyss()}
          />
        )}
      </div>
    </motion.div>
  );
}

// ========== 副本选择 ==========
function DungeonPicker({
  tideOpen, tidePhase, playerLevelIndex, onPick,
}: {
  tideOpen: boolean;
  tidePhase: string;
  playerLevelIndex: number;
  onPick: (id: any) => void;
}) {
  return (
    <div className="bg-gradient-to-b from-red-950/90 to-slate-950/95 border-2 border-red-700/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
      <div className="text-center mb-5">
        <div className="w-14 h-14 mx-auto bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center justify-center mb-3">
          <Skull className="text-red-400" size={26} />
        </div>
        <h2 className="text-xl text-red-300 tracking-[0.25em]" style={{ fontWeight: 600 }}>魔渊</h2>
        <p className="text-[11px] text-slate-400 mt-1">乱星海三魔出世，魔气大潮已至。</p>
      </div>

      {!tideOpen && (
        <div className="bg-slate-900/60 border border-amber-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-[11px] text-amber-300">魔气未起，请等待下一波潮汐。</p>
          <p className="text-[10px] text-slate-500 mt-1">当前：{tidePhase === 'rising' ? '魔气日盛' : tidePhase === 'closing' ? '魔气消散' : '魔气未起'}</p>
        </div>
      )}

      <div className="space-y-3">
        {DEMON_ABYSS_DUNGEONS.map(d => {
          const locked = playerLevelIndex < d.unlockLevelIndex;
          const stub = d.narrativePools[0].length === 0; // 节点池为空 = stub 副本
          return (
            <button
              key={d.id}
              disabled={locked || stub || !tideOpen}
              onClick={() => onPick(d.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                locked || stub || !tideOpen
                  ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-900/40 to-slate-900/40 border-red-700/50 hover:border-red-500 active:scale-[0.99]'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className={`text-sm tracking-widest ${locked || stub ? 'text-slate-400' : 'text-red-200'}`} style={{ fontWeight: 600 }}>
                    {d.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">解锁：{d.unlockLevelName}</p>
                </div>
                {!locked && !stub && tideOpen && <ChevronRight size={16} className="text-red-400 mt-1" />}
                {(locked || stub) && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                    {locked ? '修为不足' : '即将开启'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{d.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ========== 剧情节点 ==========
function NarrativeView({ onChoose }: { onChoose: (id: string) => void }) {
  const { demonAbyssRun } = useStore();
  const node: NarrativeNode | undefined = useMemo(() => {
    if (!demonAbyssRun.dungeonId || !demonAbyssRun.currentNarrativeId) return undefined;
    return getNarrativeNode(demonAbyssRun.dungeonId, demonAbyssRun.stage, demonAbyssRun.currentNarrativeId);
  }, [demonAbyssRun.dungeonId, demonAbyssRun.stage, demonAbyssRun.currentNarrativeId]);

  if (!node) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 text-center text-slate-400">
        剧情数据加载中...
      </div>
    );
  }

  const stageLabel = ['序章·入渊', '中章·遇魔', '终章·斩魔'][demonAbyssRun.stage - 1] || '';

  return (
    <div className="bg-gradient-to-b from-slate-900/95 to-red-950/40 border border-red-700/30 rounded-3xl p-6 shadow-[0_0_60px_rgba(239,68,68,0.1)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText size={14} className="text-amber-400" />
          <span className="text-[10px] tracking-widest text-amber-300">{stageLabel}</span>
        </div>
        <span className="text-[10px] text-slate-500">节阶 {demonAbyssRun.stage} / 3</span>
      </div>

      <h3 className="text-base text-red-200 tracking-wider mb-3" style={{ fontWeight: 600 }}>{node.title}</h3>
      <p className="text-[12px] text-slate-300 leading-relaxed mb-5">{node.text}</p>

      <div className="space-y-2">
        {node.choices.map(c => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChoose(c.id)}
            className="w-full p-3 rounded-xl bg-slate-800/70 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-200 font-medium">{c.label}</span>
              <ArrowRight size={12} className="text-slate-500" />
            </div>
            {/* 战斗修正提示 */}
            <div className="mt-1 flex flex-wrap gap-1.5 text-[9px] text-slate-500">
              {c.battleMod.monsterCountDelta !== undefined && c.battleMod.monsterCountDelta !== 0 && (
                <span className={c.battleMod.monsterCountDelta < 0 ? 'text-emerald-400' : 'text-red-400'}>
                  魔兵 {c.battleMod.monsterCountDelta > 0 ? '+' : ''}{c.battleMod.monsterCountDelta}
                </span>
              )}
              {c.battleMod.monsterPowerMul !== undefined && c.battleMod.monsterPowerMul !== 1 && (
                <span className={c.battleMod.monsterPowerMul < 1 ? 'text-emerald-400' : 'text-red-400'}>
                  威力 ×{c.battleMod.monsterPowerMul}
                </span>
              )}
              {c.battleMod.spawnAllies && c.battleMod.spawnAllies > 0 && (
                <span className="text-blue-400">友军 ×{c.battleMod.spawnAllies}</span>
              )}
              {c.battleMod.bonusReward?.stones !== undefined && (
                <span className="text-amber-400">额外 {c.battleMod.bonusReward.stones} 灵石</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ========== 节阶间休整 ==========
function RestView({ onContinue, onRetreat }: { onContinue: () => void; onRetreat: () => void }) {
  const { demonAbyssRun } = useStore();
  const def = demonAbyssRun.dungeonId ? getDemonAbyssDungeon(demonAbyssRun.dungeonId) : undefined;
  const boss = demonAbyssRun.bossId && demonAbyssRun.dungeonId ? getBossById(demonAbyssRun.dungeonId, demonAbyssRun.bossId) : undefined;
  const p = demonAbyssRun.pendingRewards;

  const stageLabel = ['序章·入渊', '中章·遇魔', '终章·斩魔'][demonAbyssRun.stage - 1] || '';

  return (
    <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-700/30 rounded-3xl p-6">
      <div className="text-center mb-4">
        <div className="w-14 h-14 mx-auto bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-center mb-3">
          <Shield className="text-emerald-400" size={24} />
        </div>
        <h2 className="text-base text-emerald-200 tracking-widest" style={{ fontWeight: 600 }}>节阶渡过</h2>
        <p className="text-[10px] text-slate-400 mt-1">即将进入【{stageLabel}】</p>
      </div>

      {/* 已得 pending */}
      <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-4 mb-4">
        <div className="text-[10px] tracking-widest text-amber-300 mb-2">尚未结算</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">灵石</span>
            <span className="text-amber-300">{p.spiritStones.toLocaleString()}</span>
          </div>
          {p.skillPages > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">魔功残页</span>
              <span className="text-purple-300">×{p.skillPages}</span>
            </div>
          )}
          {Object.entries(p.materials).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-400">{materialName(k)}</span>
              <span className="text-emerald-300">×{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 下一节阶预告 */}
      {def && demonAbyssRun.stage <= 3 && (
        <div className="bg-slate-900/50 rounded-2xl p-3 mb-4 text-[10px] text-slate-400 border border-slate-800">
          {demonAbyssRun.stage === 3 ? (
            <span>终章 BOSS：<span className="text-red-300 font-bold">{boss?.name || '魔头'}</span> · {boss?.title}</span>
          ) : (
            <span>下一节阶魔兵威力提升约 {Math.round((def.stageBattles[demonAbyssRun.stage - 1].baseMonsterPower / def.stageBattles[Math.max(0, demonAbyssRun.stage - 2)].baseMonsterPower - 1) * 100)}%</span>
          )}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-medium tracking-widest transition-all active:scale-[0.99]"
        >
          继续深入
        </button>
        <button
          onClick={onRetreat}
          className="w-full py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-[12px] tracking-wider border border-slate-700"
        >
          结算撤退
        </button>
      </div>
    </div>
  );
}

const MATERIAL_LABELS: Record<string, string> = {
  common_herb: '普通灵草',
  rare_herb: '珍稀灵草',
  millennium_lingzhi: '千年灵芝',
  jiuzhuan_grass: '九转玄草',
  humai_pill: '护脉丹',
  demon_crystal: '魔晶',
  demon_skill_page: '魔功残页',
};
function materialName(id: string): string {
  return MATERIAL_LABELS[id] || id;
}

// 用 component-export 让外部 lazy import 也能访问
export { DemonAbyssBattle };
