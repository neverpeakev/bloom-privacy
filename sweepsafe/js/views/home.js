import { get, isPro } from '../state.js';
import { html, raw } from '../ui.js';
import { SWEEPS } from '../data/sweep.js';

const TOOLS = [
  { href: '#/scan', icon: '📷', title: 'IR & Lens Scanner', desc: 'Spot hidden camera lenses and night-vision IR glow with your camera.', tag: null },
  { href: '#/sensors', icon: '🧲', title: 'Magnetometer', desc: 'Sweep objects for the magnetic signature of concealed electronics.', tag: 'pro' },
  { href: '#/sensors', icon: '📡', title: 'Tracker Radar', desc: 'Find unwanted AirTags, Tile and SmartTag trackers near you.', tag: 'pro' },
  { href: '#/sensors', icon: '🌐', title: 'Network Scan', desc: 'List Wi-Fi devices and flag likely IP cameras on the network.', tag: 'pro' },
];

export function render(root) {
  const s = get();
  root.innerHTML = html`
    <section class="hero">
      <div class="hero-radar">${raw(radarSVG())}</div>
      <h1 class="hero-title">Is someone <span class="accent">watching?</span></h1>
      <p class="hero-sub">Sweep any room for hidden cameras, microphones and Bluetooth trackers — before you unpack. Honest tools, no fake "RF detector" gimmicks.</p>
      <a class="btn btn-primary btn-lg" href="#/sweep/arrival">▶ Start a 5-minute sweep</a>
    </section>

    <h2 class="section-title">Detection tools</h2>
    <div class="grid-2">
      ${raw(TOOLS.map((t) => html`
        <a class="tool" href="${t.href}">
          ${raw(t.tag === 'pro' && !isPro(s) ? '<span class="tool-tag tag-pro">Pro</span>' : '')}
          <div class="tool-icon">${t.icon}</div>
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
        </a>`).join(''))}
    </div>

    <h2 class="section-title">Guided sweeps</h2>
    ${raw(SWEEPS.map((sw) => html`
      <a class="card" href="#/sweep/${sw.id}" style="display:flex;gap:14px;align-items:center;text-decoration:none;color:inherit">
        <div class="tool-icon" style="margin:0">${sw.icon}</div>
        <div style="flex:1">
          <h3 style="margin:0 0 2px">${sw.title}</h3>
          <p class="muted" style="margin:0;font-size:0.9rem">${sw.blurb} · ${String(sw.minutes)} min</p>
        </div>
        <span class="muted">→</span>
      </a>`).join(''))}

    <div class="notice" style="margin-top:18px">
      <b>How honest detection works:</b> a phone can reveal camera lenses (reflection + IR), magnetic anomalies, and nearby Bluetooth trackers. It <b>cannot</b> detect radio bugs over the air — any app claiming phone "RF detection" is misleading. SweepSafe only ships methods that actually work, plus a guided manual sweep, which is your most reliable tool.
    </div>
  `;
}

function radarSVG() {
  return '<svg viewBox="0 0 124 124" fill="none" aria-hidden="true" style="width:124px;height:124px">' +
    '<circle cx="62" cy="62" r="58" stroke="#243152" stroke-width="2"/>' +
    '<circle cx="62" cy="62" r="40" stroke="#243152" stroke-width="2"/>' +
    '<circle cx="62" cy="62" r="22" stroke="#243152" stroke-width="2"/>' +
    '<line x1="62" y1="62" x2="62" y2="6" stroke="#22d3ee" stroke-width="2"><animateTransform attributeName="transform" type="rotate" from="0 62 62" to="360 62 62" dur="3.4s" repeatCount="indefinite"/></line>' +
    '<circle cx="86" cy="44" r="3.5" fill="#f87171"/><circle cx="44" cy="80" r="3" fill="#34d399"/></svg>';
}
