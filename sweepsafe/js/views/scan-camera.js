/**
 * Flagship: IR & Lens camera scanner. Works in the web stack (getUserMedia) and
 * in the native build. Two honest, real techniques:
 *   • Lens mode — high-contrast magnified viewfinder + a flashing light to catch
 *     the glint of a camera lens (sweep slowly; pinhole lenses sparkle).
 *   • IR mode — boosted feed to reveal night-vision IR LEDs glowing in the dark.
 */

import { addFinding, save } from '../state.js';
import { html, raw, toast } from '../ui.js';

export function render(root) {
  let stream = null;
  let track = null;
  let facing = 'environment';
  let mode = 'lens';
  let flashing = false;
  let torchOn = false;

  const scr = document.createElement('div');
  scr.className = 'scanner';
  scr.innerHTML = html`
    <video class="scanner-video fx-glint" autoplay playsinline muted></video>
    <div class="scanner-overlay">
      <div class="scanner-reticle"></div>
      <div class="flash-pulse" hidden></div>
    </div>
    <div class="scanner-top">
      <button class="scanner-x" data-close aria-label="Close scanner">✕</button>
      <button class="chip" data-flip>⤿ Flip</button>
    </div>
    <div class="scanner-bottom">
      <div class="scanner-hint" data-hint></div>
      <div class="scanner-modes" style="pointer-events:auto">
        <button class="mode-btn active" data-mode="lens">🔦 Lens glint</button>
        <button class="mode-btn" data-mode="ir">🌙 IR / night</button>
      </div>
      <div style="display:flex;gap:10px;pointer-events:auto">
        <button class="btn btn-ghost" data-flash style="flex:1">✨ Flash light</button>
        <button class="btn btn-primary" data-found style="flex:1">⚑ Log a finding</button>
      </div>
    </div>
  `;
  document.body.appendChild(scr);

  const video = scr.querySelector('.scanner-video');
  const hint = scr.querySelector('[data-hint]');
  const flashEl = scr.querySelector('.flash-pulse');

  const HINTS = {
    lens: 'Darken the room, tap Flash, and pan slowly. A hidden lens reflects a tiny bright sparkle — check detectors, clocks, chargers, vents, décor.',
    ir: 'Turn the lights OFF. Night-vision cameras show small purple/white dots through your camera. Scan anything aimed at the bed or shower.',
  };
  function setHint() { hint.textContent = HINTS[mode]; }
  setHint();

  async function start() {
    stop();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }, audio: false,
      });
      video.srcObject = stream;
      track = stream.getVideoTracks()[0];
    } catch (e) {
      hint.innerHTML = '⚠️ Camera access is needed to scan. Enable camera permission for SweepSafe in your settings, then reopen this screen.';
    }
  }
  function stop() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null; track = null; torchOn = false;
  }

  function applyMode() {
    video.classList.toggle('fx-glint', mode === 'lens');
    video.classList.toggle('fx-ir', mode === 'ir');
    scr.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    setHint();
  }

  async function toggleTorch() {
    // Web torch works on some Android browsers; iOS web ignores it (use Flash overlay instead).
    if (!track) return false;
    try {
      const caps = track.getCapabilities?.() || {};
      if (caps.torch) { torchOn = !torchOn; await track.applyConstraints({ advanced: [{ torch: torchOn }] }); return true; }
    } catch { /* not supported */ }
    return false;
  }

  scr.querySelector('[data-close]').addEventListener('click', () => { location.hash = '#/home'; });
  scr.querySelector('[data-flip]').addEventListener('click', () => { facing = facing === 'environment' ? 'user' : 'environment'; start(); });
  scr.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; applyMode(); }));
  scr.querySelector('[data-flash]').addEventListener('click', async () => {
    const hw = await toggleTorch();
    if (!hw) { flashing = !flashing; flashEl.hidden = !flashing; } // screen-flash fallback
  });
  scr.querySelector('[data-found]').addEventListener('click', () => {
    addFinding({ kind: 'camera', label: 'Possible camera (visual)', note: `Spotted via ${mode} scan` });
    save();
    toast('Logged. See it under More → Findings.');
  });

  start();
  return stop; // router calls this on navigation away
}
