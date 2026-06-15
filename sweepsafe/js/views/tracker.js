import { get, isPro, addFinding, save } from '../state.js';
import { html, raw, toast } from '../ui.js';
import { ble, isDemo } from '../native.js';
import { classifyDevice, rssiToMeters, proximity, bars } from '../sensor-logic.js';

export function render(root) {
  const s = get();
  if (!isPro(s) && !isDemo()) return locked(root);
  if (!ble.available()) return unavailable(root);

  root.innerHTML = html`
    <header class="page-head"><a class="card-link" href="#/sensors">← Sensors</a>
      <h1 style="margin-top:8px">📡 Tracker Radar</h1>
      <p>Scanning for nearby Bluetooth trackers. Walk the room slowly — a tracker’s signal gets stronger as you near it.</p></header>
    <div class="card" style="display:flex;align-items:center;gap:10px">
      <div style="width:10px;height:10px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 0 var(--teal);animation:pulse 1.4s infinite"></div>
      <span class="muted" data-count>Listening…</span>
    </div>
    <div data-list></div>
    <div class="card notice" style="margin-top:8px">Unknown devices aren’t necessarily trackers — headphones, watches and speakers also use Bluetooth. Trackers are flagged in amber. If one follows you between locations, treat it seriously: document it and contact authorities.</div>
    <style>@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,211,238,.5)}70%{box-shadow:0 0 0 12px rgba(34,211,238,0)}100%{box-shadow:0 0 0 0 rgba(34,211,238,0)}}</style>
  `;

  const listEl = root.querySelector('[data-list]');
  const countEl = root.querySelector('[data-count]');
  const seen = new Map(); // id -> classified device (latest)

  function draw() {
    const items = [...seen.values()].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
    const trackers = items.filter((d) => d.tracker).length;
    countEl.textContent = `${items.length} device${items.length === 1 ? '' : 's'} · ${trackers} possible tracker${trackers === 1 ? '' : 's'}`;
    listEl.innerHTML = items.map((d) => {
      const m = rssiToMeters(d.rssi);
      return html`
        <div class="signal-row" style="${d.tracker ? 'border-color:var(--amber)' : ''}">
          <div class="signal-bars">${bars(d.rssi)}</div>
          <div style="flex:1">
            <div class="signal-name">${d.name || 'Unknown device'} ${raw(d.tracker ? '<span class="signal-flag">⚑ possible tracker</span>' : '')}</div>
            <div class="signal-meta">${d.note} · ${proximity(d.rssi)}${m != null ? ` · ~${m} m` : ''}</div>
          </div>
          <button class="btn btn-ghost" data-log="${d.id}" style="min-height:36px;padding:6px 10px">⚑</button>
        </div>`;
    }).join('') || '<div class="card muted">No devices yet — keep moving around the room.</div>';
    listEl.querySelectorAll('[data-log]').forEach((b) => b.addEventListener('click', () => {
      const d = seen.get(b.dataset.log);
      addFinding({ kind: 'tracker', label: d?.name || d?.note || 'Bluetooth device', note: `${d?.note || ''} (${d?.rssi} dBm)` });
      save(); toast('Logged to Findings.');
    }));
  }

  let stopFn = () => {};
  Promise.resolve(ble.start((dev) => {
    const c = classifyDevice(dev);
    c.id = dev.id;
    c.name = c.name || dev.name;
    seen.set(dev.id, c);
    draw();
  })).then((fn) => { stopFn = fn; });
  draw();

  return () => { try { const r = stopFn(); if (r && r.then) r.catch(() => {}); } catch {} };
}

function locked(root) {
  root.innerHTML = html`<header class="page-head"><h1>📡 Tracker Radar</h1></header>
    <div class="card"><p>The Bluetooth tracker radar is a <b>Pro</b> tool. Unlock it along with the magnetometer and deep sweeps.</p>
    <a class="btn btn-primary btn-block" href="#/premium" style="margin-top:10px">Unlock Pro</a></div>`;
}
function unavailable(root) {
  root.innerHTML = html`<header class="page-head"><a class="card-link" href="#/sensors">← Sensors</a><h1 style="margin-top:8px">📡 Tracker Radar</h1></header>
    <div class="card notice">Bluetooth scanning isn’t available in a web browser — it’s live in the installed SweepSafe app. (iOS 17.5+ can also alert you to unknown trackers via Settings → Privacy &amp; Security → Tracking; the app adds continuous, on-demand scanning.)</div>`;
}
