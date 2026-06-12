/**
 * Flag Match — see a flag, pick the right country before the timer runs out.
 * 10 flags per round, 12 seconds each, bonus star for speed.
 */

import { TEAMS } from '../data/teams.js';
import { generateFlagRound } from '../games/questions.js';
import { get, save, addStars, addStamp, evaluateBadges, isPro } from '../state.js';
import { html, raw, showBadges } from '../ui.js';
import { flagSVG } from '../flags.js';
import { sfx } from '../audio.js';
import { celebrate } from '../confetti.js';

const ROUND = 10;
const SECONDS = 12;

export function render(root) {
  const s = get();
  const pool = isPro(s) ? TEAMS : TEAMS.filter((t) => t.free);
  const items = generateFlagRound(ROUND, Math.random, { teams: pool });

  let index = 0;
  let score = 0;
  let timer = null;
  let timeLeft = SECONDS;

  function cleanup() {
    clearInterval(timer);
  }

  function show() {
    const item = items[index];
    timeLeft = SECONDS;
    root.innerHTML = html`
      <header class="page-head">
        <h1>🔎 Flag Match</h1>
        <p>Flag <b>${index + 1}</b> of ${items.length} · Score ${score}</p>
      </header>
      <section class="card quiz-card">
        <div class="timer-bar"><div class="timer-fill" data-timer></div></div>
        <div class="flagmatch-flag">${raw(flagSVG(item.code, { mode: 'full' }))}</div>
        <h2 class="quiz-question">Which country does this flag belong to?</h2>
        <div class="quiz-options">
          ${raw(item.options.map((o) => html`<button class="btn btn-option" data-option="${o}">${o}</button>`).join(''))}
        </div>
        <div class="quiz-explain" data-explain hidden></div>
        <button class="btn btn-primary btn-block" data-next hidden>
          ${index + 1 === items.length ? '🏁 See results' : 'Next flag →'}
        </button>
      </section>
    `;
    const fill = root.querySelector('[data-timer]');
    fill.style.width = '100%';
    let answered = false;

    timer = setInterval(() => {
      timeLeft -= 0.1;
      fill.style.width = `${Math.max(0, (timeLeft / SECONDS) * 100)}%`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (!answered) settle(null, item);
      }
    }, 100);

    function settle(btn, it) {
      if (answered) return;
      answered = true;
      clearInterval(timer);
      const right = btn?.dataset.option === it.answer;
      if (right) {
        score++;
        addStamp(it.code);
        sfx.correct();
      } else {
        sfx.wrong();
      }
      root.querySelectorAll('[data-option]').forEach((b) => {
        b.disabled = true;
        if (b.dataset.option === it.answer) b.classList.add('right');
        else if (b === btn) b.classList.add('wrong');
      });
      const ex = root.querySelector('[data-explain]');
      ex.hidden = false;
      ex.textContent = (right ? '✅ ' : btn ? '💡 ' : '⏰ Time! ') + `${it.answer}: ${it.explain}`;
      root.querySelector('[data-next]').hidden = false;
    }

    root.querySelectorAll('[data-option]').forEach((btn) => {
      btn.addEventListener('click', () => settle(btn, item));
    });
    root.querySelector('[data-next]').addEventListener('click', () => {
      index++;
      if (index < items.length) show();
      else results();
    });
  }

  function results() {
    cleanup();
    const st = get();
    st.flagmatch.played++;
    st.flagmatch.best = Math.max(st.flagmatch.best, score);
    const earned = score * 2 + (score === ROUND ? 8 : 0);
    addStars(earned);
    const fresh = evaluateBadges();
    save();
    if (score >= 8) {
      celebrate();
      sfx.fanfare();
    }
    root.innerHTML = html`
      <header class="page-head"><h1>🔎 Flag Match</h1></header>
      <section class="card center">
        <p class="big-emoji">${score === ROUND ? '🏆' : score >= 8 ? '🌟' : score >= 5 ? '👏' : '💪'}</p>
        <h2>${score === ROUND ? 'FLAWLESS!' : score >= 8 ? 'Eagle eyes!' : 'Nice spotting!'}</h2>
        <p class="result-score">${score} / ${items.length} flags · +${earned} ⭐</p>
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
  return cleanup;
}
