/**
 * App bootstrap: shell, hash router and global chrome (header, nav, FX).
 */

import { get, load, save, subscribe, touchStreak, isPro, trialDaysLeft, evaluateBadges } from './state.js';
import { html, raw, toast, showBadges } from './ui.js';
import { sfx } from './audio.js';
import { initBilling } from './billing.js';

import * as home from './views/home.js';
import * as color from './views/color.js';
import * as games from './views/games.js';
import * as trivia from './views/trivia.js';
import * as flagmatch from './views/flagmatch.js';
import * as continents from './views/continents.js';
import * as worldcup from './views/worldcup.js';
import * as passport from './views/passport.js';
import * as premium from './views/premium.js';
import * as grownups from './views/grownups.js';

const ROUTES = [
  { pattern: /^#?\/?$/, view: home, nav: 'home' },
  { pattern: /^#\/home$/, view: home, nav: 'home' },
  { pattern: /^#\/color$/, view: color, nav: 'color' },
  { pattern: /^#\/color\/([A-Z]{3})$/, view: color, nav: 'color' },
  { pattern: /^#\/games$/, view: games, nav: 'games' },
  { pattern: /^#\/trivia$/, view: trivia, nav: 'games' },
  { pattern: /^#\/trivia\/daily$/, view: trivia, nav: 'games', params: ['daily'] },
  { pattern: /^#\/flagmatch$/, view: flagmatch, nav: 'games' },
  { pattern: /^#\/continents$/, view: continents, nav: 'games' },
  { pattern: /^#\/worldcup$/, view: worldcup, nav: 'worldcup' },
  { pattern: /^#\/passport$/, view: passport, nav: 'passport' },
  { pattern: /^#\/premium$/, view: premium, nav: null },
  { pattern: /^#\/grownups$/, view: grownups, nav: null },
];

const NAV = [
  { id: 'home', href: '#/home', emoji: '🏠', label: 'Home' },
  { id: 'color', href: '#/color', emoji: '🎨', label: 'Color' },
  { id: 'games', href: '#/games', emoji: '🎮', label: 'Games' },
  { id: 'worldcup', href: '#/worldcup', emoji: '⚽', label: 'World Cup' },
  { id: 'passport', href: '#/passport', emoji: '🛂', label: 'Passport' },
];

function renderShell() {
  const s = get();
  const pro = isPro(s);
  const trial = trialDaysLeft(s);
  document.body.innerHTML = html`
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar">
      <a class="brand" href="#/home" aria-label="WorldCopa home">
        <span class="brand-ball">🏆</span>
        <span class="brand-text">World<span class="brand-accent">Copa</span><span class="brand-year">2026</span></span>
      </a>
      <div class="topbar-right">
        <span class="chip chip-streak" title="Daily streak">🔥 <b data-streak>${s.streak.count}</b></span>
        <span class="chip chip-stars" title="Stars earned">⭐ <b data-stars>${s.stars}</b></span>
        ${raw(
          pro
            ? html`<a class="chip chip-pro" href="#/premium">${s.plan === 'free' ? `🎁 Trial · ${trial}d` : '👑 Pro'}</a>`
            : html`<a class="chip chip-upgrade" href="#/premium">🔓 Unlock all</a>`,
        )}
        <a class="chip chip-grownups" href="#/grownups" aria-label="Grown-ups corner">👨‍👩‍👧</a>
      </div>
    </header>
    <main id="main" class="view" tabindex="-1"></main>
    <nav class="bottom-nav" aria-label="Main">
      ${raw(
        NAV.map(
          (n) => html`
            <a class="nav-item" data-nav="${n.id}" href="${n.href}">
              <span class="nav-emoji">${n.emoji}</span>
              <span class="nav-label">${n.label}</span>
            </a>`,
        ).join(''),
      )}
    </nav>
  `;
}

function updateChrome() {
  const s = get();
  const st = document.querySelector('[data-stars]');
  const sk = document.querySelector('[data-streak]');
  if (st) st.textContent = s.stars;
  if (sk) sk.textContent = s.streak.count;
}

let currentCleanup = null;

function route() {
  const hash = location.hash || '#/home';
  let match = null;
  let view = null;
  for (const r of ROUTES) {
    const m = hash.match(r.pattern);
    if (m) {
      match = { ...r, args: m.slice(1).concat(r.params || []) };
      view = r.view;
      break;
    }
  }
  if (!view) {
    location.hash = '#/home';
    return;
  }
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.nav === match.nav);
  });
  // Navigation always dismisses any lingering dialogs (badge popups etc.)
  document.querySelectorAll('.modal-backdrop').forEach((m) => m.remove());
  const main = document.querySelector('main.view');
  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch { /* view cleanup must never break routing */ }
  }
  main.scrollTop = 0;
  window.scrollTo(0, 0);
  currentCleanup = view.render(main, match.args) || null;
  main.focus({ preventScroll: true });
}

function init() {
  load();
  const newStreak = touchStreak();
  save();
  renderShell();
  subscribe(updateChrome);
  window.addEventListener('hashchange', route);
  route();

  if (newStreak >= 2) {
    setTimeout(() => toast(`Day ${newStreak} streak — keep it up!`, { emoji: '🔥' }), 800);
  }
  const fresh = evaluateBadges();
  if (fresh.length) {
    save();
    setTimeout(() => showBadges(fresh), 1400);
  }

  document.body.addEventListener('click', (e) => {
    if (e.target.closest('a,button')) sfx.tap();
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Native builds: configure RevenueCat and refresh entitlement, then repaint
  // the current view so any gated content reflects an active subscription.
  initBilling()
    .then(() => {
      if (isPro()) route();
    })
    .catch(() => {});
}

init();
