/**
 * Coloring: the flag gallery and the paint-by-region studio.
 *
 * Guided mode (default): paint a region with its true colour to lock it in;
 * wrong colours wobble and count a mistake. Free-paint mode: any colour
 * goes anywhere — finishing requires every region painted (any colour).
 */

import { TEAMS, TEAM_BY_CODE, GROUPS, teamsInGroup } from '../data/teams.js';
import { FLAGS, flagSVG, paletteWithDecoys } from '../flags.js';
import { get, save, addStars, addStamp, evaluateBadges, isFlagUnlocked, seededRng, dayKey } from '../state.js';
import { html, raw, esc, toast, modal, showBadges, shuffled } from '../ui.js';
import { sfx } from '../audio.js';
import { celebrate } from '../confetti.js';

// ── Gallery ────────────────────────────────────────────────────────────

function renderGallery(root) {
  const s = get();
  const sections = GROUPS.map((g) => {
    const tiles = teamsInGroup(g)
      .map((t) => {
        const unlocked = isFlagUnlocked(t.code, s);
        const done = s.coloring[t.code]?.completed;
        const fills = s.coloring[t.code]?.fills || {};
        return html`
          <a class="flag-tile ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}"
             href="${unlocked ? `#/color/${t.code}` : '#/premium'}"
             aria-label="${t.name}${unlocked ? '' : ' (locked)'}">
            ${raw(flagSVG(t.code, done ? { mode: 'full' } : { mode: 'outline', fills }))}
            <span class="flag-tile-name">${t.name}</span>
            ${raw(done ? '<span class="flag-tile-badge">✅</span>' : '')}
            ${raw(unlocked ? '' : '<span class="flag-tile-lock">🔒</span>')}
          </a>`;
      })
      .join('');
    return html`
      <section class="group-section">
        <h2 class="group-title"><span class="group-letter">${g}</span> Group ${g}</h2>
        <div class="flag-grid">${raw(tiles)}</div>
      </section>`;
  }).join('');

  const done = Object.values(s.coloring).filter((c) => c.completed).length;
  root.innerHTML = html`
    <header class="page-head">
      <h1>🎨 Coloring Studio</h1>
      <p>Pick a flag and paint it region by region. <b>${done}</b> of ${TEAMS.length} colored so far!</p>
    </header>
    ${raw(sections)}
  `;
}

// ── Studio ─────────────────────────────────────────────────────────────

function renderStudio(root, code) {
  const team = TEAM_BY_CODE[code];
  const spec = FLAGS[code];
  const s = get();
  if (!team || !spec) {
    location.hash = '#/color';
    return;
  }
  if (!isFlagUnlocked(code, s)) {
    location.hash = '#/premium';
    return;
  }

  const saveSlot = (s.coloring[code] ||= { fills: {}, completed: false, mistakes: 0 });
  const rng = seededRng(code + dayKey());
  const palette = shuffled(paletteWithDecoys(code, rng), rng);
  let selected = palette[0];
  let guided = s.settings.guided;
  let locked = new Set(
    Object.entries(saveSlot.fills)
      .filter(([id, c]) => spec.regions.find((r) => r.id === id)?.color === c)
      .map(([id]) => id),
  );

  root.innerHTML = html`
    <header class="page-head studio-head">
      <a class="btn btn-ghost btn-sm" href="#/color">← All flags</a>
      <h1>${team.emoji} ${team.name}</h1>
      <label class="toggle" title="Guided mode tells you when a colour is right">
        <input type="checkbox" data-guided ${guided ? 'checked' : ''} />
        <span>Guided</span>
      </label>
    </header>

    <section class="studio">
      <div class="studio-canvas" data-canvas></div>
      <div class="studio-side">
        <div class="palette" role="toolbar" aria-label="Colour palette">
          ${raw(
            palette
              .map(
                (p, i) => html`
                  <button class="swatch ${i === 0 ? 'selected' : ''}" data-color="${p.color}"
                          style="--sw:${p.color}" aria-label="${p.name}" title="${p.name}"></button>`,
              )
              .join(''),
          )}
        </div>
        <div class="studio-progress">
          <div class="progress-bar"><div class="progress-fill" data-fill></div></div>
          <span data-count></span>
        </div>
        <div class="studio-actions">
          <button class="btn btn-ghost btn-sm" data-reset>🧽 Start over</button>
        </div>
        <div class="fact-card">
          <h3>Did you know?</h3>
          <p>${team.fact}</p>
        </div>
      </div>
    </section>
  `;

  const canvas = root.querySelector('[data-canvas]');

  function paintSVG() {
    canvas.innerHTML = flagSVG(code, { mode: 'outline', fills: saveSlot.fills, cls: 'studio-svg' });
    const svg = canvas.querySelector('svg');
    const paths = svg.querySelectorAll('path:not([fill="none"])');
    // The first child is the white backdrop rect; region paths follow in order.
    spec.regions.forEach((r, i) => {
      const p = paths[i];
      p.dataset.region = r.id;
      p.classList.add('region');
      if (locked.has(r.id)) p.classList.add('locked-in');
    });
    svg.addEventListener('click', (e) => {
      const p = e.target.closest('path.region');
      if (p) handlePaint(p.dataset.region, p);
    });
  }

  function updateProgress() {
    const total = spec.regions.length;
    const done = guided
      ? locked.size
      : Object.keys(saveSlot.fills).filter((id) => spec.regions.some((r) => r.id === id)).length;
    root.querySelector('[data-fill]').style.width = `${(done / total) * 100}%`;
    root.querySelector('[data-count]').textContent = `${done} / ${total} regions`;
    return done === total;
  }

  function finish() {
    if (saveSlot.completed) return;
    saveSlot.completed = true;
    addStamp(code);
    const earned = Math.max(5, 20 - saveSlot.mistakes * 2);
    addStars(earned);
    const fresh = evaluateBadges();
    save();
    sfx.fanfare();
    celebrate();
    modal(html`
      <div class="finish-modal">
        <h3 class="modal-title">🎉 ${team.name} complete!</h3>
        ${raw(flagSVG(code, { mode: 'full', cls: 'finish-flag' }))}
        <p class="finish-stars">+${earned} ⭐</p>
        <p class="finish-fact">⚽ ${team.soccer}</p>
        <div class="finish-actions">
          <a class="btn btn-ghost" href="#/color" onclick="this.closest('.modal-backdrop').remove()">All flags</a>
          ${raw(nextFlagButton())}
        </div>
      </div>
    `);
    setTimeout(() => showBadges(fresh), 1200);
  }

  function nextFlagButton() {
    const idx = TEAMS.findIndex((t) => t.code === code);
    const after = [...TEAMS.slice(idx + 1), ...TEAMS.slice(0, idx)];
    const next = after.find((t) => isFlagUnlocked(t.code) && !get().coloring[t.code]?.completed);
    return next
      ? html`<a class="btn btn-primary" href="#/color/${next.code}"
             onclick="this.closest('.modal-backdrop').remove()">Next: ${next.emoji} ${next.name} →</a>`
      : html`<a class="btn btn-primary" href="#/passport" onclick="this.closest('.modal-backdrop').remove()">🛂 Passport</a>`;
  }

  function handlePaint(regionId, pathEl) {
    const region = spec.regions.find((r) => r.id === regionId);
    if (!region || locked.has(regionId)) return;
    if (guided) {
      if (selected.color === region.color) {
        saveSlot.fills[regionId] = selected.color;
        locked.add(regionId);
        pathEl.setAttribute('fill', selected.color);
        pathEl.classList.add('locked-in', 'pop');
        sfx.correct();
      } else {
        saveSlot.mistakes++;
        pathEl.classList.remove('wobble');
        void pathEl.getBBox; // restart animation
        requestAnimationFrame(() => pathEl.classList.add('wobble'));
        sfx.wrong();
        toast(`Hmm, that region isn't ${selected.name.toLowerCase()}. Try another colour!`, { emoji: '🤔', ms: 1600 });
        save();
        return;
      }
    } else {
      saveSlot.fills[regionId] = selected.color;
      pathEl.setAttribute('fill', selected.color);
      sfx.paint();
    }
    save();
    if (updateProgress()) finish();
  }

  // Palette selection
  root.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      root.querySelectorAll('.swatch').forEach((x) => x.classList.remove('selected'));
      sw.classList.add('selected');
      selected = { color: sw.dataset.color, name: sw.title };
      sfx.tap();
    });
  });

  // Guided toggle
  root.querySelector('[data-guided]').addEventListener('change', (e) => {
    guided = e.target.checked;
    get().settings.guided = guided;
    save();
    updateProgress();
  });

  // Reset
  root.querySelector('[data-reset]').addEventListener('click', () => {
    saveSlot.fills = {};
    saveSlot.completed = false;
    saveSlot.mistakes = 0;
    locked = new Set();
    save();
    paintSVG();
    updateProgress();
    toast('Fresh start — happy painting!', { emoji: '🧽' });
  });

  paintSVG();
  updateProgress();
}

export function render(root, args = []) {
  const code = args[0];
  if (code) renderStudio(root, code);
  else renderGallery(root);
}
