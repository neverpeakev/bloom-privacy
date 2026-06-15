/** SweepSafe bootstrap: shell, hash router, bottom nav. */

import { load, get, save, subscribe, isPro } from './state.js';
import { html, raw } from './ui.js';

import * as home from './views/home.js';
import * as scanCamera from './views/scan-camera.js';
import * as sweep from './views/sweep.js';
import * as learn from './views/learn.js';
import * as sensors from './views/sensors.js';
import * as more from './views/more.js';
import * as premium from './views/premium.js';

const ROUTES = [
  { pattern: /^#?\/?$/, view: home, nav: 'home' },
  { pattern: /^#\/home$/, view: home, nav: 'home' },
  { pattern: /^#\/scan$/, view: scanCamera, nav: 'scan' },
  { pattern: /^#\/sweep$/, view: sweep, nav: 'sweep' },
  { pattern: /^#\/sweep\/([a-z]+)$/, view: sweep, nav: 'sweep' },
  { pattern: /^#\/learn$/, view: learn, nav: 'learn' },
  { pattern: /^#\/sensors$/, view: sensors, nav: null },
  { pattern: /^#\/more$/, view: more, nav: 'more' },
  { pattern: /^#\/premium$/, view: premium, nav: null },
];

const NAV = [
  { id: 'home', href: '#/home', emoji: '🛡️', label: 'Home' },
  { id: 'scan', href: '#/scan', emoji: '📷', label: 'Scan' },
  { id: 'sweep', href: '#/sweep', emoji: '✅', label: 'Sweep' },
  { id: 'learn', href: '#/learn', emoji: '💡', label: 'Learn' },
  { id: 'more', href: '#/more', emoji: '⚙️', label: 'More' },
];

function renderShell() {
  const s = get();
  document.body.innerHTML = html`
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="topbar">
      <a class="brand" href="#/home" aria-label="SweepSafe home">
        ${raw(markSVG())}
        <span>Sweep<span class="brand-accent">Safe</span></span>
      </a>
      <div>
        ${raw(isPro(s)
          ? '<a class="chip chip-pro" href="#/premium">● Protected</a>'
          : '<a class="chip chip-upgrade" href="#/premium">Unlock Pro</a>')}
      </div>
    </header>
    <main id="main" class="view" tabindex="-1"></main>
    <nav class="bottom-nav" aria-label="Main">
      ${raw(NAV.map((n) => html`
        <a class="nav-item" data-nav="${n.id}" href="${n.href}">
          <span class="nav-emoji">${n.emoji}</span><span>${n.label}</span>
        </a>`).join(''))}
    </nav>
  `;
}

function markSVG() {
  return '<svg class="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 2l8 3v6c0 5-3.4 8.4-8 11-4.6-2.6-8-6-8-11V5l8-3z" fill="#15203a" stroke="#22d3ee" stroke-width="1.5"/>' +
    '<circle cx="12" cy="11" r="3.2" fill="none" stroke="#22d3ee" stroke-width="1.5"/>' +
    '<circle cx="12" cy="11" r="1" fill="#22d3ee"/></svg>';
}

let cleanup = null;
function route() {
  const hash = location.hash || '#/home';
  let match = null, view = null;
  for (const r of ROUTES) {
    const m = hash.match(r.pattern);
    if (m) { match = { ...r, args: m.slice(1) }; view = r.view; break; }
  }
  if (!view) { location.hash = '#/home'; return; }
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.nav === match.nav));
  const main = document.querySelector('main.view');
  document.querySelectorAll('.scanner').forEach((n) => n.remove());
  if (typeof cleanup === 'function') { try { cleanup(); } catch {} }
  window.scrollTo(0, 0);
  cleanup = view.render(main, match.args) || null;
  main.focus({ preventScroll: true });
}

function init() {
  load();
  renderShell();
  subscribe(() => { /* chrome reacts via re-render on nav */ });
  window.addEventListener('hashchange', route);
  route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  import('./billing.js').then((b) => b.initBilling?.()).catch(() => {});
}

init();
