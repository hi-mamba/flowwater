const fs = require('fs');
const path = './src/pages/Home.tsx';

let content = fs.readFileSync(path, 'utf8');

// Fix 1: Argument of type '"members"' is not assignable to parameter of type 'SetStateAction<"quests" | "ranking" | "competition" | "sectWar" | "hall">'.
content = content.replace(
  /const \[activeQuestTab, setActiveQuestTab\] = useState<'quests' \| 'ranking' \| 'competition' \| 'sectWar' \| 'hall'>\('quests'\);/,
  `const [activeQuestTab, setActiveQuestTab] = useState<'quests' | 'ranking' | 'competition' | 'sectWar' | 'hall' | 'members'>('quests');`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patch Home.tsx complete.');
