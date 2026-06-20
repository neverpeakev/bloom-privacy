/**
 * Generates App Store / marketing promo images for WorldCopa.
 *
 * Takes live phone-sized screenshots of the running app (with a seeded,
 * rich progress state so screens look alive), then composes them into
 * 1284×2778 App Store screenshot cards and a 1200×630 social OG image.
 *
 * Run: python3 -m http.server 8123 &  then
 *      PLAYWRIGHT_BROWSERS_PATH=... node scripts/gen-promo.mjs
 * Outputs → store-assets/
 */

import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:8123';
mkdirSync('store-assets', { recursive: true });

// Rich demo state: pro plan, streaks, badges, stamps, finished + in-progress flags
const SEED_STATE = {
  createdAt: Date.now() - 5 * 86400000,
  plan: 'monthly',
  trialStartedAt: null,
  stars: 248,
  streak: { count: 5, lastDay: null },
  coloring: {
    FRA: { completed: true, fills: {}, mistakes: 0 },
    MEX: { completed: true, fills: {}, mistakes: 0 },
    ARG: { completed: true, fills: {}, mistakes: 1 },
    JPN: { completed: true, fills: {}, mistakes: 0 },
    GER: { completed: true, fills: {}, mistakes: 0 },
    BRA: { completed: false, fills: { r0: '#009739', r1: '#fedd00' }, mistakes: 0 },
    ESP: { completed: true, fills: {}, mistakes: 0 },
    ENG: { completed: true, fills: {}, mistakes: 2 },
    CAN: { completed: true, fills: {}, mistakes: 0 },
    USA: { completed: true, fills: {}, mistakes: 1 },
  },
  trivia: { played: 9, correct: 31, bestRun: 5, perfect: true },
  flagmatch: { played: 6, best: 9 },
  continents: { played: 4, best: 11 },
  daily: {},
  badges: ['first-flag', 'five-flags', 'perfect-quiz', 'quiz-10', 'sharp-eye', 'globe-trotter', 'streak-3', 'stamps-12'],
  stamps: ['FRA', 'MEX', 'ARG', 'JPN', 'GER', 'BRA', 'ESP', 'ENG', 'CAN', 'USA', 'MAR', 'GHA', 'KOR', 'NED', 'POR', 'COL'],
  settings: { sound: true, reducedMotion: true, guided: true },
  matchdayDone: {},
};

const browser = await chromium.launch();

async function appShot(route, out, { actions = null } = {}) {
  const page = await browser.newPage({
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
  });
  await page.addInitScript((state) => {
    localStorage.setItem('flagexplorer.v1', JSON.stringify(state));
  }, SEED_STATE);
  await page.goto(`${BASE}/index.html${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(450);
  if (actions) await actions(page);
  await page.screenshot({ path: out });
  await page.close();
  console.log(`  📱 ${out}`);
}

const b64 = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');

async function compose({ out, w, h, html }) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out });
  await page.close();
  console.log(`  🎨 ${out}`);
}

const FONT = `'Segoe UI', system-ui, -apple-system, sans-serif`;

function card({ grad, headline, sub, shot, tilt = -3, emojis = [] }) {
  const floats = emojis
    .map(
      (e, i) => `<span class="float" style="left:${8 + i * 22}%;top:${6 + (i % 3) * 4}%;
        font-size:${86 + (i % 2) * 30}px;transform:rotate(${-14 + i * 9}deg)">${e}</span>`,
    )
    .join('');
  return `
  <style>
    html,body{margin:0;width:100%;height:100%;overflow:hidden}
    body{background:${grad};font-family:${FONT};position:relative}
    .float{position:absolute;opacity:.5;filter:drop-shadow(0 6px 14px rgba(0,0,0,.25))}
    .head{position:relative;text-align:center;padding-top:130px;z-index:2}
    h1{color:#fff;font-size:118px;font-weight:900;letter-spacing:-3px;margin:0;
       text-shadow:0 8px 30px rgba(0,0,0,.3);line-height:1.05}
    p{color:rgba(255,255,255,.92);font-size:52px;font-weight:700;margin:26px 0 0}
    .shotwrap{position:absolute;left:50%;bottom:-110px;transform:translateX(-50%) rotate(${tilt}deg);z-index:1}
    img.shot{width:1020px;border-radius:64px;border:14px solid rgba(255,255,255,.32);
       box-shadow:0 60px 140px rgba(0,0,0,.45)}
    .badge{position:absolute;top:54px;left:50%;transform:translateX(-50%);
       background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);
       color:#fff;font-weight:800;font-size:38px;border-radius:999px;padding:12px 38px;z-index:3}
  </style>
  <span class="badge">🏆 WorldCopa</span>
  ${floats}
  <div class="head"><h1>${headline}</h1><p>${sub}</p></div>
  <div class="shotwrap"><img class="shot" src="${shot}"/></div>`;
}

// ── 1. Raw app screenshots (phone) ─────────────────────────────────────
console.log('▶ Capturing app screens');
await appShot('#/home', 'store-assets/raw-home.png');
await appShot('#/color/BRA', 'store-assets/raw-studio.png');
await appShot('#/flagmatch', 'store-assets/raw-flagmatch.png', {
  actions: async (page) => page.waitForSelector('.flagmatch-flag svg'),
});
await appShot('#/worldcup', 'store-assets/raw-worldcup.png');
await appShot('#/passport', 'store-assets/raw-passport.png');
await appShot('#/color', 'store-assets/raw-gallery.png');

// ── 2. App Store screenshot cards (1284×2778) ──────────────────────────
console.log('▶ Composing App Store cards');
const cards = [
  {
    out: 'store-assets/appstore-1-color.png',
    grad: 'linear-gradient(165deg,#4f46e5,#7c3aed 55%,#c026d3)',
    headline: 'COLOR EVERY<br/>TEAM FLAG',
    sub: 'All 48 national flags ⚽🎨',
    shot: b64('store-assets/raw-studio.png'),
    tilt: -3,
    emojis: ['🎨', '🖌️', '🇧🇷', '✨'],
  },
  {
    out: 'store-assets/appstore-2-flagmatch.png',
    grad: 'linear-gradient(165deg,#f59e0b,#ef4444 60%,#be123c)',
    headline: "LEARNING THEY'LL<br/>BEG TO DO",
    sub: 'Geography that feels like a game',
    shot: b64('store-assets/raw-home.png'),
    tilt: 3,
    emojis: ['🔥', '🔎', '⚡', '🏁'],
  },
  {
    out: 'store-assets/appstore-3-schedule.png',
    grad: 'linear-gradient(165deg,#059669,#0d9488 55%,#0369a1)',
    headline: 'BEAT THE<br/>FLAG-MATCH CLOCK',
    sub: 'Fast, fun, a little addictive ⏱️',
    shot: b64('store-assets/raw-flagmatch.png'),
    tilt: -3,
    emojis: ['⚽', '🏟️', '📅', '🌎'],
  },
  {
    out: 'store-assets/appstore-4-passport.png',
    grad: 'linear-gradient(165deg,#db2777,#9333ea 60%,#4f46e5)',
    headline: 'THE REAL<br/>TOURNAMENT',
    sub: 'All 104 matches, groups & more',
    shot: b64('store-assets/raw-worldcup.png'),
    tilt: 3,
    emojis: ['🛂', '🏅', '🔥', '⭐'],
  },
  {
    out: 'store-assets/appstore-5-learn.png',
    grad: 'linear-gradient(165deg,#0ea5e9,#2563eb 55%,#4f46e5)',
    headline: 'BADGES, STREAKS<br/>& STAMPS',
    sub: 'Keeps kids coming back 🏆',
    shot: b64('store-assets/raw-passport.png'),
    tilt: -3,
    emojis: ['🧠', '🌍', '🎮', '🥇'],
  },
];
for (const c of cards) await compose({ out: c.out, w: 1290, h: 2796, html: card(c) });

// ── 3. Social OG image (1200×630) ──────────────────────────────────────
console.log('▶ Composing OG image');
const icon = 'data:image/svg+xml;base64,' + readFileSync('assets/icon.svg').toString('base64');
await compose({
  out: 'store-assets/og.png',
  w: 1200,
  h: 630,
  html: `
  <style>
    html,body{margin:0;width:100%;height:100%;overflow:hidden}
    body{background:linear-gradient(135deg,#4f46e5,#7c3aed 55%,#c026d3);
         font-family:${FONT};display:flex;align-items:center;padding:0 70px;position:relative}
    .left{z-index:2;max-width:600px}
    img.icon{width:150px;border-radius:34px;box-shadow:0 18px 50px rgba(0,0,0,.35)}
    h1{color:#fff;font-size:88px;font-weight:900;letter-spacing:-2px;margin:24px 0 10px}
    h1 .copa{background:linear-gradient(135deg,#fde68a,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent}
    p{color:#e0e7ff;font-size:36px;font-weight:700;margin:0}
    .shots{position:absolute;right:-40px;top:50%;transform:translateY(-50%) rotate(6deg);display:flex;gap:26px;z-index:1}
    .shots img{width:240px;border-radius:30px;border:6px solid rgba(255,255,255,.3);box-shadow:0 30px 70px rgba(0,0,0,.4)}
    .shots img:nth-child(2){margin-top:70px}
  </style>
  <div class="left">
    <img class="icon" src="${icon}"/>
    <h1>World<span class="copa">Copa</span></h1>
    <p>Color the Cup. Learn the World. ⚽🎨<br/>48 flags · trivia · geography for kids</p>
  </div>
  <div class="shots">
    <img src="${b64('store-assets/raw-studio.png')}"/>
    <img src="${b64('store-assets/raw-worldcup.png')}"/>
  </div>`,
});

await browser.close();
console.log('🏁 Promo assets generated into store-assets/');
