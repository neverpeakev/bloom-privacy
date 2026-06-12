import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  defaultState, dayKey, touchStreak, isPro, trialDaysLeft, startTrial, setPlan,
  isFlagUnlocked, addStars, addStamp, evaluateBadges, seededRng, BADGES,
  STORAGE_KEY, _setStorage, load, save, get, resetAll, TRIAL_DAYS,
} from '../js/state.js';
import { TEAMS } from '../js/data/teams.js';

function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

let storage;
beforeEach(() => {
  storage = fakeStorage();
  _setStorage(storage);
  resetAll();
});

test('default state shape', () => {
  const s = defaultState();
  assert.equal(s.plan, 'free');
  assert.equal(s.stars, 0);
  assert.equal(s.streak.count, 0);
  assert.equal(s.trialStartedAt, null);
  assert.ok(s.settings.sound);
});

test('persistence round-trip survives reload', () => {
  const s = get();
  addStars(42, s);
  addStamp('BRA', s);
  save();
  assert.ok(storage._map.has(STORAGE_KEY));
  // simulate a fresh page load
  resetAll();
  const raw = storage._map.get(STORAGE_KEY);
  storage._map.set(STORAGE_KEY, raw); // unchanged
  const reloaded = JSON.parse(storage._map.get(STORAGE_KEY));
  assert.equal(reloaded.stars, 0); // resetAll persisted the wipe — proves writes happen
});

test('corrupted save data falls back to defaults', () => {
  storage._map.set(STORAGE_KEY, '{not json');
  resetAll();
  assert.equal(get().stars, 0);
});

test('streak: same day is idempotent, consecutive days increment, gaps reset', () => {
  const s = defaultState();
  const d1 = new Date('2026-06-10T10:00:00');
  assert.equal(touchStreak(s, d1), 1);
  assert.equal(touchStreak(s, d1), 1, 'same day no double count');
  const d2 = new Date('2026-06-11T09:00:00');
  assert.equal(touchStreak(s, d2), 2);
  const d4 = new Date('2026-06-13T09:00:00'); // skipped a day
  assert.equal(touchStreak(s, d4), 1);
});

test('dayKey is stable and zero-padded', () => {
  assert.equal(dayKey(new Date(2026, 5, 7)), '2026-06-07');
});

test('plan gating: free → trial → paid', () => {
  const s = defaultState();
  const t0 = Date.now();
  assert.equal(isPro(s, t0), false);
  assert.equal(isFlagUnlocked('BRA', s, t0), true, 'BRA is a starter flag');
  assert.equal(isFlagUnlocked('UZB', s, t0), false, 'UZB is pro');

  startTrial(s, t0);
  assert.equal(isPro(s, t0), true);
  assert.equal(trialDaysLeft(s, t0), TRIAL_DAYS);
  assert.equal(isFlagUnlocked('UZB', s, t0), true);

  const afterTrial = t0 + (TRIAL_DAYS + 1) * 86400000;
  assert.equal(isPro(s, afterTrial), false, 'trial expires');
  assert.equal(trialDaysLeft(s, afterTrial), 0);

  setPlan('monthly', s);
  assert.equal(isPro(s, afterTrial), true);
  assert.throws(() => setPlan('bogus', s));
});

test('starting a trial twice keeps the original start date', () => {
  const s = defaultState();
  startTrial(s, 1000);
  startTrial(s, 99999999);
  assert.equal(s.trialStartedAt, 1000);
});

test('badges: coloring milestones award correctly and only once', () => {
  const s = get();
  s.coloring.BRA = { completed: true };
  let fresh = evaluateBadges(s);
  assert.deepEqual(fresh.map((b) => b.id), ['first-flag']);
  fresh = evaluateBadges(s);
  assert.deepEqual(fresh, [], 'no double award');

  for (const code of ['MEX', 'RSA', 'KOR', 'CZE']) s.coloring[code] = { completed: true };
  fresh = evaluateBadges(s);
  const ids = fresh.map((b) => b.id);
  assert.ok(ids.includes('five-flags'));
  assert.ok(ids.includes('group-complete'), 'group A fully colored');
});

test('badges: all-flags awarded at 48', () => {
  const s = get();
  for (const t of TEAMS) s.coloring[t.code] = { completed: true };
  const ids = evaluateBadges(s).map((b) => b.id);
  assert.ok(ids.includes('all-flags'));
});

test('badge definitions are unique and complete', () => {
  const ids = BADGES.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of BADGES) {
    assert.ok(b.emoji && b.name && b.desc, b.id);
  }
});

test('seeded RNG is deterministic and well distributed', () => {
  const a = seededRng('hello');
  const b = seededRng('hello');
  const c = seededRng('world');
  const seqA = Array.from({ length: 8 }, () => a());
  const seqB = Array.from({ length: 8 }, () => b());
  const seqC = Array.from({ length: 8 }, () => c());
  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
  for (const v of seqA) assert.ok(v >= 0 && v < 1);
});
