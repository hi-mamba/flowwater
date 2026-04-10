const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// Helper to replace an array in the file
function replaceArray(arrayName, newContent) {
  const regex = new RegExp(`export const ${arrayName}(?:\\s*:\\s*[a-zA-Z\\[\\]]+)?\\s*=\\s*\\[[\\s\\S]*?\\];`);
  if (regex.test(content)) {
    content = content.replace(regex, `export const ${arrayName} = [\n${newContent}\n];`);
    console.log(`Replaced ${arrayName}`);
  } else {
    console.log(`Could not find ${arrayName}`);
  }
}

const newCultivationLevels = `
  { name: '凡人', min: 0, bg: 'from-slate-900 to-slate-800', color: 'text-slate-400' },
  { name: '炼气一层', min: 2000, bg: 'from-slate-900 to-blue-900/10', color: 'text-blue-200' },
  { name: '炼气二层', min: 2500, bg: 'from-slate-900 to-blue-900/20', color: 'text-blue-200' },
  { name: '炼气三层', min: 3000, bg: 'from-slate-900 to-blue-900/30', color: 'text-blue-200' },
  { name: '炼气四层', min: 3500, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气五层', min: 4000, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气六层', min: 4500, bg: 'from-slate-900 to-blue-900/40', color: 'text-blue-300' },
  { name: '炼气七层', min: 5000, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气八层', min: 5500, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气九层', min: 6000, bg: 'from-slate-900 to-blue-900/50', color: 'text-blue-400' },
  { name: '炼气十层', min: 6500, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十一层', min: 7000, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十二层', min: 8000, bg: 'from-slate-900 to-blue-900/60', color: 'text-blue-500' },
  { name: '炼气十三层', min: 9000, bg: 'from-slate-900 to-blue-900/70', color: 'text-blue-600' },
  { name: '筑基初期', min: 10000, bg: 'from-slate-900 to-emerald-900/40', color: 'text-emerald-300' },
  { name: '筑基中期', min: 15000, bg: 'from-slate-900 to-emerald-900/50', color: 'text-emerald-400' },
  { name: '筑基后期', min: 20000, bg: 'from-slate-900 to-emerald-900/60', color: 'text-emerald-500' },
  { name: '筑基巅峰', min: 25000, bg: 'from-slate-900 to-emerald-900/70', color: 'text-emerald-600' },
  { name: '结丹初期', min: 30000, bg: 'from-slate-900 to-yellow-900/40', color: 'text-yellow-300' },
  { name: '结丹中期', min: 45000, bg: 'from-slate-900 to-yellow-900/50', color: 'text-yellow-400' },
  { name: '结丹后期', min: 60000, bg: 'from-slate-900 to-yellow-900/60', color: 'text-yellow-500' },
  { name: '结丹巅峰', min: 80000, bg: 'from-slate-900 to-yellow-900/70', color: 'text-yellow-600' },
  { name: '元婴初期', min: 100000, bg: 'from-slate-900 to-purple-900/40', color: 'text-purple-300' },
  { name: '元婴中期', min: 150000, bg: 'from-slate-900 to-purple-900/50', color: 'text-purple-400' },
  { name: '元婴后期', min: 200000, bg: 'from-slate-900 to-purple-900/60', color: 'text-purple-500' },
  { name: '元婴巅峰', min: 250000, bg: 'from-slate-900 to-purple-900/70', color: 'text-purple-600' },
  { name: '化神初期', min: 300000, bg: 'from-slate-900 to-rose-900/40', color: 'text-rose-300' },
  { name: '化神中期', min: 400000, bg: 'from-slate-900 to-rose-900/50', color: 'text-rose-400' },
  { name: '化神后期', min: 500000, bg: 'from-slate-900 to-rose-900/60', color: 'text-rose-500' },
  { name: '化神巅峰', min: 600000, bg: 'from-slate-900 to-rose-900/70', color: 'text-rose-600' },
  { name: '炼虚初期', min: 800000, bg: 'from-slate-900 to-cyan-900/40', color: 'text-cyan-300' },
  { name: '炼虚中期', min: 1200000, bg: 'from-slate-900 to-cyan-900/50', color: 'text-cyan-400' },
  { name: '炼虚后期', min: 1800000, bg: 'from-slate-900 to-cyan-900/60', color: 'text-cyan-500' },
  { name: '炼虚巅峰', min: 2500000, bg: 'from-slate-900 to-cyan-900/70', color: 'text-cyan-600' },
  { name: '合体初期', min: 4000000, bg: 'from-slate-900 to-indigo-900/40', color: 'text-indigo-300' },
  { name: '合体中期', min: 6000000, bg: 'from-slate-900 to-indigo-900/50', color: 'text-indigo-400' },
  { name: '合体后期', min: 9000000, bg: 'from-slate-900 to-indigo-900/60', color: 'text-indigo-500' },
  { name: '合体巅峰', min: 14000000, bg: 'from-slate-900 to-indigo-900/70', color: 'text-indigo-600' },
  { name: '大乘初期', min: 20000000, bg: 'from-slate-900 to-fuchsia-900/40', color: 'text-fuchsia-300' },
  { name: '大乘中期', min: 30000000, bg: 'from-slate-900 to-fuchsia-900/50', color: 'text-fuchsia-400' },
  { name: '大乘后期', min: 45000000, bg: 'from-slate-900 to-fuchsia-900/60', color: 'text-fuchsia-500' },
  { name: '大乘巅峰', min: 60000000, bg: 'from-slate-900 to-fuchsia-900/70', color: 'text-fuchsia-600' },
  { name: '渡劫期', min: 80000000, bg: 'from-slate-900 to-red-900/60', color: 'text-red-500' },
  { name: '真仙初期', min: 100000000, bg: 'from-slate-900 to-amber-900/40', color: 'text-amber-300' },
  { name: '真仙中期', min: 150000000, bg: 'from-slate-900 to-amber-900/50', color: 'text-amber-400' },
  { name: '真仙后期', min: 250000000, bg: 'from-slate-900 to-amber-900/60', color: 'text-amber-500' },
  { name: '真仙巅峰', min: 400000000, bg: 'from-slate-900 to-amber-900/70', color: 'text-amber-600' },
  { name: '金仙初期', min: 600000000, bg: 'from-slate-900 to-orange-900/40', color: 'text-orange-300' },
  { name: '金仙中期', min: 900000000, bg: 'from-slate-900 to-orange-900/50', color: 'text-orange-400' },
  { name: '金仙后期', min: 1500000000, bg: 'from-slate-900 to-orange-900/60', color: 'text-orange-500' },
  { name: '金仙巅峰', min: 2500000000, bg: 'from-slate-900 to-orange-900/70', color: 'text-orange-600' },
  { name: '太乙初期', min: 4000000000, bg: 'from-slate-900 to-lime-900/40', color: 'text-lime-300' },
  { name: '太乙中期', min: 6000000000, bg: 'from-slate-900 to-lime-900/50', color: 'text-lime-400' },
  { name: '太乙后期', min: 9000000000, bg: 'from-slate-900 to-lime-900/60', color: 'text-lime-500' },
  { name: '太乙巅峰', min: 15000000000, bg: 'from-slate-900 to-lime-900/70', color: 'text-lime-600' },
  { name: '大罗初期', min: 25000000000, bg: 'from-slate-900 to-teal-900/40', color: 'text-teal-300' },
  { name: '大罗中期', min: 40000000000, bg: 'from-slate-900 to-teal-900/50', color: 'text-teal-400' },
  { name: '大罗后期', min: 70000000000, bg: 'from-slate-900 to-teal-900/60', color: 'text-teal-500' },
  { name: '大罗巅峰', min: 120000000000, bg: 'from-slate-900 to-teal-900/70', color: 'text-teal-600' },
  { name: '道祖', min: 200000000000, bg: 'from-slate-900 to-zinc-100/20', color: 'text-zinc-100' }
`;

const newPresetCharacters = `
  {
    id: 'hanli',
    name: '韩立',
    background: '山村少年，机缘巧合下进入七玄门，获得掌天瓶。',
    talent: '坚韧不拔：突破成功率提升10%，闭关收益提升20%。',
    growthPath: '凡人流：稳扎稳打，资源获取更稳定。',
    spiritualRoot: 'mixed', // 四灵根
    initialSpiritStones: 100,
    initialArtifacts: ['heavenly_bottle'],
    bonusType: 'breakthrough_rate',
    bonusValue: 0.1
  },
  {
    id: 'lifeiyu',
    name: '厉飞雨',
    background: '七玄门弟子，韩立至交好友，服用抽髓丸换取短暂巅峰。',
    talent: '杀伐果断：战斗胜率提升20%，但寿命消耗加快。',
    growthPath: '武道流：前期战斗力极强。',
    spiritualRoot: 'none', // 无灵根
    initialSpiritStones: 50,
    initialArtifacts: ['artifact_sword'],
    bonusType: 'combat_win_rate',
    bonusValue: 0.2
  },
  {
    id: 'nangongwan',
    name: '南宫婉',
    background: '掩月宗长老，修炼素女轮回功，与韩立有不解之缘。',
    talent: '轮回之体：每次突破失败返还部分修为，双修收益提升30%。',
    growthPath: '宗门流：初始地位高，资源丰富。',
    spiritualRoot: 'heaven', // 天灵根
    initialSpiritStones: 5000,
    initialArtifacts: ['artifact_qingjiao'],
    bonusType: 'companion_bonus',
    bonusValue: 1.3
  },
  {
    id: 'ziling',
    name: '紫灵',
    background: '乱星海妙音门门主之女，绝世容颜，精通魅术。',
    talent: '魅惑众生：购买物品价格降低20%，结识道侣概率提升50%。',
    growthPath: '商道流：擅长经营与人际交往。',
    spiritualRoot: 'earth', // 地灵根
    initialSpiritStones: 10000,
    initialArtifacts: ['artifact_2'],
    bonusType: 'shop_discount',
    bonusValue: 0.8
  },
  {
    id: 'lizongzhu',
    name: '李宗主',
    background: '名门之后，天生异象，宗门未来的希望。',
    talent: '宗门领袖：宗门贡献获取提升50%，每日俸禄提升100%。',
    growthPath: '天才流：境界突破极快，但根基需稳固。',
    spiritualRoot: 'heaven', // 天灵根
    initialSpiritStones: 1000,
    initialArtifacts: [],
    bonusType: 'daily_salary',
    bonusValue: 2.0
  }
`;

replaceArray('CULTIVATION_LEVELS', newCultivationLevels);
replaceArray('PRESET_CHARACTERS', newPresetCharacters);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete.');
