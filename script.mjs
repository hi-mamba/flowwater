import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

content = content.replace(/<button /g, '<motion.button whileTap={{ scale: 0.95 }} ');
content = content.replace(/<\/button>/g, '</motion.button>');

// Fix any double motions
content = content.replace(/<motion\.motion\.button whileTap=\{\{ scale: 0\.95 \}\} /g, '<motion.button ');
content = content.replace(/<motion\.motion\.button/g, '<motion.button');
content = content.replace(/<\/motion\.motion\.button>/g, '</motion.button>');

fs.writeFileSync('src/pages/Home.tsx', content);

// Also do it for CharacterSelectionModal
let content2 = fs.readFileSync('src/components/CharacterSelectionModal.tsx', 'utf8');
content2 = content2.replace(/<button /g, '<motion.button whileTap={{ scale: 0.95 }} ');
content2 = content2.replace(/<\/button>/g, '</motion.button>');
content2 = content2.replace(/<motion\.motion\.button whileTap=\{\{ scale: 0\.95 \}\} /g, '<motion.button ');
content2 = content2.replace(/<motion\.motion\.button/g, '<motion.button');
content2 = content2.replace(/<\/motion\.motion\.button>/g, '</motion.button>');
fs.writeFileSync('src/components/CharacterSelectionModal.tsx', content2);
