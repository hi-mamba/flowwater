import { GAME_SKILLS } from './constants';
import type { Fate } from './types';

export const createEquipmentSlice = (set: any, get: any, _store?: any) => ({
  skills: [] as string[],
  equippedSkills: [] as string[],
  skillProficiency: {} as Record<string, number>,
  artifacts: [] as string[],
  equippedArtifacts: [] as string[],
  artifactLevels: {} as Record<string, number>,
  dailyFates: [] as Fate[],
  selectedFate: null as Fate | null,
  chests: 0,

  learnSkill: (id: string) => set((state: any) => {
    if (!state.skills.includes(id)) {
      return { skills: [...state.skills, id] };
    }
    return state;
  }),
  equipSkill: (id: string) => set((state: any) => {
    if (state.skills.includes(id) && !state.equippedSkills.includes(id) && state.equippedSkills.length < 3) {
      return { equippedSkills: [...state.equippedSkills, id] };
    }
    return state;
  }),
  unequipSkill: (id: string) => set((state: any) => ({
    equippedSkills: state.equippedSkills.filter((s: string) => s !== id)
  })),
  gainSkillProficiency: (id: string, amount: number) => set((state: any) => {
    const currentProficiency = state.skillProficiency[id] || 0;
    return {
      skillProficiency: {
        ...state.skillProficiency,
        [id]: Math.min(100, currentProficiency + amount)
      }
    };
  }),
  obtainArtifact: (id: string) => set((state: any) => {
    if (!state.artifacts.includes(id)) {
      return { artifacts: [...state.artifacts, id] };
    }
    return state;
  }),
  equipArtifact: (id: string) => set((state: any) => {
    if (state.artifacts.includes(id) && !state.equippedArtifacts.includes(id) && state.equippedArtifacts.length < 1) {
      return { equippedArtifacts: [...state.equippedArtifacts, id] };
    }
    return state;
  }),
  unequipArtifact: (id: string) => set((state: any) => ({
    equippedArtifacts: state.equippedArtifacts.filter((a: string) => a !== id)
  })),
  upgradeArtifact: (id: string) => set((state: any) => {
    const currentLevel = state.artifactLevels[id] || 1;
    if (currentLevel >= 5) return state;
    return {
      artifactLevels: {
        ...state.artifactLevels,
        [id]: currentLevel + 1
      }
    };
  }),
  generateFates: () => {
    const fates: Fate[] = [
      { id: 'f1', type: 'fortune', title: '紫气东来', desc: '今日首次饮水获得双倍修为', effectType: 'first_drink_bonus', value: 2 },
      { id: 'f2', type: 'disaster', title: '丹毒入体', desc: '今日饮用奶茶修为减半', effectType: 'none', value: 0 },
      { id: 'f3', type: 'encounter', title: '秘境开启', desc: '今日探索秘境必定获得灵石', effectType: 'random_event', value: 1 },
      { id: 'f4', type: 'fortune', title: '灵光乍现', desc: '今日所有饮水修为+20%', effectType: 'cultivation_multiplier', value: 1.2 },
      { id: 'f5', type: 'disaster', title: '心魔滋生', desc: '今日未完成目标扣除50修为', effectType: 'none', value: 0 },
    ];
    const shuffled = fates.sort(() => 0.5 - Math.random());
    set({ dailyFates: shuffled.slice(0, 3), selectedFate: null });
  },
  selectFate: (fateId: string) => set((state: any) => ({
    selectedFate: state.dailyFates.find((f: Fate) => f.id === fateId) || null
  })),
  openChest: () => {
    const state = get();
    if (state.chests <= 0) return null;

    set({ chests: state.chests - 1 });

    const rand = Math.random();
    if (rand < 0.3) {
      const amount = Math.floor(Math.random() * 50) + 10;
      get().addSpiritStones(amount);
      return { type: 'spiritStones', amount, name: `${amount} 灵石` };
    } else if (rand < 0.6) {
      const mats = ['common_herb', 'rare_herb', 'stone', 'profound_iron', 'monster_bone', 'monster_fur'];
      const mat = mats[Math.floor(Math.random() * mats.length)];
      const names: Record<string, string> = {
        'common_herb': '凝气草',
        'rare_herb': '洗髓草',
        'stone': '灵石矿',
        'profound_iron': '玄铁精',
        'monster_bone': '妖兽骨骼',
        'monster_fur': '妖兽皮毛'
      };
      get().addMaterial(mat, 1);
      return { type: 'material', name: names[mat] };
    } else if (rand < 0.8) {
      get().addHeavenlyBottleDrop(1);
      return { type: 'drop', name: '绿液滴' };
    } else if (rand < 0.9) {
      const rareMats = ['millennium_lingzhi', 'jiuzhuan_grass'];
      const mat = rareMats[Math.floor(Math.random() * rareMats.length)];
      const names: Record<string, string> = {
        'millennium_lingzhi': '千年灵芝',
        'jiuzhuan_grass': '九转玄草'
      };
      get().addMaterial(mat, 1);
      return { type: 'material', name: names[mat] };
    } else if (rand < 0.95) {
      const unlearnedSkills = ['skill_1', 'skill_2', 'skill_3', 'skill_4', 'skill_5'].filter(s => !state.skills.includes(s));
      if (unlearnedSkills.length > 0) {
        const randomSkill = unlearnedSkills[Math.floor(Math.random() * unlearnedSkills.length)];
        get().learnSkill(randomSkill);
        const skillName = GAME_SKILLS.find(s => s.id === randomSkill)?.name || '未知功法';
        return { type: 'skill', name: skillName };
      }
      get().addSpiritStones(100);
      return { type: 'spiritStones', amount: 100, name: `100 灵石` };
    } else {
      if (!state.artifacts.includes('julian_array')) {
        get().obtainArtifact('julian_array');
        return { type: 'artifact', name: '聚灵阵' };
      }
      get().addSpiritStones(200);
      return { type: 'spiritStones', amount: 200, name: `200 灵石` };
    }
  },
  addChest: (amount: number) => set((state: any) => ({ chests: state.chests + amount })),
});
