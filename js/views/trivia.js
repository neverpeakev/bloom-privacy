/**
 * Trivia Arena — quick-fire quiz rounds, plus the once-a-day Daily Challenge
 * (seeded by the calendar date so everyone gets the same questions).
 */

import { TEAMS } from '../data/teams.js';
import { generateQuiz } from '../games/questions.js';
import { get, save, addStars, evaluateBadges, seededRng, dayKey, isPro } from '../state.js';
import { html, raw, toast, showBadges } from '../ui.js';
import { sfx } from '../audio.js';
import { celebrate } from '../confetti.js';

const ROUND_SIZE = 5;

export function render(root, args = []) {
  const daily = args.includes('daily');
  const s = get();

  if (daily && s.daily[dayKey()]?.done) {
    root.innerHTML = html`
      <header class="page-head"><h1>📅 Daily Challenge</h1></header>
      <section class="card center">
        <p class="big-emoji">✅</p>
        <h2>Already done today!</h2>
        <p>You scored <b>${s.daily[dayKey()].score}/${ROUND_SIZE}</b>. A new challenge lands tomorrow.</p>
        <a class="btn btn-primary" href="#/trivia">Play free trivia instead</a>
      </section>`;
    return;
  }

  const pool = isPro(s) ? TEAMS : TEAMS.filter((t) => t.free);
  const rng = daily ? seededRng('daily-' + dayKey()) : Math.random;
  const questions = generateQuiz(ROUND_SIZE, rng, { teams: daily ? TEAMS : pool });

  let index = 0;
  let score = 0;
  let answered = false;

  function showQuestion() {
    const q = questions[index];
    root.innerHTML = html`
      <header class="page-head">
        <h1>${daily ? '📅 Daily Challenge' : '🧠 Trivia Arena'}</h1>
        <p>Question <b>${index + 1}</b> of ${questions.length} · Score ${score}</p>
      </header>
      <section class="card quiz-card">
        <div class="quiz-progress">
          ${raw(
            questions
              .map((_, i) => `<span class="quiz-dot ${i < index ? 'past' : ''} ${i === index ? 'now' : ''}"></span>`)
              .join(''),
          )}
        </div>
        <h2 class="quiz-question">${q.text}</h2>
        <div class="quiz-options">
          ${raw(
            q.options
              .map((o) => html`<button class="btn btn-option" data-option="${o}">${o}</button>`)
              .join(''),
          )}
        </div>
        <div class="quiz-explain" data-explain hidden></div>
        <button class="btn btn-primary btn-block" data-next hidden>
          ${index + 1 === questions.length ? '🏁 See results' : 'Next question →'}
        </button>
      </section>
    `;
    answered = false;
    root.querySelectorAll('[data-option]').forEach((btn) => {
      btn.addEventListener('click', () => answer(btn, q));
    });
    root.querySelector('[data-next]').addEventListener('click', () => {
      index++;
      if (index < questions.length) showQuestion();
      else showResults();
    });
  }

  function answer(btn, q) {
    if (answered) return;
    answered = true;
    const right = btn.dataset.option === q.answer;
    if (right) {
      score++;
      get().trivia.correct++;
      sfx.correct();
    } else {
      sfx.wrong();
    }
    root.querySelectorAll('[data-option]').forEach((b) => {
      b.disabled = true;
      if (b.dataset.option === q.answer) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    const ex = root.querySelector('[data-explain]');
    ex.hidden = false;
    ex.textContent = (right ? '✅ ' : '💡 ') + q.explain;
    root.querySelector('[data-next]').hidden = false;
    save();
  }

  function showResults() {
    const st = get();
    st.trivia.played++;
    const perfect = score === questions.length;
    if (perfect) st.trivia.perfect = true;
    st.trivia.bestRun = Math.max(st.trivia.bestRun, score);
    const earned = score * 2 + (perfect ? 5 : 0) + (daily ? 5 : 0);
    addStars(earned);
    if (daily) st.daily[dayKey()] = { done: true, score, kind: 'trivia' };
    const fresh = evaluateBadges();
    save();
    if (perfect) {
      celebrate();
      sfx.fanfare();
    }
    root.innerHTML = html`
      <header class="page-head"><h1>${daily ? '📅 Daily Challenge' : '🧠 Trivia Arena'}</h1></header>
      <section class="card center">
        <p class="big-emoji">${perfect ? '🏆' : score >= 3 ? '🌟' : '💪'}</p>
        <h2>${perfect ? 'PERFECT ROUND!' : score >= 3 ? 'Great job!' : 'Good try!'}</h2>
        <p class="result-score">${score} / ${questions.length} correct · +${earned} ⭐</p>
        <div class="finish-actions">
          ${raw(daily ? '' : html`<button class="btn btn-primary" data-again>🔁 Play again</button>`)}
          <a class="btn btn-ghost" href="#/games">All games</a>
        </div>
      </section>
    `;
    root.querySelector('[data-again]')?.addEventListener('click', () => render(root, args));
    setTimeout(() => showBadges(fresh), 900);
    if (!isPro(st) && st.trivia.played === 3) {
      setTimeout(
        () => toast('Loving trivia? Unlock questions about all 48 teams!', { emoji: '🔓', ms: 3500 }),
        2200,
      );
    }
  }

  showQuestion();
}
