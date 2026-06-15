import { get, isPro } from '../state.js';
import { html, raw } from '../ui.js';

/**
 * Native-sensor tools (magnetometer, Bluetooth tracker radar, network scan).
 * These require device sensors not available to a browser, so in the web
 * preview they're shown honestly as native-only; in the installed app they run
 * via Capacitor plugins. All three are Pro.
 */
const SENSORS = [
  { icon: '🧲', title: 'Magnetometer Sweep', desc: 'Reads the phone’s magnetic sensor (µT). Move it slowly over an object — concealed electronics and magnets cause a sharp spike above the room baseline.' },
  { icon: '📡', title: 'Tracker Radar', desc: 'Continuously scans Bluetooth for AirTag, Tile, Samsung SmartTag, Chipolo and Pebblebee tags, ranking them by signal strength so you can locate one.' },
  { icon: '🌐', title: 'Network Scan', desc: 'Lists devices on the local Wi-Fi and flags likely IP cameras by manufacturer. (Limited by iOS; most effective on the same network.)' },
];

export function render(root) {
  const s = get();
  const pro = isPro(s);
  const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  root.innerHTML = html`
    <header class="page-head"><h1>Sensor tools</h1><p>Hardware-powered detectors that run in the installed app.</p></header>
    ${raw(!native ? '<div class="notice" style="margin-bottom:14px">These use device sensors a web browser can’t access. They’re live in the installed SweepSafe app — this preview shows what each does.</div>' : '')}
    ${raw(SENSORS.map((x) => html`
      <section class="card">
        <div style="display:flex;gap:13px;align-items:flex-start">
          <div class="tool-icon" style="margin:0">${x.icon}</div>
          <div style="flex:1"><h3 style="margin:0 0 4px">${x.title}</h3><p class="muted" style="margin:0;line-height:1.5">${x.desc}</p></div>
        </div>
        <button class="btn ${pro ? 'btn-primary' : 'btn-ghost'} btn-block" data-run style="margin-top:12px" ${(!native || !pro) ? 'disabled' : ''}>
          ${raw(!pro ? '🔒 Unlock with Pro' : (native ? '▶ Run' : 'Available in the app'))}
        </button>
      </section>`).join(''))}
    ${raw(!pro ? '<a class="btn btn-primary btn-block" href="#/premium" style="margin-top:8px">Unlock all sensor tools</a>' : '')}
  `;
  root.querySelectorAll('[data-run]').forEach((b) => b.addEventListener('click', () => { if (!isPro(get())) location.hash = '#/premium'; }));
}
