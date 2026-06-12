/**
 * Passport: stamps for every country you've explored, badge shelf,
 * star total and streak — the gamified progress home.
 */

import { TEAMS } from '../data/teams.js';
import { get, BADGES } from '../state.js';
import { html, raw } from '../ui.js';

export function render(root) {
  const s = get();
  const colored = Object.values(s.coloring).filter((c) => c.completed).length;

  const stampGrid = TEAMS.map((t) => {
    const stamped = s.stamps.includes(t.code);
    return html`
      <div class="stamp ${stamped ? 'stamped' : ''}" title="${t.name}">
        <span class="stamp-emoji">${stamped ? t.emoji : '·'}</span>
        <span class="stamp-name">${stamped ? t.name : '???'}</span>
      </div>`;
  }).join('');

  const badgeShelf = BADGES.map((b) => {
    const earned = s.badges.includes(b.id);
    return html`
      <div class="shelf-badge ${earned ? 'earned' : 'locked'}" title="${b.desc}">
        <span class="shelf-badge-emoji">${earned ? b.emoji : '🔒'}</span>
        <span class="shelf-badge-name">${b.name}</span>
        <span class="shelf-badge-desc">${b.desc}</span>
      </div>`;
  }).join('');

  root.innerHTML = html`
    <header class="page-head">
      <h1>🛂 My Passport</h1>
      <p>Every flag you colour and country you guess earns a stamp.</p>
    </header>

    <section class="passport-summary">
      <div class="passport-stat"><b>⭐ ${s.stars}</b><span>stars</span></div>
      <div class="passport-stat"><b>🔥 ${s.streak.count}</b><span>day streak</span></div>
      <div class="passport-stat"><b>🎨 ${colored}</b><span>flags colored</span></div>
      <div class="passport-stat"><b>🛂 ${s.stamps.length}</b><span>stamps</span></div>
    </section>

    <h2 class="section-title">🏅 Badges (${s.badges.length}/${BADGES.length})</h2>
    <div class="badge-shelf">${raw(badgeShelf)}</div>

    <h2 class="section-title">🌍 Country stamps (${s.stamps.length}/${TEAMS.length})</h2>
    <div class="stamp-grid">${raw(stampGrid)}</div>
  `;
}
