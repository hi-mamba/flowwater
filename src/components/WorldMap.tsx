// src/components/WorldMap.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, ChevronDown, ChevronUp, Lock, X } from 'lucide-react';
import { useStore, CULTIVATION_LEVELS } from '../store';
import {
  REALMS, REALM_META, ALL_LOCATIONS, getLocationsByRealm,
  inferDefaultRealm, realmOfRegion,
  type RealmId, type WorldLocation,
} from '../data/worldMap';
import MortalRealmMap from './worldmap/MortalRealmMap';
import SpiritRealmMap from './worldmap/SpiritRealmMap';
import ImmortalRealmMap from './worldmap/ImmortalRealmMap';
import type { TimeOfDay } from './worldmap/types';

export default function WorldMap() {
  const { levelIndex, currentRegion, setCurrentRegion, startDungeon, dungeon } = useStore();

  const [expanded, setExpanded] = useState(false);
  const [activeRealm, setActiveRealm] = useState<RealmId>(() => inferDefaultRealm(levelIndex));
  const [selected, setSelected] = useState<WorldLocation | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  // 初次或修为变化时，未手动切过 Tab 则跟随境界
  const [tabUserChanged, setTabUserChanged] = useState(false);
  useEffect(() => {
    if (!tabUserChanged) {
      setActiveRealm(inferDefaultRealm(levelIndex));
    }
  }, [levelIndex, tabUserChanged]);

  // 时辰
  useEffect(() => {
    const hour = new Date().getHours();
    setTimeOfDay(hour < 6 ? 'night' : hour < 9 ? 'dawn' : hour < 18 ? 'day' : hour < 21 ? 'dusk' : 'night');
  }, []);

  const unlockedSet = useMemo(
    () => new Set(ALL_LOCATIONS.filter(l => levelIndex >= l.unlockLevelIndex).map(l => l.id)),
    [levelIndex]
  );

  const currentRealm = realmOfRegion(currentRegion);
  // 找当前所在地点（粗略匹配 regionStoreId 中第一个匹配的）
  const currentLocationId = useMemo(() => {
    const match = ALL_LOCATIONS.find(l => l.regionStoreId && l.regionStoreId === currentRegion);
    return match?.id;
  }, [currentRegion]);

  const realmMeta = REALM_META[activeRealm];
  const realmLocked = levelIndex < realmMeta.unlockLevelIndex;
  const inDungeon = dungeon.active;

  const subMapLocations = getLocationsByRealm(activeRealm);
  const showImmortalMist = activeRealm === 'immortal' && realmLocked;

  const handleTabClick = (realm: RealmId) => {
    const meta = REALM_META[realm];
    if (levelIndex < meta.unlockLevelIndex) {
      setToast(`${meta.name} 需 ${meta.unlockHintLevel} 方可窥探`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setActiveRealm(realm);
    setTabUserChanged(true);
  };

  const handleLocationClick = (loc: WorldLocation) => {
    if (inDungeon) {
      setToast('副本进行中，无法切换');
      setTimeout(() => setToast(null), 1800);
      return;
    }
    if (!unlockedSet.has(loc.id)) {
      const lvl = CULTIVATION_LEVELS[loc.unlockLevelIndex]?.name || '更高境界';
      setToast(`此地需 ${lvl} 方可前往`);
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setSelected(loc);
  };

  const confirmAction = () => {
    if (!selected) return;
    if (selected.type === 'dungeon' && selected.dungeonId) {
      const r = startDungeon(selected.dungeonId);
      setToast(r.message);
    } else if (selected.regionStoreId) {
      setCurrentRegion(selected.regionStoreId);
      setToast(`传送至 ${selected.name}`);
    } else {
      setToast(`${selected.name}：${selected.desc}`);
    }
    setTimeout(() => setToast(null), 2400);
    setSelected(null);
  };

  const currentLocationName = ALL_LOCATIONS.find(l => l.id === currentLocationId)?.name || currentRegion;

  return (
    <div className="relative z-10 w-full mb-4">
      {/* 折叠态：标题栏 */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl backdrop-blur-md transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MapIcon size={16} className="text-emerald-400" />
          <span className="text-sm font-medium text-slate-200">修仙地图</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">
            {REALM_META[currentRealm].name} · {currentLocationName}
          </span>
        </div>
        <span className="text-xs text-slate-400 flex items-center">
          {expanded ? <>收起 <ChevronUp size={14} className="ml-1" /></> : <>展开 <ChevronDown size={14} className="ml-1" /></>}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden mt-2"
          >
            <div className="rounded-3xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-md p-3">
              {/* Tab */}
              <div className="flex items-center space-x-2 mb-3">
                {REALMS.map(meta => {
                  const locked = levelIndex < meta.unlockLevelIndex;
                  const isActive = activeRealm === meta.id;
                  return (
                    <button
                      key={meta.id}
                      onClick={() => handleTabClick(meta.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all relative ${
                        isActive
                          ? 'bg-slate-800 text-white border-slate-500 shadow-inner'
                          : locked
                            ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800/70'
                      }`}
                      style={isActive ? { borderColor: meta.accentColor + '80' } : undefined}
                    >
                      <span className="flex items-center justify-center space-x-1.5">
                        {locked && <Lock size={11} />}
                        <span>{meta.name}</span>
                      </span>
                      {locked && (
                        <span className="absolute -top-1.5 -right-1 text-[9px] bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full px-1.5 py-0.5">
                          {meta.unlockHintLevel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 子地图 */}
              <div className="relative w-full h-[50vh] min-h-[320px] max-h-[450px] rounded-2xl overflow-hidden border border-slate-700/40">
                {activeRealm === 'mortal' && (
                  <MortalRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'mortal' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                  />
                )}
                {activeRealm === 'spirit' && (
                  <SpiritRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'spirit' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                  />
                )}
                {activeRealm === 'immortal' && (
                  <ImmortalRealmMap
                    locations={subMapLocations}
                    currentLocationId={currentRealm === 'immortal' ? currentLocationId : undefined}
                    unlockedLocationIds={unlockedSet}
                    onLocationClick={handleLocationClick}
                    timeOfDay={timeOfDay}
                    mistOverlay={showImmortalMist}
                  />
                )}

                {/* 副本进行中遮罩 */}
                {inDungeon && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-30">
                    <div className="text-center px-6">
                      <p className="text-amber-300 text-sm font-bold mb-1">副本进行中</p>
                      <p className="text-xs text-slate-400">退出副本后方可切换地点</p>
                    </div>
                  </div>
                )}

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-slate-800/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] border border-slate-600 shadow-lg whitespace-nowrap max-w-[80%] truncate"
                    >
                      {toast}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 底部信息条 */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-2">
                <span>当前境界：{CULTIVATION_LEVELS[levelIndex]?.name || '凡人'}</span>
                <span>共 {ALL_LOCATIONS.length} 处秘境 · 已解锁 {unlockedSet.size}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 地点详情弹窗 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800/95 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-200">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-2">{selected.desc}</p>
              {selected.loreSnippet && (
                <p className="text-xs text-amber-300/80 italic mb-3 border-l-2 border-amber-500/40 pl-3">
                  {selected.loreSnippet}
                </p>
              )}
              <div className="text-[10px] text-slate-500 mb-4">
                解锁境界：{CULTIVATION_LEVELS[selected.unlockLevelIndex]?.name}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors"
                >
                  关闭
                </button>
                {(selected.type === 'dungeon' || selected.regionStoreId) && !inDungeon && (
                  <button
                    onClick={confirmAction}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg hover:from-amber-400 hover:to-orange-400 transition-colors"
                  >
                    {selected.type === 'dungeon' ? '进入副本' : '前往此地'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
