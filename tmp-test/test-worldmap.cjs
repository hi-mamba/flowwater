// Verify the new three-realm world map
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000/';
const OUT = path.resolve(__dirname);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 414, height: 900, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('[pageerror] ' + e.message));

  console.log('▶ Loading', URL);
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Pre-seed localStorage so we skip novice guide & give the user some progress
  await page.evaluate(() => {
    const state = {
      state: {
        isFirstTime: false,
        hasDoneFirstDrink: true,
        levelIndex: 14, // 筑基初期 — 解锁血色禁地、星城等
        currentRegion: '天南',
        playerName: '测试道友',
        spiritualRoot: 'dual',
      },
      version: 1,
    };
    try { localStorage.setItem('flowwater-storage', JSON.stringify(state)); } catch {}
  });
  await page.reload({ waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  // Screenshot 1: collapsed map (fullPage to see whole layout)
  await page.screenshot({ path: path.join(OUT, '01-home-collapsed.png'), fullPage: true });
  console.log('✔ 01-home-collapsed.png saved (fullPage)');

  // Try to dismiss any modal first
  await page.evaluate(() => {
    // Close any "X" buttons in modals
    document.querySelectorAll('button').forEach(b => {
      const aria = b.getAttribute('aria-label') || '';
      const txt = (b.textContent || '').trim();
      if (txt === '关闭' || aria.includes('close')) b.click();
    });
  });
  await new Promise(r => setTimeout(r, 500));
  // Click through novice guide if it appears
  for (let i = 0; i < 5; i++) {
    const clicked = await page.evaluate(() => {
      const candidates = ['接受灵根鉴定', '感谢长老', '开始修仙之旅', '开始修炼', '我知道了', '关闭', '继续'];
      const btns = [...document.querySelectorAll('button')];
      for (const b of btns) {
        const t = (b.textContent || '').trim();
        if (candidates.some(c => t.includes(c))) {
          b.click();
          return t;
        }
      }
      return null;
    });
    if (!clicked) break;
    console.log('  closed novice step:', clicked);
    await new Promise(r => setTimeout(r, 600));
  }
  // Press Escape to close any modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // List top-level visible elements at viewport-top to debug
  const topElements = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (r.width > 100 && r.height > 100 && r.top < 500 && r.top > -10 &&
          (style.position === 'fixed' || style.position === 'absolute') &&
          parseInt(style.zIndex || '0') > 10) {
        results.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 80),
          rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`,
          z: style.zIndex,
        });
      }
    });
    return results.slice(0, 10);
  });
  console.log('▶ Fixed/absolute high-z elements at top:', JSON.stringify(topElements, null, 2));

  // Locate "修仙地图" collapse button - scroll into view first
  const mapHandle = await page.evaluateHandle(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find(b => b.textContent && b.textContent.includes('修仙地图'));
    if (btn) btn.scrollIntoView({behavior: 'instant', block: 'center'});
    return btn;
  });
  const mapButton = mapHandle.asElement();
  if (!mapButton) {
    console.log('✘ 找不到 "修仙地图" 折叠条');
    await browser.close();
    process.exit(2);
  }
  const box = await mapButton.boundingBox();
  console.log('✔ 找到地图折叠条:', box);

  // Click to expand
  await mapButton.click();
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT, '02-map-expanded.png'), fullPage: false });
  console.log('✔ 02-map-expanded.png saved');

  // Find tab buttons by structure (in expanded panel)
  const tabs = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const set = new Set(['人界', '灵界', '仙界']);
    return buttons
      .filter(b => {
        const t = (b.textContent || '').trim();
        return t.length < 30 && [...set].some(n => t.startsWith(n) || t.includes(n));
      })
      .map(b => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent.trim().slice(0, 30), rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, disabled: b.disabled || b.classList.contains('cursor-not-allowed'), visible: r.width > 0 && r.height > 0 };
      })
      .filter(t => t.visible);
  });
  console.log('▶ Tab-like buttons detected:');
  tabs.forEach(t => console.log(`   • ${t.text} ${t.rect} ${t.disabled ? '[locked]' : ''}`));

  // Check locations rendered (icons inside the map zone)
  const locationCount = await page.evaluate(() => {
    // find the 50vh map container
    const mapZone = [...document.querySelectorAll('div')].find(d =>
      d.className && typeof d.className === 'string' &&
      d.className.includes('h-[50vh]') && d.className.includes('overflow-hidden')
    );
    if (!mapZone) return -1;
    return mapZone.querySelectorAll('button').length;
  });
  console.log(`▶ Mortal realm location buttons: ${locationCount}`);

  // Click 灵界 tab (locked at level 0)
  const lingjieClicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => {
      const t = (b.textContent || '').trim();
      return t.includes('灵界') && t.length < 20; // tab button, not "前往" etc
    });
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log('▶ Clicked 灵界 tab:', lingjieClicked);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT, '03-locked-tab-toast.png'), fullPage: false });
  console.log('✔ 03-locked-tab-toast.png saved');

  // Click first unlocked location
  const firstLocClicked = await page.evaluate(() => {
    const mapZone = [...document.querySelectorAll('div')].find(d =>
      d.className && typeof d.className === 'string' &&
      d.className.includes('h-[50vh]') && d.className.includes('overflow-hidden')
    );
    if (!mapZone) return null;
    const buttons = mapZone.querySelectorAll('button');
    for (const b of buttons) {
      // skip the "副本进行中" overlay etc
      if (b.querySelector('svg') && !b.classList.contains('cursor-not-allowed')) {
        b.click();
        return b.textContent.trim().slice(0, 20);
      }
    }
    return null;
  });
  console.log('▶ Clicked location:', firstLocClicked);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, '04-location-modal.png'), fullPage: false });
  console.log('✔ 04-location-modal.png saved');

  console.log('\n=== console errors during run ===');
  if (consoleErrors.length === 0) console.log('  (none)');
  else consoleErrors.slice(0, 20).forEach(e => console.log('  • ' + e));

  await browser.close();
  console.log('\n✓ done');
})().catch(e => { console.error(e); process.exit(1); });
