/**
 * SweepSafe state: settings, Pro gating, sweep progress and a local "found
 * devices" log. Pure logic, DOM-free, unit-testable. Stored in localStorage.
 */

export const STORAGE_KEY = 'sweepsafe.v1';

export function defaultState() {
  return {
    createdAt: Date.now(),
    entitled: false, // native RevenueCat entitlement
    plan: 'free',
    trialStartedAt: null,
    sweeps: {}, // sweepId -> { [stepId]: true }
    findings: [], // { id, kind, label, note, ts }
    settings: { sound: true, haptics: true, reducedMotion: false },
    onboarded: false,
  };
}

export const TRIAL_DAYS = 3;

let storage = typeof localStorage !== 'undefined' ? localStorage : null;
export function _setStorage(s) { storage = s; }

let state = null;
const listeners = new Set();

export function load() {
  if (state) return state;
  state = defaultState();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
  } catch { /* corrupted save — start fresh */ }
  return state;
}
export function get() { return load(); }
export function save() {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota/private */ }
  for (const fn of listeners) fn(state);
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function resetAll() { state = defaultState(); save(); }

// ── Pro gating ──────────────────────────────────────────────────────
export function isPro(s = get(), now = Date.now()) {
  if (s.entitled) return true;
  if (s.plan !== 'free') return true;
  if (s.trialStartedAt && now - s.trialStartedAt < TRIAL_DAYS * 86400000) return true;
  return false;
}
export function startTrial(s = get(), now = Date.now()) {
  if (!s.trialStartedAt) s.trialStartedAt = now;
  return s;
}

// ── Sweep progress ─────────────────────────────────────────────────
export function toggleStep(sweepId, stepId, s = get()) {
  const m = (s.sweeps[sweepId] ||= {});
  if (m[stepId]) delete m[stepId]; else m[stepId] = true;
  return !!m[stepId];
}
export function sweepProgress(sweepId, total, s = get()) {
  const done = Object.keys(s.sweeps[sweepId] || {}).length;
  return { done: Math.min(done, total), total, pct: total ? Math.min(done, total) / total : 0 };
}

// ── Findings log ───────────────────────────────────────────────────
let _fseq = 0;
export function addFinding(finding, s = get()) {
  s.findings.unshift({ id: `f${Date.now()}_${++_fseq}`, ts: Date.now(), ...finding });
  return s.findings;
}
export function removeFinding(id, s = get()) {
  s.findings = s.findings.filter((f) => f.id !== id);
}
