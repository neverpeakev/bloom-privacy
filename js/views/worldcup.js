/**
 * World Cup hub: the 12 real groups, the full 104-match schedule and the
 * Matchday Challenge — a quiz built from each day's actual fixtures.
 */

import { TEAM_BY_CODE, GROUPS, teamsInGroup, CONFEDERATIONS } from '../data/teams.js';
import { MATCHES, STAGE_LABELS, matchesOn } from '../data/matches.js';
import { generateMatchdayQuiz } from '../games/questions.js';
import { get, save, addStars, evaluateBadges, dayKey, isPro, seededRng } from '../state.js';
import { html, raw, modal, showBadges, toast } from '../ui.js';
import { flagSVG } from '../flags.js';
import { sfx } from '../audio.js';
import { celebrate } from '../confetti.js';

function teamCell(code) {
  const t = TEAM_BY_CODE[code];
  const done = get().coloring[code]?.completed;
  return html`
    <a class="wc-team ${done ? 'done' : ''}" href="#/color/${code}" title="${t.name} (${CONFEDERATIONS[t.conf] || t.conf})">
      <span class="wc-team-flag">${raw(flagSVG(code, { mode: 'full' }))}</span>
      <span class="wc-team-name">${t.name}</span>
      ${raw(done ? '<span class="wc-team-check">✅</span>' : '')}
    </a>`;
}

function matchLine(m) {
  const time = new Date(m.kickoff).toLocaleString([], {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  if (!m.home) {
    return html`
      <div class="match-row">
        <span class="match-teams match-placeholder">M${m.num} · ${m.placeholder}</span>
        <span class="match-meta">${STAGE_LABELS[m.stage]} · ${time} · ${m.venue}, ${m.city}</span>
      </div>`;
  }
  const h = TEAM_BY_CODE[m.home];
  const a = TEAM_BY_CODE[m.away];
  return html`
    <div class="match-row">
      <span class="match-teams">
        <span class="match-team">${h.emoji} ${h.name}</span>
        <span class="match-vs">vs</span>
        <span class="match-team">${a.name} ${a.emoji}</span>
      </span>
      <span class="match-meta">${m.group ? `Group ${m.group}` : STAGE_LABELS[m.stage]} · ${time} · ${m.city}</span>
    </div>`;
}

function runMatchdayQuiz() {
  const s = get();
  const key = dayKey();
  const today = matchesOn(new Date());
  const playable = today.filter((m) => m.home && m.away);
  if (!playable.length) {
    toast('No group matches today — check the schedule!', { emoji: '📅' });
    return;
  }
  if (s.matchdayDone[key]) {
    toast('Matchday challenge already completed today!', { emoji: '✅' });
    return;
  }
  if (!isPro(s)) {
    location.hash = '#/premium';
    return;
  }
  const rng = seededRng('matchday-' + key);
  const questions = generateMatchdayQuiz(playable, rng);
  let index = 0;
  let score = 0;

  const m = modal('<div data-quiz></div>', { closable: true });
  const host = m.box.querySelector('[data-quiz]');

  function show() {
    const q = questions[index];
    host.innerHTML = html`
      <h3 class="modal-title">⚽ Matchday Challenge</h3>
      <p class="muted">Question ${index + 1} of ${questions.length}</p>
      <h4 class="quiz-question">${q.text}</h4>
      <div class="quiz-options">
        ${raw(q.options.map((o) => html`<button class="btn btn-option" data-option="${o}">${o}</button>`).join(''))}
      </div>
      <div class="quiz-explain" data-explain hidden></div>
      <button class="btn btn-primary btn-block" data-next hidden>
        ${index + 1 === questions.length ? '🏁 Finish' : 'Next →'}
      </button>
    `;
    let answered = false;
    host.querySelectorAll('[data-option]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const right = btn.dataset.option === q.answer;
        if (right) {
          score++;
          sfx.correct();
        } else sfx.wrong();
        host.querySelectorAll('[data-option]').forEach((b) => {
          b.disabled = true;
          if (b.dataset.option === q.answer) b.classList.add('right');
          else if (b === btn) b.classList.add('wrong');
        });
        const ex = host.querySelector('[data-explain]');
        ex.hidden = false;
        ex.textContent = (right ? '✅ ' : '💡 ') + q.explain;
        host.querySelector('[data-next]').hidden = false;
      });
    });
    host.querySelector('[data-next]').addEventListener('click', () => {
      index++;
      if (index < questions.length) show();
      else finish();
    });
  }

  function finish() {
    const st = get();
    st.matchdayDone[key] = true;
    const earned = score * 3 + 5;
    addStars(earned);
    const fresh = evaluateBadges();
    save();
    celebrate();
    sfx.fanfare();
    host.innerHTML = html`
      <h3 class="modal-title">🎉 Matchday complete!</h3>
      <p class="result-score center">${score} / ${questions.length} · +${earned} ⭐</p>
      <button class="btn btn-primary btn-block" data-close>Brilliant!</button>
    `;
    host.querySelector('[data-close]').addEventListener('click', () => m.close());
    setTimeout(() => showBadges(fresh), 800);
  }

  show();
}

export function render(root) {
  const s = get();
  const key = dayKey();
  const today = matchesOn(new Date()).filter((m) => m.home && m.away);
  const matchdayAvailable = today.length > 0 && !s.matchdayDone[key];

  const groupCards = GROUPS.map((g) => {
    const colored = teamsInGroup(g).filter((t) => s.coloring[t.code]?.completed).length;
    return html`
      <section class="card wc-group">
        <h3 class="group-title"><span class="group-letter">${g}</span> Group ${g}
          <span class="wc-group-progress">${colored}/4 🎨</span>
        </h3>
        <div class="wc-group-teams">
          ${raw(teamsInGroup(g).map((t) => teamCell(t.code)).join(''))}
        </div>
      </section>`;
  }).join('');

  const stages = ['group', 'round_32', 'round_16', 'quarter', 'semi', 'third', 'final'];

  root.innerHTML = html`
    <header class="page-head">
      <h1>⚽ World Cup 2026</h1>
      <p>48 teams · 12 groups · 104 matches across Canada, Mexico and the USA.</p>
    </header>

    <section class="card card-daily ${matchdayAvailable ? '' : 'done'}">
      <div class="card-daily-left">
        <h2 class="card-title">🏟️ Matchday Challenge</h2>
        <p>${
          today.length === 0
            ? 'No group matches today — explore the schedule below!'
            : s.matchdayDone[key]
              ? 'Completed today. New challenge with tomorrow’s matches!'
              : `Quiz time about today's ${today.length} real match${today.length > 1 ? 'es' : ''}! ${isPro(s) ? '' : '(Pro)'}`
        }</p>
      </div>
      <button class="btn ${matchdayAvailable ? 'btn-sunny' : 'btn-ghost'}" data-matchday ${matchdayAvailable ? '' : 'disabled'}>
        ${s.matchdayDone[key] ? '✅ Done' : '▶️ Play'}
      </button>
    </section>

    <h2 class="section-title">The groups</h2>
    <div class="wc-groups">${raw(groupCards)}</div>

    <h2 class="section-title">Match schedule</h2>
    <div class="stage-tabs" role="tablist">
      ${raw(
        stages
          .map(
            (st, i) =>
              html`<button class="stage-tab ${i === 0 ? 'active' : ''}" role="tab" data-stage="${st}">${STAGE_LABELS[st]}</button>`,
          )
          .join(''),
      )}
    </div>
    <section class="card match-list" data-schedule></section>
  `;

  const schedule = root.querySelector('[data-schedule]');
  function renderStage(stage) {
    const list = MATCHES.filter((m) => m.stage === stage);
    schedule.innerHTML = list.map(matchLine).join('');
  }
  root.querySelectorAll('.stage-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      root.querySelectorAll('.stage-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderStage(tab.dataset.stage);
    });
  });
  renderStage('group');

  root.querySelector('[data-matchday]').addEventListener('click', runMatchdayQuiz);
}
