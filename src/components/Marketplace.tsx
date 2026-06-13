import { useState, useEffect, useMemo } from 'react';
import { useStore, SHOP_ITEMS, CULTIVATION_LEVELS, REGIONS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Gem, Package, Flame, Sparkles, Star, Coffee, Droplets, Scroll, Shield, Swords, Clock, Tag, RefreshCw } from 'lucide-react';

// 大千世界坊市商品分类
const MARKET_CATEGORIES = [
  { id: 'all', name: '全部', icon: Store, color: 'text-amber-300' },
  { id: 'pill', name: '丹药', icon: Flame, color: 'text-red-300' },
  { id: 'material', name: '灵材', icon: Package, color: 'text-emerald-300' },
  { id: 'skill', name: '功法', icon: Scroll, color: 'text-purple-300' },
  { id: 'artifact', name: '法宝', icon: Shield, color: 'text-cyan-300' },
  { id: 'special', name: '奇珍', icon: Sparkles, color: 'text-yellow-300' },
];

// Extended marketplace items from across the cultivation world
const MARKET_ITEMS = [
  ...SHOP_ITEMS.map(item => ({ ...item, category: item.type === 'consumable' || item.type === 'breakthrough' ? 'pill' : item.type === 'material' ? 'material' : item.type === 'skill' ? 'skill' : item.type === 'passive' ? 'artifact' : 'special' as string })),
  // 乱星海特产
  { id: 'starfish_pearl', name: '星海明珠', type: 'material', effect: 0, cost: 800, desc: '乱星海深海所产，蕴含精纯水灵气', region: '乱星海', category: 'material' },
  { id: 'monster_core', name: '妖兽内丹', type: 'material', effect: 0, cost: 500, desc: '五级以上妖兽体内凝结，炼丹佳品', region: '乱星海', category: 'material' },
  // 阴冥之地特产
  { id: 'soul_wood', name: '养魂木', type: 'material', effect: 0, cost: 1200, desc: '阴冥之地独有，可稳固神魂', region: '阴冥之地', category: 'material' },
  { id: 'ghost_pearl', name: '鬼灵珠', type: 'consumable', effect: 2000, cost: 1500, desc: '阴气凝结之珠，服用增加 2000 修为', region: '阴冥之地', category: 'pill' },
  // 灵界特产
  { id: 'spirit_marrow', name: '仙灵髓', type: 'consumable', effect: 10000, cost: 8000, desc: '灵界仙脉所产，服用修为暴涨', region: '灵界', category: 'special' },
  { id: 'dao_essence', name: '道韵碎片', type: 'passive', effect: 2.5, cost: 50000, desc: '蕴含大道法则，永久提升 150% 饮水修为', region: '灵界', category: 'artifact' },
  // 稀有丹药
  { id: 'tribulation_pill', name: '渡劫丹', type: 'consumable', effect: 0, cost: 3000, desc: '天劫中服用，+20% 存活率（一次性）', region: 'all', category: 'special' },
  { id: 'lifespan_pill', name: '延寿丹', type: 'consumable', effect: 0, cost: 5000, desc: '延长 50 年寿元', region: 'all', category: 'special' },
  { id: 'enlightenment_tea', name: '悟道茶', type: 'consumable', effect: 5000, cost: 2000, desc: '饮下可顿悟，修为 +5000', region: 'all', category: 'pill' },
  // 稀有法宝
  { id: 'thunder_orb', name: '雷灵珠', type: 'passive', effect: 1.5, cost: 15000, desc: '天劫存活率 +10%', region: '灵界', category: 'artifact' },
  { id: 'ice_heart', name: '冰心玉佩', type: 'passive', effect: 1.3, cost: 8000, desc: '突破成功率 +8%', region: '阴冥之地', category: 'artifact' },
];

export default function Marketplace() {
  const { spiritStones, buyItem, sellItem, materials, inventory, currentRegion, levelIndex } = useStore();
  const [activeCat, setActiveCat] = useState('all');
  const [showSell, setShowSell] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [haggleTarget, setHaggleTarget] = useState<string | null>(null);
  const [hagglePrice, setHagglePrice] = useState(0);
  const [dailyRefresh, setDailyRefresh] = useState(Date.now());

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Rotating daily specials
  const dailySpecials = useMemo(() => {
    const seed = Math.floor(dailyRefresh / (24 * 60 * 60 * 1000));
    const shuffled = [...MARKET_ITEMS].sort(() => (seed * 7 + 3) % 13 - 6);
    return shuffled.slice(0, 4).map(item => ({ ...item, cost: Math.floor(item.cost * 0.7), isSpecial: true } as any));
  }, [dailyRefresh]);

  const availableItems = useMemo(() => {
    return MARKET_ITEMS.filter(item => {
      if (item.region && item.region !== 'all' && item.region !== currentRegion) return false;
      if (activeCat !== 'all' && item.category !== activeCat) return false;
      if (inventory.includes(item.id)) return false; // Already owned passive/skill
      return true;
    });
  }, [activeCat, currentRegion, inventory]);

  const handleBuy = (item: typeof MARKET_ITEMS[0]) => {
    const price = (item as any).isSpecial ? item.cost : item.cost;
    const success = buyItem(item.id, price, item.type === 'consumable', item.effect);
    if (success) {
      showToast(`购入 ${item.name}！`);
    } else {
      showToast('灵石不足或已拥有');
    }
  };

  const handleHaggle = (item: typeof MARKET_ITEMS[0]) => {
    const discountedPrice = Math.floor(item.cost * (0.5 + Math.random() * 0.3));
    setHaggleTarget(item.id);
    setHagglePrice(discountedPrice);
  };

  const confirmHaggle = () => {
    if (!haggleTarget) return;
    const item = MARKET_ITEMS.find(i => i.id === haggleTarget);
    if (!item) return;
    const success = buyItem(item.id, hagglePrice, item.type === 'consumable', item.effect);
    if (success) {
      showToast(`砍价成功！${hagglePrice}💎 购入 ${item.name}`);
    } else {
      showToast('灵石不足');
    }
    setHaggleTarget(null);
  };

  const myMaterials = Object.entries(materials).filter(([_, v]) => v > 0);
  const myInventory = inventory.filter(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    return item?.type === 'skill' || item?.type === 'passive' || item?.type === 'consumable';
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-amber-950/40 to-orange-950/40 backdrop-blur-md border border-amber-500/20 rounded-3xl overflow-hidden">

      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Store size={20} className="text-amber-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-bold text-amber-300">大千世界坊市</h3>
              <p className="text-[10px] text-amber-400/50">{currentRegion} · 灵石 {spiritStones}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => { setShowSell(!showSell); showToast(showSell ? '返回购买' : '出售模式'); }}
              className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${
                showSell ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 border-slate-600 text-slate-400'
              }`}>
              {showSell ? '出售中' : '我要出售'}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setDailyRefresh(Date.now())}
              className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400">
              <RefreshCw size={14} />
            </motion.button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex space-x-1 mb-4 overflow-x-auto scrollbar-hide">
          {MARKET_CATEGORIES.map(cat => (
            <motion.button key={cat.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCat === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600'
              }`}>
              <cat.icon size={12} className={activeCat === cat.id ? cat.color : 'text-slate-500'} />
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Daily specials banner */}
      <div className="mx-5 mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Star size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-300">今日特价</span>
          <span className="text-[10px] text-amber-400/50">7 折优惠</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {dailySpecials.map(item => (
            <motion.button key={item.id + '_special'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleBuy(item)}
              className="flex items-center space-x-2 p-2 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-all">
              <div className="text-[10px] font-medium text-amber-200 flex-1 truncate">{item.name}</div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] text-slate-500 line-through">{item.cost}</span>
                <span className="text-xs font-bold text-amber-400">{item.cost}💎</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div className="px-5 pb-5 space-y-1.5 max-h-[400px] overflow-y-auto">
        {showSell ? (
          // Sell mode
          <>
            <div className="text-[10px] text-slate-500 mb-2">选择要出售的物品（点击出售）</div>
            {myMaterials.length === 0 && myInventory.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">暂无物品可出售</p>
            )}
            {myMaterials.map(([id, amount]) => {
              const info = SHOP_ITEMS.find(i => i.id === id);
              return (
                <motion.button key={id} whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const price = (info?.cost || 20) / 2;
                    const success = sellItem(id, 'material', 1, price);
                    showToast(success ? `出售 ${info?.name || id} +${price}💎` : '出售失败');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-emerald-500/20 transition-all">
                  <span className="text-xs text-slate-300">{info?.name || id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500">x{amount}</span>
                    <span className="text-[10px] text-emerald-400">+{Math.floor((info?.cost || 20) / 2)}💎</span>
                  </div>
                </motion.button>
              );
            })}
            {myInventory.map(id => {
              const info = SHOP_ITEMS.find(i => i.id === id);
              return (
                <motion.button key={id} whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const price = Math.floor((info?.cost || 100) / 2);
                    const success = sellItem(id, 'inventory', 1, price);
                    showToast(success ? `出售 ${info?.name || id} +${price}💎` : '出售失败');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-emerald-500/20 transition-all">
                  <span className="text-xs text-slate-300">{info?.name || id}</span>
                  <span className="text-[10px] text-emerald-400">+{Math.floor((info?.cost || 100) / 2)}💎</span>
                </motion.button>
              );
            })}
          </>
        ) : (
          // Buy mode
          availableItems.slice(0, 30).map((item, i) => (
            <motion.div key={item.id + ((item as any).isSpecial ? '_s' : '')} initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:border-amber-500/20 transition-all group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.category === 'pill' ? 'bg-red-500/10' :
                item.category === 'material' ? 'bg-emerald-500/10' :
                item.category === 'skill' ? 'bg-purple-500/10' :
                item.category === 'artifact' ? 'bg-cyan-500/10' :
                'bg-amber-500/10'
              }`}>
                {item.category === 'pill' ? <Flame size={16} className="text-red-400" /> :
                 item.category === 'material' ? <Package size={16} className="text-emerald-400" /> :
                 item.category === 'skill' ? <Scroll size={16} className="text-purple-400" /> :
                 item.category === 'artifact' ? <Shield size={16} className="text-cyan-400" /> :
                 <Sparkles size={16} className="text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-medium text-white">{item.name}</span>
                  {item.region && item.region !== 'all' && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{item.region}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button onClick={() => handleBuy(item)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/20 whitespace-nowrap">
                  {item.cost}💎
                </button>
                <button onClick={() => handleHaggle(item)}
                  className="text-[10px] px-1.5 py-1 rounded-lg bg-slate-700/50 text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all">
                  砍价
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Haggle modal */}
      <AnimatePresence>
        {haggleTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl"
            onClick={() => setHaggleTarget(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-56 text-center"
              onClick={e => e.stopPropagation()}>
              <Tag size={20} className="text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 mb-1">砍价结果</p>
              <p className="text-lg font-bold text-amber-300 mb-3">{hagglePrice} 💎</p>
              <div className="flex space-x-2">
                <button onClick={confirmHaggle}
                  className="flex-1 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">确认</button>
                <button onClick={() => setHaggleTarget(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-400 text-xs">取消</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
