/**
 * Billing abstraction (same hardened pattern as WorldCopa).
 * Native: RevenueCat via window.__SWEEPSAFE_RC__ (bundled by esbuild, lazy).
 * Web: local demo unlock; paywall shows static plans.
 * A native purchase NEVER grants access without a real transaction.
 */
import { get, save } from './state.js';

export function isNativePlatform() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}
function rc() { return window.__SWEEPSAFE_RC__ || null; }
export function billingMode() { return isNativePlatform() ? 'native' : 'web'; }

let initPromise = null;
export function initBilling() {
  if (!isNativePlatform()) return Promise.resolve();
  if (!initPromise) initPromise = _init();
  return initPromise;
}
async function _init() {
  if (!rc()) { try { await loadScript('native-iap.bundle.js'); } catch {} }
  const b = rc();
  if (!b) return;
  try { syncEntitlement(await b.configure()); } catch {}
}
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
function syncEntitlement(active) { const s = get(); if (s.entitled !== !!active) { s.entitled = !!active; save(); } }

export async function getPackages() {
  if (!isNativePlatform()) return null;
  await initBilling();
  const b = rc(); if (!b) return [];
  try { return await b.getOfferings(); } catch { return []; }
}
export async function purchase(planId, { webPlan } = {}) {
  if (isNativePlatform()) {
    await initBilling();
    const b = rc();
    if (!b) throw new Error('The App Store is unavailable right now. Please try again.');
    const active = await b.purchase(planId);
    syncEntitlement(active);
    return active;
  }
  const s = get(); s.plan = webPlan || 'monthly'; save(); return true; // web demo
}
export async function restore() {
  if (!isNativePlatform()) return false;
  await initBilling();
  const b = rc(); if (!b) return false;
  const active = await b.restore(); syncEntitlement(active); return active;
}
