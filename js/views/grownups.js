/**
 * Grown-ups corner: settings, privacy summary, educators info and
 * data controls. Sensitive actions sit behind the parent gate.
 */

import { get, save, resetAll, PLANS } from '../state.js';
import { html, raw, toast, parentGate, modal } from '../ui.js';

export function render(root) {
  const s = get();

  root.innerHTML = html`
    <header class="page-head">
      <h1>👨‍👩‍👧 Grown-ups corner</h1>
      <p>Settings, privacy and info for parents &amp; teachers.</p>
    </header>

    <section class="card">
      <h2 class="card-title">⚙️ Settings</h2>
      <label class="setting-row">
        <span>🔊 Sound effects</span>
        <input type="checkbox" data-set="sound" ${s.settings.sound ? 'checked' : ''} />
      </label>
      <label class="setting-row">
        <span>🪄 Reduce animations</span>
        <input type="checkbox" data-set="reducedMotion" ${s.settings.reducedMotion ? 'checked' : ''} />
      </label>
      <label class="setting-row">
        <span>🎯 Guided colouring (show right/wrong)</span>
        <input type="checkbox" data-set="guided" ${s.settings.guided ? 'checked' : ''} />
      </label>
    </section>

    <section class="card">
      <h2 class="card-title">🔒 Privacy, in plain words</h2>
      <ul class="plain-list">
        <li>No accounts, no sign-up — the app works entirely on this device.</li>
        <li>Progress is stored locally in your browser only. We collect <b>no personal data</b>.</li>
        <li>No ads, no third-party trackers, no chat, no external links inside kid areas.</li>
        <li>Designed with COPPA principles in mind for children under 13.</li>
      </ul>
      <a class="card-link" href="privacy.html" target="_blank" rel="noopener">Read the full privacy policy →</a>
    </section>

    <section class="card">
      <h2 class="card-title">🏫 For educators</h2>
      <p>
        WorldCopa doubles as a geography starter for classrooms: every national
        team's flag, capital, language and continent, wrapped in games kids ask to play.
      </p>
      <p>
        The <b>Family &amp; Classroom plan</b> (${PLANS.family.price}) covers multi-student use, and the
        <b>Institutional Partner Program</b> (from $1,000/year) adds curriculum
        alignment, printable worksheets and dedicated support.
      </p>
      <p class="muted">Contact: partnerships@flagexplorer.example (demo placeholder)</p>
    </section>

    <section class="card">
      <h2 class="card-title">🗑️ Data controls</h2>
      <p>Erase all progress, stars, badges and plan state from this device.</p>
      <button class="btn btn-danger" data-reset>Reset all progress</button>
    </section>

    <section class="card about-card">
      <h2 class="card-title">ℹ️ About</h2>
      <p>
        <b>WorldCopa</b> — Color the Cup. Learn the World. 🌍
      </p>
      <p class="muted">Version 1.0.1 · Made with ⚽ + 🎨</p>
      <p class="muted" style="font-size:0.8rem;margin-top:8px">
        WorldCopa is an independent educational game. It is not affiliated with,
        endorsed by, or sponsored by FIFA or any tournament organizer. National
        flags are in the public domain; match dates shown are publicly available facts.
      </p>
    </section>
  `;

  root.querySelectorAll('[data-set]').forEach((input) => {
    input.addEventListener('change', () => {
      get().settings[input.dataset.set] = input.checked;
      save();
      toast('Saved!', { emoji: '✅', ms: 1200 });
    });
  });

  root.querySelector('[data-reset]').addEventListener('click', () => {
    parentGate(() => {
      modal(html`
        <h3 class="modal-title">⚠️ Really reset everything?</h3>
        <p>All flags, stars, badges and stamps will be gone. This cannot be undone.</p>
        <div class="finish-actions">
          <button class="btn btn-danger" data-confirm>Yes, erase it all</button>
          <button class="btn btn-ghost" data-cancel>Keep my progress</button>
        </div>
      `).box.addEventListener('click', (e) => {
        if (e.target.closest('[data-confirm]')) {
          resetAll();
          toast('All progress erased.', { emoji: '🗑️' });
          location.hash = '#/home';
          e.target.closest('.modal-backdrop').remove();
        } else if (e.target.closest('[data-cancel]')) {
          e.target.closest('.modal-backdrop').remove();
        }
      });
    });
  });
}
