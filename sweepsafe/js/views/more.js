import { get, save, resetAll, removeFinding } from '../state.js';
import { html, raw, toast, modal } from '../ui.js';

export function render(root) {
  const s = get();
  const draw = () => {
    root.innerHTML = html`
      <header class="page-head"><h1>More</h1></header>

      <h2 class="section-title">🗂️ Findings (${String(s.findings.length)})</h2>
      ${raw(s.findings.length
        ? s.findings.map((f) => html`
          <div class="signal-row">
            <div style="flex:1"><div class="signal-name">${f.label}</div><div class="signal-meta">${f.note || ''} · ${new Date(f.ts).toLocaleString()}</div></div>
            <button class="btn btn-ghost" data-del="${f.id}" style="min-height:36px;padding:6px 12px">✕</button>
          </div>`).join('')
        : '<div class="card muted">Nothing logged yet. Flag anything suspicious from the scanner and it’ll appear here.</div>')}

      <h2 class="section-title">⚙️ Settings</h2>
      <section class="card">
        <label style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>🔊 Sound</span><input type="checkbox" data-set="sound" ${s.settings.sound ? 'checked' : ''}></label>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>📳 Haptics</span><input type="checkbox" data-set="haptics" ${s.settings.haptics ? 'checked' : ''}></label>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>🪄 Reduce motion</span><input type="checkbox" data-set="reducedMotion" ${s.settings.reducedMotion ? 'checked' : ''}></label>
      </section>

      <h2 class="section-title">🔒 Privacy</h2>
      <section class="card">
        <p class="muted" style="margin:0 0 8px">SweepSafe runs entirely on your device. Scans, sweeps and findings never leave your phone. No accounts, no ads, no trackers.</p>
        <a class="card-link" href="privacy.html" target="_blank" rel="noopener">Read the privacy policy →</a>
      </section>

      <section class="card">
        <h3 class="card-title">Reset</h3>
        <p class="muted" style="margin:0 0 10px">Erase all sweeps, findings and settings on this device.</p>
        <button class="btn btn-danger" data-reset>Reset all data</button>
      </section>
      <p class="center muted" style="font-size:0.8rem;margin-top:18px">SweepSafe v1.0 · Personal counter-surveillance. Not a guarantee a space is clean.</p>
    `;
    root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { removeFinding(b.dataset.del); save(); draw(); }));
    root.querySelectorAll('[data-set]').forEach((i) => i.addEventListener('change', () => { get().settings[i.dataset.set] = i.checked; save(); toast('Saved'); }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      modal(html`<h3 class="modal-title">Reset everything?</h3><p class="muted">All sweeps, findings and settings will be erased. This can’t be undone.</p>
        <div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-danger" data-yes style="flex:1">Erase</button><button class="btn btn-ghost" data-no style="flex:1">Cancel</button></div>`)
        .box.addEventListener('click', (e) => {
          if (e.target.closest('[data-yes]')) { resetAll(); toast('All data erased.'); location.hash = '#/home'; e.target.closest('.modal-backdrop').remove(); }
          else if (e.target.closest('[data-no]')) e.target.closest('.modal-backdrop').remove();
        });
    });
  };
  draw();
}
