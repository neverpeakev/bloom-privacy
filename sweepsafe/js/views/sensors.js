import { get, isPro } from '../state.js';
import { html, raw } from '../ui.js';

const SENSORS = [
  { route: '#/tool/tracker', icon: '📡', title: 'Tracker Radar', desc: 'Continuously scans Bluetooth for AirTag, Tile, SmartTag, Chipolo and Pebblebee tags, ranked by signal so you can locate one.', cta: 'Open radar' },
  { route: '#/tool/magnetometer', icon: '🧲', title: 'Magnetometer Sweep', desc: 'Reads the magnetic sensor (µT). Sweep an object — concealed electronics and magnets spike above the room baseline.', cta: 'Open meter' },
  { route: '#/tool/network', icon: '🌐', title: 'Wi-Fi Camera Check', desc: 'A guided check for IP cameras streaming over the network (honest about what a phone can and can’t see).', cta: 'Open check' },
];

export function render(root) {
  const s = get();
  const pro = isPro(s);
  root.innerHTML = html`
    <header class="page-head"><h1>Sensor tools</h1><p>Hardware-powered detectors. ${raw(pro ? '' : '<span class="muted">Pro</span>')}</p></header>
    ${raw(SENSORS.map((x) => html`
      <a class="card" href="${x.route}" style="display:block;text-decoration:none;color:inherit">
        <div style="display:flex;gap:13px;align-items:flex-start">
          <div class="tool-icon" style="margin:0">${x.icon}</div>
          <div style="flex:1"><h3 style="margin:0 0 4px">${x.title} ${raw(!pro ? '<span class="tool-tag tag-pro" style="position:static">Pro</span>' : '')}</h3><p class="muted" style="margin:0;line-height:1.5">${x.desc}</p></div>
        </div>
        <div class="btn ${pro ? 'btn-primary' : 'btn-ghost'} btn-block" style="margin-top:12px">${raw(pro ? x.cta : '🔒 Unlock with Pro')}</div>
      </a>`).join(''))}
    ${raw(!pro ? '<a class="btn btn-primary btn-block" href="#/premium" style="margin-top:8px">Unlock all sensor tools</a>' : '')}
  `;
}
