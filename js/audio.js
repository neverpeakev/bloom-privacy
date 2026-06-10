/**
 * Tiny synthesised sound effects via WebAudio — no audio files needed.
 * Respects the "sound" setting and degrades silently when unavailable.
 */

import { get } from './state.js';

let ctx = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, { t = 0, dur = 0.15, type = 'sine', gain = 0.12, slide = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  const start = a.currentTime + t;
  osc.frequency.setValueAtTime(freq, start);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(a.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function enabled() {
  try {
    return get().settings.sound;
  } catch {
    return false;
  }
}

export const sfx = {
  tap() {
    if (!enabled()) return;
    tone(660, { dur: 0.06, type: 'triangle', gain: 0.08 });
  },
  paint() {
    if (!enabled()) return;
    tone(520, { dur: 0.09, type: 'sine', gain: 0.1, slide: 240 });
  },
  correct() {
    if (!enabled()) return;
    tone(523, { dur: 0.1, type: 'triangle' });
    tone(659, { t: 0.09, dur: 0.1, type: 'triangle' });
    tone(784, { t: 0.18, dur: 0.16, type: 'triangle' });
  },
  wrong() {
    if (!enabled()) return;
    tone(220, { dur: 0.18, type: 'sawtooth', gain: 0.07, slide: -60 });
  },
  fanfare() {
    if (!enabled()) return;
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => tone(f, { t: i * 0.11, dur: 0.18, type: 'triangle', gain: 0.12 }));
  },
  badge() {
    if (!enabled()) return;
    [784, 988, 1175].forEach((f, i) => tone(f, { t: i * 0.08, dur: 0.22, type: 'sine' }));
  },
  whistle() {
    if (!enabled()) return;
    tone(2200, { dur: 0.28, type: 'square', gain: 0.05, slide: 300 });
  },
};
