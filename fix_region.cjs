const fs = require('fs');

// Fix store.ts
let storeContent = fs.readFileSync('./src/store.ts', 'utf8');
storeContent = storeContent.replace(
  /const sectPower = regionPower\[sect\.region\] \|\| 50000;/,
  `// Infer region from ID or just use a default
        let sectPower = 50000;
        if (sect.id.includes('qixuan') || sect.id.includes('yelang')) sectPower = 10000;
        else if (sect.id.includes('huangfeng') || sect.id.includes('yanyue')) sectPower = 100000;
        else if (sect.id.includes('xinggong') || sect.id.includes('nixing')) sectPower = 500000;
        else if (sect.id.includes('yinluo') || sect.id.includes('xiaoji')) sectPower = 2000000;
        else if (sect.id.includes('tianyuan') || sect.id.includes('jiuyuan')) sectPower = 10000000;
        else sectPower = 500000;`
);
fs.writeFileSync('./src/store.ts', storeContent, 'utf8');

// Fix Home.tsx
let homeContent = fs.readFileSync('./src/pages/Home.tsx', 'utf8');
homeContent = homeContent.replace(
  /<span className="text-\[10px\] px-2 py-0\.5 bg-slate-700 rounded-full text-slate-300">\{s\.region\}<\/span>/,
  `<span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">宗门</span>`
);
fs.writeFileSync('./src/pages/Home.tsx', homeContent, 'utf8');

console.log('Fix region complete.');
