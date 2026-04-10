const { execSync } = require('child_process');
try {
  execSync('git checkout src/store.ts');
  execSync('git checkout src/pages/Home.tsx');
  console.log('Git checkout successful');
} catch (e) {
  console.error(e.toString());
}
