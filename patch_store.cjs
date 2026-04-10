const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Add message to Log
content = content.replace(
  /export interface Log \{([\s\S]*?)\}/,
  `export interface Log {$1  message?: string;\n}`
);

// 2. Add favorability and relationship to SectNpc
content = content.replace(
  /export interface SectNpc \{([\s\S]*?)\}/,
  `export interface SectNpc {$1  favorability?: number;\n  relationship?: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'enemy';\n}`
);

// 3. Add LIFE_STAGES
if (!content.includes('export const LIFE_STAGES')) {
  content = content.replace(
    /export const CULTIVATION_LEVELS/,
    `export const LIFE_STAGES = [
  { id: 'mortal', name: '凡人界', description: '初入江湖，凡人求仙。' },
  { id: 'tiannan', name: '天南', description: '修仙界初露锋芒。' },
  { id: 'luanxinghai', name: '乱星海', description: '海外修真，危机四伏。' },
  { id: 'dajin', name: '大晋', description: '修仙圣地，强者如云。' },
  { id: 'lingjie', name: '灵界', description: '飞升灵界，万族林立。' },
  { id: 'xianjie', name: '仙界', description: '登临仙界，追求大道。' }
];

export const CULTIVATION_LEVELS`
  );
}

// 4. Add missing properties to AppState
content = content.replace(
  /interface AppState \{/,
  `interface AppState {
  currentStageId?: string;
  palmBottleLiquid?: number;
  bottleSpiritUnlocked?: boolean;
  usePalmBottleLiquid?: (amount: number) => void;
  cultivationMode?: 'normal' | 'closed' | 'breakthrough';
  foundationDamaged?: boolean;
  companionDailyEvent?: any;
  claimCompanionEvent?: () => void;
  interactWithNpc?: (npcId: string, action: 'chat' | 'gift' | 'spar') => void;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch complete.');
