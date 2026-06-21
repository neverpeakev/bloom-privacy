/**
 * Pure helpers for the brush-coloring engine — no DOM, fully unit-tested.
 * The studio uses a coarse coverage grid to decide when a region is "coloured
 * in enough" to lock, and to pick the colour the child used the most.
 */

/** Fraction of a region's cells that have been painted (0‒1). */
export function coverageRatio(painted, total) {
  return total > 0 ? painted / total : 0;
}

/** A region counts as finished once it's mostly filled in. */
export function isRegionComplete(ratio, threshold = 0.8) {
  return ratio >= threshold;
}

/** Grid cell index for a point in SVG space. */
export function cellIndex(x, y, gridW, cell) {
  return Math.floor(y / cell) * gridW + Math.floor(x / cell);
}

/** Indices of grid cells whose centre falls inside a brush circle. */
export function cellsInCircle(cx, cy, r, gridW, gridH, cell) {
  const out = [];
  const minX = Math.max(0, Math.floor((cx - r) / cell));
  const maxX = Math.min(gridW - 1, Math.floor((cx + r) / cell));
  const minY = Math.max(0, Math.floor((cy - r) / cell));
  const maxY = Math.min(gridH - 1, Math.floor((cy + r) / cell));
  const r2 = r * r;
  for (let gy = minY; gy <= maxY; gy++) {
    for (let gx = minX; gx <= maxX; gx++) {
      const px = (gx + 0.5) * cell;
      const py = (gy + 0.5) * cell;
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx + dy * dy <= r2) out.push(gy * gridW + gx);
    }
  }
  return out;
}

/** Most-used colour from a {color: count} tally. */
export function dominantColor(counts) {
  let best = null;
  let max = -1;
  for (const [color, n] of Object.entries(counts)) {
    if (n > max) {
      max = n;
      best = color;
    }
  }
  return best;
}

/** Case-insensitive hex comparison. */
export function colorsEqual(a, b) {
  return typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
}

/** Points sampled along a segment so fast finger swipes leave no gaps. */
export function interpolatePoints(x0, y0, x1, y1, step) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const n = Math.max(1, Math.ceil(dist / Math.max(0.0001, step)));
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    pts.push([x0 + dx * t, y0 + dy * t]);
  }
  return pts;
}
