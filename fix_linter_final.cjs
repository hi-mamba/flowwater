const fs = require('fs');

let content = fs.readFileSync('./src/store.ts', 'utf8');

// Fix pendingStreakRescue type
content = content.replace(/pendingStreakRescue: boolean;/g, 'pendingStreakRescue: number | null;');

// Fix 'water' as any as const
content = content.replace(/type: 'water' as any as const/g, "type: 'water' as any");

// Remove duplicate companionDailyEvent
const parts = content.split('companionDailyEvent: (...args: any[]) => any;');
if (parts.length > 2) {
  content = parts[0] + 'companionDailyEvent: (...args: any[]) => any;' + parts.slice(1).join('');
}

fs.writeFileSync('./src/store.ts', content, 'utf8');
console.log('Fixed remaining linter errors');
