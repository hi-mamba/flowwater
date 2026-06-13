import { useState, useEffect, useCallback } from 'react';
import { useStore, DUNGEONS, CULTIVATION_LEVELS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Heart, Coins, Gift, AlertTriangle, ChevronUp, DoorOpen, Skull, CheckCircle } from 'lucide-react';

export default function InstanceDungeon() {
  const { dungeon, levelIndex, startDungeon, exploreDungeon, advanceFloor, endDungeon, spiritStones } = useStore();
  const [selectedDungeon, setSelectedDungeon] = useState<string | null>(null);
  const [eventAnim, setEventAnim] = useState<string | null>(null);
  const [eventMsg, setEventMsg] = useState<string>('');
  const [shaking, setShaking] = useState(false);

  const currentDungeon = dungeon.location ? DUNGEONS.find(d => d.id === dungeon.location) : null;

  const triggerEvent = useCallback((msg: string, evt?: string) => {
    setEventMsg(msg);
    setEventAnim(evt || 'explore');
    setShaking(true);
    setTimeout(() => { setEventAnim(null); setShaking(false); }, 1200);
  }, []);

  const handleExplore = () => {
    const r = exploreDungeon('fight');
    triggerEvent(r.message, r.event);
    if (dungeon.hp <= 0) setTimeout(() => endDungeon(), 2000);
  };

  const handleAdvance = () => {
    const r = advanceFloor();
    triggerEvent(r.message, 'advance');
  };

  const handleEnd = () => {
    endDungeon();
    setSelectedDungeon(null);
    setEventAnim(null);
  };

  // Selection screen
  if (!dungeon.active) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <DoorOpen size={16} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-bold text-rose-300">秘境探索</h3>
          {dungeon.bestFloor > 1 && (
            <span className="text-[10px] text-rose-400/50">最佳：第 {dungeon.bestFloor} 层</span>
          )}
        </div>

        <div className="space-y-2">
          {DUNGEONS.map((d, i) => {
            const unlocked = levelIndex >= d.minLevel;
            return (
              <motion.button
                key={d.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  if (!unlocked) return;
                  const r = startDungeon(d.id);
                  if (!r.success) triggerEvent(r.message);
                }}
                disabled={!unlocked}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left ${
                  unlocked
                    ? 'bg-slate-800/50 border-slate-700/50 hover:border-rose-500/30 hover:bg-slate-800/80'
                    : 'bg-slate-800/20 border-slate-700/20 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  unlocked ? 'bg-rose-500/20' : 'bg-slate-700/30'
                }`}>
                  <DoorOpen size={18} className={unlocked ? 'text-rose-400' : 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.desc}</div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[10px] text-rose-400/60">{d.floors} 层</span>
                    <span className="text-[10px] text-slate-500">
                      BOSS: {d.boss}
                    </span>
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

  // Active dungeon
  const hpPercent = (dungeon.hp / dungeon.maxHp) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gradient-to-br from-rose-950/80 to-slate-950/90 backdrop-blur-md border border-rose-500/20 rounded-3xl p-5 overflow-hidden"
      >
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-rose-400/30 rounded-full"
              animate={{
                y: ['100%', '-10%'],
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                opacity: [0, 0.8, 0],
              }}
              transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Swords size={16} className="text-rose-400" />
              <span className="text-sm font-bold text-rose-300">{currentDungeon?.name}</span>
            </div>
            <span className="text-[10px] text-rose-400/50">第 {dungeon.floor}/{dungeon.maxFloor} 层</span>
          </div>
          <button onClick={handleEnd} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-700/50">
            退出
          </button>
        </div>

        {/* HP bar */}
        <div className="relative mb-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span className="flex items-center"><Heart size={10} className="mr-1 text-red-400" /> HP</span>
            <span>{dungeon.hp}/{dungeon.maxHp}</span>
          </div>
          <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden border border-red-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
              animate={{ width: `${hpPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 relative">
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <div className="text-[10px] text-slate-500">攻击</div>
            <div className="text-sm font-bold text-amber-400">{dungeon.attack}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <div className="text-[10px] text-slate-500">金币</div>
            <div className="text-sm font-bold text-yellow-400">{dungeon.goldEarned}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2 text-center">
            <div className="text-[10px] text-slate-500">物品</div>
            <div className="text-sm font-bold text-purple-400">{dungeon.itemsFound.length}</div>
          </div>
        </div>

        {/* Event animation */}
        <AnimatePresence>
          {eventAnim && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`mb-4 p-3 rounded-xl text-center text-xs font-medium ${
                eventAnim === 'monster' || eventAnim === 'boss_hit' ? 'bg-red-500/10 text-red-300 border border-red-500/30' :
                eventAnim === 'treasure' ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30' :
                eventAnim === 'trap' ? 'bg-orange-500/10 text-orange-300 border border-orange-500/30' :
                eventAnim === 'rest' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' :
                'bg-slate-500/10 text-slate-300 border border-slate-500/30'
              }`}
            >
              {eventAnim === 'monster' && '⚔️ '}
              {eventAnim === 'treasure' && '📦 '}
              {eventAnim === 'trap' && '⚠️ '}
              {eventAnim === 'rest' && '💚 '}
              {eventAnim === 'advance' && '⬆️ '}
              {eventAnim === 'boss_win' && '🏆 '}
              {eventAnim === 'boss_hit' && '💥 '}
              {eventMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boss icon on boss floor */}
        {dungeon.floor === dungeon.maxFloor && !dungeon.bossDefeated && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center space-x-3 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <Skull size={24} className="text-red-400" />
            <div>
              <div className="text-sm font-bold text-red-300">BOSS: {currentDungeon?.boss}</div>
              <div className="text-[10px] text-red-400/60">击败 BOSS 即可通关</div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExplore}
            disabled={dungeon.hp <= 0}
            className="flex-1 py-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold hover:bg-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ⚔️ 探索
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdvance}
            disabled={dungeon.hp <= 0 || (dungeon.floor === dungeon.maxFloor && !dungeon.bossDefeated)}
            className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronUp size={18} />
          </motion.button>
        </div>

        {/* Cleared overlay */}
        {dungeon.cleared && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4"
            >
              <CheckCircle size={40} className="text-amber-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-amber-300 mb-2">副本通关！</h3>
            <p className="text-sm text-slate-400 mb-4">获得 {dungeon.goldEarned}💎 + {dungeon.itemsFound.length} 件物品</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnd}
              className="px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
            >
              离开副本
            </motion.button>
          </motion.div>
        )}

        {/* Death overlay */}
        {dungeon.hp <= 0 && !dungeon.cleared && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/95 rounded-3xl flex flex-col items-center justify-center"
          >
            <Skull size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-red-400 mb-2">力竭而退</h3>
            <p className="text-sm text-slate-400 mb-4">达到第 {dungeon.floor} 层，获得 {dungeon.goldEarned}💎</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnd}
              className="px-6 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white font-bold"
            >
              返回洞府
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
