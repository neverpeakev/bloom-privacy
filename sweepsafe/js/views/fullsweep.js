/**
 * Full Sweep — the guided, all-in-one flow. Chains the real tools into one
 * sequence (camera → tracker radar → magnetometer → checklist) and ends in a
 * "scan complete" results screen summarising what was found and what to do next.
 *
 * Sensor stages use the shared native layer (BLE + magnetometer) and degrade
 * honestly where a sensor isn't available. ?demo=1 drives synthetic data.
 */

import { get, isPro, addFinding, save, toggleStep, sweepProgress } from '../state.js';
import { html, raw, toast } from '../ui.js';
import { ble, magnetometer, isDemo } from '../native.js';
import { classifyDevice, magnitude, baselineOf, magLevel } from '../sensor-logic.js';
import { SWEEP_BY_ID } from '../data/sweep.js';

const STAGES = ['intro', 'camera', 'tracker', 'magnet', 'checklist', 'results'];

export function render(root) {
  const s = get();
  if (!isPro(s) && !isDemo()) {
    root.innerHTML = html`<header class="page-head"><h1>🛰️ Full Sweep</h1></header>
      <div class="card"><p>The guided Full Sweep is a <b>Pro</b> feature — it runs every detector back-to-back and gives you a single verdict.</p>
      <a class="btn btn-primary btn-block" href="#/premium" style="margin-top:10px">Unlock Pro</a></div>`;
    return;
  }

  let i = 0;
  let cleanup = () => {};
  const result = { devices: new Map(), trackers: 0, magPeak: 0, cameraFlag: false };

  function go(n) { try { cleanup(); } catch {} cleanup = () => {}; i = Math.max(0, Math.min(n, STAGES.length - 1)); draw(); }

  function progressDots() {
    return STAGES.slice(0, -1).map((_, idx) => `<span style="width:${idx === i ? '26px' : '8px'};height:8px;border-radius:999px;background:${idx <= i ? 'var(--teal)' : 'var(--line)'};transition:all .2s"></span>`).join('');
  }
  function frame(title, body, footer) {
    root.innerHTML = html`
      <header class="page-head">
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:12px">${raw(progressDots())}</div>
        <h1 style="margin:0">${title}</h1>
      </header>
      <div data-body>${raw(body)}</div>
      <div style="margin-top:16px">${raw(footer)}</div>`;
  }

  function draw() {
    const stage = STAGES[i];
    if (stage === 'intro') return drawIntro();
    if (stage === 'camera') return drawCamera();
    if (stage === 'tracker') return drawTracker();
    if (stage === 'magnet') return drawMagnet();
    if (stage === 'checklist') return drawChecklist();
    return drawResults();
  }

  // ── Intro ──
  function drawIntro() {
    frame('🛰️ Full Sweep',
      `<div class="card"><p>We'll run all four checks back-to-back, about <b>3 minutes</b>:</p>
        <ol style="line-height:1.9;color:var(--ink-2)"><li>📷 Camera — lenses & IR</li><li>📡 Bluetooth — hidden trackers</li><li>🧲 Magnetometer — concealed electronics</li><li>✅ Physical checklist</li></ol>
        <p class="muted" style="margin:0">Best in a quiet, darkened room. You'll get a single verdict at the end.</p></div>`,
      `<button class="btn btn-primary btn-block" data-next>▶ Begin sweep</button>`);
    root.querySelector('[data-next]').addEventListener('click', () => go(1));
  }

  // ── Camera ──
  function drawCamera() {
    frame('📷 Step 1 · Cameras',
      `<div class="card" style="padding:0;overflow:hidden">
         <video data-vid autoplay playsinline muted style="width:100%;height:300px;object-fit:cover;background:#000" class="fx-glint"></video>
       </div>
       <div class="card notice">Darken the room and pan slowly. A hidden lens reflects a bright sparkle; night-vision cameras glow. Check detectors, chargers, clocks, vents and décor aimed at the bed.</div>
       <button class="btn btn-danger btn-block" data-flag style="margin-bottom:10px">⚑ I see a suspicious lens</button>`,
      `<button class="btn btn-primary btn-block" data-next>Done scanning →</button>`);
    let stream;
    (async () => {
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); root.querySelector('[data-vid]').srcObject = stream; }
      catch { root.querySelector('[data-vid]').replaceWith(Object.assign(document.createElement('div'), { className: 'card notice', textContent: 'Camera permission needed — enable it to use the visual scan, or continue and rely on the other checks.' })); }
    })();
    cleanup = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
    root.querySelector('[data-flag]').addEventListener('click', () => { result.cameraFlag = true; addFinding({ kind: 'camera', label: 'Possible camera (Full Sweep)' }); save(); toast('Flagged.'); });
    root.querySelector('[data-next]').addEventListener('click', () => go(2));
  }

  // ── Tracker ──
  function drawTracker() {
    const available = ble.available();
    frame('📡 Step 2 · Trackers',
      available
        ? `<div class="card" style="display:flex;align-items:center;gap:10px"><div style="width:10px;height:10px;border-radius:50%;background:var(--teal);animation:pulse 1.4s infinite"></div><span data-count class="muted">Scanning Bluetooth…</span></div><div data-list></div>
           <style>@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,211,238,.5)}70%{box-shadow:0 0 0 12px rgba(34,211,238,0)}100%{box-shadow:0 0 0 0 rgba(34,211,238,0)}}</style>`
        : `<div class="card notice">Bluetooth scanning runs in the installed app. Continuing — your camera, magnetometer and checklist still cover this sweep.</div>`,
      `<button class="btn btn-primary btn-block" data-next>${available ? 'Continue →' : 'Skip →'}</button>`);
    if (available) {
      const listEl = root.querySelector('[data-list]'); const countEl = root.querySelector('[data-count]');
      const redraw = () => {
        const items = [...result.devices.values()].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
        result.trackers = items.filter((d) => d.tracker).length;
        countEl.textContent = `${items.length} device(s) · ${result.trackers} possible tracker(s)`;
        listEl.innerHTML = items.slice(0, 6).map((d) => `<div class="signal-row" style="${d.tracker ? 'border-color:var(--amber)' : ''}"><div class="signal-name">${d.name || 'Unknown'} ${d.tracker ? '<span class="signal-flag">⚑</span>' : ''}</div><div class="signal-meta">${d.note}</div></div>`).join('');
      };
      let stop = () => {};
      Promise.resolve(ble.start((dev) => { const c = classifyDevice(dev); c.id = dev.id; c.name = c.name || dev.name; result.devices.set(dev.id, c); redraw(); })).then((fn) => (stop = fn));
      cleanup = () => { try { const r = stop(); if (r && r.then) r.catch(() => {}); } catch {} };
    }
    root.querySelector('[data-next]').addEventListener('click', () => go(3));
  }

  // ── Magnetometer ──
  function drawMagnet() {
    const available = magnetometer.available();
    frame('🧲 Step 3 · Electronics',
      available
        ? `<div class="card meter"><div class="meter-value" data-val style="color:var(--ink-2)">––</div><div class="meter-unit">µT · <span data-state>calibrating</span></div><div class="meter-bar"><div class="meter-fill" data-fill style="width:0%"></div></div></div>
           <div class="card notice">Sweep slowly over suspicious objects. A sharp spike above baseline near something small is worth a closer look.</div>`
        : `<div class="card notice">The magnetometer runs in the installed app. Continuing with the rest of the sweep.</div>`,
      `<button class="btn btn-primary btn-block" data-next>${available ? 'Continue →' : 'Skip →'}</button>`);
    if (available) {
      const valEl = root.querySelector('[data-val]'); const stateEl = root.querySelector('[data-state]'); const fillEl = root.querySelector('[data-fill]');
      let samples = [], baseline = 0, calib = true;
      const stop = magnetometer.start(({ x, y, z }) => {
        const m = magnitude(x, y, z);
        if (calib) { samples.push(m); if (samples.length >= 15) { baseline = baselineOf(samples); calib = false; stateEl.textContent = 'monitoring'; } valEl.textContent = m.toFixed(0); return; }
        const { level, dev, intensity } = magLevel(m, baseline);
        const col = level === 'alert' ? 'var(--red)' : level === 'elevated' ? 'var(--amber)' : 'var(--green)';
        valEl.textContent = m.toFixed(0); valEl.style.color = col; stateEl.textContent = level; fillEl.style.width = `${Math.round(intensity * 100)}%`; fillEl.style.background = col;
        result.magPeak = Math.max(result.magPeak, dev);
      });
      cleanup = () => { try { stop(); } catch {} };
    }
    root.querySelector('[data-next]').addEventListener('click', () => go(4));
  }

  // ── Checklist ──
  function drawChecklist() {
    const sw = SWEEP_BY_ID.arrival;
    const st = get();
    frame('✅ Step 4 · Physical check',
      `<section class="card">${sw.steps.map((step) => { const done = !!(st.sweeps[sw.id] && st.sweeps[sw.id][step.id]); return `<div class="step ${done ? 'done' : ''}" data-step="${step.id}"><div class="step-check" tabindex="0">✓</div><div class="step-body"><h4>${step.title}</h4><p>${step.body}</p></div></div>`; }).join('')}</section>`,
      `<button class="btn btn-primary btn-block" data-next>See results →</button>`);
    root.querySelectorAll('[data-step]').forEach((row) => row.querySelector('.step-check').addEventListener('click', () => { toggleStep('arrival', row.dataset.step); save(); row.classList.toggle('done'); }));
    root.querySelector('[data-next]').addEventListener('click', () => go(5));
  }

  // ── Results ──
  function drawResults() {
    const checklist = sweepProgress('arrival', SWEEP_BY_ID.arrival.steps.length);
    const flagged = result.trackers + (result.cameraFlag ? 1 : 0) + (result.magPeak >= 50 ? 1 : 0);
    const clean = flagged === 0;
    const color = clean ? 'var(--green)' : 'var(--red)';
    root.innerHTML = html`
      <header class="page-head center"><h1 style="color:${color}">${clean ? '✓ Sweep complete' : '⚠ Needs attention'}</h1></header>
      <section class="card center">
        <div style="font-size:3.2rem">${clean ? '🟢' : '🔴'}</div>
        <p style="font-size:1.1rem;font-weight:700;margin:6px 0">${clean ? 'No obvious surveillance devices found.' : `${String(flagged)} thing(s) worth a closer look.`}</p>
        <div style="display:flex;justify-content:space-around;margin-top:14px;text-align:center">
          <div><div style="font-family:var(--mono);font-size:1.6rem">${String(result.devices.size)}</div><div class="muted" style="font-size:0.8rem">BT devices</div></div>
          <div><div style="font-family:var(--mono);font-size:1.6rem;color:${result.trackers ? 'var(--amber)' : 'inherit'}">${String(result.trackers)}</div><div class="muted" style="font-size:0.8rem">trackers</div></div>
          <div><div style="font-family:var(--mono);font-size:1.6rem;color:${result.magPeak >= 50 ? 'var(--amber)' : 'inherit'}">+${String(Math.round(result.magPeak))}</div><div class="muted" style="font-size:0.8rem">µT peak</div></div>
          <div><div style="font-family:var(--mono);font-size:1.6rem">${String(checklist.done)}/${String(checklist.total)}</div><div class="muted" style="font-size:0.8rem">checklist</div></div>
        </div>
      </section>
      ${raw(clean
        ? `<div class="card notice">No tool can guarantee a space is clean. If something still feels off, re-run the sweep in the dark or trust your instincts and leave.</div>`
        : `<div class="card notice danger"><b>If you found a device:</b> don't dismantle it (preserve evidence), photograph it and what it points at, cover the lens, and report to local police + the platform. If you feel unsafe, leave first.</div>
           <a class="btn btn-danger btn-block" href="#/sweep/found" style="margin-bottom:10px">What to do now →</a>`)}
      <button class="btn btn-primary btn-block" data-again>↻ Run another sweep</button>
      <a class="btn btn-ghost btn-block" href="#/home" style="margin-top:8px">Done</a>
    `;
    root.querySelector('[data-again]').addEventListener('click', () => { result.devices = new Map(); result.trackers = 0; result.magPeak = 0; result.cameraFlag = false; go(0); });
  }

  draw();
  return () => { try { cleanup(); } catch {} };
}
