/**
 * Billing abstraction shared by the views.
 *
 * Native (iOS/Android): delegates to RevenueCat via the bundled
 * window.__WORLDCOPA_RC__ bridge (see src/native-iap.js).
 * Web (the PWA): no store exists, so purchasing falls back to the local
 * demo unlock and the UI shows the plans without real prices.
 */

import { get, save, setPlan } from './state.js';

export function isNativePlatform() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}

function rc() {
  return window.__WORLDCOPA_RC__ || null;
}

export function billingMode() {
  return isNativePlatform() && rc() ? 'native' : 'web';
}

/**
 * Load the native IAP bundle (native only) and sync entitlement into state.
 * Safe to call on web — it just no-ops.
 */
export async function initBilling() {
  if (!isNativePlatform()) return;
  if (!rc()) {
    await loadScript('native-iap.bundle.js').catch(() => {});
  }
  const bridge = rc();
  if (!bridge) return;
  try {
    const active = await bridge.configure();
    syncEntitlement(active);
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
  if (s.entitled !== active) {
    s.entitled = active;
    save();
  }
}

/** Real store packages on native; null on web (caller uses static plans). */
export async function getPackages() {
  const bridge = rc();
  if (!bridge) return null;
  try {
    return await bridge.getOfferings();
  } catch {
    return [];
  }
}

/**
 * Purchase. On native, runs the real RevenueCat flow and reflects the
 * entitlement into state. On web, performs the local demo unlock.
 * Returns true if the user is now entitled.
 */
export async function purchase(planId, { webPlan } = {}) {
  const bridge = rc();
  if (bridge) {
    const active = await bridge.purchase(planId);
    syncEntitlement(active);
    return active;
  }
  // web demo fallback
  setPlan(webPlan || 'monthly');
  save();
  return true;
}

/** Apple-required restore. Returns true if entitlement is active afterwards. */
export async function restore() {
  const bridge = rc();
  if (!bridge) return false;
  const active = await bridge.restore();
  syncEntitlement(active);
  return active;
}
