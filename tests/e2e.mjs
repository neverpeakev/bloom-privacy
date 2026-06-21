/**
 * End-to-end smoke test. Drives the real app in headless Chromium:
 * colours a full flag, plays every game, starts the trial through the
 * parent gate and verifies gating flips. Fails on any console error.
 *
 * Run: node tests/e2e.mjs  (requires playwright + a static server on :8123)
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:8123';
const SHOTS = '.screenshots';
mkdirSync(SHOTS, { recursive: true });

const errors = [];
let step = 0;

async function shot(page, name) {
  step++;
  await page.screenshot({ path: `${SHOTS}/${String(step).padStart(2, '0')}-${name}.png`, fullPage: false });
  console.log(`  📸 ${name}`);
}

function check(cond, msg) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  ✅ ${msg}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

try {
  // ── Home ────────────────────────────────────────────────────────────
  console.log('▶ Home');
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
  check((await page.title()).includes('WorldCopa'), 'title set');
  check(await page.locator('.hero-title').isVisible(), 'hero renders');
  check(await page.locator('.bottom-nav .nav-item').count() === 5, '5 nav items');
  await shot(page, 'home');

  // ── Coloring gallery ───────────────────────────────────────────────
  console.log('▶ Coloring gallery');
  await page.click('a[href="#/color"]');
  await page.waitForSelector('.flag-grid');
  const tiles = await page.locator('.flag-tile').count();
  check(tiles === 48, `gallery shows all 48 flags (got ${tiles})`);
  const locked = await page.locator('.flag-tile.locked').count();
  check(locked === 36, `36 flags locked on free tier (got ${locked})`);
  await shot(page, 'gallery');

  // ── Colour France end-to-end (3 regions, guided mode) ──────────────
  console.log('▶ Coloring studio — France');
  await page.goto(BASE + '/index.html#/color/FRA');
  await page.waitForSelector('.paint-canvas');              // brush is the default surface on first visit
  check(await page.locator('.paint-canvas').isVisible(), 'brush canvas is the default colouring surface');
  await page.click('[data-mode-btn="fill"]');               // switch to tap-to-fill for this test
  await page.waitForSelector('.studio-svg');
  const regions = await page.evaluate(async () => {
    const { FLAGS } = await import('./js/flags.js');
    return FLAGS.FRA.regions.map((r) => ({ id: r.id, color: r.color }));
  });
  check(regions.length === 3, 'France has 3 regions');
  await shot(page, 'studio-before');
  for (const r of regions) {
    await page.click(`.swatch[data-color="${r.color}"]`);
    await page.click(`path[data-region="${r.id}"]`, { force: true });
  }
  await page.waitForSelector('.finish-modal', { timeout: 5000 });
  check(true, 'finish modal appears after coloring all regions');
  await shot(page, 'studio-finished');
  const stars1 = await page.evaluate(() => JSON.parse(localStorage.getItem('flagexplorer.v1')).stars);
  check(stars1 >= 20, `stars awarded (${stars1})`);
  await page.keyboard.press('Escape');
  // the delayed "First Masterpiece" badge popup follows the finish modal
  await page.waitForSelector('.badge-award', { timeout: 4000 });
  check(true, 'badge award popup appears');
  await page.keyboard.press('Escape');

  // Wrong colour wobbles & counts a mistake
  console.log('▶ Guided mode mistake handling — Japan');
  await page.goto(BASE + '/index.html#/color/JPN');
  await page.click('[data-mode-btn="fill"]');
  await page.waitForSelector('.studio-svg');
  const jpn = await page.evaluate(async () => {
    const { FLAGS } = await import('./js/flags.js');
    return FLAGS.JPN.regions.map((r) => ({ id: r.id, color: r.color }));
  });
  const wrongColor = await page.evaluate(async () => {
    const sw = [...document.querySelectorAll('.swatch[data-color]')].find(
      (s) => !['#ffffff', '#bc002d'].includes(s.dataset.color),
    );
    return sw?.dataset.color;
  });
  check(!!wrongColor, 'decoy colour exists in palette');
  await page.click(`.swatch[data-color="${wrongColor}"]`);
  await page.click(`path[data-region="${jpn[0].id}"]`, { force: true });
  const mistakes = await page.evaluate(
    () => JSON.parse(localStorage.getItem('flagexplorer.v1')).coloring.JPN.mistakes,
  );
  check(mistakes === 1, 'wrong colour recorded as mistake');

  // ── Brush mode: finger-paint a flag inside the lines ────────────────
  console.log('▶ Brush colouring — Germany');
  await page.goto(BASE + '/index.html#/color/GER');
  await page.click('[data-mode-btn="brush"]');              // prior test persisted fill mode; pick brush
  await page.waitForSelector('.paint-canvas');
  check(await page.locator('.paint-lines svg').count() === 1, 'region outline overlay renders');
  await page.uncheck('[data-guided]');                       // free-paint: any colour completes a region
  const lockedRegions = await page.evaluate(() => {
    window.__paint.fillRegion(0);                            // colour the whole flag via the engine hook
    return window.__paint.lockedCount();
  });
  check(lockedRegions >= 1, `brush coloured and locked regions (${lockedRegions})`);
  await page.waitForSelector('.finish-modal', { timeout: 5000 });
  check(true, 'brush colouring reaches the finish modal');
  await shot(page, 'brush-finished');
  await page.keyboard.press('Escape');

  // ── Trivia round ────────────────────────────────────────────────────
  console.log('▶ Trivia');
  await page.goto(BASE + '/index.html#/trivia');
  for (let i = 0; i < 5; i++) {
    await page.waitForSelector('.quiz-options .btn-option');
    await page.click('.quiz-options .btn-option');
    await page.waitForSelector('[data-next]:not([hidden])');
    if (i === 0) await shot(page, 'trivia-question');
    await page.click('[data-next]');
  }
  await page.waitForSelector('.result-score');
  check(true, 'trivia round completes to results');
  await shot(page, 'trivia-results');

  // ── Flag Match ──────────────────────────────────────────────────────
  console.log('▶ Flag Match');
  await page.goto(BASE + '/index.html#/flagmatch');
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('.quiz-options .btn-option');
    await page.click('.quiz-options .btn-option.right, .quiz-options .btn-option', { timeout: 3000 });
    await page.waitForSelector('[data-next]:not([hidden])');
    if (i === 0) await shot(page, 'flagmatch');
    await page.click('[data-next]');
  }
  await page.waitForSelector('.result-score');
  check(true, 'flag match completes to results');

  // ── Continent Quest ─────────────────────────────────────────────────
  console.log('▶ Continent Quest');
  await page.goto(BASE + '/index.html#/continents');
  for (let i = 0; i < 12; i++) {
    await page.waitForSelector('.btn-continent');
    await page.click('.btn-continent');
    await page.waitForSelector('[data-next]:not([hidden])');
    if (i === 0) await shot(page, 'continents');
    await page.click('[data-next]');
  }
  await page.waitForSelector('.result-score');
  check(true, 'continent quest completes to results');

  // ── Soccer / Teams hub ──────────────────────────────────────────────
  console.log('▶ Soccer hub');
  await page.goto(BASE + '/index.html#/worldcup');
  await page.waitForSelector('.wc-groups');
  check((await page.locator('.wc-group').count()) === 12, '12 group cards');
  check((await page.locator('[data-schedule] .match-row').count()) === 72, '72 group matches listed');
  await page.click('.stage-tab[data-stage="final"]');
  check((await page.locator('[data-schedule] .match-row').count()) === 1, 'final tab shows 1 match');
  await shot(page, 'worldcup');

  // ── Passport ────────────────────────────────────────────────────────
  console.log('▶ Passport');
  await page.goto(BASE + '/index.html#/passport');
  await page.waitForSelector('.stamp-grid');
  const stamped = await page.locator('.stamp.stamped').count();
  check(stamped >= 1, `stamps recorded (${stamped})`);
  const earnedBadges = await page.locator('.shelf-badge.earned').count();
  check(earnedBadges >= 1, `badges earned (${earnedBadges})`);
  await shot(page, 'passport');

  // ── Premium + parent gate + trial ──────────────────────────────────
  console.log('▶ Premium & parent gate');
  await page.goto(BASE + '/index.html#/premium');
  await page.waitForSelector('.plans');
  check((await page.locator('.plan-card').count()) === 3, '3 plan cards');
  await shot(page, 'premium');
  await page.click('[data-trial]');
  await page.waitForSelector('.gate-q');
  const product = await page.evaluate(() => {
    const m = document.querySelector('.gate-q').textContent.match(/(\d+)\s*×\s*(\d+)/);
    return parseInt(m[1], 10) * parseInt(m[2], 10);
  });
  await page.fill('.gate-input', String(product));
  await shot(page, 'parent-gate');
  await page.click('.gate-form button[type="submit"]');
  await page.waitForSelector('.trial-note');
  check(true, 'trial activates after parent gate');
  await page.goto(BASE + '/index.html#/color');
  await page.waitForSelector('.flag-grid');
  const lockedAfter = await page.locator('.flag-tile.locked').count();
  check(lockedAfter === 0, 'all 48 flags unlocked during trial');
  await shot(page, 'gallery-unlocked');

  // ── Grown-ups corner ────────────────────────────────────────────────
  console.log('▶ Grown-ups corner');
  await page.goto(BASE + '/index.html#/grownups');
  await page.waitForSelector('.setting-row');
  await page.click('[data-set="sound"]');
  const sound = await page.evaluate(
    () => JSON.parse(localStorage.getItem('flagexplorer.v1')).settings.sound,
  );
  check(sound === false, 'settings persist');
  await shot(page, 'grownups');

  // ── Mobile viewport sanity ──────────────────────────────────────────
  console.log('▶ Mobile viewport');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/index.html#/home');
  await page.waitForSelector('.hero-title');
  await shot(page, 'mobile-home');
  await page.goto(BASE + '/index.html#/color/BRA');
  await page.click('[data-mode-btn="brush"]');
  await page.waitForSelector('.paint-canvas');
  await shot(page, 'mobile-studio');

  // ── Privacy page ────────────────────────────────────────────────────
  const resp = await page.goto(BASE + '/privacy.html');
  check(resp.ok(), 'privacy page serves');
  check((await page.title()).includes('Privacy'), 'privacy page title');

  if (errors.length) {
    console.error('\n💥 Console/page errors detected:');
    for (const e of errors) console.error('   ' + e);
    process.exit(1);
  }
  console.log('\n🏁 E2E PASSED — no console errors, all flows verified.');
} catch (err) {
  console.error('\n💥 E2E FAILED:', err.message);
  if (errors.length) {
    console.error('Console errors so far:');
    for (const e of errors) console.error('   ' + e);
  }
  try { await shot(page, 'FAILURE'); } catch { /* page may be gone */ }
  process.exit(1);
} finally {
  await browser.close();
}
