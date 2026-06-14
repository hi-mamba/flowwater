import { useState, useEffect, Suspense, lazy } from 'react';
import { useStore, DUNGEONS, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, DoorOpen } from 'lucide-react';

const BattleScene3D = lazy(() => import('./three/BattleScene3D'));

type Theme = 'blood' | 'void' | 'demon' | 'kunwu';
type EnemyKind = 'humanoid' | 'beast' | 'boss';

interface EnemyDef {
  name: string;
  kind: EnemyKind;
  hpMul: number;
  atkMul: number;
  reward: number;
  intro: string;
}

interface DungeonRoster {
  theme: Theme;
  enemies: EnemyDef[];
  boss: EnemyDef;
}

// 4 个秘境各自的敌人阵容（每个秘境 5 个普通 NPC + 1 BOSS）
const ROSTER: Record<string, DungeonRoster> = {
  blood_forbidden: {
    theme: 'blood',
    enemies: [
      { name: '血煞门散修', kind: 'humanoid', hpMul: 0.8, atkMul: 0.85, reward: 600, intro: '一名披血袍的散修拦在路前，喝令交出灵石。' },
      { name: '赤鳞蛇妖',  kind: 'beast',    hpMul: 0.9, atkMul: 0.9,  reward: 700, intro: '红雾中扑出一条赤鳞巨蛇，吐着腥红信子。' },
      { name: '魔道弟子',  kind: 'humanoid', hpMul: 1.0, atkMul: 1.0,  reward: 900, intro: '魔道弟子双手结印，黑气缭绕逼近。' },
      { name: '九尾血狐',  kind: 'beast',    hpMul: 1.1, atkMul: 1.05, reward: 1100, intro: '九尾血狐妖瞳一闪，瞬移到你身前。' },
      { name: '血煞执事',  kind: 'humanoid', hpMul: 1.25, atkMul: 1.15, reward: 1500, intro: '执事冷笑："禁地之中，岂容外人。"' },
    ],
    boss: { name: '血魔', kind: 'boss', hpMul: 2.4, atkMul: 1.5, reward: 6000, intro: '血色法阵尽头，血魔睁开双眼，血雨倾泻。' },
  },
  void_hall: {
    theme: 'void',
    enemies: [
      { name: '虚空守卫',   kind: 'humanoid', hpMul: 1.0, atkMul: 1.0,  reward: 1000, intro: '虚空之中现出一道紫色身影，目光如电。' },
      { name: '虚天魔虫',   kind: 'beast',    hpMul: 1.1, atkMul: 1.05, reward: 1200, intro: '殿顶垂下一只通体紫黑的巨虫，触须如鞭。' },
      { name: '上古傀儡',   kind: 'humanoid', hpMul: 1.25, atkMul: 1.1, reward: 1400, intro: '一具上古魔修傀儡破阵而出，体表符文流转。' },
      { name: '虚空魔灵',   kind: 'humanoid', hpMul: 1.4, atkMul: 1.2,  reward: 1700, intro: '魔灵无形无相，只见虚空扭曲，紫雷劈下。' },
      { name: '殿前妖将',   kind: 'beast',    hpMul: 1.5, atkMul: 1.25, reward: 2000, intro: '殿门前蹲伏一头六眼妖兽，怒吼震动大殿。' },
    ],
    boss: { name: '虚天殿灵', kind: 'boss', hpMul: 3.0, atkMul: 1.8, reward: 12000, intro: '殿心一道紫光冲天而起，殿灵睁眼："凡夫，亦敢窥探玄天？"' },
  },
  demon_valley: {
    theme: 'demon',
    enemies: [
      { name: '魔气尸傀',   kind: 'humanoid', hpMul: 1.2, atkMul: 1.1,  reward: 1500, intro: '战场枯骨中爬出一具尸傀，魔气滔天。' },
      { name: '坠魔狼妖',   kind: 'beast',    hpMul: 1.3, atkMul: 1.2,  reward: 1700, intro: '一头黑毛狼妖嚎叫，召出魔影狼群。' },
      { name: '古战场亡魂', kind: 'humanoid', hpMul: 1.4, atkMul: 1.25, reward: 2000, intro: '上古亡魂凝形而出，手中残戟还染血色。' },
      { name: '魔功修士',   kind: 'humanoid', hpMul: 1.55, atkMul: 1.3, reward: 2400, intro: '修士全身血气翻涌：“此地，乃我修魔之所！”' },
      { name: '魔骨巨虫',   kind: 'beast',    hpMul: 1.7, atkMul: 1.4,  reward: 2800, intro: '地裂处钻出一条魔骨巨虫，骨刃林立。' },
    ],
    boss: { name: '古魔残魂', kind: 'boss', hpMul: 3.6, atkMul: 2.0, reward: 18000, intro: '坠魔谷最深处，古魔残魂凝聚成形，魔气几乎实质化。' },
  },
  kunwu_mountain: {
    theme: 'kunwu',
    enemies: [
      { name: '昆吾守山',   kind: 'humanoid', hpMul: 1.4, atkMul: 1.3,  reward: 2400, intro: '一道青色身影自云端落下，玄铁面甲遮蔽容颜。' },
      { name: '青铜兽魄',   kind: 'beast',    hpMul: 1.5, atkMul: 1.35, reward: 2700, intro: '上古青铜兽魄从山岩中爬出，身上烙有古老符文。' },
      { name: '雷阵执法',   kind: 'humanoid', hpMul: 1.7, atkMul: 1.4,  reward: 3000, intro: '执法者抬手一挥，九道紫雷劈落。' },
      { name: '玄铁巨兽',   kind: 'beast',    hpMul: 1.9, atkMul: 1.5,  reward: 3500, intro: '玄铁鳞片巨兽踏地而来，每一步都让山岩颤抖。' },
      { name: '镇山神将',   kind: 'humanoid', hpMul: 2.1, atkMul: 1.6,  reward: 4000, intro: '披甲神将持戟而立，目光如炬：“凡人安敢登山。”' },
    ],
    boss: { name: '昆吾山神', kind: 'boss', hpMul: 4.5, atkMul: 2.4, reward: 30000, intro: '山神睁眼，整座昆吾山为之一颤——“我已等你三千年。”' },
  },
};

const THEME_BG: Record<Theme, string> = {
  blood:  'from-rose-950/80 via-slate-900 to-slate-900 border-rose-900/40',
  void:   'from-purple-950/80 via-slate-900 to-slate-900 border-purple-900/40',
  demon:  'from-amber-950/70 via-slate-900 to-slate-900 border-amber-900/40',
  kunwu:  'from-cyan-950/70 via-slate-900 to-slate-900 border-cyan-900/40',
};

interface BattleEnemy {
  name: string;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  atk: number;
  isBoss: boolean;
  reward: number;
  armorBreak: number;
  beetleDot: number;
  intro: string;
}

export default function InstanceDungeon() {
  const {
    levelIndex, addMaterial,
    swordFormation, spiritBeast, goldDevouringBeetles, heavenlyBottle, divineSense,
    spiritStones,
  } = useStore() as any;
  void spiritStones;

  // 副本选择 / 战斗状态
  const [activeDungeonId, setActiveDungeonId] = useState<string | null>(null);
  const dungeonDef = activeDungeonId ? DUNGEONS.find((d: any) => d.id === activeDungeonId) : null;
  const roster = activeDungeonId ? ROSTER[activeDungeonId] : null;

  // 玩家状态
  const maxHealth = 200 + levelIndex * 30;
  const [health, setHealth] = useState(maxHealth);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(0); // 0..4 普通, 5 = BOSS
  const [log, setLog] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [busy, setBusy] = useState(false);

  // 战斗动画状态
  const [attacking, setAttacking] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [enemyDefeated, setEnemyDefeated] = useState(false);

  // 技能蓄量
  const [liquidCharges, setLiquidCharges] = useState(2);
  const [beetleCharges, setBeetleCharges] = useState(1);
  const [divineCharges, setDivineCharges] = useState(1);
  const [beastUsed, setBeastUsed] = useState(false);

  // 当前敌人
  const [enemy, setEnemy] = useState<BattleEnemy | null>(null);

  const addLogMsg = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 6));

  // 开始副本
  const startBattle = (dungeonId: string) => {
    const def = DUNGEONS.find((d: any) => d.id === dungeonId);
    if (!def) return;
    if (levelIndex < def.minLevel) {
      addLogMsg(`修为不足，需 ${CULTIVATION_LEVELS[def.minLevel]?.name || '更高境界'}`);
      return;
    }
    setActiveDungeonId(dungeonId);
    setHealth(maxHealth);
    setScore(0);
    setStage(0);
    setGameOver(false);
    setBusy(false);
    setAttacking(false);
    setEnemyHit(false);
    setEnemyDefeated(false);
    setLiquidCharges(Math.max(2, Math.floor(heavenlyBottle.greenLiquid / 5)));
    setBeetleCharges(goldDevouringBeetles.stage || 1);
    setDivineCharges(divineSense.level || 1);
    setBeastUsed(false);
    setLog([`🚪 进入【${def.name}】，前方杀机四伏…`]);
    setEnemy(initEnemy(dungeonId, 0));
  };

  const initEnemy = (dungeonId: string, idx: number): BattleEnemy => {
    const r = ROSTER[dungeonId];
    const def = idx >= r.enemies.length ? r.boss : r.enemies[idx];
    const hp = Math.floor((180 + levelIndex * 30) * def.hpMul);
    return {
      name: def.name,
      kind: def.kind,
      hp,
      maxHp: hp,
      atk: Math.floor((14 + levelIndex * 3) * def.atkMul),
      isBoss: idx >= r.enemies.length,
      reward: def.reward,
      armorBreak: 0,
      beetleDot: 0,
      intro: def.intro,
    };
  };

  // 介绍敌人
  useEffect(() => {
    if (!enemy) return;
    addLogMsg(`⚔️ 第 ${stage + 1}/6 关 · ${enemy.name}`);
    addLogMsg(enemy.intro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy?.name]);

  // 玩家面板
  const baseAtk = 22 + levelIndex * 4;
  const swordAtk = swordFormation.swords * 2;
  const formationMult: Record<string, number> = { none: 1.0, swarm: 1.3, dragon: 1.5, net: 1.7, storm: 2.0 };
  const formationBonus = formationMult[swordFormation.formation || 'none'] || 1.0;

  // ==== 敌方反击 ====
  const enemyTurn = (e: BattleEnemy, currentHealth: number) => {
    let beetleDot = e.beetleDot;
    let nextEnemy = { ...e };
    if (beetleDot > 0) {
      const dotDmg = Math.floor(goldDevouringBeetles.count * 0.8 + 30);
      beetleDot -= 1;
      nextEnemy = { ...e, hp: Math.max(0, e.hp - dotDmg), beetleDot };
      addLogMsg(`🪲 噬金虫啃噬，${e.name} -${dotDmg}`);
      if (nextEnemy.hp <= 0) { onEnemyDefeated(nextEnemy); return; }
    }
    const isCrit = e.isBoss && Math.random() < 0.25;
    const dmg = Math.floor(nextEnemy.atk * (0.85 + Math.random() * 0.3) * (isCrit ? 1.8 : 1));
    const nextHealth = currentHealth - dmg;
    addLogMsg(`💢 ${e.name} ${isCrit ? '【大招】重击' : '反击'}你 -${dmg}`);
    setHealth(nextHealth);
    setEnemy(nextEnemy);
    setBusy(false);

    if (nextHealth <= 0) {
      addLogMsg('☠️ 你重伤倒地，被传送出秘境。');
      setGameOver(true);
    }
  };

  // ==== 击败结算 ====
  const onEnemyDefeated = (e: BattleEnemy) => {
    const reward = e.reward + (e.isBoss ? 5000 : 0);
    addLogMsg(`💀 击杀 ${e.name}！+${reward} 灵石`);
    setScore(s => s + reward);
    if (Math.random() < (e.kind === 'beast' ? 0.35 : 0.55)) {
      const mat = (dungeonDef?.rewards.materials[Math.floor(Math.random() * dungeonDef.rewards.materials.length)]) || 'rare_herb';
      addMaterial(mat, e.isBoss ? 5 : 1);
      addLogMsg(`📦 拾得 ${mat} ×${e.isBoss ? 5 : 1}`);
    }
    setEnemyDefeated(true);
    setBusy(true);

    if (e.isBoss) {
      addLogMsg('🏆 秘境征服！');
      setTimeout(() => setGameOver(true), 600);
      return;
    }

    setTimeout(() => {
      const heal = Math.floor(maxHealth * 0.3);
      setHealth(h => Math.min(maxHealth, h + heal));
      addLogMsg(`💚 短暂喘息，恢复 ${heal} 气血`);
      const nextStage = stage + 1;
      setStage(nextStage);
      setEnemy(initEnemy(activeDungeonId!, nextStage));
      setEnemyDefeated(false);
      setBusy(false);
    }, 500);
  };

  // ==== 通用攻击包装 ====
  const flashAttack = () => {
    setAttacking(true);
    setEnemyHit(true);
    setTimeout(() => { setAttacking(false); setEnemyHit(false); }, 250);
  };

  // ==== 技能 ====
  const skillAttack = () => {
    if (busy || gameOver || !enemy) return;
    setBusy(true); flashAttack();
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const dmg = Math.floor((baseAtk + Math.random() * baseAtk * 0.4) * armorMult);
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`👊 普攻 -${dmg}${enemy.armorBreak > 0 ? ` (破甲x${enemy.armorBreak})` : ''}`);
    finalizeStrike(newHp);
  };

  const skillSwords = () => {
    if (busy || gameOver || !enemy) return;
    if (swordFormation.swords < 1) { addLogMsg('⚠️ 尚无飞剑可用'); return; }
    setBusy(true); flashAttack();
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const base = (baseAtk + swordAtk) * formationBonus;
    const dmg = Math.floor(base * (0.9 + Math.random() * 0.3) * armorMult);
    const fname = ({ none: '飞剑斩', swarm: '蜂群乱舞', dragon: '游龙吞天', net: '天罗地网', storm: '剑雨风暴' } as Record<string, string>)[swordFormation.formation || 'none'];
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`⚔️ 【${fname}】(${swordFormation.swords}口) -${dmg}`);
    finalizeStrike(newHp);
  };

  const skillBeetles = () => {
    if (busy || gameOver || !enemy || beetleCharges <= 0) return;
    setBusy(true); flashAttack();
    setBeetleCharges(c => c - 1);
    const turns = 2 + goldDevouringBeetles.stage;
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const burst = Math.floor(goldDevouringBeetles.count * 1.5 * armorMult);
    const newHp = Math.max(0, enemy.hp - burst);
    addLogMsg(`🪲 投放 ${goldDevouringBeetles.count} 只噬金虫，持续 ${turns} 回合`);
    addLogMsg(`🪲 首轮蚀骨 -${burst}`);
    if (newHp <= 0) { onEnemyDefeated({ ...enemy, hp: 0 }); return; }
    const nextE = { ...enemy, hp: newHp, beetleDot: turns };
    setEnemy(nextE);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  const skillDivine = () => {
    if (busy || gameOver || !enemy || divineCharges <= 0) return;
    setBusy(true);
    setDivineCharges(c => c - 1);
    const nextE = { ...enemy, armorBreak: enemy.armorBreak + 1 };
    setEnemy(nextE);
    addLogMsg(`🧠 大衍神识压制，${enemy.name} 破甲 +1`);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  const skillBeast = () => {
    if (busy || gameOver || !enemy) return;
    if (beastUsed || !spiritBeast.active) return;
    const beast = spiritBeast.stabled.find((b: any) => b.id === spiritBeast.active);
    if (!beast) return;
    setBusy(true); flashAttack();
    setBeastUsed(true);
    const armorMult = 1 + enemy.armorBreak * 0.15;
    const dmg = Math.floor((baseAtk * 2.5 + beast.stage * 80) * (0.9 + Math.random() * 0.4) * armorMult);
    const beastSkillName = ({
      blood_jade_spider: '血玉蛛丝缠', wailing_beast: '啼魂夺魄', six_wing_centipede: '霜蚣冰封',
    } as Record<string, string>)[beast.id] || '灵兽撕咬';
    const newHp = Math.max(0, enemy.hp - dmg);
    addLogMsg(`🐾 ${beast.name} 施展【${beastSkillName}】 -${dmg}`);
    finalizeStrike(newHp);
  };

  const skillLiquid = () => {
    if (busy || gameOver || !enemy || liquidCharges <= 0) return;
    setBusy(true);
    setLiquidCharges(c => c - 1);
    const heal = Math.floor(maxHealth * (0.25 + heavenlyBottle.level * 0.05));
    const newHealth = Math.min(maxHealth, health + heal);
    addLogMsg(`💧 饮翠绿灵液，恢复 ${newHealth - health} 气血`);
    setHealth(newHealth);
    setTimeout(() => enemyTurn(enemy, newHealth), 150);
  };

  const finalizeStrike = (newHp: number) => {
    if (!enemy) return;
    if (newHp <= 0) { onEnemyDefeated({ ...enemy, hp: 0 }); return; }
    const nextE = { ...enemy, hp: newHp };
    setEnemy(nextE);
    setTimeout(() => enemyTurn(nextE, health), 150);
  };

  const exitDungeon = () => {
    setActiveDungeonId(null);
    setEnemy(null);
    setLog([]);
  };

  const skillBtn = (active: boolean, color: string) =>
    `relative px-2 py-2 rounded-lg text-[11px] font-medium transition-all border ${
      active
        ? `bg-${color}-600/30 border-${color}-500/50 text-${color}-100 hover:bg-${color}-600/50`
        : 'bg-slate-800/40 border-slate-700/40 text-slate-600 cursor-not-allowed'
    }`;

  // ===== 副本选择界面 =====
  if (!activeDungeonId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <DoorOpen size={16} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-rose-300">秘境探索</h3>
          <span className="text-[10px] text-rose-400/50">3D 斗法 · 释放法宝功法</span>
        </div>

        <div className="space-y-2">
          {DUNGEONS.map((d: any, i: number) => {
            const unlocked = levelIndex >= d.minLevel;
            const r = ROSTER[d.id];
            return (
              <motion.button key={d.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => unlocked && startBattle(d.id)}
                disabled={!unlocked}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left ${
                  unlocked
                    ? `bg-gradient-to-r ${THEME_BG[r.theme]} hover:scale-[1.01]`
                    : 'bg-slate-800/20 border-slate-700/20 opacity-40 cursor-not-allowed'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unlocked ? 'bg-rose-500/20' : 'bg-slate-700/30'}`}>
                  <DoorOpen size={18} className={unlocked ? 'text-rose-400' : 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.desc}</div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] text-rose-400/60">{r.enemies.length} 关 + BOSS</span>
                    <span className="text-[10px] text-slate-500">BOSS: {d.boss}</span>
                  </div>
                </div>
                <span className={`text-[10px] ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {unlocked ? '进入 →' : `${CULTIVATION_LEVELS[d.minLevel]?.name || ''}解锁`}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  if (!roster || !enemy) return null;

  // ===== 战斗界面 =====
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-gradient-to-br ${THEME_BG[roster.theme]} rounded-2xl p-4 border shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden`}>

        {/* 头部 */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Swords size={16} className="text-rose-400" />
              <span className="text-sm font-bold text-rose-300">{dungeonDef?.name}</span>
              <span className="text-[10px] text-amber-400 font-mono">第 {stage + 1}/6 关</span>
            </div>
          </div>
          <button onClick={exitDungeon} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700/50">退出</button>
        </div>

        {/* 关卡进度 */}
        <div className="grid grid-cols-6 gap-0.5 mb-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-sm ${
              i < stage ? 'bg-emerald-500'
                : i === stage ? (stage === 5 ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-pulse')
                : 'bg-slate-800'
            }`} />
          ))}
        </div>

        {/* 3D 战斗场景 */}
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-700/40 bg-slate-950/60">
          <Suspense fallback={<div style={{ height: 220 }} className="flex items-center justify-center text-slate-500 text-xs">凝聚战场...</div>}>
            <BattleScene3D
              theme={roster.theme}
              enemyKind={enemy.kind}
              swords={swordFormation.swords}
              attacking={attacking}
              enemyHit={enemyHit}
              enemyDefeated={enemyDefeated}
              height={220}
            />
          </Suspense>
        </div>

        {/* 双方状态 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-900/70 rounded-xl p-2 border border-emerald-700/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-300 font-bold text-xs">🧑 你</span>
              <span className="text-[9px] text-emerald-400/60">攻 {baseAtk}</span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }} />
            </div>
            <div className="text-[10px] text-emerald-200/70 mt-0.5">{Math.max(0, Math.floor(health))} / {maxHealth}</div>
          </div>
          <div className={`bg-slate-900/70 rounded-xl p-2 border ${enemy.isBoss ? 'border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'border-rose-700/40'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-bold text-xs ${enemy.isBoss ? 'text-amber-300' : 'text-rose-300'}`}>
                {enemy.isBoss ? '👑' : enemy.kind === 'beast' ? '👹' : '🗡️'} {enemy.name}
              </span>
              <span className="text-[9px] text-rose-400/60">攻 {enemy.atk}</span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${enemy.isBoss ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-rose-200/70">{Math.max(0, enemy.hp)} / {enemy.maxHp}</span>
              <div className="flex space-x-1">
                {enemy.armorBreak > 0 && (
                  <span className="text-[8px] px-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">破{enemy.armorBreak}</span>
                )}
                {enemy.beetleDot > 0 && (
                  <span className="text-[8px] px-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🪲{enemy.beetleDot}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-2 text-[10px]">
          <span className="text-amber-400">💎 {score} 灵石</span>
          <span className="text-slate-400">气血上限 {maxHealth}</span>
        </div>

        {/* 技能面板 */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <button onClick={skillAttack} disabled={busy} className={skillBtn(!busy, 'slate')}>
            <div>👊 普攻</div><div className="text-[9px] opacity-60">{baseAtk}</div>
          </button>
          <button onClick={skillSwords} disabled={busy || swordFormation.swords < 1}
            className={skillBtn(!busy && swordFormation.swords >= 1, 'cyan')}>
            <div>⚔️ 剑阵</div><div className="text-[9px] opacity-60">{swordFormation.swords}口×{formationBonus}</div>
          </button>
          <button onClick={skillBeetles} disabled={busy || beetleCharges <= 0}
            className={skillBtn(!busy && beetleCharges > 0, 'yellow')}>
            <div>🪲 噬金虫</div><div className="text-[9px] opacity-60">{beetleCharges > 0 ? `剩 ${beetleCharges}` : '已用'}</div>
          </button>
          <button onClick={skillDivine} disabled={busy || divineCharges <= 0}
            className={skillBtn(!busy && divineCharges > 0, 'purple')}>
            <div>🧠 神识</div><div className="text-[9px] opacity-60">{divineCharges > 0 ? `剩 ${divineCharges}` : '已用'}</div>
          </button>
          <button onClick={skillBeast} disabled={busy || beastUsed || !spiritBeast.active}
            className={skillBtn(!busy && !beastUsed && !!spiritBeast.active, 'teal')}>
            <div>🐾 灵兽</div>
            <div className="text-[9px] opacity-60">{!spiritBeast.active ? '未派' : beastUsed ? '已用' : '终结技'}</div>
          </button>
          <button onClick={skillLiquid} disabled={busy || liquidCharges <= 0}
            className={skillBtn(!busy && liquidCharges > 0, 'emerald')}>
            <div>💧 灵液</div><div className="text-[9px] opacity-60">{liquidCharges > 0 ? `剩 ${liquidCharges}` : '已用'}</div>
          </button>
        </div>

        {/* 战斗日志 */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 h-28 overflow-y-auto text-left text-[11px] space-y-1 border border-slate-700/40">
          {log.map((msg, idx) => (
            <p key={idx} className={idx === 0 ? 'text-slate-100 font-medium' : 'text-slate-500'}>{msg}</p>
          ))}
        </div>

        {/* 结算遮罩 */}
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/95 rounded-2xl flex flex-col items-center justify-center z-20">
            <h3 className={`text-lg font-bold mb-2 ${stage >= 5 ? 'text-amber-300' : 'text-rose-400'}`}>
              {stage >= 5 ? '🏆 秘境征服' : health <= 0 ? '☠️ 力竭而退' : '试炼结束'}
            </h3>
            <p className="text-amber-400 mb-4 text-sm">总收益: {Math.floor(stage >= 5 ? score : score * 0.5)} 灵石</p>
            <p className="text-slate-400 text-xs mb-4">通过：{Math.min(stage + (stage >= 5 ? 1 : 0), 6)} / 6</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={exitDungeon}
              className="px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
              返回洞府
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
