/**
 * SweepSafe App Store screenshots (1290×2796, 6.9"). Captures REAL app screens
 * in demo mode (Pro unlocked, synthetic sensor data) and frames them as bold,
 * conversion-focused marketing cards in the dark "security console" style.
 *
 * Run: python3 -m http.server 8124 &  then
 *      PLAYWRIGHT_BROWSERS_PATH=... node scripts/gen-promo.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:8124';
mkdirSync('store-assets', { recursive: true });
const b64 = (p) => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const FONT = "'SF Pro Text', system-ui, -apple-system, 'Segoe UI', sans-serif";

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

async function appShot(route, out, settleMs = 900) {
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, permissions: ['camera'] });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('sweepsafe.v1', JSON.stringify({ entitled: true, plan: 'lifetime', settings: { sound: true, haptics: true, reducedMotion: true }, sweeps: { arrival: { wifi: true, lights: true } }, findings: [] })));
  await page.goto(`${BASE}/index.html${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(settleMs);
  await page.screenshot({ path: out });
  await ctx.close();
  console.log('  📱', out);
}

async function compose(out, html) {
  const page = await browser.newPage({ viewport: { width: 1290, height: 2796 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out });
  await page.close();
  console.log('  🎨', out);
}

function card({ grad, headline, sub, shot, badge }) {
  return `
  <style>
    html,body{margin:0;width:1290px;height:2796px;overflow:hidden}
    body{background:${grad};font-family:${FONT};position:relative}
    .badge{position:absolute;top:70px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.12);border:2px solid rgba(34,211,238,.5);color:#a5f3fc;font-weight:800;font-size:38px;border-radius:999px;padding:13px 40px;letter-spacing:.02em}
    h1{position:absolute;top:200px;left:0;right:0;text-align:center;color:#fff;font-size:122px;font-weight:900;letter-spacing:-3px;line-height:1.02;margin:0;padding:0 70px;text-shadow:0 8px 34px rgba(0,0,0,.5)}
    p{position:absolute;top:560px;left:0;right:0;text-align:center;color:#9fb0cf;font-size:50px;font-weight:600;margin:0;padding:0 60px}
    .ph{position:absolute;top:720px;left:50%;transform:translateX(-50%);width:1010px;border-radius:62px;border:14px solid rgba(255,255,255,.14);box-shadow:0 50px 130px rgba(0,0,0,.6)}
  </style>
  <div class="badge">${badge}</div>
  <h1>${headline}</h1><p>${sub}</p>
  <img class="ph" src="${shot}"/>`;
}

console.log('▶ Capturing app screens (demo mode)');
await appShot('?demo=1#/scan', 'store-assets/raw-scan.png', 1200);
await appShot('?demo=1#/tool/tracker', 'store-assets/raw-tracker.png', 2600);
await appShot('?demo=1#/tool/magnetometer', 'store-assets/raw-mag.png', 2600);
await appShot('?demo=1#/sweep/arrival', 'store-assets/raw-sweep.png', 700);
await appShot('?demo=1#/home', 'store-assets/raw-home.png', 700);

console.log('▶ Composing cards');
const CARDS = [
  { out: 'store-assets/appstore-1.png', grad: 'linear-gradient(165deg,#0e7490,#0b1220 60%)', badge: '🛡️ SweepSafe', headline: 'FIND HIDDEN<br/>CAMERAS', sub: 'Lens-glint + infrared scanner', shot: b64('store-assets/raw-scan.png') },
  { out: 'store-assets/appstore-2.png', grad: 'linear-gradient(165deg,#155e75,#0b1220 60%)', badge: '🛡️ SweepSafe', headline: 'DETECT HIDDEN<br/>TRACKERS', sub: 'AirTag · Tile · SmartTag radar', shot: b64('store-assets/raw-tracker.png') },
  { out: 'store-assets/appstore-3.png', grad: 'linear-gradient(165deg,#3730a3,#0b1220 60%)', badge: '🛡️ SweepSafe', headline: 'SCAN FOR<br/>BUGGED TECH', sub: 'Magnetic-field detector', shot: b64('store-assets/raw-mag.png') },
  { out: 'store-assets/appstore-4.png', grad: 'linear-gradient(165deg,#0f766e,#0b1220 60%)', badge: '🛡️ SweepSafe', headline: '5-MINUTE<br/>PRIVACY SWEEP', sub: 'Run it before you unpack', shot: b64('store-assets/raw-sweep.png') },
  { out: 'store-assets/appstore-5.png', grad: 'linear-gradient(165deg,#0891b2,#0b1220 62%)', badge: '🛡️ SweepSafe', headline: 'STAY IN<br/>ANY ROOM', sub: 'Airbnb · hotel · rental peace of mind', shot: b64('store-assets/raw-home.png') },
];
for (const c of CARDS) await compose(c.out, card(c));

await browser.close();
console.log('🏁 SweepSafe store screenshots in store-assets/');
