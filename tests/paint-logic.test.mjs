import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  coverageRatio, isRegionComplete, cellIndex, cellsInCircle,
  dominantColor, colorsEqual, interpolatePoints,
} from '../js/paint-logic.js';

test('coverageRatio handles empty regions without dividing by zero', () => {
  assert.equal(coverageRatio(0, 0), 0);
  assert.equal(coverageRatio(5, 10), 0.5);
  assert.equal(coverageRatio(10, 10), 1);
});

test('isRegionComplete uses an 80% default threshold', () => {
  assert.equal(isRegionComplete(0.79), false);
  assert.equal(isRegionComplete(0.8), true);
  assert.equal(isRegionComplete(0.5, 0.4), true);
});

test('cellIndex maps SVG coordinates onto the grid', () => {
  // grid width 120, cell 2.5 → x=5 is column 2, y=5 is row 2
  assert.equal(cellIndex(5, 5, 120, 2.5), 2 * 120 + 2);
  assert.equal(cellIndex(0, 0, 120, 2.5), 0);
});

test('cellsInCircle returns only cells whose centre is within the radius', () => {
  const cells = cellsInCircle(50, 50, 5, 120, 80, 2.5);
  assert.ok(cells.length > 0);
  // every returned cell centre must actually be inside the circle
  for (const ci of cells) {
    const gx = ci % 120;
    const gy = Math.floor(ci / 120);
    const px = (gx + 0.5) * 2.5;
    const py = (gy + 0.5) * 2.5;
    assert.ok((px - 50) ** 2 + (py - 50) ** 2 <= 25 + 1e-9);
  }
});

test('cellsInCircle clamps to the grid bounds at the edges', () => {
  const cells = cellsInCircle(0, 0, 10, 120, 80, 2.5);
  assert.ok(cells.every((ci) => ci >= 0 && ci < 120 * 80));
});

test('dominantColor picks the most-used colour', () => {
  assert.equal(dominantColor({ '#ff0000': 3, '#00ff00': 7 }), '#00ff00');
  assert.equal(dominantColor({}), null);
});

test('colorsEqual is case-insensitive and type-safe', () => {
  assert.equal(colorsEqual('#FF0000', '#ff0000'), true);
  assert.equal(colorsEqual('#ff0000', '#00ff00'), false);
  assert.equal(colorsEqual(null, '#fff'), false);
});

test('interpolatePoints fills gaps along a fast swipe and always ends at the target', () => {
  const pts = interpolatePoints(0, 0, 10, 0, 2);
  assert.ok(pts.length >= 5);
  assert.deepEqual(pts[pts.length - 1], [10, 0]);
  // consecutive points never further apart than the step
  for (let i = 1; i < pts.length; i++) {
    assert.ok(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) <= 2 + 1e-9);
  }
});

test('interpolatePoints handles a zero-length move (single tap)', () => {
  const pts = interpolatePoints(5, 5, 5, 5, 2);
  assert.deepEqual(pts, [[5, 5]]);
});
