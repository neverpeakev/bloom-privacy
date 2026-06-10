/**
 * Continent Quest — tap the continent each country belongs to.
 * Build the longest streak you can; 12 countries per round.
 */

import { TEAMS, CONTINENTS } from '../data/teams.js';
import { generateContinentRound } from '../games/questions.js';
import { get, save, addStars, addStamp, evaluateBadges, isPro } from '../state.js';
import { html, raw, showBadges } from '../ui.js';
import { sfx } from '../audio.js';
import { celebrate } from '../confetti.js';

const ROUND = 12;

const CONTINENT_EMOJI = {
  Africa: '🦁',
  Asia: '🐼',
  Europe: '🏰',
  'North America': '🦅',
  'South America': '🦜',
  Oceania: '🐨',
};

export function render(root) {
  const s = get();
  const pool = isPro(s) ? TEAMS : TEAMS.filter((t) => t.free);
  const queue = generateContinentRound(ROUND, Math.random, { teams: pool });

  let index = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;

  function show() {
    const item = queue[index];
    root.innerHTML = html`
      <header class="page-head">
        <h1>🗺️ Continent Quest</h1>
        <p>Country <b>${index + 1}</b> of ${queue.length} · Streak 🔥${streak}</p>
      </header>
      <section class="card quiz-card center">
        <div class="continent-country">
          <span class="continent-emoji">${item.emoji}</span>
          <h2>${item.name}</h2>
          <p class="muted">Which continent is it on?</p>
        </div>
        <div class="continent-grid">
          ${raw(
            CONTINENTS.map(
              (c) => html`
                <button class="btn btn-continent" data-continent="${c}">
                  <span>${CONTINENT_EMOJI[c]}</span> ${c}
                </button>`,
            ).join(''),
          )}
        </div>
        <div class="quiz-explain" data-explain hidden></div>
        <button class="btn btn-primary btn-block" data-next hidden>
          ${index + 1 === queue.length ? '🏁 See results' : 'Next country →'}
        </button>
      </section>
    `;
    let answered = false;
    root.querySelectorAll('[data-continent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const pick = btn.dataset.continent;
        const right = item.accept.includes(pick);
        if (right) {
          score++;
          streak++;
          bestStreak = Math.max(bestStreak, streak);
          addStamp(item.code);
          sfx.correct();
        } else {
          streak = 0;
          sfx.wrong();
        }
        root.querySelectorAll('[data-continent]').forEach((b) => {
          b.disabled = true;
          if (item.accept.includes(b.dataset.continent)) b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });
        const ex = root.querySelector('[data-explain]');
        ex.hidden = false;
        ex.textContent = right
          ? `✅ Yes! ${item.name} is in ${item.accept.join(' and ')}.`
          : `💡 ${item.name} is in ${item.accept.join(' and ')}.`;
        root.querySelector('[data-next]').hidden = false;
      });
    });
    root.querySelector('[data-next]').addEventListener('click', () => {
      index++;
      if (index < queue.length) show();
      else results();
    });
  }

  function results() {
    const st = get();
    st.continents.played++;
    st.continents.best = Math.max(st.continents.best, bestStreak);
    const earned = score * 2 + (score === queue.length ? 6 : 0);
    addStars(earned);
    const fresh = evaluateBadges();
    save();
    if (score >= queue.length - 1) {
      celebrate();
      sfx.fanfare();
    }
    root.innerHTML = html`
      <header class="page-head"><h1>🗺️ Continent Quest</h1></header>
      <section class="card center">
        <p class="big-emoji">${score === queue.length ? '🏆' : score >= 9 ? '🌍' : '🧭'}</p>
        <h2>${score === queue.length ? 'WORLD CHAMPION!' : score >= 9 ? 'Globe trotter!' : 'Keep exploring!'}</h2>
        <p class="result-score">${score} / ${queue.length} · best streak 🔥${bestStreak} · +${earned} ⭐</p>
        <div class="finish-actions">
          <button class="btn btn-primary" data-again>🔁 Play again</button>
          <a class="btn btn-ghost" href="#/games">All games</a>
        </div>
      </section>
    `;
    root.querySelector('[data-again]').addEventListener('click', () => render(root));
    setTimeout(() => showBadges(fresh), 900);
  }

  show();
}
