/**
 * Generates native app store assets (icon + splash PNGs) from the app's
 * SVG branding using headless Chromium.
 *
 * Run: PLAYWRIGHT_BROWSERS_PATH=... node scripts/gen-assets.mjs
 * Outputs: resources/icon-only.png (1024), resources/splash.png (2732),
 *          resources/splash-dark.png (2732)
 */

import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync('resources', { recursive: true });

const svg = readFileSync(resolve('assets/icon.svg'), 'utf8');
const svgData = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

const browser = await chromium.launch();

async function shoot({ width, height, html, out }) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out });
  await page.close();
  console.log(`✅ ${out} (${width}x${height})`);
}

const iconHTML = `
  <style>html,body{margin:0;padding:0}</style>
  <img src="${svgData}" style="width:1024px;height:1024px;display:block" />
`;

const splashHTML = (bg) => `
  <style>
    html,body{margin:0;padding:0;width:100%;height:100%}
    body{display:flex;align-items:center;justify-content:center;background:${bg}}
    .wrap{text-align:center}
    img{width:560px;height:560px;border-radius:120px;box-shadow:0 40px 120px rgba(0,0,0,.35)}
    h1{font-family:'Segoe UI',system-ui,sans-serif;font-size:120px;letter-spacing:-3px;margin:64px 0 0;color:#fff;font-weight:900}
    h1 .copa{background:linear-gradient(135deg,#fde68a,#f59e0b);-webkit-background-clip:text;background-clip:text;color:transparent}
    p{font-family:'Segoe UI',system-ui,sans-serif;font-size:44px;color:#e0e7ff;margin:18px 0 0;font-weight:600;letter-spacing:1px}
  </style>
  <div class="wrap">
    <img src="${svgData}" />
    <h1>World<span class="copa">Copa</span></h1>
    <p>Color the Cup. Learn the World. ⚽🎨</p>
  </div>
`;

await shoot({ width: 1024, height: 1024, html: iconHTML, out: 'resources/icon-only.png' });
await shoot({
  width: 2732, height: 2732,
  html: splashHTML('linear-gradient(160deg,#4f46e5,#7c3aed 55%,#c026d3)'),
  out: 'resources/splash.png',
});
await shoot({
  width: 2732, height: 2732,
  html: splashHTML('linear-gradient(160deg,#1e293b,#0f172a)'),
  out: 'resources/splash-dark.png',
});

await browser.close();
console.log('🏁 Store assets generated into resources/');
