import { useState } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Hammer, Swords, Shield, Zap, Sparkles, Wrench } from 'lucide-react';
import { ALL_HERBS } from '../data/craftingData';

const MAT_NAME = (id: string) =>
  id === 'spiritStones' ? '灵石' : (ALL_HERBS.find(h => h.id === id)?.name || id);

const PUPPET_TYPES = [
  { id: 'wooden', name: '木傀儡', tier: 1, desc: '以灵木炼制的基础傀儡，可执行简单任务', cost: { common_herb: 3, spiritStones: 100 }, power: 10, icon: Bot },
  { id: 'iron', name: '铁甲傀儡', tier: 2, desc: '以玄铁精炼制，防御力惊人', cost: { profound_iron: 2, spiritStones: 500 }, power: 30, icon: Shield },
  { id: 'beast', name: '兽形傀儡', tier: 3, desc: '模仿妖兽形态，攻击力强大', cost: { monster_bone: 3, monster_fur: 2, spiritStones: 1000 }, power: 60, icon: Swords },
  { id: 'spirit', name: '灵傀', tier: 4, desc: '注入灵智的高级傀儡，可自主战斗', cost: { millennium_lingzhi: 1, spiritStones: 3000 }, power: 120, icon: Sparkles },
  { id: 'divine', name: '神傀', tier: 5, desc: '大衍诀第七层方可炼制，威力接近元婴修士', cost: { jiuzhuan_grass: 1, spiritStones: 10000 }, power: 300, icon: Zap },
];

export interface Puppet {
  id: string;
  type: string;
  name: string;
  tier: number;
  level: number;
  power: number;
  durability: number;
  maxDurability: number;
  deployed: boolean;
}

export default function PuppetMaster() {
  const { divineSense, materials, spiritStones, addSpiritStones, addMaterial } = useStore();
  const [puppets, setPuppets] = useState<Puppet[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [crafting, setCrafting] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const canCraft = divineSense.level >= 2;
  const maxPuppets = divineSense.maxSplit;

  const craft = (typeId: string) => {
    const def = PUPPET_TYPES.find(p => p.id === typeId);
    if (!def) return;
    if (puppets.length >= maxPuppets) { showToast(`神识不足以操控更多傀儡（${maxPuppets}）`); return; }

    for (const [mat, amt] of Object.entries(def.cost)) {
      if (mat === 'spiritStones') continue;
      const have = materials[mat] || 0;
      if (have < amt) { showToast(`材料不足：${MAT_NAME(mat)} ${have}/${amt}`); return; }
    }
    if (spiritStones < def.cost.spiritStones) { showToast(`灵石不足 ${spiritStones}/${def.cost.spiritStones}`); return; }

    setCrafting(typeId);
    const newPuppet: Puppet = {
      id: `${typeId}_${Date.now()}`,
      type: typeId,
      name: def.name,
      tier: def.tier,
      level: 1,
      power: def.power,
      durability: 100,
      maxDurability: 100,
      deployed: false,
    };

    for (const [mat, amt] of Object.entries(def.cost)) {
      if (mat === 'spiritStones') continue;
      addMaterial(mat, -amt);
    }
    addSpiritStones(-def.cost.spiritStones);

    setTimeout(() => {
      setPuppets(prev => [...prev, newPuppet]);
      setCrafting(null);
      showToast(`炼制成功：${def.name}！`);
    }, 1500);
  };

  const deploy = (puppetId: string) => {
    setPuppets(prev => prev.map(p =>
      p.id === puppetId ? { ...p, deployed: !p.deployed } : p
    ));
  };

  const repair = (puppetId: string) => {
    if (spiritStones < 50) { showToast('需要 50 灵石'); return; }
    addSpiritStones(-50);
    setPuppets(prev => prev.map(p =>
      p.id === puppetId ? { ...p, durability: p.maxDurability } : p
    ));
    showToast('傀儡已修复');
  };

  const deployedPower = puppets.filter(p => p.deployed).reduce((s, p) => s + p.power * p.level, 0);

  if (!canCraft) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-5">
        <div className="flex items-center space-x-2 mb-3">
          <Bot size={16} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-300">傀儡术</h3>
        </div>
        <p className="text-[10px] text-slate-500">需大衍诀第二层（一心二用）方可炼制傀儡</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-slate-700/30 rounded-2xl p-5 overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-500/90 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bot size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300">傀儡术</h3>
          <span className="text-[10px] text-amber-400/40">{puppets.length}/{maxPuppets}</span>
        </div>
        <span className="text-[10px] text-amber-400/50">出战战力：{deployedPower}</span>
      </div>

      {/* Craft list */}
      <div className="mb-3 space-y-1.5">
        {PUPPET_TYPES.filter(p => puppets.filter(pp => pp.type === p.id).length < 3).map(p => {
          const craftingThis = crafting === p.id;
          const matCosts = Object.entries(p.cost).filter(([m]) => m !== 'spiritStones');
          return (
            <motion.button key={p.id} whileTap={{ scale: 0.98 }}
              onClick={() => craft(p.id)}
              disabled={!!crafting}
              className="w-full flex items-center space-x-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-amber-500/20 transition-all disabled:opacity-50"
            >
              <p.icon size={14} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs text-white">{p.name}</div>
                <div className="text-[10px] text-slate-500 truncate">T{p.tier} · {p.desc}</div>
                <div className="flex flex-wrap gap-x-2 mt-0.5">
                  {matCosts.map(([m, amt]) => {
                    const have = materials[m] || 0;
                    const ok = have >= amt;
                    return (
                      <span key={m} className={`text-[9px] ${ok ? 'text-slate-400' : 'text-red-400'}`}>
                        {MAT_NAME(m)} {have}/{amt}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[10px] text-amber-400/60">战力 {p.power}</div>
                <div className={`text-[8px] ${spiritStones >= p.cost.spiritStones ? 'text-slate-600' : 'text-red-400'}`}>
                  {p.cost.spiritStones}💎
                </div>
              </div>
              <motion.div animate={craftingThis ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity }}>
                <Hammer size={14} className={craftingThis ? 'text-amber-400' : 'text-slate-600'} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Puppet roster */}
      {puppets.length > 0 && (
        <div className="space-y-1.5">
          {puppets.map(puppet => {
            const def = PUPPET_TYPES.find(p => p.id === puppet.type);
            const Icon = def?.icon || Bot;
            return (
              <motion.div key={puppet.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all ${
                  puppet.deployed ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/30 border-slate-700/20'
                }`}>
                <Icon size={14} className={puppet.deployed ? 'text-amber-400' : 'text-slate-500'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-white">{puppet.name}</span>
                    <span className="text-[10px] text-slate-500">Lv.{puppet.level}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-600">
                    <span>战力 {puppet.power * puppet.level}</span>
                    <span>·</span>
                    <span>耐久 {puppet.durability}%</span>
                  </div>
                </div>
                <button onClick={() => deploy(puppet.id)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                    puppet.deployed ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-slate-700/50 border-slate-600 text-slate-400'
                  }`}>
                  {puppet.deployed ? '出战' : '待命'}
                </button>
                <button onClick={() => repair(puppet.id)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400">
                  <Wrench size={12} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
