/** SweepSafe E2E smoke test (headless Chromium, fake camera). Fails on console errors. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:8124';
const SHOTS = '.screenshots';
mkdirSync(SHOTS, { recursive: true });
const errors = [];
let step = 0;
const shot = async (p, n) => { step++; await p.screenshot({ path: `${SHOTS}/${String(step).padStart(2, '0')}-${n}.png` }); console.log('  📸', n); };
const check = (c, m) => { if (!c) throw new Error('ASSERT: ' + m); console.log('  ✅', m); };

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await browser.newContext({ viewport: { width: 430, height: 880 }, permissions: ['camera'] });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

try {
  console.log('▶ Home');
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  check((await page.title()).includes('SweepSafe'), 'title set');
  check(await page.locator('.hero-title').isVisible(), 'hero renders');
  check((await page.locator('.bottom-nav .nav-item').count()) === 5, '5 nav items');
  check((await page.locator('.tool').count()) === 4, '4 detection tools');
  await shot(page, 'home');

  console.log('▶ Guided sweep');
  await page.goto(BASE + '/index.html#/sweep/arrival', { waitUntil: 'networkidle' });
  await page.waitForSelector('.step');
  const steps = await page.locator('.step').count();
  check(steps >= 5, `arrival sweep has ${steps} steps`);
  await page.locator('.step .step-check').first().click();
  check((await page.locator('.step.done').count()) === 1, 'checking a step marks it done');
  await shot(page, 'sweep');

  console.log('▶ Learn');
  await page.goto(BASE + '/index.html#/learn', { waitUntil: 'networkidle' });
  check((await page.locator('details.card').count()) >= 5, 'learn articles render');

  console.log('▶ Sensors (native-gated)');
  await page.goto(BASE + '/index.html#/sensors', { waitUntil: 'networkidle' });
  check((await page.locator('.card').count()) >= 3, 'three sensor tools listed');
  await shot(page, 'sensors');

  console.log('▶ Premium (web)');
  await page.goto(BASE + '/index.html#/premium', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-trial]');
  check(true, 'paywall renders with trial');
  await shot(page, 'premium');

  console.log('▶ Camera scanner');
  await page.goto(BASE + '/index.html#/scan', { waitUntil: 'networkidle' });
  await page.waitForSelector('.scanner-video', { timeout: 5000 });
  check(await page.locator('.scanner-reticle').isVisible(), 'scanner overlay shows');
  await page.locator('[data-mode="ir"]').click();
  check(await page.locator('.scanner-video.fx-ir').count() === 1, 'IR mode switches filter');
  await page.locator('[data-found]').click();
  await shot(page, 'scanner');
  console.log('▶ Magnetometer (demo data)');
  await page.goto(BASE + '/index.html?demo=1#/tool/magnetometer', { waitUntil: 'networkidle' });
  await page.waitForSelector('.meter-value');
  await page.waitForFunction(() => { const v = document.querySelector('.meter-value'); return v && v.textContent && v.textContent !== '––'; }, { timeout: 6000 });
  check(true, 'magnetometer meter shows live readings');
  await shot(page, 'magnetometer');

  console.log('▶ Tracker radar (demo data)');
  await page.goto(BASE + '/index.html?demo=1#/tool/tracker', { waitUntil: 'networkidle' });
  await page.waitForSelector('.signal-row', { timeout: 6000 });
  await page.waitForFunction(() => document.querySelectorAll('.signal-flag').length > 0, { timeout: 6000 });
  check((await page.locator('.signal-flag').count()) >= 1, 'tracker radar flags a possible tracker');
  await shot(page, 'tracker');

  console.log('▶ Full Sweep flow (demo data)');
  await page.goto(BASE + '/index.html?demo=1#/fullsweep', { waitUntil: 'networkidle' });
  await page.locator('[data-next]').click();                 // Begin → camera
  await page.waitForSelector('[data-vid], .notice');
  await page.locator('[data-next]').click();                 // Done scanning → tracker
  await page.waitForTimeout(1600);
  await page.locator('[data-next]').click();                 // → magnet
  await page.waitForTimeout(800);
  await page.locator('[data-next]').click();                 // → checklist
  await page.locator('[data-next]').click();                 // → results
  await page.waitForFunction(() => /complete|attention/i.test(document.querySelector('.page-head h1')?.textContent || ''), { timeout: 6000 });
  check(true, 'Full Sweep reaches the results screen');
  await shot(page, 'fullsweep-results');

  console.log('▶ Findings log');
  await page.goto(BASE + '/index.html#/more', { waitUntil: 'networkidle' });
  check((await page.locator('.signal-row').count()) >= 1, 'logged finding appears in More');

  if (errors.length) { console.error('💥 console/page errors:\n' + errors.join('\n')); process.exit(1); }
  console.log('\n🏁 SweepSafe E2E PASSED — no console errors.');
} catch (e) {
  console.error('💥 FAILED:', e.message);
  if (errors.length) console.error(errors.join('\n'));
  try { await shot(page, 'FAILURE'); } catch {}
  process.exit(1);
} finally { await browser.close(); }
