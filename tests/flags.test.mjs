import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TEAMS } from '../js/data/teams.js';
import { FLAGS, flagSVG, flagPalette, paletteWithDecoys, star, rect, circle } from '../js/flags.js';

test('every one of the 48 teams has a flag spec', () => {
  for (const t of TEAMS) {
    assert.ok(FLAGS[t.code], `missing flag for ${t.code}`);
  }
  assert.equal(Object.keys(FLAGS).length, 48);
});

test('every flag has 2–6 paintable regions with valid colours and paths', () => {
  for (const [code, spec] of Object.entries(FLAGS)) {
    assert.ok(spec.regions.length >= 2 && spec.regions.length <= 6, `${code}: ${spec.regions.length} regions`);
    const ids = new Set();
    for (const r of spec.regions) {
      assert.match(r.color, /^#[0-9a-f]{6}$/i, `${code}/${r.id} colour`);
      assert.ok(r.name.length >= 3, `${code}/${r.id} colour name`);
      assert.match(r.d, /^M/, `${code}/${r.id} path starts with M`);
      assert.ok(r.d.includes('Z'), `${code}/${r.id} path closes`);
      assert.ok(!ids.has(r.id), `${code}/${r.id} duplicate id`);
      ids.add(r.id);
      // path numbers stay within a sane bleed of the 300x200 viewBox
      // (negative values up to -300 are fine: relative h/v deltas)
      const nums = r.d.match(/-?\d+(\.\d+)?/g).map(Number);
      for (const n of nums) assert.ok(n >= -310 && n <= 360, `${code}/${r.id} coord ${n}`);
    }
  }
});

test('flag SVG renders all modes', () => {
  for (const t of TEAMS) {
    const full = flagSVG(t.code);
    const outline = flagSVG(t.code, { mode: 'outline' });
    assert.ok(full.startsWith('<svg'), t.code);
    assert.ok(full.includes('</svg>'), t.code);
    assert.ok(outline.includes('stroke-dasharray'), t.code);
    const partial = flagSVG(t.code, { mode: 'outline', fills: { r0: '#123456' } });
    assert.ok(partial.includes('#123456'), t.code);
  }
  assert.equal(flagSVG('XXX'), '');
});

test('palettes are deduplicated and decoys never collide', () => {
  for (const t of TEAMS) {
    const pal = flagPalette(t.code);
    const colors = pal.map((p) => p.color);
    assert.equal(new Set(colors).size, colors.length, t.code);
    const withDecoys = paletteWithDecoys(t.code, () => 0.5);
    assert.equal(new Set(withDecoys.map((p) => p.color)).size, withDecoys.length, t.code);
    assert.ok(withDecoys.length >= pal.length + 1, `${t.code} has decoys`);
    const names = withDecoys.map((p) => p.name);
    assert.equal(new Set(names).size, names.length, `${t.code} decoy names unique`);
  }
});

test('geometry helpers produce well-formed paths', () => {
  assert.match(rect(0, 0, 10, 10), /^M0,0 h10 v10 h-10 Z$/);
  const s = star(50, 50, 20, 5);
  assert.equal((s.match(/L/g) || []).length, 9); // 10 points => M + 9 L
  const c = circle(50, 50, 10);
  assert.ok(c.includes('a10,10'));
});
