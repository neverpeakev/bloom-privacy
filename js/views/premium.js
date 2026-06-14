/**
 * Plans & unlock screen — the value ladder from the product spec.
 *
 * Native (iOS/Android): real auto-renewing subscriptions via RevenueCat,
 * behind the parental gate, with the App Store-required disclosure + Restore.
 * Web (PWA): no store exists, so it falls back to a local demo unlock.
 */

import { TEAMS } from '../data/teams.js';
import { get, save, isPro, trialDaysLeft, startTrial, PLANS, TRIAL_DAYS } from '../state.js';
import { html, raw, toast, parentGate } from '../ui.js';
import { celebrate } from '../confetti.js';
import { sfx } from '../audio.js';
import { billingMode, getPackages, purchase, restore } from '../billing.js';

const NATIVE = billingMode() === 'native';
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'privacy.html';

// Map our plan ids to RevenueCat's standard package identifiers (default offering).
const RC_PACKAGE = { weekly: '$rc_weekly', monthly: '$rc_monthly', family: '$rc_annual' };

const FEATURES = {
  free: ['12 starter flags to colour', 'Trivia with starter teams', 'Flag Match & Continent Quest (starter teams)', 'Daily streaks & badges'],
  weekly: ['All 48 World Cup flags', 'Trivia about every team', 'Matchday Challenges with real fixtures', 'All badges & passport stamps'],
  monthly: ['Everything in World Explorer', 'Best value for the whole tournament', 'No ads — ever (we never show ads to kids)', 'New event content as it lands'],
  family: ['Everything in Pro Unlock', 'Up to 6 family or classroom profiles*', 'Printable colouring sheets*', 'Teacher dashboard*'],
};

function onPurchased(label) {
  save();
  celebrate();
  sfx.fanfare();
  toast(`${label} active — everything is unlocked!`, { emoji: '👑', ms: 3200 });
  setTimeout(() => (location.hash = '#/color'), 700);
}

function buy(planId) {
  const label = PLANS[planId].label;
  parentGate(async () => {
    try {
      const ok = await purchase(NATIVE ? RC_PACKAGE[planId] : planId, { webPlan: planId });
      if (ok) onPurchased(label);
      else toast('Purchase not completed.', { emoji: '😕' });
    } catch (e) {
      if (!/cancel/i.test(e?.message || '')) toast('Purchase failed — please try again.', { emoji: '⚠️' });
    }
  });
}

export function render(root) {
  const s = get();
  const pro = isPro(s);
  const trialLeft = trialDaysLeft(s);
  const freeCount = TEAMS.filter((t) => t.free).length;

  const planCard = (id, { badge = '', cta }) => {
    const p = PLANS[id];
    const active = (s.plan === id && !NATIVE);
    return html`
      <div class="plan-card ${id === 'monthly' ? 'plan-popular' : ''} ${active ? 'plan-active' : ''}">
        ${raw(badge ? `<span class="plan-badge">${badge}</span>` : '')}
        <h3 class="plan-name">${p.label}</h3>
        <div class="plan-price" data-price="${id}">${p.price}</div>
        <ul class="plan-features">
          ${raw(FEATURES[id].map((f) => html`<li>${f}</li>`).join(''))}
        </ul>
        ${raw(
          active
            ? '<button class="btn btn-ghost btn-block" disabled>✓ Current plan</button>'
            : `<button class="btn ${id === 'monthly' ? 'btn-primary' : 'btn-outline'} btn-block" data-plan="${id}">${cta}</button>`,
        )}
      </div>`;
  };

  const header =
    NATIVE && pro
      ? html`<p class="trial-note">👑 You're subscribed — every flag and game is unlocked. Thank you!</p>`
      : NATIVE
        ? html`<p class="muted">Start with a free 3-day trial, then your chosen plan. Cancel anytime.</p>`
        : s.plan === 'free' && !s.trialStartedAt
          ? html`<button class="btn btn-sunny btn-lg" data-trial>🎁 Start free ${TRIAL_DAYS}-day trial</button>`
          : s.plan === 'free' && pro
            ? html`<p class="trial-note">🎁 Trial active — <b>${trialLeft} day${trialLeft === 1 ? '' : 's'}</b> left. Enjoy everything!</p>`
            : s.plan === 'free'
              ? html`<p class="trial-note">Your trial has ended — pick a plan to keep exploring.</p>`
              : '';

  const legal = NATIVE
    ? html`
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
      </section>`
    : html`
      <section class="card demo-note">
        <p>
          <b>Web preview:</b> purchases happen in the iOS app. Here, choosing a plan unlocks
          everything locally so you can explore. Schools &amp; districts: see the
          <a href="#/grownups">Grown-ups corner</a> for the Institutional Partner Program.
        </p>
      </section>`;

  root.innerHTML = html`
    <header class="page-head center">
      <h1>🔓 Unlock the whole world</h1>
      <p>
        The free Starter Pack includes <b>${freeCount} flags</b>. Go Pro for all
        <b>48 teams</b>, every game mode and the daily Matchday Challenge.
      </p>
      ${raw(header)}
    </header>

    <div class="plans">
      ${raw(planCard('weekly', { cta: 'Choose Weekly' }))}
      ${raw(planCard('monthly', { badge: '⭐ Most popular', cta: 'Choose Pro' }))}
      ${raw(planCard('family', { badge: '👨‍👩‍👧‍👦 Best for groups', cta: 'Choose Family' }))}
    </div>

    ${raw(legal)}
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
    btn.addEventListener('click', () => buy(btn.dataset.plan));
  });

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

  // Native: replace placeholder prices with the real localized App Store prices.
  if (NATIVE) {
    getPackages()
      .then((pkgs) => {
        if (!pkgs?.length) return;
        const byPeriod = {};
        for (const p of pkgs) byPeriod[(p.period || '').toLowerCase()] = p.price;
        const map = { weekly: byPeriod.weekly, monthly: byPeriod.monthly, family: byPeriod.annual || byPeriod.yearly };
        for (const [id, price] of Object.entries(map)) {
          const elprice = root.querySelector(`[data-price="${id}"]`);
          if (elprice && price) elprice.textContent = price;
        }
      })
      .catch(() => {});
  }
}
