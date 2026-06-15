import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState, _setStorage, get, save, resetAll, isPro, startTrial, TRIAL_DAYS,
  toggleStep, sweepProgress, addFinding, removeFinding,
} from '../js/state.js';

function fakeStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }; }

beforeEach(() => { _setStorage(fakeStorage()); resetAll(); });

test('default state shape', () => {
  const s = defaultState();
  assert.equal(s.entitled, false);
  assert.equal(s.plan, 'free');
  assert.deepEqual(s.findings, []);
  assert.ok(s.settings.sound);
});

test('Pro gating: free -> trial -> entitlement', () => {
  const s = defaultState();
  const t0 = Date.now();
  assert.equal(isPro(s, t0), false);
  startTrial(s, t0);
  assert.equal(isPro(s, t0), true);
  assert.equal(isPro(s, t0 + (TRIAL_DAYS + 1) * 86400000), false, 'trial expires');
  s.entitled = true;
  assert.equal(isPro(s, t0 + 999 * 86400000), true, 'store entitlement overrides');
});

test('sweep steps toggle and progress', () => {
  const s = get();
  assert.equal(sweepProgress('arrival', 5, s).done, 0);
  assert.equal(toggleStep('arrival', 'wifi', s), true);
  toggleStep('arrival', 'lights', s);
  const p = sweepProgress('arrival', 5, s);
  assert.equal(p.done, 2);
  assert.ok(Math.abs(p.pct - 0.4) < 1e-9);
  assert.equal(toggleStep('arrival', 'wifi', s), false, 'toggles off');
  assert.equal(sweepProgress('arrival', 5, s).done, 1);
});

test('progress never exceeds total', () => {
  const s = get();
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) toggleStep('arrival', id, s);
  assert.equal(sweepProgress('arrival', 5, s).done, 5);
  assert.equal(sweepProgress('arrival', 5, s).pct, 1);
});

test('findings add (newest first) and remove', () => {
  const s = get();
  addFinding({ kind: 'camera', label: 'A' }, s);
  addFinding({ kind: 'tracker', label: 'B' }, s);
  assert.equal(s.findings.length, 2);
  assert.equal(s.findings[0].label, 'B');
  assert.ok(s.findings[0].id && s.findings[0].ts);
  removeFinding(s.findings[0].id, s);
  assert.equal(s.findings.length, 1);
  assert.equal(s.findings[0].label, 'A');
});

test('corrupted save falls back to defaults', () => {
  const fs = fakeStorage(); fs._m.set('sweepsafe.v1', '{bad json'); _setStorage(fs);
  // force reload
  resetAll();
  assert.equal(get().plan, 'free');
});
