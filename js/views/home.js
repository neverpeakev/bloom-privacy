/**
 * Home dashboard: hero, today's real World Cup matches, daily challenge,
 * activity shortcuts and progress at a glance.
 */

import { TEAMS, TEAM_BY_CODE } from '../data/teams.js';
import { matchesOn, nextMatchDay, STAGE_LABELS } from '../data/matches.js';
import { get, dayKey, isPro } from '../state.js';
import { html, raw, esc } from '../ui.js';
import { flagSVG } from '../flags.js';

function matchRow(m) {
  const home = TEAM_BY_CODE[m.home];
  const away = TEAM_BY_CODE[m.away];
  const time = new Date(m.kickoff).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!home || !away) {
    return html`
      <div class="match-row">
        <span class="match-teams match-placeholder">${m.placeholder || 'TBD'}</span>
        <span class="match-meta">${STAGE_LABELS[m.stage]} · ${time} · ${m.city}</span>
      </div>`;
  }
  return html`
    <div class="match-row">
      <span class="match-teams">
        <span class="match-team">${home.emoji} ${home.name}</span>
        <span class="match-vs">vs</span>
        <span class="match-team">${away.name} ${away.emoji}</span>
      </span>
      <span class="match-meta">Group ${m.group} · ${time} · ${m.city}</span>
    </div>`;
}

export function render(root) {
  const s = get();
  const now = new Date();
  const today = matchesOn(now);
  const next = today.length ? { date: now, matches: today } : nextMatchDay(now);
  const colored = Object.values(s.coloring).filter((c) => c.completed).length;
  const dailyDone = !!s.daily[dayKey(now)]?.done;
  const featured = TEAMS.filter((t) => t.free).slice(0, 6);

  root.innerHTML = html`
    <section class="hero">
      <div class="hero-art" aria-hidden="true">
        <div class="hero-globe">🌍</div>
        <div class="hero-flags">
          ${raw(featured.map((t) => `<span class="hero-flag-chip" style="animation-delay:${Math.random() * 2}s">${esc(t.emoji)}</span>`).join(''))}
        </div>
      </div>
      <h1 class="hero-title">Color the Cup. <span class="hero-rainbow">Learn the World.</span></h1>
      <p class="hero-sub">
        The Cup is here — color all 48 team flags, crush the trivia,
        and stamp your passport one country at a time. ⚽🎨
      </p>
      <div class="hero-cta">
        <a class="btn btn-primary btn-lg" href="#/color">🎨 Start coloring</a>
        <a class="btn btn-ghost btn-lg" href="#/games">🎮 Play games</a>
      </div>
    </section>

    <section class="card card-daily ${dailyDone ? 'done' : ''}">
      <div class="card-daily-left">
        <h2 class="card-title">📅 Daily Challenge</h2>
        <p>${dailyDone
          ? 'Done for today — amazing! Come back tomorrow for a new one.'
          : 'Five quick questions. Keep your streak alive and earn ⭐ 15!'}</p>
      </div>
      <a class="btn ${dailyDone ? 'btn-ghost' : 'btn-sunny'}" href="#/trivia/daily">
        ${dailyDone ? '✅ Completed' : '▶️ Play now'}
      </a>
    </section>

    ${raw(
      next.matches.length
        ? html`
          <section class="card">
            <h2 class="card-title">
              ⚽ ${today.length ? "Today's matches" : `Next match day · ${next.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
            </h2>
            <div class="match-list">${raw(next.matches.slice(0, 5).map(matchRow).join(''))}</div>
            <a class="card-link" href="#/worldcup">See full schedule & groups →</a>
          </section>`
        : '',
    )}

    <section class="grid-2">
      <a class="card card-action" href="#/flagmatch">
        <div class="card-action-emoji">🔎</div>
        <h3>Flag Match</h3>
        <p>Spot the right flag against the clock!</p>
      </a>
      <a class="card card-action" href="#/continents">
        <div class="card-action-emoji">🗺️</div>
        <h3>Continent Quest</h3>
        <p>Sort countries onto their continents.</p>
      </a>
    </section>

    <section class="card">
      <h2 class="card-title">🛂 Your journey</h2>
      <div class="progress-strip">
        <div class="progress-stat"><b>${colored}</b><span>/ ${TEAMS.length} flags colored</span></div>
        <div class="progress-stat"><b>${s.stamps.length}</b><span>passport stamps</span></div>
        <div class="progress-stat"><b>${s.badges.length}</b><span>badges</span></div>
      </div>
      <div class="progress-bar" role="progressbar" aria-valuenow="${colored}" aria-valuemin="0" aria-valuemax="${TEAMS.length}">
        <div class="progress-fill" style="width:${(colored / TEAMS.length) * 100}%"></div>
      </div>
      <a class="card-link" href="#/passport">Open your passport →</a>
    </section>

    ${raw(
      isPro(s)
        ? ''
        : html`
          <section class="card card-upsell">
            <h2 class="card-title">🔓 48 flags. 12 groups. One champion — you!</h2>
            <p>The free Starter Pack includes ${TEAMS.filter((t) => t.free).length} flags. Unlock every team, all games and the matchday challenges.</p>
            <a class="btn btn-primary" href="#/premium">See plans & free trial</a>
          </section>`,
    )}

    <section class="card">
      <h2 class="card-title">🌟 Featured flags</h2>
      <div class="flag-grid flag-grid-mini">
        ${raw(
          featured
            .map(
              (t) => html`
                <a class="flag-tile" href="#/color/${t.code}">
                  ${raw(flagSVG(t.code, { mode: s.coloring[t.code]?.completed ? 'full' : 'outline' }))}
                  <span class="flag-tile-name">${t.name}</span>
                </a>`,
            )
            .join(''),
        )}
      </div>
    </section>
  `;
}
