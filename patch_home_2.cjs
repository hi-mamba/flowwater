const fs = require('fs');
const path = './src/pages/Home.tsx';

let content = fs.readFileSync(path, 'utf8');

// Fix claimCompanionEvent
content = content.replace(
  /const res = useStore\.getState\(\)\.claimCompanionEvent\(\);\s*setToastMessage\(res\.message\);/g,
  `const res = useStore.getState().claimCompanionEvent?.();
                if (res && res.message) setToastMessage(res.message);`
);

// Fix interactWithNpc
content = content.replace(
  /const result = useStore\.getState\(\)\.interactWithNpc\(npc\.id, 'chat'\);\s*setToastMessage\(result\.message\);/g,
  `const result = useStore.getState().interactWithNpc?.(npc.id, 'chat');
                              if (result && result.message) setToastMessage(result.message);`
);

content = content.replace(
  /const result = useStore\.getState\(\)\.interactWithNpc\(npc\.id, 'gift'\);\s*setToastMessage\(result\.message\);/g,
  `const result = useStore.getState().interactWithNpc?.(npc.id, 'gift');
                              if (result && result.message) setToastMessage(result.message);`
);

content = content.replace(
  /const result = useStore\.getState\(\)\.interactWithNpc\(npc\.id, 'spar'\);\s*setToastMessage\(result\.message\);/g,
  `const result = useStore.getState().interactWithNpc?.(npc.id, 'spar');
                              if (result && result.message) setToastMessage(result.message);`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch Home.tsx 2 complete.');
