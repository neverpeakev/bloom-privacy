import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const svg = readFileSync('assets/icon.svg', 'utf8');
const html = `<!doctype html><html><body style="margin:0;background:#8b93a7;display:flex;gap:28px;align-items:center;justify-content:center;height:300px">
  <div style="width:180px;height:180px">${svg}</div>
  <div style="width:84px;height:84px">${svg}</div>
  <div style="width:48px;height:48px">${svg}</div>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 560, height: 300, deviceScaleFactor: 3 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.screenshot({ path: 'store-assets/icon-preview.png' });
await b.close();
console.log('wrote store-assets/icon-preview.png');
