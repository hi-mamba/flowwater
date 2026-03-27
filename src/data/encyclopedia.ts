export interface EncyclopediaItem {
  id: string;
  category: '历史' | '经济' | '物理' | '天文';
  title: string;
  content: string;
}

const categories = ['历史', '经济', '物理', '天文'] as const;

const baseItems: Omit<EncyclopediaItem, 'id'>[] = [
  { category: '历史', title: '秦始皇统一六国', content: '公元前221年，秦始皇嬴政先后灭韩、赵、魏、楚、燕、齐六国，完成了统一中国的大业，建立起一个以汉族为主体统一的中央集权的强大国家——秦朝。' },
  { category: '历史', title: '文艺复兴', content: '14世纪至16世纪欧洲的一场思想文化运动，核心是人文主义，提倡人性，反对神性，提倡个性解放，反对盲从盲信的愚昧思想。' },
  { category: '经济', title: '供求关系', content: '在竞争性市场中，特定商品的供给和需求决定了其价格。当需求大于供给时，价格上升；当供给大于需求时，价格下降。' },
  { category: '经济', title: '通货膨胀', content: '指在货币流通条件下，因货币供给大于货币实际需求，也即现实购买力大于产出供给，导致货币贬值，而引起的一段时间内物价持续而普遍地上涨现象。' },
  { category: '物理', title: '牛顿第一定律', content: '又称惯性定律。任何物体都要保持匀速直线运动或静止状态，直到外力迫使它改变运动状态为止。' },
  { category: '物理', title: '量子纠缠', content: '在量子力学里，当几个粒子在彼此相互作用后，由于各个粒子所拥有的特性已综合成为整体性质，无法单独描述各个粒子的性质，只能描述整体系统的性质，则称这现象为量子纠缠。' },
  { category: '天文', title: '黑洞', content: '是时空展现出极端强大的引力，以致于所有粒子、甚至光这样的电磁辐射都不能逃逸的区域。' },
  { category: '天文', title: '宇宙微波背景辐射', content: '是宇宙学中“大爆炸”遗留下来的热辐射，是全天空中各向同性的微波辐射。' },
];

export const ENCYCLOPEDIA_ITEMS: EncyclopediaItem[] = [];

// Generate 500 items based on the base items
for (let i = 0; i < 500; i++) {
  const base = baseItems[i % baseItems.length];
  ENCYCLOPEDIA_ITEMS.push({
    id: `encyclopedia_${i + 1}`,
    category: base.category,
    title: `${base.title} (卷${Math.floor(i / baseItems.length) + 1})`,
    content: `${base.content} 这部分知识深奥无比，道友需细细体悟其中的天地法则。这是第 ${i + 1} 篇典籍。`
  });
}
