import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplets, Flame, Package, Clock, Sparkles, Gem, X, Beaker, Swords } from 'lucide-react';
import SectLeaderboard from '../components/SectLeaderboard';

export default function CavePage() {
  const { cave, materials, collectSpring, plantHerb, harvestHerb, spiritStones, startAlchemy, collectPill, speedUpAlchemy, inventory, heavenlyBottleDrops, useHeavenlyBottle, artifacts, sect } = useStore();
  const [showInventory, setShowInventory] = useState(false);
  const [showAlchemy, setShowAlchemy] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hoursPassed = (currentTime - cave.lastSpringCollect) / (1000 * 60 * 60);
  const springAmount = Math.floor(Math.min(24, cave.springQi + hoursPassed));

  return (
    <div className="flex flex-col min-h-full bg-slate-900 p-6 relative overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-emerald-400">洞府</h1>
        <div className="flex space-x-3">
          <div className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
            <Gem size={14} className="mr-1.5" /> {spiritStones || 0}
          </div>
          <button onClick={() => setShowInventory(true)} className="p-2 bg-slate-800 rounded-full border border-slate-700 text-slate-300">
            <Package size={20} />
          </button>
        </div>
      </div>

      {/* Spirit Spring */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Droplets size={120} />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-lg font-bold text-sky-300 flex items-center mb-1">
              <Droplets size={18} className="mr-2" /> 聚灵泉
            </h2>
            <p className="text-xs text-slate-400">每日自动凝聚天地灵气</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sky-400">{springAmount} <span className="text-sm text-slate-500">滴</span></div>
            <div className="text-[10px] text-slate-500">上限 24 滴</div>
          </div>
        </div>
        
        <button 
          onClick={collectSpring}
          disabled={springAmount === 0}
          className={`w-full mt-6 py-3 rounded-xl font-medium flex items-center justify-center transition-colors ${springAmount > 0 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
        >
          <Sparkles size={16} className="mr-2" /> 采集灵气
        </button>
      </div>

      {/* Heavenly Bottle */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Beaker size={120} className="text-emerald-500" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-lg font-bold text-emerald-400 flex items-center mb-1">
              <Beaker size={18} className="mr-2" /> 掌天瓶
            </h2>
            <p className="text-xs text-slate-400">夺天地造化，催熟灵草</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">{heavenlyBottleDrops} <span className="text-sm text-slate-500">滴</span></div>
            <div className="text-[10px] text-slate-500">绿液</div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={() => useHeavenlyBottle('accelerate')}
            disabled={heavenlyBottleDrops === 0 || !cave.herbs.some(h => h.stage !== 'mature')}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center transition-colors ${heavenlyBottleDrops > 0 && cave.herbs.some(h => h.stage !== 'mature') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
          >
            <Clock size={16} className="mr-2" /> 催熟灵草
          </button>
          <button 
            onClick={() => useHeavenlyBottle('duplicate')}
            disabled={heavenlyBottleDrops === 0 || cave.herbs.length === 0 || cave.herbs.length >= 4}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center transition-colors ${heavenlyBottleDrops > 0 && cave.herbs.length > 0 && cave.herbs.length < 4 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
          >
            <Sparkles size={16} className="mr-2" /> 复制灵草
          </button>
        </div>
      </div>

      {/* Herb Garden */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-emerald-300 flex items-center">
            <Sprout size={18} className="mr-2" /> 灵药园
          </h2>
          <span className="text-xs text-slate-400">喝水自动浇灌</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {cave.herbs.map((herb, index) => (
            <div key={herb.id} className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50 flex flex-col items-center relative">
              <div className="text-xs text-slate-400 absolute top-2 left-2">
                {herb.type === 'rare_herb' || herb.type === 'rare' ? '珍稀' : 
                 herb.type === 'millennium_lingzhi' ? '千年' : 
                 herb.type === 'jiuzhuan_grass' ? '九转' : '普通'}
              </div>
              
              <div className="h-16 flex items-end justify-center mb-3">
                {herb.stage === 'seed' && <div className="w-4 h-4 bg-amber-700/50 rounded-full border border-amber-600/50"></div>}
                {herb.stage === 'sprout' && <Sprout size={32} className="text-emerald-500" />}
                {herb.stage === 'mature' && <Sprout size={48} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
              </div>
              
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (herb.growth / (herb.maxGrowth || 1000)) * 100)}%` }}></div>
              </div>
              
              {herb.stage === 'mature' ? (
                <button 
                  onClick={() => harvestHerb(herb.id)}
                  className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  收获
                </button>
              ) : (
                <div className="text-[10px] text-slate-500">成长值: {Math.floor(herb.growth)}/{herb.maxGrowth || 1000}</div>
              )}
            </div>
          ))}
          
          {cave.herbs.length < 4 && (
            <button 
              onClick={() => setShowPlantModal(true)}
              className="bg-slate-800/30 rounded-2xl p-4 border border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors min-h-[140px]"
            >
              <Sprout size={24} className="mb-2" />
              <span className="text-xs">播种灵草</span>
            </button>
          )}
        </div>
      </div>

      {/* Plant Modal */}
      <AnimatePresence>
        {showPlantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-xl font-bold text-emerald-400 flex items-center">
                  <Sprout className="mr-2" size={24} /> 播种灵草
                </h2>
                <button onClick={() => setShowPlantModal(false)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'common_herb', name: '普通灵草', time: '1000成长值', desc: '最基础的灵草，容易存活。' },
                    { id: 'rare_herb', name: '珍稀灵草', time: '3000成长值', desc: '较为罕见的灵草，需要更多灵气。' },
                    { id: 'millennium_lingzhi', name: '千年灵芝', time: '10000成长值', desc: '极其罕见的天材地宝，生长极其缓慢。' },
                    { id: 'jiuzhuan_grass', name: '九转玄草', time: '50000成长值', desc: '传说中的仙草，需海量灵气灌溉。' }
                  ].map(seed => (
                    <div key={seed.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-emerald-300">{seed.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{seed.desc}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center">
                          <Clock size={10} className="mr-1" /> {seed.time}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          plantHerb(seed.id);
                          setShowPlantModal(false);
                        }}
                        className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors whitespace-nowrap ml-4"
                      >
                        播种
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alchemy Furnace */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-amber-500 flex items-center">
            <Flame size={18} className="mr-2" /> 炼丹炉
          </h2>
          {cave.furnace.active ? (
            <span className="text-xs text-amber-400 animate-pulse">炼制中...</span>
          ) : (
            <button onClick={() => setShowAlchemy(true)} className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
              开炉炼丹
            </button>
          )}
        </div>
        
        {cave.furnace.active ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Flame size={48} className="mb-4 text-amber-500 animate-bounce" />
            
            {Date.now() >= (cave.furnace.endTime || 0) ? (
              <button 
                onClick={collectPill}
                className="bg-amber-500 text-slate-900 font-bold px-6 py-2 rounded-xl"
              >
                收取丹药
              </button>
            ) : (
              <div className="w-full text-center">
                <div className="text-sm text-slate-300 mb-2">
                  剩余时间: {Math.ceil(((cave.furnace.endTime || 0) - Date.now()) / 60000)} 分钟
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-amber-500" style={{ width: `${100 - (((cave.furnace.endTime || 0) - Date.now()) / ((cave.furnace.endTime || 0) - (cave.furnace.startTime || 0))) * 100}%` }}></div>
                </div>
                <button 
                  onClick={speedUpAlchemy}
                  className="text-xs flex items-center justify-center w-full py-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-400 hover:text-amber-400"
                >
                  <Gem size={12} className="mr-1" /> 消耗 20 灵石立即完成
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Flame size={48} className="mb-4 opacity-20" />
            <p className="text-sm">炉火已熄，等待炼丹</p>
          </div>
        )}
      </div>

      {/* Crafting Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-300 flex items-center">
            <Swords size={18} className="mr-2" /> 炼器台
          </h2>
          <button onClick={() => setShowCrafting(true)} className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full border border-slate-600">
            开炉炼器
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <Swords size={48} className="mb-4 opacity-20" />
          <p className="text-sm">收集玄铁精等材料，打造绝世神兵</p>
        </div>
      </div>

      {/* Sect Leaderboard */}
      {sect && (
        <div className="mb-6">
          <SectLeaderboard sectName={sect} />
        </div>
      )}

      {/* Alchemy Modal */}
      <AnimatePresence>
        {showAlchemy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Flame size={18} className="mr-2 text-amber-500" /> 选择丹方
                </h2>
                <button onClick={() => setShowAlchemy(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                {/* Juqi San */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-amber-400 font-bold">聚气散</h3>
                      <p className="text-[10px] text-slate-400 mt-1">2小时内喝水修为+50%</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">耗时: 4小时</div>
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 10</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 普通灵草 x2 (拥有: {materials['common_herb'] || 0})
                    </div>
                    <button 
                      onClick={() => { startAlchemy('juqi'); setShowAlchemy(false); }}
                      disabled={(materials['common_herb'] || 0) < 2 || spiritStones < 10}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30 disabled:opacity-50"
                    >
                      炼制
                    </button>
                  </div>
                </div>

                {/* Humai Dan */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-amber-400 font-bold">护脉丹</h3>
                      <p className="text-[10px] text-slate-400 mt-1">抵消一次断签惩罚</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">耗时: 8小时</div>
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 50</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 珍稀x1, 普通x2
                    </div>
                    <button 
                      onClick={() => { startAlchemy('humai'); setShowAlchemy(false); }}
                      disabled={(materials['rare_herb'] || 0) < 1 || (materials['common_herb'] || 0) < 2 || spiritStones < 50}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30 disabled:opacity-50"
                    >
                      炼制
                    </button>
                  </div>
                </div>

                {/* Qingxin Wan */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-amber-400 font-bold">清心丸</h3>
                      <p className="text-[10px] text-slate-400 mt-1">接下来3次提醒静音</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">耗时: 2小时</div>
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 20</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 普通灵草 x3 (拥有: {materials['common_herb'] || 0})
                    </div>
                    <button 
                      onClick={() => { startAlchemy('qingxin'); setShowAlchemy(false); }}
                      disabled={(materials['common_herb'] || 0) < 3 || spiritStones < 20}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30 disabled:opacity-50"
                    >
                      炼制
                    </button>
                  </div>
                </div>

                {/* Millennium Pill */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-amber-400 font-bold">千年灵丹</h3>
                      <p className="text-[10px] text-slate-400 mt-1">大幅增加修为，突破瓶颈</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">耗时: 12小时</div>
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 200</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 千年灵芝x1, 珍稀x2
                    </div>
                    <button 
                      onClick={() => { startAlchemy('millennium'); setShowAlchemy(false); }}
                      disabled={(materials['millennium_lingzhi'] || 0) < 1 || (materials['rare_herb'] || 0) < 2 || spiritStones < 200}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30 disabled:opacity-50"
                    >
                      炼制
                    </button>
                  </div>
                </div>

                {/* Jiuzhuan Pill */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-amber-400 font-bold">九转金丹</h3>
                      <p className="text-[10px] text-slate-400 mt-1">生死人肉白骨，起死回生</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-300">耗时: 24小时</div>
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 500</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 九转玄草x1, 千年灵芝x1
                    </div>
                    <button 
                      onClick={() => { startAlchemy('jiuzhuan'); setShowAlchemy(false); }}
                      disabled={(materials['jiuzhuan_grass'] || 0) < 1 || (materials['millennium_lingzhi'] || 0) < 1 || spiritStones < 500}
                      className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-lg border border-amber-500/30 disabled:opacity-50"
                    >
                      炼制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crafting Modal */}
      <AnimatePresence>
        {showCrafting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Swords size={18} className="mr-2 text-slate-300" /> 炼制法宝
                </h2>
                <button onClick={() => setShowCrafting(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                {/* Ancient Sword */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-slate-300 font-bold">上古残剑</h3>
                      <p className="text-[10px] text-slate-400 mt-1">秘境历练灵石收益 +20%</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-cyan-400 flex items-center justify-end mt-1"><Gem size={10} className="mr-1"/> 1000</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-slate-400">
                      需: 玄铁精x5 (拥有: {materials['profound_iron'] || 0})
                    </div>
                    <button 
                      onClick={() => {
                        if (spiritStones >= 1000 && (materials['profound_iron'] || 0) >= 5) {
                          useStore.getState().addSpiritStones(-1000);
                          useStore.getState().addMaterial('profound_iron', -5);
                          useStore.getState().obtainArtifact('ancient_sword');
                          setShowCrafting(false);
                        }
                      }}
                      disabled={(materials['profound_iron'] || 0) < 5 || spiritStones < 1000 || artifacts.includes('ancient_sword')}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg border border-slate-600 disabled:opacity-50"
                    >
                      {artifacts.includes('ancient_sword') ? '已拥有' : '炼制'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Package size={18} className="mr-2 text-slate-400" /> 储物袋
                </h2>
                <button onClick={() => setShowInventory(false)} className="text-slate-400"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">材料</div>
                {Object.entries(materials).length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-xs">暂无材料</div>
                ) : (
                  Object.entries(materials).map(([id, amount]) => (
                    <div key={id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <span className="text-sm text-slate-300">
                        {id === 'common_herb' ? '普通灵草' : id === 'rare_herb' ? '珍稀灵草' : id}
                      </span>
                      <span className="text-sm font-mono text-slate-400">x{amount}</span>
                    </div>
                  ))
                )}
                
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">丹药 & 道具</div>
                {Object.keys(materials).filter(id => id.includes('pill')).length === 0 ? (
                  <div className="text-center py-4 text-slate-600 text-xs">暂无丹药</div>
                ) : (
                  Object.entries(materials)
                    .filter(([id, amount]) => id.includes('pill') && amount > 0)
                    .map(([id, amount]) => (
                    <div key={id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <span className="text-sm text-amber-300">
                        {id === 'pill_1' ? '黄龙丹' : id === 'pill_foundation' ? '筑基丹' : id === 'pill_golden_core' ? '降尘丹' : id === 'pill_nascent_soul' ? '定灵丹' : id === 'zhuyan_pill' ? '驻颜丹' : id === 'juqi_pill' ? '聚气散' : id === 'humai_pill' ? '护脉丹' : id === 'qingxin_pill' ? '清心丹' : id === 'millennium_pill' ? '千年灵丹' : id === 'jiuzhuan_pill' ? '九转金丹' : id}
                      </span>
                      <span className="text-sm font-mono text-slate-400">x{amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
