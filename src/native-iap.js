/**
 * Native In-App-Purchase bridge (iOS/Android via RevenueCat).
 *
 * This file is the ONLY part of the app that depends on an npm package, so it
 * is bundled on its own by esbuild into dist/native-iap.bundle.js and included
 * exclusively in the native Capacitor build — never in the web PWA. The web app
 * stays a pure, bundler-free ES-module project.
 *
 * It exposes a tiny, framework-agnostic surface on window.__WORLDCOPA_RC__ that
 * js/billing.js talks to. The RevenueCat public SDK key is injected at build
 * time by esbuild's --define (__RC_KEY__) from the REVENUECAT_IOS_KEY secret.
 *
 * RevenueCat dashboard contract (set up by the project owner):
 *   • offering identifier:  "default"  (current offering)
 *   • one entitlement (any identifier) that all paid products grant.
 *     We treat "any active entitlement" as Pro, so the entitlement can be
 *     named anything ("WorldCopa Pro", "pro", …) without code changes.
 */

import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const RC_KEY = typeof __RC_KEY__ !== 'undefined' ? __RC_KEY__ : '';

let configured = false;

async function ensureConfigured() {
  if (configured) return;
  if (!RC_KEY) throw new Error('RevenueCat key missing (REVENUECAT_IOS_KEY not set at build)');
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({ apiKey: RC_KEY });
  configured = true;
}

// Any active entitlement = Pro. One entitlement guards all content, so we
// don't couple the app to its exact identifier.
function entitled(customerInfo) {
  return Object.keys(customerInfo?.entitlements?.active || {}).length > 0;
}

window.__WORLDCOPA_RC__ = {
  /** Configure the SDK and return current entitlement state. */
  async configure() {
    await ensureConfigured();
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return entitled(customerInfo);
    } catch {
      return false;
    }
  },

  /** Normalised list of buyable packages from the "default" offering. */
  async getOfferings() {
    await ensureConfigured();
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages.map((p) => ({
      id: p.identifier,
      productId: p.storeProduct.identifier,
      title: p.storeProduct.title,
      price: p.storeProduct.priceString,
      period: p.packageType,
    }));
  },

  /** Purchase a package by its RevenueCat package identifier. */
  async purchase(packageId) {
    await ensureConfigured();
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find((p) => p.identifier === packageId);
    if (!pkg) throw new Error(`package ${packageId} not found in default offering`);
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return entitled(customerInfo);
  },

  /** Apple-required "Restore Purchases" path. */
  async restore() {
    await ensureConfigured();
    const { customerInfo } = await Purchases.restorePurchases();
    return entitled(customerInfo);
  },

  /** Re-check entitlement (e.g. on resume / launch). */
  async refresh() {
    await ensureConfigured();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return entitled(customerInfo);
  },
};
