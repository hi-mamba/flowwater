const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix usePalmBottleLiquid return type
content = content.replace(
  /usePalmBottleLiquid\?: \(amount: number\) => void;/,
  `usePalmBottleLiquid?: (amount: number) => { success: boolean; message: string };`
);

// Fix claimCompanionEvent return type
content = content.replace(
  /claimCompanionEvent\?: \(\) => void;/,
  `claimCompanionEvent?: () => { message: string };`
);

// Fix interactWithNpc return type
content = content.replace(
  /interactWithNpc\?: \(npcId: string, action: 'chat' \| 'gift' \| 'spar'\) => void;/,
  `interactWithNpc?: (npcId: string, action: 'chat' | 'gift' | 'spar') => { message: string };`
);

// Fix cultivationMode type
content = content.replace(
  /cultivationMode\?: 'normal' \| 'closed' \| 'breakthrough';/,
  `cultivationMode?: 'normal' | 'closed' | 'breakthrough' | 'safe' | 'risky';`
);

// Fix relationship type
content = content.replace(
  /relationship\?: 'stranger' \| 'acquaintance' \| 'friend' \| 'close' \| 'enemy';/,
  `relationship?: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'enemy' | 'close_friend';`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch 2 complete.');
