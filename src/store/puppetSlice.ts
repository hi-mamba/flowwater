// 傀儡自动化系统 — 在洞府托管常规事务（采灵气 / 炼丹 / 炼器），
// 把 PuppetMaster 组件的本地 state 提升为持久化 store，并按出战战力分配每小时任务配额。
//
// 配额规则（与 UI 描述一致）：
//   每 60 战力 = 每小时 1 次任务；行动点上限 = 每小时配额 × 2（最多缓冲 2 小时离线收益）
//   每次 tick(): 按 (距上次结算分钟数 / 60 * 配额) 累计行动点；按优先级消耗
//   优先级：聚灵泉 > 炼丹（按用户配置顺序） > 炼器（按用户配置顺序）
//
// 这意味着：
//   - 离线/后台时仍能"补算"过去的产出（最多 2 小时上限），打开洞府就直接看到产物
//   - 玩家不用再手动点浇水/收获/采气/炼丹/炼器，但仍可手动操作覆盖

import { ALL_PILLS, ALL_ARTIFACTS, ALL_HERBS } from '../data/craftingData';

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

// 灵药园灵田 — 放在 store 里以便傀儡 tick 操作（HerbGarden UI 也读这份数据）
export interface GardenPlot {
  id: string;
  herbId: string;     // '' 表示空地
  plantedAt: number;  // 种植时间戳
  lastHerbId: string; // 上一次种植的灵草，用于"自动补种"
}

const PUPPET_TYPES_DATA = [
  { id: 'wooden', tier: 1, power: 10 },
  { id: 'iron', tier: 2, power: 30 },
  { id: 'beast', tier: 3, power: 60 },
  { id: 'spirit', tier: 4, power: 120 },
  { id: 'divine', tier: 5, power: 300 },
];

export interface PuppetAutomationConfig {
  // 聚灵泉满 24 滴时是否自动采集
  autoSpring: boolean;
  // 炼丹优先级队列（recipe id list）；空则不自动炼丹
  alchemyQueue: string[];
  // 炼器优先级队列
  craftingQueue: string[];
  // 是否自动收获成熟灵草（不消耗行动点，是免费贴心服务）
  autoHarvest: boolean;
  // 是否自动按 lastHerbId 补种空灵田（免费）
  autoReplant: boolean;
}

export interface PuppetSliceState {
  puppets: Puppet[];
  puppetAutomation: PuppetAutomationConfig;
  // 当前已累积的行动点（小数，按出战战力随时间增长）
  puppetActions: number;
  // 上次结算时间戳
  puppetLastTickAt: number;
  // 最近 5 条自动行动日志，用于 UI 显示"傀儡刚刚做了什么"
  puppetActivityLog: { ts: number; text: string }[];
  // 灵田（提升到 store，以便傀儡 tick 操作）
  gardenPlots: GardenPlot[];
}

export const ACTIONS_PER_60_POWER_PER_HOUR = 1; // 每 60 战力 / 每小时 1 个行动点
const POWER_PER_ACTION = 60;
const MAX_OFFLINE_HOURS = 2;

const calcDeployedPower = (puppets: Puppet[]) =>
  puppets.filter(p => p.deployed).reduce((s, p) => s + p.power * p.level, 0);

export const createPuppetSlice = (set: any, get: any, _store?: any) => ({
  puppets: [] as Puppet[],
  puppetAutomation: {
    autoSpring: true,
    alchemyQueue: [],
    craftingQueue: [],
    autoHarvest: true,
    autoReplant: true,
  } as PuppetAutomationConfig,
  puppetActions: 0,
  puppetLastTickAt: Date.now(),
  puppetActivityLog: [] as { ts: number; text: string }[],
  gardenPlots: Array.from({ length: 8 }).map((_, i) => ({
    id: `plot_${i}`, herbId: '', plantedAt: 0, lastHerbId: '',
  })) as GardenPlot[],

  // —— 傀儡管理 ——
  addPuppet: (p: Puppet) => set((state: any) => ({ puppets: [...state.puppets, p] })),
  removePuppet: (id: string) => set((state: any) => ({ puppets: state.puppets.filter((p: Puppet) => p.id !== id) })),
  togglePuppetDeployed: (id: string) => set((state: any) => ({
    puppets: state.puppets.map((p: Puppet) => p.id === id ? { ...p, deployed: !p.deployed } : p),
  })),
  repairPuppet: (id: string) => {
    const state = get();
    if (state.spiritStones < 50) return false;
    set({
      spiritStones: state.spiritStones - 50,
      puppets: state.puppets.map((p: Puppet) => p.id === id ? { ...p, durability: p.maxDurability } : p),
    });
    return true;
  },

  // —— 自动化配置 ——
  setPuppetAutomation: (cfg: Partial<PuppetAutomationConfig>) => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, ...cfg },
  })),
  togglePuppetAutoSpring: () => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, autoSpring: !state.puppetAutomation.autoSpring },
  })),
  togglePuppetAutoHarvest: () => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, autoHarvest: !state.puppetAutomation.autoHarvest },
  })),
  togglePuppetAutoReplant: () => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, autoReplant: !state.puppetAutomation.autoReplant },
  })),

  // —— 灵田操作（取代 HerbGarden 的本地 state） ——
  plantGardenPlot: (plotId: string, herbId: string) => set((state: any) => ({
    gardenPlots: state.gardenPlots.map((p: GardenPlot) =>
      p.id === plotId ? { ...p, herbId, plantedAt: Date.now(), lastHerbId: herbId } : p
    ),
  })),
  plantAllEmptyPlots: (herbId: string, maxPlots: number) => set((state: any) => {
    let count = 0;
    const newPlots = state.gardenPlots.map((p: GardenPlot, idx: number) => {
      if (idx < maxPlots && !p.herbId) {
        count++;
        return { ...p, herbId, plantedAt: Date.now(), lastHerbId: herbId };
      }
      return p;
    });
    return { gardenPlots: newPlots };
  }),
  harvestGardenPlot: (plotId: string) => {
    const state = get();
    const plot = state.gardenPlots.find((p: GardenPlot) => p.id === plotId);
    if (!plot?.herbId) return;
    const herb = ALL_HERBS.find(h => h.id === plot.herbId);
    if (!herb) return;
    const elapsed = (Date.now() - plot.plantedAt) / 1000;
    if (elapsed < herb.growthTime) return; // 未成熟
    set({
      materials: { ...state.materials, [herb.id]: (state.materials[herb.id] || 0) + herb.yield },
      // 收获后保留 lastHerbId 用于自动补种
      gardenPlots: state.gardenPlots.map((p: GardenPlot) =>
        p.id === plotId ? { ...p, herbId: '', plantedAt: 0 } : p
      ),
    });
  },
  clearGardenPlot: (plotId: string) => set((state: any) => ({
    gardenPlots: state.gardenPlots.map((p: GardenPlot) =>
      p.id === plotId ? { ...p, herbId: '', plantedAt: 0, lastHerbId: '' } : p
    ),
  })),
  addAlchemyQueueItem: (recipeId: string) => set((state: any) => {
    if (state.puppetAutomation.alchemyQueue.includes(recipeId)) return state;
    return { puppetAutomation: { ...state.puppetAutomation, alchemyQueue: [...state.puppetAutomation.alchemyQueue, recipeId] } };
  }),
  removeAlchemyQueueItem: (recipeId: string) => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, alchemyQueue: state.puppetAutomation.alchemyQueue.filter((id: string) => id !== recipeId) },
  })),
  moveAlchemyQueueItem: (recipeId: string, dir: -1 | 1) => set((state: any) => {
    const q = [...state.puppetAutomation.alchemyQueue];
    const i = q.indexOf(recipeId);
    if (i < 0) return state;
    const j = i + dir;
    if (j < 0 || j >= q.length) return state;
    [q[i], q[j]] = [q[j], q[i]];
    return { puppetAutomation: { ...state.puppetAutomation, alchemyQueue: q } };
  }),
  addCraftingQueueItem: (recipeId: string) => set((state: any) => {
    if (state.puppetAutomation.craftingQueue.includes(recipeId)) return state;
    return { puppetAutomation: { ...state.puppetAutomation, craftingQueue: [...state.puppetAutomation.craftingQueue, recipeId] } };
  }),
  removeCraftingQueueItem: (recipeId: string) => set((state: any) => ({
    puppetAutomation: { ...state.puppetAutomation, craftingQueue: state.puppetAutomation.craftingQueue.filter((id: string) => id !== recipeId) },
  })),
  moveCraftingQueueItem: (recipeId: string, dir: -1 | 1) => set((state: any) => {
    const q = [...state.puppetAutomation.craftingQueue];
    const i = q.indexOf(recipeId);
    if (i < 0) return state;
    const j = i + dir;
    if (j < 0 || j >= q.length) return state;
    [q[i], q[j]] = [q[j], q[i]];
    return { puppetAutomation: { ...state.puppetAutomation, craftingQueue: q } };
  }),

  // 计算当前每小时配额（仅 deployed 傀儡参与）
  getPuppetActionsPerHour: () => {
    const state = get();
    const power = calcDeployedPower(state.puppets);
    return power / POWER_PER_ACTION;
  },
  getDeployedPuppetPower: () => calcDeployedPower(get().puppets),

  // 主 tick — 在 App 启动 / 进入洞府 / 每分钟 调用一次
  // 内部根据时间差累积行动点 → 按优先级消费 → 写日志
  tickPuppetAutomation: () => {
    const state = get();
    const now = Date.now();
    const power = calcDeployedPower(state.puppets);
    const cfg = state.puppetAutomation;

    // —— 1. 累积行动点（即使未出战傀儡也要更新时间，避免后续部署后突然爆炸）——
    const elapsedHours = (now - state.puppetLastTickAt) / (1000 * 60 * 60);
    const ratePerHour = power / POWER_PER_ACTION;
    const cap = Math.max(1, ratePerHour * MAX_OFFLINE_HOURS);
    let actions = Math.min(cap, state.puppetActions + elapsedHours * ratePerHour);

    const logs: { ts: number; text: string }[] = [];
    const pushLog = (text: string) => logs.push({ ts: now, text });

    // —— 2. 自动收获成熟灵草（免费，不消耗行动点）——
    if (cfg.autoHarvest && state.gardenPlots?.length) {
      const matureNow = state.gardenPlots.filter((p: GardenPlot) => {
        if (!p.herbId) return false;
        const herb = ALL_HERBS.find(h => h.id === p.herbId);
        if (!herb) return false;
        return (now - p.plantedAt) / 1000 >= herb.growthTime;
      });
      if (matureNow.length > 0) {
        const newMaterials = { ...state.materials };
        const harvestedNames: string[] = [];
        const newPlots = state.gardenPlots.map((p: GardenPlot) => {
          const herb = ALL_HERBS.find(h => h.id === p.herbId);
          if (!herb) return p;
          if ((now - p.plantedAt) / 1000 < herb.growthTime) return p;
          newMaterials[herb.id] = (newMaterials[herb.id] || 0) + herb.yield;
          harvestedNames.push(`${herb.name}×${herb.yield}`);
          // 保留 lastHerbId，清空 herbId
          return { ...p, herbId: '', plantedAt: 0 };
        });
        set({ materials: newMaterials, gardenPlots: newPlots });
        pushLog(`收获灵草：${harvestedNames.slice(0, 3).join('、')}${harvestedNames.length > 3 ? `等${harvestedNames.length}种` : ''}`);
      }
    }

    // —— 2.5 自动补种（免费）——
    // 对每个空灵田，如果它有 lastHerbId（表示之前种过），且修为允许，则按上次种类补种
    if (cfg.autoReplant) {
      const fresh = get();
      const maxPlots = 2 + Math.floor(fresh.levelIndex / 5);
      let replanted = 0;
      const replantedNames: string[] = [];
      const newPlots = fresh.gardenPlots.map((p: GardenPlot, idx: number) => {
        if (idx >= maxPlots) return p;
        if (p.herbId || !p.lastHerbId) return p;
        const herb = ALL_HERBS.find(h => h.id === p.lastHerbId);
        if (!herb || fresh.levelIndex < herb.minLevel) return p;
        replanted++;
        if (!replantedNames.includes(herb.name)) replantedNames.push(herb.name);
        return { ...p, herbId: p.lastHerbId, plantedAt: now };
      });
      if (replanted > 0) {
        set({ gardenPlots: newPlots });
        pushLog(`补种空灵田 ×${replanted}（${replantedNames.join('、')}）`);
      }
    }

    // —— 3. 自动采集聚灵泉（不消耗行动点，因为这是免费的傀儡值班）——
    if (cfg.autoSpring && state.cave) {
      const hoursPassed = (now - state.cave.lastSpringCollect) / (1000 * 60 * 60);
      const projected = Math.floor(Math.min(24, state.cave.springQi + hoursPassed));
      if (projected >= 24) {
        // 满 24 滴必采，避免溢出浪费
        const fresh = get(); // 读最新（可能被上一步收获 set 影响）
        set({
          bonusPoints: fresh.bonusPoints + projected * 10,
          cave: { ...fresh.cave, springQi: 0, lastSpringCollect: now },
        });
        pushLog(`采集聚灵泉满灵气 ${projected} 滴 (+${projected * 10} 修为)`);
      }
    }

    // —— 4. 自动炼丹（按队列优先级，每丹消耗 1 行动点）——
    if (actions >= 1 && cfg.alchemyQueue.length > 0) {
      let stop = false;
      while (actions >= 1 && !stop) {
        stop = true;
        const fresh = get();
        for (const recipeId of fresh.puppetAutomation.alchemyQueue) {
          const recipe = ALL_PILLS.find(r => r.id === recipeId);
          if (!recipe) continue;
          if (fresh.levelIndex < recipe.minLevel) continue;
          const enough = Object.entries(recipe.cost).every(([m, n]: any) => (fresh.materials[m] || 0) >= n);
          if (!enough) continue;
          // 消耗
          const newMats = { ...fresh.materials };
          for (const [m, n] of Object.entries(recipe.cost)) newMats[m] = (newMats[m] || 0) - (n as number);
          newMats[recipe.id] = (newMats[recipe.id] || 0) + 1;
          set({ materials: newMats });
          actions -= 1;
          pushLog(`炼制【${recipe.name}】成功 ×1`);
          stop = false;
          if (actions < 1) break;
        }
      }
    }

    // —— 5. 自动炼器 ——
    if (actions >= 1 && cfg.craftingQueue.length > 0) {
      let stop = false;
      while (actions >= 1 && !stop) {
        stop = true;
        const fresh = get();
        for (const recipeId of fresh.puppetAutomation.craftingQueue) {
          const recipe = ALL_ARTIFACTS.find(r => r.id === recipeId);
          if (!recipe) continue;
          if (fresh.levelIndex < recipe.minLevel) continue;
          const enough = Object.entries(recipe.cost).every(([m, n]: any) => (fresh.materials[m] || 0) >= n);
          if (!enough) continue;
          const newMats = { ...fresh.materials };
          for (const [m, n] of Object.entries(recipe.cost)) newMats[m] = (newMats[m] || 0) - (n as number);
          set({
            materials: newMats,
            inventory: [...fresh.inventory, recipe.id],
          });
          actions -= 1;
          pushLog(`炼器【${recipe.name}】成功`);
          stop = false;
          if (actions < 1) break;
        }
      }
    }

    // —— 6. 写回 actions / lastTick / 日志 ——
    const final = get();
    const newLogList = [...logs, ...final.puppetActivityLog].slice(0, 8);
    set({
      puppetActions: actions,
      puppetLastTickAt: now,
      puppetActivityLog: newLogList,
    });
  },

  // 给定 puppet type id 返回 power（兼容老组件）
  getPuppetTypePower: (typeId: string) => PUPPET_TYPES_DATA.find(t => t.id === typeId)?.power || 10,
});
