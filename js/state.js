/**
 * App state: persisted progress, streaks, stars, badges and plan gating.
 * Pure logic lives here (no DOM) so it is unit-testable under node:test.
 */

import { TEAMS, TEAM_BY_CODE } from './data/teams.js';

export const STORAGE_KEY = 'flagexplorer.v1';

export const PLANS = {
  free: { id: 'free', label: 'Starter Pack', price: 'Free' },
  weekly: { id: 'weekly', label: 'World Explorer', price: '$7.99/week' },
  monthly: { id: 'monthly', label: 'Pro Unlock', price: '$39.99/month' },
  family: { id: 'family', label: 'Family & Classroom', price: '$100/year' },
};

export const TRIAL_DAYS = 3;

export function defaultState(now = Date.now()) {
  return {
    createdAt: now,
    plan: 'free',
    entitled: false, // native: true when a RevenueCat "pro" entitlement is active
    trialStartedAt: null,
    stars: 0,
    streak: { count: 0, lastDay: null },
    coloring: {}, // code -> { fills: {regionId: color}, completed: bool, mistakes }
    trivia: { played: 0, correct: 0, bestRun: 0 },
    flagmatch: { played: 0, best: 0 },
    continents: { played: 0, best: 0 },
    daily: {}, // dayKey -> { done: bool, kind }
    badges: [], // badge ids
    stamps: [], // country codes "visited" (any activity completed)
    settings: { sound: true, reducedMotion: false, guided: true },
    matchdayDone: {}, // dayKey -> bool
  };
}

// ── Persistence (DOM-free injection point for tests) ───────────────────

let storage = typeof localStorage !== 'undefined' ? localStorage : null;
export function _setStorage(s) {
  storage = s;
}

let state = null;
const listeners = new Set();

export function load() {
  if (state) return state;
  state = defaultState();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) state = migrate({ ...defaultState(), ...JSON.parse(raw) });
  } catch {
    /* corrupted save — start fresh rather than crash */
  }
  return state;
}

function migrate(s) {
  s.settings = { ...defaultState().settings, ...(s.settings || {}) };
  return s;
}

export function save() {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — app still works in-memory */
  }
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function get() {
  return load();
}

export function resetAll() {
  state = defaultState();
  save();
}

// ── Day / streak helpers ───────────────────────────────────────────────

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Update the daily streak. Returns the new streak count. */
export function touchStreak(s = get(), today = new Date()) {
  const key = dayKey(today);
  if (s.streak.lastDay === key) return s.streak.count;
  const yesterday = new Date(today.getTime() - 86400000);
  s.streak.count = s.streak.lastDay === dayKey(yesterday) ? s.streak.count + 1 : 1;
  s.streak.lastDay = key;
  return s.streak.count;
}

// ── Plan gating ────────────────────────────────────────────────────────

export function isPro(s = get(), now = Date.now()) {
  if (s.entitled) return true; // native store entitlement (RevenueCat "pro")
  if (s.plan !== 'free') return true;
  if (s.trialStartedAt && now - s.trialStartedAt < TRIAL_DAYS * 86400000) return true;
  return false;
}

export function trialDaysLeft(s = get(), now = Date.now()) {
  if (!s.trialStartedAt) return 0;
  const left = TRIAL_DAYS - (now - s.trialStartedAt) / 86400000;
  return Math.max(0, Math.ceil(left));
}

export function isFlagUnlocked(code, s = get(), now = Date.now()) {
  const team = TEAM_BY_CODE[code];
  if (!team) return false;
  return team.free || isPro(s, now);
}

export function startTrial(s = get(), now = Date.now()) {
  if (!s.trialStartedAt) s.trialStartedAt = now;
  return s;
}

export function setPlan(planId, s = get()) {
  if (!PLANS[planId]) throw new Error(`unknown plan ${planId}`);
  s.plan = planId;
  return s;
}

// ── Stars, stamps & badges ─────────────────────────────────────────────

export function addStars(n, s = get()) {
  s.stars += n;
  return s.stars;
}

export function addStamp(code, s = get()) {
  if (!s.stamps.includes(code)) s.stamps.push(code);
}

export const BADGES = [
  { id: 'first-flag', emoji: '🎨', name: 'First Masterpiece', desc: 'Colour your very first flag.' },
  { id: 'five-flags', emoji: '🖌️', name: 'Busy Brush', desc: 'Colour 5 flags.' },
  { id: 'fifteen-flags', emoji: '🌈', name: 'Rainbow Artist', desc: 'Colour 15 flags.' },
  { id: 'all-flags', emoji: '🏆', name: 'Flag Master', desc: 'Colour every single flag!' },
  { id: 'group-complete', emoji: '⚽', name: 'Group Stage Hero', desc: 'Colour all 4 flags of one tournament group.' },
  { id: 'perfect-quiz', emoji: '🧠', name: 'Brainiac', desc: 'Get a perfect score in a trivia round.' },
  { id: 'quiz-10', emoji: '❓', name: 'Question Hunter', desc: 'Answer 10 trivia questions correctly.' },
  { id: 'sharp-eye', emoji: '🔎', name: 'Sharp Eye', desc: 'Score 8+ in one Flag Match round.' },
  { id: 'globe-trotter', emoji: '🌍', name: 'Globe Trotter', desc: 'Sort 10 countries onto the right continent in a row.' },
  { id: 'streak-3', emoji: '🔥', name: 'On Fire', desc: 'Play 3 days in a row.' },
  { id: 'streak-7', emoji: '☄️', name: 'Unstoppable', desc: 'Play 7 days in a row.' },
  { id: 'matchday', emoji: '📅', name: 'Matchday Fan', desc: 'Complete a Matchday Challenge.' },
  { id: 'stamps-12', emoji: '🛂', name: 'Passport Pro', desc: 'Collect 12 country stamps.' },
];

const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/**
 * Evaluate all badge rules against the state; award anything new.
 * Returns the list of newly-awarded badge objects.
 */
export function evaluateBadges(s = get()) {
  const completed = Object.values(s.coloring).filter((c) => c.completed).length;
  const groups = {};
  for (const t of TEAMS) {
    groups[t.group] = (groups[t.group] || 0) + (s.coloring[t.code]?.completed ? 1 : 0);
  }
  const rules = {
    'first-flag': completed >= 1,
    'five-flags': completed >= 5,
    'fifteen-flags': completed >= 15,
    'all-flags': completed >= TEAMS.length,
    'group-complete': Object.values(groups).some((n) => n === 4),
    'perfect-quiz': s.trivia.perfect === true,
    'quiz-10': s.trivia.correct >= 10,
    'sharp-eye': s.flagmatch.best >= 8,
    'globe-trotter': s.continents.best >= 10,
    'streak-3': s.streak.count >= 3,
    'streak-7': s.streak.count >= 7,
    matchday: Object.values(s.matchdayDone).some(Boolean),
    'stamps-12': s.stamps.length >= 12,
  };
  const fresh = [];
  for (const [id, ok] of Object.entries(rules)) {
    if (ok && !s.badges.includes(id)) {
      s.badges.push(id);
      fresh.push(BADGE_BY_ID[id]);
    }
  }
  return fresh;
}

// ── Seeded RNG for deterministic daily challenges ──────────────────────

export function seededRng(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function rng() {
    h += h << 13; h ^= h >>> 7;
    h += h << 3; h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 1e9) / 1e9;
  };
}
