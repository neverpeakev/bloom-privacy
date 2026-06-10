/**
 * Shared DOM helpers: html templating, toasts, modals, the parent gate
 * and the badge-award popup.
 */

import { sfx } from './audio.js';
import { BADGES } from './state.js';

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tagged template that escapes interpolations unless wrapped in raw(). */
export function html(strings, ...vals) {
  return strings.reduce((out, str, i) => {
    const v = vals[i - 1];
    const piece = v == null ? '' : v.__raw ? v.value : esc(v);
    return out + piece + str;
  });
}

export function raw(value) {
  return { __raw: true, value };
}

export function el(tag, attrs = {}, inner = '') {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.innerHTML = inner;
  return node;
}

// ── Toasts ─────────────────────────────────────────────────────────────

export function toast(message, { emoji = '', ms = 2400 } = {}) {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = el('div', { class: 'toast-host', 'aria-live': 'polite' });
    document.body.appendChild(host);
  }
  const t = el('div', { class: 'toast' }, html`${emoji} ${message}`);
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 350);
  }, ms);
}

// ── Modal ──────────────────────────────────────────────────────────────

export function modal(innerHTML, { onClose = null, closable = true } = {}) {
  const wrap = el('div', { class: 'modal-backdrop', role: 'dialog', 'aria-modal': 'true' });
  const box = el('div', { class: 'modal-box' }, innerHTML);
  if (closable) {
    const x = el('button', { class: 'modal-close', 'aria-label': 'Close' }, '✕');
    x.addEventListener('click', close);
    box.prepend(x);
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) close();
    });
  }
  function close() {
    wrap.classList.add('closing');
    setTimeout(() => wrap.remove(), 180);
    onClose?.();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.key === 'Escape' && closable) close();
  }
  document.addEventListener('keydown', onKey);
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  return { close, box };
}

// ── Parent gate (simple multiplication — COPPA-style adult check) ─────

export function parentGate(onPass) {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 4 + Math.floor(Math.random() * 6);
  const m = modal(html`
    <h3 class="modal-title">👨‍👩‍👧 Grown-ups only</h3>
    <p>To continue, please solve this so we know you're a grown-up:</p>
    <p class="gate-q">What is <strong>${a} × ${b}</strong>?</p>
    <form class="gate-form">
      <input class="gate-input" type="number" inputmode="numeric" autocomplete="off" aria-label="Answer" required />
      <button class="btn btn-primary" type="submit">Check</button>
    </form>
    <p class="gate-err" hidden>That's not quite right — ask a grown-up to help!</p>
  `);
  const form = m.box.querySelector('.gate-form');
  const input = m.box.querySelector('.gate-input');
  setTimeout(() => input.focus(), 60);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (parseInt(input.value, 10) === a * b) {
      sfx.correct();
      m.close();
      onPass();
    } else {
      sfx.wrong();
      m.box.querySelector('.gate-err').hidden = false;
      input.value = '';
      input.focus();
    }
  });
}

// ── Badge award popup ──────────────────────────────────────────────────

export function showBadges(newBadges) {
  if (!newBadges?.length) return;
  sfx.badge();
  const items = newBadges
    .map(
      (b) => html`
        <div class="badge-award">
          <div class="badge-award-emoji">${b.emoji}</div>
          <div>
            <div class="badge-award-name">${b.name}</div>
            <div class="badge-award-desc">${b.desc}</div>
          </div>
        </div>`,
    )
    .join('');
  modal(html`
    <h3 class="modal-title">🎉 New badge${newBadges.length > 1 ? 's' : ''} earned!</h3>
    ${raw(items)}
    <button class="btn btn-primary btn-block" onclick="this.closest('.modal-backdrop').querySelector('.modal-close')?.click()">Awesome!</button>
  `);
}

export function badgeById(id) {
  return BADGES.find((b) => b.id === id);
}

// ── Misc ───────────────────────────────────────────────────────────────

export function starCounterHTML(stars) {
  return html`<span class="star-counter" title="Stars earned">⭐ ${stars}</span>`;
}

export function shuffled(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n, rng = Math.random) {
  return shuffled(arr, rng).slice(0, n);
}
