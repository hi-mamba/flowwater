const fs = require('fs');
const path = './src/store.ts';

let content = fs.readFileSync(path, 'utf8');

// Fix claimCompanionEvent return type
content = content.replace(
  /claimCompanionEvent\?: \(\) => \{ message: string \};/,
  `claimCompanionEvent?: () => { message: string } | void;`
);

// Fix interactWithNpc return type
content = content.replace(
  /interactWithNpc\?: \(npcId: string, action: 'chat' \| 'gift' \| 'spar'\) => \{ message: string \};/,
  `interactWithNpc?: (npcId: string, action: 'chat' | 'gift' | 'spar') => { message: string } | void;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch 4 complete.');
