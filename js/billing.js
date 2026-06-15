/**
 * Billing abstraction shared by the views.
 *
 * Native (iOS/Android): delegates to RevenueCat via the bundled
 * window.__WORLDCOPA_RC__ bridge (see src/native-iap.js), loaded lazily.
 * Web (the PWA): no store exists, so purchasing falls back to the local
 * demo unlock and the UI shows the static plans.
 */

import { get, save, setPlan } from './state.js';

export function isNativePlatform() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function rc() {
  return window.__WORLDCOPA_RC__ || null;
}

// Platform decides the paywall, NOT whether the RC bundle has loaded yet
// (it loads lazily). This must be evaluated at call time, never cached at
// module import — the bridge isn't ready during initial module evaluation.
export function billingMode() {
  return isNativePlatform() ? 'native' : 'web';
}

let initPromise = null;

/**
 * Idempotent: loads the native IAP bundle, configures RevenueCat, and syncs
 * entitlement into state. No-ops on web. Safe to call repeatedly.
 */
export function initBilling() {
  if (!isNativePlatform()) return Promise.resolve();
  if (!initPromise) initPromise = _init();
  return initPromise;
}

async function _init() {
  if (!rc()) {
    try {
      await loadScript('native-iap.bundle.js');
    } catch {
      /* bundle missing — purchase()/getPackages() will surface this */
    }
  }
  const bridge = rc();
  if (!bridge) return;
  try {
    syncEntitlement(await bridge.configure());
  } catch {
    /* offline or RC unavailable — leave existing state untouched */
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function syncEntitlement(active) {
  const s = get();
  if (s.entitled !== !!active) {
    s.entitled = !!active;
    save();
  }
}

/** Real store packages on native; null on web (caller uses static plans). */
export async function getPackages() {
  if (!isNativePlatform()) return null;
  await initBilling();
  const bridge = rc();
  if (!bridge) return [];
  try {
    return await bridge.getOfferings();
  } catch {
    return [];
  }
}

/**
 * Purchase. On native, runs the real RevenueCat flow and reflects the
 * entitlement into state — it will THROW if the store bridge is unavailable
 * (it must never silently grant access without a real transaction). On web,
 * performs the local demo unlock.
 * Returns true if the user is now entitled.
 */
export async function purchase(planId, { webPlan } = {}) {
  if (isNativePlatform()) {
    await initBilling();
    const bridge = rc();
    if (!bridge) throw new Error('The App Store is unavailable right now. Please try again.');
    const active = await bridge.purchase(planId);
    syncEntitlement(active);
    return active;
  }
  // web demo fallback (no store exists in the browser)
  setPlan(webPlan || 'monthly');
  save();
  return true;
}

/** Apple-required restore. Returns true if entitlement is active afterwards. */
export async function restore() {
  if (!isNativePlatform()) return false;
  await initBilling();
  const bridge = rc();
  if (!bridge) return false;
  const active = await bridge.restore();
  syncEntitlement(active);
  return active;
}
