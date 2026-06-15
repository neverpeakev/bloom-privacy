/**
 * Plans & unlock screen — the value ladder from the product spec.
 *
 * Native (iOS/Android): real auto-renewing subscriptions via RevenueCat. The
 * paywall is rendered from the live "default" offering, so whatever packages
 * are configured in RevenueCat/App Store Connect appear automatically with
 * their real localized prices. Purchases run behind the parental gate, with
 * the App Store-required disclosure + Restore.
 * Web (PWA): no store exists, so it falls back to a local demo unlock.
 */

import { TEAMS } from '../data/teams.js';
import { get, save, isPro, trialDaysLeft, startTrial, PLANS, TRIAL_DAYS } from '../state.js';
import { html, raw, toast, parentGate } from '../ui.js';
import { celebrate } from '../confetti.js';
import { sfx } from '../audio.js';
import { billingMode, getPackages, purchase, restore } from '../billing.js';

const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'privacy.html';

const PERIOD_LABEL = {
  WEEKLY: 'per week', MONTHLY: 'per month', TWO_MONTH: 'every 2 months',
  THREE_MONTH: 'per quarter', SIX_MONTH: 'every 6 months', ANNUAL: 'per year',
  LIFETIME: 'one-time', CUSTOM: '',
};

const FEATURES = {
  free: ['12 starter flags to colour', 'Trivia with starter teams', 'Flag Match & Continent Quest (starter teams)', 'Daily streaks & badges'],
  weekly: ['All 48 World Cup flags', 'Trivia about every team', 'Matchday Challenges with real fixtures', 'All badges & passport stamps'],
  monthly: ['Everything in World Explorer', 'Best value for the whole tournament', 'No ads — ever (we never show ads to kids)', 'New event content as it lands'],
  family: ['Everything in Pro Unlock', 'Up to 6 family or classroom profiles*', 'Printable colouring sheets*', 'Teacher dashboard*'],
};

const PRO_PERKS = [
  '🎨 All 48 World Cup flags to colour',
  '🧠 Trivia & games with every team',
  '🏟️ Daily Matchday Challenges',
  '🛂 All badges & passport stamps',
  '🚫 No ads, ever',
];

function onPurchased() {
  save();
  celebrate();
  sfx.fanfare();
  toast('You’re subscribed — everything is unlocked!', { emoji: '👑', ms: 3200 });
  setTimeout(() => (location.hash = '#/color'), 700);
}

const legalBlock = () => html`
  <section class="card demo-note">
    <p>
      Subscriptions auto-renew unless cancelled at least 24 hours before the period ends.
      Payment is charged to your Apple ID; manage or cancel anytime in your App Store
      account settings. A free trial's unused portion is forfeited when you buy a subscription.
    </p>
    <p>
      <a href="${EULA_URL}" target="_blank" rel="noopener">Terms of Use (EULA)</a> ·
      <a href="${PRIVACY_URL}" target="_blank" rel="noopener">Privacy Policy</a>
    </p>
    <button class="btn btn-ghost btn-sm" data-restore>↩️ Restore purchases</button>
  </section>`;

function wireRestore(root) {
  root.querySelector('[data-restore]')?.addEventListener('click', async () => {
    toast('Checking your purchases…', { emoji: '↩️', ms: 1500 });
    try {
      const ok = await restore();
      if (ok) {
        toast('Purchases restored!', { emoji: '✅' });
        render(root);
      } else {
        toast('No active subscription found for this Apple ID.', { emoji: 'ℹ️' });
      }
    } catch {
      toast('Could not restore right now.', { emoji: '⚠️' });
    }
  });
}

// ── Native: render the live RevenueCat offering ────────────────────────
function renderNative(root, s) {
  const freeCount = TEAMS.filter((t) => t.free).length;
  root.innerHTML = html`
    <header class="page-head center">
      <h1>🔓 Unlock the whole world</h1>
      <p>The free Starter Pack has <b>${freeCount} flags</b>. Go Pro for all <b>48 teams</b> and every game.</p>
      ${raw(isPro(s) ? html`<p class="trial-note">👑 You're subscribed — thank you!</p>` : '')}
    </header>
    <section class="card">
      <ul class="plan-features">${raw(PRO_PERKS.map((p) => html`<li>${p}</li>`).join(''))}</ul>
    </section>
    <div class="plans" data-packages><p class="muted center">Loading plans…</p></div>
    ${raw(legalBlock())}
  `;
  wireRestore(root);

  getPackages()
    .then((pkgs) => {
      const host = root.querySelector('[data-packages]');
      if (!host) return;
      if (!pkgs || !pkgs.length) {
        host.innerHTML = html`<p class="muted center">Plans aren't available right now. Pull to refresh or try again shortly.</p>`;
        return;
      }
      // Highlight annual/yearly as the popular pick when present.
      const popular = pkgs.find((p) => /ANNUAL|YEARLY/i.test(p.period)) || pkgs[1] || pkgs[0];
      host.innerHTML = pkgs
        .map(
          (p) => html`
            <div class="plan-card ${p === popular ? 'plan-popular' : ''}">
              ${raw(p === popular ? '<span class="plan-badge">⭐ Best value</span>' : '')}
              <h3 class="plan-name">${p.title || p.period}</h3>
              <div class="plan-price">${p.price} <span class="muted">${PERIOD_LABEL[p.period] ?? ''}</span></div>
              <button class="btn ${p === popular ? 'btn-primary' : 'btn-outline'} btn-block" data-pkg="${p.id}">Subscribe</button>
            </div>`,
        )
        .join('');
      host.querySelectorAll('[data-pkg]').forEach((btn) => {
        btn.addEventListener('click', () =>
          parentGate(async () => {
            try {
              const ok = await purchase(btn.dataset.pkg);
              if (ok) onPurchased();
              else toast('Purchase not completed.', { emoji: '😕' });
            } catch (e) {
              if (!/cancel/i.test(e?.message || '')) toast('Purchase failed — please try again.', { emoji: '⚠️' });
            }
          }),
        );
      });
    })
    .catch(() => {
      const host = root.querySelector('[data-packages]');
      if (host) host.innerHTML = html`<p class="muted center">Couldn't load plans. Check your connection and try again.</p>`;
    });
}

// ── Web: local demo unlock + trial ─────────────────────────────────────
function renderWeb(root, s) {
  const pro = isPro(s);
  const trialLeft = trialDaysLeft(s);
  const freeCount = TEAMS.filter((t) => t.free).length;

  const planCard = (id, { badge = '', cta }) => {
    const p = PLANS[id];
    const active = s.plan === id;
    return html`
      <div class="plan-card ${id === 'monthly' ? 'plan-popular' : ''} ${active ? 'plan-active' : ''}">
        ${raw(badge ? `<span class="plan-badge">${badge}</span>` : '')}
        <h3 class="plan-name">${p.label}</h3>
        <div class="plan-price">${p.price}</div>
        <ul class="plan-features">${raw(FEATURES[id].map((f) => html`<li>${f}</li>`).join(''))}</ul>
        ${raw(
          active
            ? '<button class="btn btn-ghost btn-block" disabled>✓ Current plan</button>'
            : `<button class="btn ${id === 'monthly' ? 'btn-primary' : 'btn-outline'} btn-block" data-plan="${id}">${cta}</button>`,
        )}
      </div>`;
  };

  root.innerHTML = html`
    <header class="page-head center">
      <h1>🔓 Unlock the whole world</h1>
      <p>The free Starter Pack includes <b>${freeCount} flags</b>. Go Pro for all <b>48 teams</b>, every game mode and the daily Matchday Challenge.</p>
      ${raw(
        s.plan === 'free' && !s.trialStartedAt
          ? html`<button class="btn btn-sunny btn-lg" data-trial>🎁 Start free ${TRIAL_DAYS}-day trial</button>`
          : s.plan === 'free' && pro
            ? html`<p class="trial-note">🎁 Trial active — <b>${trialLeft} day${trialLeft === 1 ? '' : 's'}</b> left. Enjoy everything!</p>`
            : s.plan === 'free'
              ? html`<p class="trial-note">Your trial has ended — pick a plan to keep exploring.</p>`
              : '',
      )}
    </header>
    <div class="plans">
      ${raw(planCard('weekly', { cta: 'Choose Weekly' }))}
      ${raw(planCard('monthly', { badge: '⭐ Most popular', cta: 'Choose Pro' }))}
      ${raw(planCard('family', { badge: '👨‍👩‍👧‍👦 Best for groups', cta: 'Choose Family' }))}
    </div>
    <section class="card demo-note">
      <p>
        <b>Web preview:</b> purchases happen in the iOS app. Here, choosing a plan unlocks
        everything locally so you can explore. Schools &amp; districts: see the
        <a href="#/grownups">Grown-ups corner</a> for the Institutional Partner Program.
      </p>
    </section>
  `;

  root.querySelector('[data-trial]')?.addEventListener('click', () => {
    parentGate(() => {
      startTrial();
      save();
      celebrate();
      sfx.fanfare();
      toast(`Free trial started — ${TRIAL_DAYS} days of everything!`, { emoji: '🎁', ms: 3200 });
      render(root);
    });
  });

  root.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () =>
      parentGate(async () => {
        await purchase(btn.dataset.plan, { webPlan: btn.dataset.plan });
        onPurchased();
      }),
    );
  });
}

export function render(root) {
  const s = get();
  // Decide at render time — the native bridge isn't ready at module import.
  if (billingMode() === 'native') renderNative(root, s);
  else renderWeb(root, s);
}
