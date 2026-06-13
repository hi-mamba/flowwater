// 魔渊系统 / Demon Abyss
// - 全局魔气潮汐：72h 周期 + 24h 开放窗口
// - 副本运行时状态机：narrative → battle → rest → next stage / done
// - 失败仅作废当前节阶之后的 pendingRewards，不扣修为

import type { DemonTideState, DemonAbyssRunState, DemonAbyssDungeonId } from './types';
import { DEMON_ABYSS_DUNGEONS, getDemonAbyssDungeon, getNarrativeNode, getNarrativeChoice } from '../data/demonAbyss';

const CYCLE_MS = 72 * 60 * 60 * 1000;
const OPEN_MS = 24 * 60 * 60 * 1000;
// 周期内的开放区间：[OPEN_OFFSET, OPEN_OFFSET + OPEN_MS)
// 设计：周期前 48h 关 → rising 最后 6h → 后 24h 开 → closing 最后 1h
// 简化：phase 由 (now - startTime) % cycle 直接派生
const RISING_DURATION_MS = 6 * 60 * 60 * 1000;
const CLOSING_DURATION_MS = 1 * 60 * 60 * 1000;

const initialTide: DemonTideState = {
  startTime: 0,             // 0 = 未初始化；首次 get 会回填
  cyclePeriodMs: CYCLE_MS,
  openWindowMs: OPEN_MS,
};

const initialRun: DemonAbyssRunState = {
  active: false,
  dungeonId: null,
  bossId: null,
  stage: 0,
  step: 'idle',
  currentNarrativeId: null,
  narrativeChoiceId: null,
  pendingRewards: { spiritStones: 0, materials: {}, skillPages: 0 },
  history: [],
  startedAt: 0,
  totalClears: 0,
};

export const createDemonAbyssSlice = (set: any, get: any, _store?: any) => ({
  demonTide: initialTide,
  demonAbyssRun: initialRun,

  // 派生：当前所处阶段
  getDemonTidePhase: () => {
    const state = get();
    let { startTime } = state.demonTide;
    if (!startTime) {
      // 首次访问：钉一个起点。让玩家在第一次安装时直接处于 open 阶段，避免空窗劝退。
      startTime = Date.now() - (CYCLE_MS - OPEN_MS);
      set({ demonTide: { ...state.demonTide, startTime } });
    }
    const elapsed = (Date.now() - startTime) % CYCLE_MS;
    // 阶段划分（按周期内偏移）：
    //   [0, CYCLE - OPEN - RISING)  closed
    //   [CYCLE - OPEN - RISING, CYCLE - OPEN)  rising
    //   [CYCLE - OPEN, CYCLE - CLOSING)  open
    //   [CYCLE - CLOSING, CYCLE)  closing
    const openStart = CYCLE_MS - OPEN_MS;
    const risingStart = openStart - RISING_DURATION_MS;
    const closingStart = CYCLE_MS - CLOSING_DURATION_MS;
    let phase: 'closed' | 'rising' | 'open' | 'closing' = 'closed';
    let msToNextChange = 0;
    if (elapsed < risingStart) {
      phase = 'closed';
      msToNextChange = risingStart - elapsed;
    } else if (elapsed < openStart) {
      phase = 'rising';
      msToNextChange = openStart - elapsed;
    } else if (elapsed < closingStart) {
      phase = 'open';
      msToNextChange = closingStart - elapsed;
    } else {
      phase = 'closing';
      msToNextChange = CYCLE_MS - elapsed;
    }
    return { phase, msToNextChange };
  },

  enterDemonAbyss: (dungeonId: DemonAbyssDungeonId) => {
    const state = get();
    if (state.demonAbyssRun.active) {
      return { success: false, message: '已在魔渊之中，请先结算。' };
    }
    const def = getDemonAbyssDungeon(dungeonId);
    if (!def) return { success: false, message: '未知副本。' };
    if (state.levelIndex < def.unlockLevelIndex) {
      return { success: false, message: `修为不足，需达到 ${def.unlockLevelName}。` };
    }
    const { phase } = get().getDemonTidePhase();
    if (phase !== 'open' && phase !== 'closing') {
      return { success: false, message: '魔气未起，下一波尚未开启。' };
    }
    // 抽 BOSS
    const bossId = def.bosses[Math.floor(Math.random() * def.bosses.length)].id;
    set({
      demonAbyssRun: {
        active: true,
        dungeonId,
        bossId,
        stage: 1,
        step: 'narrative',
        currentNarrativeId: null,
        narrativeChoiceId: null,
        pendingRewards: { spiritStones: 0, materials: {}, skillPages: 0 },
        history: [],
        startedAt: Date.now(),
        totalClears: state.demonAbyssRun.totalClears,
      },
    });
    // 立即抽剧情
    get().drawDemonAbyssNarrative();
    return { success: true, message: `踏入【${def.name}】，节阶 1 · 入渊。` };
  },

  drawDemonAbyssNarrative: () => {
    const state = get();
    const run = state.demonAbyssRun;
    if (!run.active || !run.dungeonId) return { success: false, message: '未在副本中。' };
    const def = getDemonAbyssDungeon(run.dungeonId);
    if (!def) return { success: false, message: '副本数据缺失。' };
    const pool = def.narrativePools[run.stage - 1] || [];
    if (pool.length === 0) return { success: false, message: '剧情池为空。' };
    const node = pool[Math.floor(Math.random() * pool.length)];
    set({
      demonAbyssRun: {
        ...run,
        step: 'narrative',
        currentNarrativeId: node.id,
        narrativeChoiceId: null,
      },
    });
    return { success: true, message: '剧情节点已抽取。' };
  },

  resolveDemonAbyssNarrative: (choiceId: string) => {
    const state = get();
    const run = state.demonAbyssRun;
    if (!run.active || !run.currentNarrativeId) return { success: false, message: '无可解析剧情。' };
    const node = getNarrativeNode(run.dungeonId!, run.stage, run.currentNarrativeId);
    if (!node) return { success: false, message: '剧情节点缺失。' };
    const choice = node.choices.find(c => c.id === choiceId);
    if (!choice) return { success: false, message: '选项无效。' };
    set({
      demonAbyssRun: {
        ...run,
        step: 'battle',
        narrativeChoiceId: choiceId,
      },
    });
    return { success: true, message: choice.flavor };
  },

  finishDemonAbyssBattle: (won: boolean, contribution: number) => {
    const state = get();
    const run = state.demonAbyssRun;
    if (!run.active || !run.dungeonId) return { success: false, message: '未在战斗。' };
    const def = getDemonAbyssDungeon(run.dungeonId);
    if (!def) return { success: false, message: '副本数据缺失。' };

    if (!won) {
      // 失败：保留前几节阶 pendingRewards，丢弃当前节阶
      const newHistory = [...run.history, {
        stage: run.stage,
        narrativeId: run.currentNarrativeId || '',
        choiceId: run.narrativeChoiceId || '',
        won: false,
      }];
      // 立即结算已得
      get().__settleDemonAbyssPendingRewards();
      set({
        demonAbyssRun: { ...initialRun, totalClears: run.totalClears, history: newHistory },
      });
      return { success: false, message: `节阶 ${run.stage} 折戟，已得奖励已收入囊中。` };
    }

    // 胜利：累积本节阶基础奖励 + 选项 bonus + contribution 折现
    const baseReward = def.stageRewards[run.stage - 1] || { stones: 0, materials: {}, skillPages: 0 };
    const choice = run.currentNarrativeId
      ? getNarrativeChoice(run.dungeonId, run.stage, run.currentNarrativeId, run.narrativeChoiceId || '')
      : null;
    const bonus = choice?.battleMod.bonusReward || {};

    const stoneGain = baseReward.stones + (bonus.stones || 0) + Math.floor(contribution * 0.5);
    const newMaterials = { ...run.pendingRewards.materials };
    Object.entries(baseReward.materials || {}).forEach(([k, v]) => {
      newMaterials[k] = (newMaterials[k] || 0) + (v as number);
    });
    Object.entries(bonus.materials || {}).forEach(([k, v]) => {
      newMaterials[k] = (newMaterials[k] || 0) + (v as number);
    });
    const newPages = run.pendingRewards.skillPages + (baseReward.skillPages || 0);

    const newPending = {
      spiritStones: run.pendingRewards.spiritStones + stoneGain,
      materials: newMaterials,
      skillPages: newPages,
    };
    const newHistory = [...run.history, {
      stage: run.stage,
      narrativeId: run.currentNarrativeId || '',
      choiceId: run.narrativeChoiceId || '',
      won: true,
    }];

    if (run.stage >= 3) {
      // 通关
      get().__settleDemonAbyssPendingRewardsWith(newPending);
      // 称号
      const titleKey = run.dungeonId === 'demon_abyss_qi' ? '斩魔者' : run.dungeonId === 'demon_abyss_core' ? '诛魔士' : '灭魔尊';
      const newTitles = state.unlockedTitles.includes(titleKey) ? state.unlockedTitles : [...state.unlockedTitles, titleKey];
      set({
        unlockedTitles: newTitles,
        demonAbyssRun: { ...initialRun, totalClears: run.totalClears + 1, history: newHistory },
      });
      return { success: true, message: `渡过魔渊三劫！收获 ${newPending.spiritStones} 灵石、魔功残页 ×${newPending.skillPages}。` };
    }
    // 下一节阶
    set({
      demonAbyssRun: {
        ...run,
        stage: (run.stage + 1) as 1 | 2 | 3,
        step: 'rest',
        currentNarrativeId: null,
        narrativeChoiceId: null,
        pendingRewards: newPending,
        history: newHistory,
      },
    });
    return { success: true, message: `节阶 ${run.stage} 渡过！进入下一节阶。` };
  },

  retreatFromDemonAbyss: () => {
    const state = get();
    const run = state.demonAbyssRun;
    if (!run.active) return { success: false, message: '未在副本中。' };
    get().__settleDemonAbyssPendingRewards();
    set({
      demonAbyssRun: { ...initialRun, totalClears: run.totalClears, history: run.history },
    });
    return { success: true, message: '主动撤出魔渊，奖励已收入囊中。' };
  },

  cancelDemonAbyss: () => {
    const state = get();
    set({ demonAbyssRun: { ...initialRun, totalClears: state.demonAbyssRun.totalClears } });
  },

  // 内部：把 run.pendingRewards 写入正式背包
  __settleDemonAbyssPendingRewards: () => {
    const state = get();
    const p = state.demonAbyssRun.pendingRewards;
    get().__settleDemonAbyssPendingRewardsWith(p);
  },
  __settleDemonAbyssPendingRewardsWith: (p: { spiritStones: number; materials: Record<string, number>; skillPages: number }) => {
    const state = get();
    if (p.spiritStones > 0) get().addSpiritStones(p.spiritStones);
    Object.entries(p.materials).forEach(([id, n]) => {
      if (n > 0) get().addMaterial(id, n);
    });
    if (p.skillPages > 0) {
      const cur = state.materials['demon_skill_page'] || 0;
      const next = cur + p.skillPages;
      const newMaterials = { ...state.materials, demon_skill_page: next };
      // 集齐 5 页：自动兑换魔功
      if (cur < 5 && next >= 5) {
        // skill_demon_blood 加入已学功法
        const skills = state.skills || [];
        if (!skills.includes('skill_demon_blood')) {
          set({ skills: [...skills, 'skill_demon_blood'] });
        }
        newMaterials['demon_skill_page'] = next - 5;
      }
      set({ materials: newMaterials });
    }
  },

  devForceDemonTideOpen: () => {
    // dev 用：把 startTime 调整到让 elapsed 落在 open 区间起点
    const tide = get().demonTide;
    const target = Date.now() - (tide.cyclePeriodMs - tide.openWindowMs);
    set({ demonTide: { ...tide, startTime: target } });
  },
});

export { DEMON_ABYSS_DUNGEONS };
