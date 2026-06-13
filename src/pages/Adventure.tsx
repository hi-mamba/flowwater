// 修仙奇遇录 · 冒险页面
import Adventure from '../components/Adventure';
import InstanceDungeon from '../components/InstanceDungeon';
import SpiritRealm from '../components/SpiritRealm';
import Marketplace from '../components/Marketplace';
import { motion } from 'motion/react';

export default function AdventurePage() {
  return (
    <motion.div
      className="min-h-full p-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🗺️</span>
        <div>
          <h1 className="text-lg font-bold text-amber-300">修仙奇遇录</h1>
          <p className="text-xs text-slate-500">喝水聚灵力 · 探索修仙界</p>
        </div>
      </div>
      <Adventure />

      {/* 秘境探索 */}
      <div className="mt-6">
        <InstanceDungeon />
      </div>

      {/* 灵界飞升 */}
      <div className="mt-6">
        <SpiritRealm />
      </div>

      {/* 大千世界坊市 */}
      <div className="mt-6">
        <Marketplace />
      </div>
    </motion.div>
  );
}
