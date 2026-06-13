// 修仙奇遇录 · React 包装层
// Phaser 游戏引擎 + React/Zustand 状态桥接

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { ADVENTURE_REGIONS, ADVENTURE_EVENTS, getAvailableAdventureEvents, pickRandomAdventureEvent, getEnemyForRegion, type AdventureRegion, type AdventureEvent, type CombatEnemy } from '../data/adventureData';
import {
  createAdventureGame,
  startCombatInGame,
  updateSpiritPowerInGame,
  switchRegionInGame,
  type GameCallbacks,
} from './AdventureGame';

type GamePhase = 'region-select' | 'playing' | 'encounter' | 'result';

export default function Adventure() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<GamePhase>('region-select');
  const [selectedRegion, setSelectedRegion] = useState<AdventureRegion | null>(null);
  const [activeEvent, setActiveEvent] = useState<AdventureEvent | null>(null);
  const [combatEnemy, setCombatEnemy] = useState<CombatEnemy | null>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [logMsg, setLogMsg] = useState('');
  const [isCombat, setIsCombat] = useState(false);

  const adventure = useStore(s => s.adventure);
  const levelIndex = useStore(s => s.levelIndex);
  const equippedSkills = useStore(s => s.equippedSkills);
  const baseLuck = useStore(s => s.baseLuck);
  const moveToNode = useStore(s => s.moveToNode);
  const triggerEvent = useStore(s => s.triggerAdventureEvent);
  const makeChoice = useStore(s => s.makeAdventureChoice);
  const startCombat = useStore(s => s.startAdventureCombat);
  const endCombat = useStore(s => s.endAdventureCombat);
  const addSpiritPower = useStore(s => s.addSpiritPower);

  // 游戏回调
  const callbacks = useRef<GameCallbacks>({
    onSpiritPowerChange: () => {},
    onCombatStart: () => {},
    onCombatEnd: () => {},
    onEncounter: () => {},
    onRegionChange: () => {},
    onNodeVisit: () => {},
    onPlayerHpChange: () => {},
    onEnemyHpChange: () => {},
    onLog: () => {},
    onComboChange: () => {},
    onStoryFlag: () => {},
  });

  // 初始化回调
  useEffect(() => {
    callbacks.current = {
      onSpiritPowerChange: (current, max) => {},
      onCombatStart: (enemy, pHp, eHp) => {
        setCombatEnemy(enemy);
        setPlayerHp(pHp);
        setPlayerMaxHp(pHp);
        setEnemyHp(eHp);
        setEnemyMaxHp(eHp);
        setIsCombat(true);
        setCombo(0);
      },
      onCombatEnd: (victory) => {
        setIsCombat(false);
        setCombatEnemy(null);
        endCombat();
        // 延迟后重置
        setTimeout(() => {
          setPhase('playing');
          // 重新启动探索场景
          if (gameRef.current && selectedRegion) {
            switchRegionInGame(gameRef.current, selectedRegion, levelIndex,
              adventure.spiritPower, adventure.maxSpiritPower,
              adventure.completedEvents, adventure.storyFlags, callbacks.current);
          }
        }, 100);
      },
      onEncounter: (eventId) => {
        const event = ADVENTURE_EVENTS.find(e => e.id === eventId);
        if (event && event.type !== 'combat') {
          setActiveEvent(event);
          setPhase('encounter');
        }
      },
      onRegionChange: () => {},
      onNodeVisit: (nodeId, regionId) => {
        const region = ADVENTURE_REGIONS.find(r => r.id === regionId);
        if (region) {
          const cost = region.spiritPowerCost;
          moveToNode(regionId, nodeId, cost);
        }
      },
      onPlayerHpChange: (hp, max) => { setPlayerHp(hp); setPlayerMaxHp(max); },
      onEnemyHpChange: (hp, max) => { setEnemyHp(hp); setEnemyMaxHp(max); },
      onLog: (msg) => { setLogMsg(msg); },
      onComboChange: (c) => { setCombo(c); },
      onStoryFlag: () => {},
    };
  }, [selectedRegion, levelIndex, adventure]);

  // 启动 Phaser 游戏
  const startGame = useCallback((region: AdventureRegion) => {
    // 清理旧游戏
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    setSelectedRegion(region);
    setPhase('playing');

    if (!gameContainerRef.current) return;

    const game = createAdventureGame(gameContainerRef.current, callbacks.current, {
      levelIndex,
      spiritPower: adventure.spiritPower,
      maxSpiritPower: adventure.maxSpiritPower,
      completedEvents: adventure.completedEvents,
      storyFlags: adventure.storyFlags,
      currentRegion: region.id,
    });
    gameRef.current = game;
  }, [levelIndex, adventure]);

  // 同步灵力到游戏
  useEffect(() => {
    if (gameRef.current) {
      updateSpiritPowerInGame(gameRef.current, adventure.spiritPower, adventure.maxSpiritPower);
    }
  }, [adventure.spiritPower, adventure.maxSpiritPower]);

  // 清理
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // 遭遇选择
  const handleChoice = (choiceId: string) => {
    const result = makeChoice(choiceId);
    // 显示结果后返回游戏
    setTimeout(() => {
      setActiveEvent(null);
      setPhase('playing');
    }, 2000);
  };

  // 区域选择界面
  if (phase === 'region-select') {
    return (
      <div className="space-y-2 px-1">
        <SpiritPowerBar />
        <h3 className="text-sm font-bold text-amber-300">🗺️ 选择界域</h3>
        {ADVENTURE_REGIONS.map((region, i) => {
          const locked = levelIndex < region.minLevelIndex;
          return (
            <motion.button
              key={region.id}
              className={`w-full text-left p-3 rounded-2xl border ${
                locked ? 'bg-slate-900/30 border-slate-800/20 opacity-40 cursor-not-allowed'
                  : 'bg-slate-800/40 border-slate-600/20 hover:border-amber-500/30 active:scale-[0.98]'
              }`}
              onClick={() => !locked && startGame(region)}
              disabled={locked}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{region.iconEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-200">{region.name}</div>
                  <div className="text-[10px] text-slate-500">{region.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-cyan-400">⚡{region.spiritPowerCost}/步</span>
                    {locked && <span className="text-[10px] text-red-400/50">🔒 修为不足</span>}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // 游戏界面
  return (
    <div className="relative">
      {/* 灵力条 */}
      <div className="absolute top-1 left-1 right-1 z-30 flex items-center gap-2">
        <SpiritPowerBar />
        <button
          className="text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm shrink-0"
          onClick={() => { setPhase('region-select'); if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; } }}
        >
          ← 换区域
        </button>
      </div>

      {/* Phaser 游戏画布 */}
      <div ref={gameContainerRef} className="w-full aspect-[9/12] rounded-2xl overflow-hidden border border-slate-700/30" />

      {/* 战斗HUD */}
      {isCombat && (
        <motion.div
          className="absolute top-8 left-2 right-2 z-30 space-y-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HpBar label={combatEnemy?.name || '敌人'} current={enemyHp} max={enemyMaxHp} color="#dc2626" />
          <HpBar label="你" current={playerHp} max={playerMaxHp} color="#059669" />
          {combo >= 2 && (
            <div className="text-center">
              <span className="text-xs text-amber-400 font-bold">🔥 {combo} 连击!</span>
            </div>
          )}
          {logMsg && <div className="text-[10px] text-slate-400 text-center">{logMsg}</div>}
        </motion.div>
      )}

      {/* 遭遇选择弹窗 */}
      <AnimatePresence>
        {phase === 'encounter' && activeEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm space-y-2.5 bg-slate-900/95 rounded-2xl p-5 border border-slate-700/40"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-lg font-bold text-amber-300 text-center">{activeEvent.title}</h2>
              <p className="text-xs text-slate-400 text-center">{activeEvent.narrative}</p>
              {activeEvent.choices.map((choice, i) => (
                <motion.button
                  key={choice.id}
                  className={`w-full text-left p-3 rounded-xl border bg-slate-800/60 active:scale-[0.97] ${
                    choice.risk === 'safe' ? 'border-emerald-700/30' :
                    choice.risk === 'risky' ? 'border-amber-700/30' : 'border-red-700/30'
                  }`}
                  onClick={() => handleChoice(choice.id)}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{choice.icon}</span>
                    <div>
                      <div className="text-sm text-slate-200">{choice.text}</div>
                      <span className={`text-[9px] ${choice.risk === 'safe' ? 'text-emerald-400' : choice.risk === 'risky' ? 'text-amber-400' : 'text-red-400'}`}>
                        {choice.risk === 'safe' ? '🟢' : choice.risk === 'risky' ? '🟡' : '🔴'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
              <button className="w-full py-2 text-xs text-slate-600" onClick={() => { setActiveEvent(null); setPhase('playing'); }}>
                离开
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// 小组件
// ============================================
function SpiritPowerBar() {
  const adventure = useStore(s => s.adventure);
  const pct = Math.min(100, (adventure.spiritPower / adventure.maxSpiritPower) * 100);
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded-xl border border-cyan-900/30 backdrop-blur-sm flex-1">
      <span className="text-[10px]">⚡</span>
      <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
      <span className="text-[9px] text-cyan-300 font-mono">{adventure.spiritPower}/{adventure.maxSpiritPower}</span>
    </div>
  );
}

function HpBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className="bg-black/40 rounded-lg p-1.5 backdrop-blur-sm">
      <div className="flex justify-between text-[9px] mb-0.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-mono">{Math.max(0, Math.round(current))}/{max}</span>
      </div>
      <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}
