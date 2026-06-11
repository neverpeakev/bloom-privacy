# 📱 App Store & Google Play Submission Playbook

Everything in this repo is store-ready: native project scaffolding (Capacitor),
icon + splash assets (`resources/`), and this checklist. The steps below marked
**[YOU]** require your Mac / developer accounts and cannot be automated.

---

## Phase 0 — One-time accounts **[YOU]**

| Store | Cost | Where |
|---|---|---|
| Apple App Store | $99/year | [developer.apple.com/programs](https://developer.apple.com/programs/) — enroll as Individual or Organization (Org needs a D-U-N-S number, takes ~1–2 weeks; Individual is same-day) |
| Google Play | $25 once | [play.google.com/console](https://play.google.com/console/signup) |

> ⏱️ With the World Cup already underway, enroll as **Individual** today and
> migrate to an Organization later if needed.

## Phase 1 — Build the native projects (any machine with Node; iOS build needs a Mac)

```bash
git clone <repo> && cd <repo>
npm install                  # pulls Capacitor (declared in package.json)
npm run mobile:init          # stages dist/ and creates ios/ + android/ projects
npm run mobile:assets        # generates all icon/splash sizes from resources/
npm run mobile:ios           # opens Xcode  [Mac only]
npm run mobile:android       # opens Android Studio
```

The web app needs no bundler — `scripts/build-mobile.sh` just stages files into
`dist/` (Capacitor's `webDir`).

## Phase 2 — Xcode setup **[YOU, Mac]**

1. In Xcode → *Signing & Capabilities*: select your Team; bundle ID is already
   `com.neverpeak.flagexplorer` (change in `capacitor.config.json` if you prefer).
2. Set *App Category*: **Education** (primary), **Games/Family** (secondary).
3. Product → Archive → Distribute → **TestFlight** first. Sanity-check on a real
   phone (coloring touch targets, sound, offline).

## Phase 3 — In-App Purchases (required before charging)

The current build ships in **demo mode** (plans unlock locally, no money). Apple
**rejects** apps that sell outside Apple's IAP, so before flipping on real pricing:

1. App Store Connect → *Features → In-App Purchases* — create:
   | Product ID | Type | Price |
   |---|---|---|
   | `we_weekly` | Auto-renewing subscription | $7.99/week |
   | `pro_monthly` | Auto-renewing subscription | $39.99/month |
   | `family_yearly` | Auto-renewing subscription | $99.99/year (Apple has no $100 tier) |
   Put all three in one Subscription Group ("Flag Explorer Pro") so users can upgrade/downgrade.
2. Wire StoreKit in the app: easiest path is **RevenueCat** (`@revenuecat/purchases-capacitor`)
   — free tier covers this scale. The only file to touch is `js/views/premium.js`:
   replace the body of `activate()` (and the trial button handler) with the purchase
   call; entitlement check replaces `isPro()`'s plan flag. Everything else (gating,
   parent gate, UI) already works.
3. Keep the 3-day trial as an **introductory offer** on the subscription products
   (configured in App Store Connect, not in code).

## Phase 4 — Kids category compliance (we're already aligned)

Apple reviews kids' apps strictly. Current state:

- ✅ **No data collection at all** → Privacy Nutrition Label: select **"Data Not Collected"** for every category.
- ✅ **Parental gate** before commerce/external content (multiplication gate) — required and implemented.
- ✅ No ads, no third-party SDKs/analytics, no social features, no external links in kid areas.
- ✅ Privacy policy URL required by review: deploy the site and use `<your-domain>/privacy.html`.
- ⚠️ If you opt INTO the "Made for Kids" / Kids Category checkbox, Apple forbids
  IAP without a parental gate (we have one) and forbids any tracking (we have none).
- ⚠️ Replace the placeholder contact emails in `privacy.html` and the Grown-ups
  page with a real address before submission.

## Phase 5 — App Store listing **[YOU]**

- **Name**: `Flag Explorer 2026 — Flag Coloring & Geography` (30-char display name: `Flag Explorer 2026`)
- **Subtitle**: `Color flags. Learn the world.`
- **Keywords**: `flag coloring,world cup,geography,kids games,flags quiz,countries,educational,soccer`
- **Screenshots**: required sizes 6.9" (1320×2868) and 6.5" (1284×2778). Generate from
  the live app — run `node tests/e2e.mjs` with a phone-sized viewport, or capture
  from the Simulator. Show: coloring studio mid-paint, World Cup groups, trivia,
  passport with badges.
- **Age rating questionnaire**: everything "None" → expect 4+.
- **Review notes**: mention the parental gate (and the math answer is whatever the
  two numbers multiply to), and that the app is fully offline with no accounts.

## Phase 6 — Google Play (parallel, easier)

```bash
npm run mobile:android   # open Android Studio → Build → Generate Signed Bundle (.aab)
```
- Play Console → create app → upload `.aab` to Internal testing → promote to Production.
- Declare **Target audience: ages 5–8/9–12**, complete *Data safety* form (no data
  collected/shared), join **Designed for Families** (we qualify: no ads, no tracking).

## Timeline reality check

| Step | Typical time |
|---|---|
| Apple Individual enrollment | hours–2 days |
| TestFlight build processing | ~30 min |
| App Review (kids apps) | 1–4 days, sometimes a rejection round on IAP/gate details |
| Google Play first review | 1–7 days (new accounts can be slower) |

**Recommendation:** the PWA is live the moment you deploy the repo — ride the
tournament wave with the web link while the store builds go through review.
