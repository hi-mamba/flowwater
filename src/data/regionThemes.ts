// 按当前所在区域生成洞府/家园的视觉主题
// 凡人界/天南/乱星海/大晋/阴冥之地/魔界/灵界（按大陆）/仙界

export type RegionTheme = {
  id: string;
  /** 主标题 / 称呼（"洞府" / "山门" / "灵窟" / "魔殿" / "仙府" 等） */
  homeTitle: string;
  /** 副标题（古朴注解） */
  homeSubtitle: string;
  /** 顶层背景渐变（CSS background） */
  bgStyle: string;
  /** 主色调强调色 (tailwind 文字色 token) */
  accentText: string;
  /** 强调色 (RGB)，用于光晕、边框 */
  glow: string;
  /** 装饰图标 emoji */
  icon: string;
  /** 聚灵泉的称呼（不同界域名字不同） */
  springName: string;
  springDesc: string;
  /** 当前氛围词（左上角灰字） */
  ambient: string;
  /** 一句问候（顶部文字旁） */
  greeting: string;
};

const fanren: RegionTheme = {
  id: '凡人界',
  homeTitle: '茅屋山居',
  homeSubtitle: '凡人居所 · 灵气稀薄',
  bgStyle: `
    radial-gradient(ellipse at 30% 0%, rgba(120,113,108,0.15), transparent 50%),
    radial-gradient(ellipse at 70% 100%, rgba(87,83,78,0.1), transparent 60%),
    linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)
  `,
  accentText: 'text-stone-300',
  glow: 'rgba(168,162,158,0.3)',
  icon: '🏚️',
  springName: '老井',
  springDesc: '村中一口老井，偶有清气逸出',
  ambient: '炊烟袅袅',
  greeting: '凡人之躯，仙路漫漫',
};

const tiannan: RegionTheme = {
  id: '天南',
  homeTitle: '黄枫洞府',
  homeSubtitle: '天南修仙之地 · 七派会武',
  bgStyle: `
    radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.1), transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(34,197,94,0.06), transparent 50%),
    linear-gradient(180deg, #0f172a 0%, #052e1a 100%)
  `,
  accentText: 'text-emerald-300',
  glow: 'rgba(16,185,129,0.4)',
  icon: '🍁',
  springName: '聚灵泉',
  springDesc: '黄枫谷山泉，每日凝聚天地灵气',
  ambient: '黄枫飘叶',
  greeting: '天南七派 · 修仙启程之地',
};

const luanxinghai: RegionTheme = {
  id: '乱星海',
  homeTitle: '海岛洞府',
  homeSubtitle: '万岛林立 · 海外修仙界',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.12), transparent 50%),
    radial-gradient(ellipse at 0% 70%, rgba(14,116,144,0.1), transparent 60%),
    linear-gradient(180deg, #0c1929 0%, #042f2e 100%)
  `,
  accentText: 'text-cyan-300',
  glow: 'rgba(34,211,238,0.4)',
  icon: '🌊',
  springName: '海眼灵泉',
  springDesc: '海底灵脉所化，潮汐之间灵气涌动',
  ambient: '潮声拍岸',
  greeting: '万岛云海 · 妖兽出没',
};

const dajin: RegionTheme = {
  id: '大晋',
  homeTitle: '星宫别院',
  homeSubtitle: '大晋皇都 · 人界第一大国',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.1), transparent 50%),
    radial-gradient(ellipse at 80% 60%, rgba(217,119,6,0.08), transparent 60%),
    linear-gradient(180deg, #1c1917 0%, #292524 100%)
  `,
  accentText: 'text-amber-300',
  glow: 'rgba(251,191,36,0.4)',
  icon: '🏯',
  springName: '皇极聚灵阵',
  springDesc: '大晋皇室所赐聚灵阵盘，灵气滚滚',
  ambient: '宫阙重重',
  greeting: '人才辈出 · 化神老怪云集',
};

const yinming: RegionTheme = {
  id: '阴冥之地',
  homeTitle: '幽冥窟府',
  homeSubtitle: '阴气浓郁 · 鬼修禁地',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12), transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(76,29,149,0.15), transparent 60%),
    linear-gradient(180deg, #1e1b4b 0%, #020617 100%)
  `,
  accentText: 'text-purple-300',
  glow: 'rgba(168,85,247,0.4)',
  icon: '👻',
  springName: '黄泉魂泉',
  springDesc: '阴气凝结之泉，可炼魂淬体',
  ambient: '阴风呜咽',
  greeting: '魂兽嘶吼 · 鬼修横行',
};

const mojie: RegionTheme = {
  id: '魔界',
  homeTitle: '魔渊裂窟',
  homeSubtitle: '上古魔渊 · 古魔降临之地',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.18), transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(127,29,29,0.2), transparent 60%),
    linear-gradient(180deg, #450a0a 0%, #0c0a09 100%)
  `,
  accentText: 'text-red-300',
  glow: 'rgba(220,38,38,0.5)',
  icon: '🔥',
  springName: '魔血池',
  springDesc: '古魔精血凝聚，可锻魔体',
  ambient: '魔气滔天',
  greeting: '人魔之战 · 万古死局',
};

const lingjie_fengyuan: RegionTheme = {
  id: '灵界·风元',
  homeTitle: '风元洞府',
  homeSubtitle: '灵界·风元大陆 · 人族聚地',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18), transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(168,85,247,0.12), transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(236,72,153,0.08), transparent 60%),
    linear-gradient(180deg, #1e1b4b 0%, #020617 100%)
  `,
  accentText: 'text-indigo-200',
  glow: 'rgba(129,140,248,0.5)',
  icon: '🏔️',
  springName: '风元灵泉',
  springDesc: '风元大陆灵脉所化，灵气如海',
  ambient: '仙灵之气',
  greeting: '飞升者所至 · 风元大陆',
};

const lingjie_leiming: RegionTheme = {
  id: '灵界·雷鸣',
  homeTitle: '雷鸣洞府',
  homeSubtitle: '灵界·雷鸣大陆 · 雷霆灵脉',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(250,204,21,0.18), transparent 50%),
    radial-gradient(ellipse at 30% 60%, rgba(168,85,247,0.12), transparent 50%),
    linear-gradient(180deg, #1e1b4b 0%, #0c0a09 100%)
  `,
  accentText: 'text-yellow-200',
  glow: 'rgba(250,204,21,0.5)',
  icon: '⚡',
  springName: '雷霆灵渊',
  springDesc: '雷霆灵气磅礴，可淬雷体',
  ambient: '雷霆滚滚',
  greeting: '雷霆之地 · 雷修圣地',
};

const lingjie_baxiong: RegionTheme = {
  id: '灵界·霸熊',
  homeTitle: '霸熊岭穴',
  homeSubtitle: '灵界·霸熊岭 · 妖族圣地',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.15), transparent 50%),
    radial-gradient(ellipse at 0% 60%, rgba(127,29,29,0.12), transparent 60%),
    linear-gradient(180deg, #292524 0%, #0c0a09 100%)
  `,
  accentText: 'text-orange-300',
  glow: 'rgba(251,146,60,0.4)',
  icon: '🐻',
  springName: '兽魂泉',
  springDesc: '上古妖兽精血凝聚，可炼妖丹',
  ambient: '妖气冲天',
  greeting: '霸熊一族 · 妖兽横行',
};

const lingjie_lieyang: RegionTheme = {
  id: '灵界·烈阳',
  homeTitle: '烈阳岛府',
  homeSubtitle: '灵界·烈阳岛 · 火脉之地',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.18), transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.15), transparent 60%),
    linear-gradient(180deg, #7c2d12 0%, #0c0a09 100%)
  `,
  accentText: 'text-orange-200',
  glow: 'rgba(251,146,60,0.5)',
  icon: '🔥',
  springName: '烈焰灵池',
  springDesc: '岛上火脉，烈火常燃，火灵根修士绝佳之地',
  ambient: '烈火长燃',
  greeting: '海外火脉 · 火修圣地',
};

const lingjie_xutian: RegionTheme = {
  id: '灵界·虚天',
  homeTitle: '虚天殿宇',
  homeSubtitle: '灵界·虚天殿 · 玄天之宝沉眠',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(192,132,252,0.2), transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(56,189,248,0.12), transparent 60%),
    linear-gradient(180deg, #312e81 0%, #020617 100%)
  `,
  accentText: 'text-fuchsia-200',
  glow: 'rgba(192,132,252,0.5)',
  icon: '🏛️',
  springName: '虚空之泉',
  springDesc: '虚天之灵气，万年方现',
  ambient: '虚空回响',
  greeting: '上古通天灵宝降临之地',
};

const lingjie_changsheng: RegionTheme = {
  id: '灵界·长生',
  homeTitle: '长生界府',
  homeSubtitle: '灵界·长生界 · 仙路之始',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(254,240,138,0.2), transparent 50%),
    radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.08), transparent 60%),
    linear-gradient(180deg, #422006 0%, #18181b 100%)
  `,
  accentText: 'text-yellow-100',
  glow: 'rgba(254,240,138,0.6)',
  icon: '☯',
  springName: '长生玉液',
  springDesc: '仙之将至，玉液涌动',
  ambient: '仙音渺渺',
  greeting: '大乘巅峰 · 仙路之始',
};

const xianjie: RegionTheme = {
  id: '仙界',
  homeTitle: '仙府云宫',
  homeSubtitle: '仙界 · 凡人修仙之终极',
  bgStyle: `
    radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15), transparent 50%),
    radial-gradient(ellipse at 30% 70%, rgba(254,240,138,0.18), transparent 60%),
    radial-gradient(ellipse at 70% 30%, rgba(125,211,252,0.12), transparent 60%),
    linear-gradient(180deg, #1e293b 0%, #0c0a09 100%)
  `,
  accentText: 'text-yellow-50',
  glow: 'rgba(254,240,138,0.6)',
  icon: '✨',
  springName: '仙池',
  springDesc: '仙池玉液，一滴可换百年修为',
  ambient: '仙乐缥缈',
  greeting: '凡人成仙 · 万千仙宫',
};

export const REGION_THEMES: Record<string, RegionTheme> = {
  '凡人界': fanren,
  '天南': tiannan,
  '乱星海': luanxinghai,
  '大晋': dajin,
  '阴冥之地': yinming,
  '魔界': mojie,
  '灵界': lingjie_fengyuan, // 默认风元大陆
  '灵界·风元': lingjie_fengyuan,
  '灵界·雷鸣': lingjie_leiming,
  '灵界·霸熊': lingjie_baxiong,
  '灵界·烈阳': lingjie_lieyang,
  '灵界·虚天': lingjie_xutian,
  '灵界·长生': lingjie_changsheng,
  '仙界': xianjie,
};

/** 根据 currentRegion + 灵界大陆 取得当前主题 */
export function getRegionTheme(currentRegion: string, spiritContinentId?: string | null): RegionTheme {
  if (currentRegion === '灵界' && spiritContinentId) {
    const map: Record<string, string> = {
      fengyuan: '灵界·风元',
      leiming: '灵界·雷鸣',
      baxiong: '灵界·霸熊',
      lieyang: '灵界·烈阳',
      xutian: '灵界·虚天',
      changsheng: '灵界·长生',
    };
    const key = map[spiritContinentId];
    if (key && REGION_THEMES[key]) return REGION_THEMES[key];
  }
  return REGION_THEMES[currentRegion] || fanren;
}
