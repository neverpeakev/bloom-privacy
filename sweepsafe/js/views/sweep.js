import { get, save, toggleStep, sweepProgress } from '../state.js';
import { SWEEPS, SWEEP_BY_ID } from '../data/sweep.js';
import { html, raw } from '../ui.js';

export function render(root, args = []) {
  const id = args[0];
  if (!id) return renderList(root);
  const sw = SWEEP_BY_ID[id];
  if (!sw) { location.hash = '#/sweep'; return; }
  renderSweep(root, sw);
}

function renderList(root) {
  root.innerHTML = html`
    <header class="page-head"><h1>Guided sweeps</h1><p>Methodical checklists — your most reliable detection tool.</p></header>
    ${raw(SWEEPS.map((sw) => {
      const p = sweepProgress(sw.id, sw.steps.length);
      return html`
        <a class="card" href="#/sweep/${sw.id}" style="display:block;text-decoration:none;color:inherit">
          <div style="display:flex;gap:13px;align-items:center">
            <div class="tool-icon" style="margin:0">${sw.icon}</div>
            <div style="flex:1"><h3 style="margin:0 0 2px">${sw.title}</h3><p class="muted" style="margin:0;font-size:0.9rem">${sw.blurb}</p></div>
            <span class="muted">${String(p.done)}/${String(p.total)}</span>
          </div>
          <div class="progress-bar" style="margin-top:11px"><div class="progress-fill" style="width:${String(Math.round(p.pct * 100))}%"></div></div>
        </a>`;
    }).join(''))}
  `;
}

function renderSweep(root, sw) {
  const s = get();
  const draw = () => {
    const p = sweepProgress(sw.id, sw.steps.length);
    root.innerHTML = html`
      <header class="page-head">
        <a class="card-link" href="#/sweep">← All sweeps</a>
        <h1 style="margin-top:8px">${sw.icon} ${sw.title}</h1>
        <p>${sw.blurb}</p>
      </header>
      ${raw(sw.danger ? '<div class="notice danger" style="margin-bottom:14px">If you may be in danger, prioritise leaving and contacting authorities over documentation.</div>' : '')}
      <div class="progress-bar"><div class="progress-fill" style="width:${String(Math.round(p.pct * 100))}%"></div></div>
      <p class="muted" style="margin:8px 0 4px">${String(p.done)} of ${String(p.total)} done</p>
      <section class="card">
        ${raw(sw.steps.map((st) => {
          const done = !!(s.sweeps[sw.id] && s.sweeps[sw.id][st.id]);
          return html`
            <div class="step ${done ? 'done' : ''}" data-step="${st.id}">
              <div class="step-check" role="checkbox" aria-checked="${done ? 'true' : 'false'}" tabindex="0">✓</div>
              <div class="step-body"><h4>${st.title}</h4><p>${st.body}</p></div>
            </div>`;
        }).join(''))}
      </section>
      ${raw(p.done === p.total ? '<div class="notice" style="border-left-color:var(--green)">✅ Sweep complete. Trust your instincts — if something still feels off, run the Bedroom deep sweep or leave.</div>' : '')}
    `;
    root.querySelectorAll('[data-step]').forEach((row) => {
      const handler = () => { toggleStep(sw.id, row.dataset.step); save(); draw(); };
      row.querySelector('.step-check').addEventListener('click', handler);
      row.querySelector('.step-check').addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handler(); } });
    });
  };
  draw();
}
