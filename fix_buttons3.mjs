import fs from 'fs';

function fixFile(file) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<button/g, '<motion.button whileTap={{ scale: 0.95 }}');
    content = content.replace(/<\/button>/g, '</motion.button>');
    
    // Fix double replacements
    content = content.replace(/<motion\.button whileTap=\{\{ scale: 0\.95 \}\} whileTap=\{\{ scale: 0\.95 \}\}/g, '<motion.button whileTap={{ scale: 0.95 }}');
    content = content.replace(/<motion\.motion\.button whileTap=\{\{ scale: 0\.95 \}\}/g, '<motion.button whileTap={{ scale: 0.95 }}');
    content = content.replace(/<motion\.motion\.button/g, '<motion.button');
    content = content.replace(/<\/motion\.motion\.button>/g, '</motion.button>');
    
    fs.writeFileSync(file, content);
  } catch(e) {}
}

const files = [
  'src/pages/Home.tsx',
  'src/components/CharacterSelectionModal.tsx',
  'src/components/ConsultHeavens.tsx',
  'src/components/SectLeaderboard.tsx',
  'src/components/ReminderManager.tsx',
  'src/components/PalmBottleModal.tsx',
  'src/components/MapModal.tsx',
  'src/components/DeathModal.tsx',
  'src/components/CombatAnimation.tsx',
  'src/components/BreakthroughAnimation.tsx',
  'src/components/EncyclopediaModal.tsx',
];

for (const f of files) {
  fixFile(f);
}
