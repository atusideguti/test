const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [ver, mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + __dirname + '/index.html?v=' + ver);
  await page.waitForFunction('window.READY===true', null, { timeout: 30000 });
  const el = await page.$('#c');
  if (mode === 'still') {
    fs.mkdirSync('stills_' + ver, { recursive: true });
    for (const s of rest) {
      const t = parseFloat(s);
      await page.evaluate(t => renderAt(t), t);
      await el.screenshot({ path: `stills_${ver}/t${t.toFixed(2)}.png` });
    }
  } else {
    const [w, nw] = rest.map(Number); const dir = 'frames_' + ver; fs.mkdirSync(dir, { recursive: true });
    for (let f = w; f < 1800; f += nw) {
      await page.evaluate(t => renderAt(t), f / 30);
      await el.screenshot({ path: `${dir}/${String(f).padStart(5, '0')}.png`, type: 'png' });
    }
  }
  await browser.close();
})();
