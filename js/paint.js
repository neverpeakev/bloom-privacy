/**
 * Finger/brush colouring engine.
 *
 * Renders a flag's regions onto a <canvas> and lets a child scribble with a
 * finger or mouse. Each stroke is clipped to the region under the pointer, so
 * paint always stays "inside the lines". A coarse coverage grid tracks how much
 * of each region is filled; once a region is mostly coloured it snaps to a clean
 * fill and locks in (recording the dominant colour, which integrates with the
 * existing per-region `fills` save model).
 *
 * Pure maths lives in paint-logic.js (unit-tested); this file is the DOM/canvas
 * glue and is exercised by the Playwright E2E.
 */

import {
  coverageRatio, isRegionComplete, cellIndex, cellsInCircle,
  dominantColor, colorsEqual, interpolatePoints,
} from './paint-logic.js';

const W = 300;          // flag viewBox
const H = 200;
const SS = 3;           // canvas supersample (900×600 backing store)
const CELL = 2.5;       // coverage-grid cell size in SVG units
const GW = W / CELL;    // 120
const GH = H / CELL;    // 80

/**
 * @param {object} o
 * @param {HTMLElement} o.container   stage element to render into
 * @param {object} o.spec            FLAGS[code] (has .regions[{id,name,color,d}])
 * @param {() => {color:string,name:string}} o.getColor  current paint colour
 * @param {() => number} o.getBrush  brush diameter in SVG units
 * @param {() => boolean} o.getErasing
 * @param {() => boolean} o.getGuided
 * @param {(regionId:string,color:string)=>void} o.onLock
 * @param {(regionId:string)=>void} o.onUnlock
 * @param {()=>void} o.onProgress
 * @param {(msg:string)=>void} o.onHint
 * @param {object} o.initialFills     {regionId: color} to pre-paint
 */
export function createBrushStudio(o) {
  const { spec } = o;
  const regions = spec.regions;

  // ── DOM scaffold: white stage, paint canvas, then the "lines" on top ──
  o.container.innerHTML =
    '<div class="paint-wrap">' +
      '<canvas class="paint-canvas" width="' + W * SS + '" height="' + H * SS + '"></canvas>' +
      '<div class="paint-lines" aria-hidden="true">' + linesSVG(regions) + '</div>' +
    '</div>';
  const canvas = o.container.querySelector('.paint-canvas');
  const ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Region paths: SVG-space (hit testing) and SS-scaled (drawing/clipping).
  const hit = document.createElement('canvas');
  hit.width = W; hit.height = H;
  const hctx = hit.getContext('2d');
  const pathSVG = regions.map((r) => new Path2D(r.d));
  const scale = new DOMMatrix([SS, 0, 0, SS, 0, 0]);
  const pathSS = regions.map((r) => {
    const p = new Path2D();
    p.addPath(new Path2D(r.d), scale);
    return p;
  });

  // Coverage grid: which (top-most) region owns each cell.
  const cellRegion = new Int16Array(GW * GH).fill(-1);
  const cellCount = new Array(regions.length).fill(0);
  for (let ri = 0; ri < regions.length; ri++) {
    for (let gy = 0; gy < GH; gy++) {
      for (let gx = 0; gx < GW; gx++) {
        const cx = (gx + 0.5) * CELL;
        const cy = (gy + 0.5) * CELL;
        if (hctx.isPointInPath(pathSVG[ri], cx, cy, 'evenodd')) {
          cellRegion[gy * GW + gx] = ri; // later region wins → matches draw order
        }
      }
    }
  }
  for (let i = 0; i < cellRegion.length; i++) {
    if (cellRegion[i] >= 0) cellCount[cellRegion[i]]++;
  }

  const painted = new Uint8Array(GW * GH);
  const paintedCount = new Array(regions.length).fill(0);
  const colorCounts = regions.map(() => ({}));
  const locked = new Set();

  function snapFill(ri, color) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clip(pathSS[ri], 'evenodd');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W * SS, H * SS);
    ctx.restore();
  }

  // Pre-paint saved progress so re-opening shows the coloured flag.
  for (let ri = 0; ri < regions.length; ri++) {
    const c = o.initialFills?.[regions[ri].id];
    if (c) {
      snapFill(ri, c);
      paintedCount[ri] = cellCount[ri];
      colorCounts[ri][c] = 1;
      locked.add(regions[ri].id);
    }
  }

  function markCell(ci, ri, color, erasing) {
    if (cellRegion[ci] !== ri) return;
    if (erasing) {
      if (painted[ci]) { painted[ci] = 0; paintedCount[ri]--; }
    } else if (!painted[ci]) {
      painted[ci] = 1; paintedCount[ri]++;
      colorCounts[ri][color] = (colorCounts[ri][color] || 0) + 1;
    }
  }

  const UNLOCK_FLOOR = 0.6; // hysteresis so a stray erase doesn't instantly unlock

  function evaluate(ri) {
    const region = regions[ri];
    const ratio = coverageRatio(paintedCount[ri], cellCount[ri]);
    if (!locked.has(region.id)) {
      if (isRegionComplete(ratio)) {
        const dom = dominantColor(colorCounts[ri]) || o.getColor().color;
        if (o.getGuided() && !colorsEqual(dom, region.color)) {
          o.onHint?.(`That isn't quite ${region.name.toLowerCase()} — keep going or erase!`);
          return;
        }
        snapFill(ri, dom);
        locked.add(region.id);
        o.onLock?.(region.id, dom);
        o.onProgress?.();
      }
    } else if (ratio < UNLOCK_FLOOR) {
      locked.delete(region.id);
      o.onUnlock?.(region.id);
      o.onProgress?.();
    }
  }

  function paintDot(x, y) {
    const ci = cellIndex(x, y, GW, CELL);
    const ri = ci >= 0 && ci < cellRegion.length ? cellRegion[ci] : -1;
    if (ri < 0) return;
    const erasing = o.getErasing();
    const color = o.getColor().color;
    const brush = o.getBrush();
    // visual
    ctx.save();
    ctx.clip(pathSS[ri], 'evenodd');
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    ctx.fillStyle = erasing ? '#000' : color;
    ctx.beginPath();
    ctx.arc(x * SS, y * SS, (brush / 2) * SS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // coverage
    for (const ci2 of cellsInCircle(x, y, brush / 2, GW, GH, CELL)) markCell(ci2, ri, color, erasing);
    evaluate(ri);
  }

  function paintSegment(x0, y0, x1, y1) {
    const brush = o.getBrush();
    for (const [px, py] of interpolatePoints(x0, y0, x1, y1, brush / 2)) paintDot(px, py);
  }

  // ── Pointer handling ─────────────────────────────────────────────────
  let drawing = false;
  let last = null;

  function toSVG(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  }
  function down(e) {
    e.preventDefault();
    drawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    const [x, y] = toSVG(e);
    last = [x, y];
    paintDot(x, y);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const [x, y] = toSVG(e);
    paintSegment(last[0], last[1], x, y);
    last = [x, y];
  }
  function up(e) {
    if (!drawing) return;
    drawing = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  }
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', up);

  function destroy() {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
    canvas.removeEventListener('pointerleave', up);
  }

  function clearAll() {
    ctx.clearRect(0, 0, W * SS, H * SS);
    painted.fill(0);
    paintedCount.fill(0);
    colorCounts.forEach((c) => Object.keys(c).forEach((k) => delete c[k]));
    locked.clear();
  }

  // Test/automation hook: deterministic coverage without synthetic pointer math.
  const api = {
    destroy,
    clearAll,
    lockedCount: () => locked.size,
    regionCount: regions.length,
    coverageOf: (ri) => coverageRatio(paintedCount[ri], cellCount[ri]),
    paintAt: (x, y) => paintDot(x, y),
    /** Fully colour region index `ri` with the current colour (for tests). */
    fillRegion: (ri) => {
      for (let gy = 0; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
          paintDot((gx + 0.5) * CELL, (gy + 0.5) * CELL);
        }
      }
    },
  };
  if (typeof window !== 'undefined') window.__paint = api;
  return api;
}

/** Transparent overlay that draws just the region boundaries ("the lines"). */
function linesSVG(regions) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const lines = regions
    .map((r) => `<path d="${esc(r.d)}" fill="none" fill-rule="evenodd" stroke="#475569" stroke-width="1.4" stroke-linejoin="round"/>`)
    .join('');
  return (
    `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Flag outline">` +
    lines +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#0f172a" stroke-width="2"/>` +
    `</svg>`
  );
}
