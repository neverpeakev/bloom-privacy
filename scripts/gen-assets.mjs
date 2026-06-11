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
    img{width:560px;height:560px;border-radius:120px;box-shadow:0 40px 120px rgba(0,0,0,.25)}
    h1{font-family:'Segoe UI',system-ui,sans-serif;font-size:84px;letter-spacing:-2px;margin:60px 0 0;color:#fff}
    h1 .y{background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#7c2d12;border-radius:24px;padding:4px 24px;font-size:64px;vertical-align:middle;margin-left:16px}
  </style>
  <div class="wrap">
    <img src="${svgData}" />
    <h1>Flag Explorer<span class="y">2026</span></h1>
  </div>
`;

await shoot({ width: 1024, height: 1024, html: iconHTML, out: 'resources/icon-only.png' });
await shoot({
  width: 2732, height: 2732,
  html: splashHTML('linear-gradient(160deg,#3b82f6,#1d4ed8 60%,#0f2a6b)'),
  out: 'resources/splash.png',
});
await shoot({
  width: 2732, height: 2732,
  html: splashHTML('linear-gradient(160deg,#1e293b,#0f172a)'),
  out: 'resources/splash-dark.png',
});

await browser.close();
console.log('🏁 Store assets generated into resources/');
