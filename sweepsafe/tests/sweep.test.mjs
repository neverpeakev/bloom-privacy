import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SWEEPS, SWEEP_BY_ID, totalSteps } from '../js/data/sweep.js';

test('sweeps are well-formed', () => {
  assert.ok(SWEEPS.length >= 3);
  const ids = new Set();
  for (const sw of SWEEPS) {
    assert.match(sw.id, /^[a-z]+$/);
    assert.ok(!ids.has(sw.id), `dup ${sw.id}`); ids.add(sw.id);
    assert.ok(sw.title && sw.blurb && sw.icon);
    assert.ok(sw.minutes >= 1);
    assert.ok(sw.steps.length >= 3, `${sw.id} steps`);
    const stepIds = new Set();
    for (const st of sw.steps) {
      assert.ok(st.id && st.title && st.body, `${sw.id}/${st.id}`);
      assert.ok(!stepIds.has(st.id), `dup step ${sw.id}/${st.id}`); stepIds.add(st.id);
      assert.ok(st.body.length > 25, `${sw.id}/${st.id} body too short`);
    }
  }
});

test('lookup + totalSteps', () => {
  assert.equal(SWEEP_BY_ID.arrival.title, 'Quick Arrival Sweep');
  assert.equal(totalSteps('arrival'), SWEEP_BY_ID.arrival.steps.length);
  assert.equal(totalSteps('nope'), 0);
});

test('has a "found something" emergency sweep flagged danger', () => {
  const found = SWEEPS.find((s) => s.danger);
  assert.ok(found, 'an emergency/danger sweep exists');
  assert.ok(found.steps.some((s) => /report|police|safety|leave/i.test(s.title + s.body)));
});
