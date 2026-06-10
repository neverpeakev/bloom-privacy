/**
 * Plans & unlock screen — the value ladder from the product spec.
 *
 * DEMO ONLY: no real payment is processed. "Purchasing" simply flips the
 * local plan flag after the parent gate, so the full product experience
 * can be evaluated end-to-end.
 */

import { TEAMS } from '../data/teams.js';
import { get, save, isPro, trialDaysLeft, startTrial, setPlan, PLANS, TRIAL_DAYS } from '../state.js';
import { html, raw, toast, parentGate } from '../ui.js';
import { celebrate } from '../confetti.js';
import { sfx } from '../audio.js';

const FEATURES = {
  free: ['12 starter flags to colour', 'Trivia with starter teams', 'Flag Match & Continent Quest (starter teams)', 'Daily streaks & badges'],
  weekly: ['All 48 World Cup flags', 'Trivia about every team', 'Matchday Challenges with real fixtures', 'All badges & passport stamps'],
  monthly: ['Everything in World Explorer', 'Best value for the whole tournament', 'No ads — ever (we never show ads to kids)', 'New event content as it lands'],
  family: ['Everything in Pro Unlock', 'Up to 6 family or classroom profiles*', 'Printable colouring sheets*', 'Teacher dashboard*'],
};

function activate(planId, label) {
  parentGate(() => {
    setPlan(planId);
    save();
    celebrate();
    sfx.fanfare();
    toast(`${label} activated — everything is unlocked!`, { emoji: '👑', ms: 3200 });
    setTimeout(() => (location.hash = '#/color'), 700);
  });
}

export function render(root) {
  const s = get();
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

  root.innerHTML = html`
    <header class="page-head center">
      <h1>🔓 Unlock the whole world</h1>
      <p>
        The free Starter Pack includes <b>${freeCount} flags</b>. Go Pro for all
        <b>48 teams</b>, every game mode and the daily Matchday Challenge.
      </p>
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
        <b>Demo mode:</b> this is a product preview — no payment is collected and no
        money changes hands. Choosing a plan simply unlocks the app on this device
        (behind a grown-ups gate). Schools &amp; districts: see the
        <a href="#/grownups">Grown-ups corner</a> for the Institutional Partner Program
        (from $1,000/year).
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
    btn.addEventListener('click', () => activate(btn.dataset.plan, PLANS[btn.dataset.plan].label));
  });
}
