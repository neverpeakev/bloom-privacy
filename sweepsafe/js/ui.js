/** Shared DOM helpers: escaping, html templating, toasts, modals. */

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
export function raw(value) { return { __raw: true, value }; }
export function html(strings, ...vals) {
  return strings.reduce((out, str, i) => {
    const v = vals[i - 1];
    const piece = v == null ? '' : v.__raw ? v.value : esc(v);
    return out + piece + str;
  });
}
export function el(tag, attrs = {}, inner = '') {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.innerHTML = inner;
  return n;
}
export function toast(message, { ms = 2400 } = {}) {
  let host = document.querySelector('.toast-host');
  if (!host) { host = el('div', { class: 'toast-host', 'aria-live': 'polite' }); document.body.appendChild(host); }
  const t = el('div', { class: 'toast' }, esc(message));
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, ms);
}
export function modal(innerHTML, { onClose = null } = {}) {
  const wrap = el('div', { class: 'modal-backdrop', role: 'dialog', 'aria-modal': 'true' });
  const box = el('div', { class: 'modal-box' }, innerHTML);
  const x = el('button', { class: 'modal-close', 'aria-label': 'Close' }, '✕');
  x.addEventListener('click', close);
  box.prepend(x);
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  function close() { wrap.classList.add('closing'); setTimeout(() => wrap.remove(), 180); onClose?.(); document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  return { close, box };
}
