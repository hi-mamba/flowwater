// 魔渊战斗 Host：包裹 Phaser 场景，负责按节阶/选项创建战斗

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store';
import { createDemonAbyssGame, type SkillSlot } from '../../games/DemonAbyssPhaser';
import {
  getDemonAbyssDungeon,
  getNarrativeChoice,
  getBossById,
} from '../../data/demonAbyss';
import { stopBgm } from '../../games/audio';

interface SkillTpl {
  id: string; name: string; desc: string; cooldown: number; type: any; color: string; dmgRatio: number;
}
interface Props {
  skillTemplates: Record<string, SkillTpl>;
  onResult: (won: boolean, contribution: number) => void;
}

export default function DemonAbyssBattleHost({ skillTemplates, onResult }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const calledRef = useRef(false);
  const [size, setSize] = useState({ w: 360, h: 540 });
  const [bootSize, setBootSize] = useState<{ w: number; h: number } | null>(null);

  const {
    demonAbyssRun, levelIndex,
    equippedArtifacts, artifactLevels,
    skills: ownedSkills, equippedSkills,
  } = useStore();

  // 测量画布
  useEffect(() => {
    const measure = () => {
      const maxW = Math.min(window.innerWidth - 48, 480);
      const w = Math.max(280, maxW);
      const maxH = Math.min(window.innerHeight - 220, 720);
      const h = Math.max(440, maxH);
      setSize(prev => prev.w === w && prev.h === h ? prev : { w, h });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (bootSize) return;
    if (size.w >= 280 && size.h >= 440) setBootSize(size);
  }, [size, bootSize]);

  const opts = useMemo(() => {
    if (!demonAbyssRun.dungeonId) return null;
    const def = getDemonAbyssDungeon(demonAbyssRun.dungeonId);
    if (!def) return null;
    const stageIdx = (demonAbyssRun.stage - 1) as 0 | 1 | 2;
    const battleDef = def.stageBattles[stageIdx];

    // 玩家面板
    const baseHealth = 200 + levelIndex * 30;
    const baseDmg = 8 + levelIndex * 2;

    const swordLv = equippedArtifacts.includes('ancient_sword') ? (artifactLevels['ancient_sword'] || 1) : 0;
    const dmgBonus = 1 + swordLv * 0.1;

    const shieldLv = equippedArtifacts.includes('shield_artifact') ? (artifactLevels['shield_artifact'] || 1) : 0;
    const playerHealth = Math.floor(baseHealth * (1 + shieldLv * 0.15));

    // 血魔甲在魔渊额外加成 +20% 攻击
    const bloodArmorBonus = equippedArtifacts.includes('blood_armor') ? 1.2 : 1.0;

    const fortuneLv = equippedArtifacts.includes('artifact_2') ? (artifactLevels['artifact_2'] || 1) : 0;
    const fortuneSpeedMul = Math.max(0.4, 1 - fortuneLv * 0.25);

    const bottleLv = equippedArtifacts.includes('artifact_1') ? (artifactLevels['artifact_1'] || 1) : 0;
    const passiveHealRate = bottleLv * 0.005;

    // 已学功法 → 技能槽
    const candidateIds = (equippedSkills?.length ? equippedSkills : ownedSkills).filter(id => skillTemplates[id]);
    const slots: SkillSlot[] = candidateIds.slice(0, 4).map(id => {
      const t = skillTemplates[id];
      return {
        id: t.id, name: t.name, desc: t.desc,
        cooldown: t.cooldown, type: t.type, color: t.color,
        damage: baseDmg * t.dmgRatio,
      };
    });

    // 剧情选项
    const choice = demonAbyssRun.currentNarrativeId && demonAbyssRun.narrativeChoiceId
      ? getNarrativeChoice(
          demonAbyssRun.dungeonId,
          demonAbyssRun.stage,
          demonAbyssRun.currentNarrativeId,
          demonAbyssRun.narrativeChoiceId,
        )
      : null;

    // BOSS（仅节阶 3）
    const bossInfo = battleDef.hasBoss && demonAbyssRun.bossId
      ? (() => {
          const b = getBossById(demonAbyssRun.dungeonId!, demonAbyssRun.bossId);
          return b ? {
            name: b.name,
            hpMul: 1.6,
            dmgMul: 1.4,
            bodyColor: b.bodyColor,
            glowColor: b.glowColor,
          } : undefined;
        })()
      : undefined;

    const themeBoss = demonAbyssRun.bossId && demonAbyssRun.dungeonId
      ? getBossById(demonAbyssRun.dungeonId, demonAbyssRun.bossId)
      : undefined;

    return {
      stage: demonAbyssRun.stage as 1 | 2 | 3,
      totalWaves: battleDef.totalWaves,
      baseMonsterPower: battleDef.baseMonsterPower,
      hasBoss: battleDef.hasBoss,
      bossInfo,

      playerHealth, baseDmg,
      dmgBonus: dmgBonus * bloodArmorBonus,
      passiveHealRate,
      fortuneSpeedMul,
      skills: slots,

      monsterCountDelta: choice?.battleMod.monsterCountDelta || 0,
      monsterPowerMul: choice?.battleMod.monsterPowerMul || 1,
      spawnAllies: choice?.battleMod.spawnAllies || 0,

      bgColor: themeBoss?.bgColor ?? 0x3a0a13,
      monsterBodyColor: themeBoss?.bodyColor ?? 0xb91c1c,
      monsterGlowColor: themeBoss?.glowColor ?? 0xef4444,
    };
  }, [
    demonAbyssRun.dungeonId, demonAbyssRun.stage, demonAbyssRun.currentNarrativeId,
    demonAbyssRun.narrativeChoiceId, demonAbyssRun.bossId,
    levelIndex, equippedArtifacts, artifactLevels, ownedSkills, equippedSkills,
    skillTemplates,
  ]);

  useEffect(() => {
    if (!ref.current || !bootSize || !opts) return;
    if (gameRef.current) return;
    calledRef.current = false;

    gameRef.current = createDemonAbyssGame({
      parent: ref.current,
      width: bootSize.w, height: bootSize.h,
      ...opts,
      onStageOver: (r) => {
        if (calledRef.current) return;
        calledRef.current = true;
        onResult(r.won, r.contribution);
      },
    });

    return () => {
      try { gameRef.current?.destroy(true); } catch { /* ignore */ }
      gameRef.current = null;
      stopBgm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSize, demonAbyssRun.stage]);

  useEffect(() => {
    if (!gameRef.current) return;
    try { gameRef.current.scale.resize(size.w, size.h); } catch { /* ignore */ }
  }, [size.w, size.h]);

  if (!opts) {
    return <div className="text-center p-8 text-slate-400">战斗参数加载中...</div>;
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-b from-red-950/95 to-slate-950/95 border-2 border-red-500/30 rounded-3xl p-3 relative"
      style={{ width: size.w + 24, maxWidth: '95vw', fontFamily: '"Noto Serif SC", serif' }}
    >
      {/* 战斗顶部信息 */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <span className="text-[12px]">🩸</span>
          </div>
          <div>
            <div className="text-[12px] text-red-200 tracking-widest" style={{ fontWeight: 600 }}>魔渊节阶 {opts.stage}</div>
            <div className="text-[9px] text-red-400/60">{opts.hasBoss ? '终章·斩魔' : opts.stage === 1 ? '序章·入渊' : '中章·遇魔'}</div>
          </div>
        </div>
        {/* 友军提示 */}
        {opts.spawnAllies > 0 && (
          <div className="text-[9px] text-blue-300 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30">
            友军 ×{opts.spawnAllies}
          </div>
        )}
      </div>

      <div
        ref={ref}
        className="rounded-2xl overflow-hidden border border-red-700/40 mx-auto bg-slate-950"
        style={{ width: size.w, height: size.h, touchAction: 'none' }}
      />
    </motion.div>
  );
}
