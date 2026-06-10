/**
 * Games hub: choose between Trivia, Flag Match and Continent Quest.
 */

import { get, dayKey } from '../state.js';
import { html, raw } from '../ui.js';

export function render(root) {
  const s = get();
  const dailyDone = !!s.daily[dayKey()]?.done;
  root.innerHTML = html`
    <header class="page-head">
      <h1>🎮 Game Zone</h1>
      <p>Three ways to become a geography champion. Earn ⭐ in every round!</p>
    </header>

    <section class="card card-daily ${dailyDone ? 'done' : ''}">
      <div class="card-daily-left">
        <h2 class="card-title">📅 Daily Challenge</h2>
        <p>${dailyDone ? 'Completed today — see you tomorrow!' : 'Today’s 5-question special. One try per day!'}</p>
      </div>
      <a class="btn ${dailyDone ? 'btn-ghost' : 'btn-sunny'}" href="#/trivia/daily">${dailyDone ? '✅ Done' : '▶️ Play'}</a>
    </section>

    <div class="grid-3">
      <a class="card card-action" href="#/trivia">
        <div class="card-action-emoji">🧠</div>
        <h3>Trivia Arena</h3>
        <p>Capitals, continents, languages and football lore.</p>
        <span class="card-stat">${s.trivia.correct} correct answers</span>
      </a>
      <a class="card card-action" href="#/flagmatch">
        <div class="card-action-emoji">🔎</div>
        <h3>Flag Match</h3>
        <p>See the flag, name the country — fast!</p>
        <span class="card-stat">Best: ${s.flagmatch.best}/10</span>
      </a>
      <a class="card card-action" href="#/continents">
        <div class="card-action-emoji">🗺️</div>
        <h3>Continent Quest</h3>
        <p>Sort every country onto its continent.</p>
        <span class="card-stat">Best streak: ${s.continents.best}</span>
      </a>
    </div>
  `;
}
