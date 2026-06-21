import { chromium } from 'playwright';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:8123';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1100, height: 800 } });
await page.goto(BASE + '/index.html#/color/BRA', { waitUntil: 'networkidle' });
await page.click('[data-mode-btn="brush"]').catch(() => {});
await page.waitForSelector('.paint-canvas');
await page.uncheck('[data-guided]');
const box = await page.locator('.paint-canvas').boundingBox();
const P = (sx, sy) => [box.x + (sx / 300) * box.width, box.y + (sy / 200) * box.height];
async function scribble(svgPts) {
  const [x0, y0] = P(...svgPts[0]);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (const p of svgPts.slice(1)) { const [x, y] = P(...p); await page.mouse.move(x, y, { steps: 6 }); }
  await page.mouse.up();
}
async function pick(hex) {
  await page.evaluate((c) => {
    const i = document.querySelector('[data-custom]');
    i.value = c; i.dispatchEvent(new Event('input', { bubbles: true }));
  }, hex);
}
// green background (scribble the left + right green areas, staying off-centre)
await pick('#009739');
for (let y = 16; y <= 184; y += 12) await scribble([[8, y], [60, y]]);
for (let y = 16; y <= 184; y += 12) await scribble([[240, y], [292, y]]);
// yellow diamond
await pick('#fedd00');
for (let y = 70; y <= 130; y += 8) await scribble([[110, y], [190, y]]);
// blue globe
await pick('#012169');
for (let y = 80; y <= 120; y += 7) await scribble([[120, y], [180, y]]);
await page.screenshot({ path: 'store-assets/brush-demo.png', clip: { x: 16, y: 96, width: 760, height: 560 } });
await b.close();
console.log('wrote store-assets/brush-demo.png');
