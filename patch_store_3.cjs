const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix usePalmBottleLiquid param type
content = content.replace(
  /usePalmBottleLiquid\?: \(amount: number\) => \{ success: boolean; message: string \};/,
  `usePalmBottleLiquid?: (type: 'herb' | 'cultivation' | 'foundation') => { success: boolean; message: string };`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch 3 complete.');
