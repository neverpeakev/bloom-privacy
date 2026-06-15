import { get, isPro, addFinding, save } from '../state.js';
import { html, raw, toast } from '../ui.js';
import { magnetometer, isDemo } from '../native.js';
import { magnitude, baselineOf, magLevel } from '../sensor-logic.js';

const COLOR = { calm: 'var(--green)', elevated: 'var(--amber)', alert: 'var(--red)' };
const WORD = { calm: 'Clear', elevated: 'Elevated', alert: 'Strong signal' };

export function render(root) {
  const s = get();
  if (!isPro(s) && !isDemo()) return locked(root);
  if (!magnetometer.available()) return unavailable(root);

  root.innerHTML = html`
    <header class="page-head"><a class="card-link" href="#/sensors">← Sensors</a>
      <h1 style="margin-top:8px">🧲 Magnetometer</h1>
      <p>Calibrating… hold the phone still in the middle of the room for a moment.</p></header>
    <section class="card meter">
      <div class="meter-value" data-val style="color:var(--ink-2)">––</div>
      <div class="meter-unit">µT · <span data-state>calibrating</span></div>
      <div class="meter-bar"><div class="meter-fill" data-fill style="width:0%;background:var(--teal)"></div></div>
      <p class="muted" data-dev style="margin:6px 0 0;font-family:var(--mono)"></p>
    </section>
    <div class="card notice">Move the phone slowly, a few cm from objects: detectors, chargers, clocks, vents, frames. A sharp jump <b>above the room baseline</b> near a small object that shouldn’t contain electronics is worth a closer look (with the lens scanner).</div>
    <button class="btn btn-primary btn-block" data-recal style="margin-top:6px">↻ Recalibrate baseline</button>
  `;

  const valEl = root.querySelector('[data-val]');
  const stateEl = root.querySelector('[data-state]');
  const fillEl = root.querySelector('[data-fill]');
  const devEl = root.querySelector('[data-dev]');

  let samples = [];
  let baseline = 0;
  let calibrating = true;
  let lastAlertAt = 0;

  const stop = magnetometer.start(({ x, y, z }) => {
    const m = magnitude(x, y, z);
    if (calibrating) {
      samples.push(m);
      if (samples.length >= 15) { baseline = baselineOf(samples); calibrating = false; stateEl.textContent = 'monitoring'; }
      valEl.textContent = m.toFixed(0);
      return;
    }
    const { level, dev, intensity } = magLevel(m, baseline);
    valEl.textContent = m.toFixed(0);
    valEl.style.color = COLOR[level];
    stateEl.textContent = WORD[level];
    fillEl.style.width = `${Math.round(intensity * 100)}%`;
    fillEl.style.background = COLOR[level];
    devEl.textContent = `+${dev.toFixed(0)} µT vs baseline ${baseline.toFixed(0)}`;
    if (level === 'alert' && Date.now() - lastAlertAt > 2500) {
      lastAlertAt = Date.now();
      if (get().settings.haptics && navigator.vibrate) navigator.vibrate(60);
    }
  });

  root.querySelector('[data-recal]').addEventListener('click', () => { samples = []; calibrating = true; stateEl.textContent = 'calibrating'; valEl.style.color = 'var(--ink-2)'; });
  // long-press value to log a finding
  valEl.addEventListener('click', () => { addFinding({ kind: 'magnetic', label: 'Magnetic anomaly', note: `${valEl.textContent} µT` }); save(); toast('Logged to Findings.'); });

  return stop;
}

function locked(root) {
  root.innerHTML = html`<header class="page-head"><h1>🧲 Magnetometer</h1></header>
    <div class="card"><p>The magnetometer sweep is a <b>Pro</b> tool. Unlock it along with the tracker radar and deep sweeps.</p>
    <a class="btn btn-primary btn-block" href="#/premium" style="margin-top:10px">Unlock Pro</a></div>`;
}
function unavailable(root) {
  root.innerHTML = html`<header class="page-head"><a class="card-link" href="#/sensors">← Sensors</a><h1 style="margin-top:8px">🧲 Magnetometer</h1></header>
    <div class="card notice">Your device’s magnetometer isn’t accessible here. It’s available in the installed SweepSafe app on supported devices — meanwhile, use the Lens scanner and the guided sweep, which don’t need this sensor.</div>`;
}
