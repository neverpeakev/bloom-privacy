import { get, save, isPro, startTrial, TRIAL_DAYS } from '../state.js';
import { html, raw, toast } from '../ui.js';
import { billingMode, getPackages, purchase, restore } from '../billing.js';

const EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY = 'privacy.html';
const PERIOD = { WEEKLY: 'per week', MONTHLY: 'per month', ANNUAL: 'per year', LIFETIME: 'one-time' };

const PERKS = [
  '🧲 Magnetometer sweep',
  '📡 Bluetooth tracker radar (AirTag/Tile/SmartTag)',
  '🌐 Wi-Fi camera network scan',
  '✅ All guided deep-sweeps',
  '🗂️ Save & export findings',
];
const WEB_PLANS = [
  { id: 'weekly', name: 'Weekly', price: '$4.99', sub: 'per week' },
  { id: 'yearly', name: 'Yearly', price: '$19.99', sub: 'per year', best: true },
  { id: 'lifetime', name: 'Lifetime', price: '$39.99', sub: 'one-time' },
];

function onPurchased() { save(); toast('Pro unlocked — every tool is active.'); setTimeout(() => (location.hash = '#/home'), 600); }

export function render(root) {
  const s = get();
  if (isPro(s)) {
    root.innerHTML = html`<header class="page-head"><h1>You're protected ●</h1><p>Every SweepSafe tool is unlocked. Stay safe out there.</p></header>
      <a class="btn btn-primary btn-block" href="#/home">Back to tools</a>`;
    return;
  }
  billingMode() === 'native' ? renderNative(root) : renderWeb(root, s);
}

function shell(inner, native) {
  return html`
    <header class="page-head center"><h1>🔓 Unlock SweepSafe Pro</h1><p>Free includes the camera lens/IR scanner and guided sweeps. Pro adds the hardware detectors.</p></header>
    <section class="card"><ul style="margin:0;padding-left:20px;line-height:1.9">${raw(PERKS.map((p) => `<li>${p}</li>`).join(''))}</ul></section>
    <div data-plans>${raw(inner)}</div>
    <section class="card">
      <p class="muted" style="font-size:0.85rem;margin:0 0 8px">${native
        ? 'Subscriptions auto-renew unless cancelled 24h before renewal; manage in your App Store account. A free trial’s unused portion is forfeited on purchase.'
        : 'Web preview — purchases happen in the iOS app. Choosing a plan here unlocks tools locally for evaluation.'}</p>
      <p style="font-size:0.85rem;margin:0"><a class="card-link" href="${EULA}" target="_blank" rel="noopener">Terms</a> · <a class="card-link" href="${PRIVACY}" target="_blank" rel="noopener">Privacy</a></p>
      ${raw(native ? '<button class="btn btn-ghost btn-block" data-restore style="margin-top:10px">↩️ Restore purchases</button>' : '')}
    </section>`;
}

function planCard(p) {
  return html`<div class="card" style="${p.best ? 'border-color:var(--teal)' : ''}">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><h3 style="margin:0">${p.name}${p.best ? ' · Best value' : ''}</h3><p class="muted" style="margin:2px 0 0">${p.price} <span style="font-size:0.85rem">${p.sub}</span></p></div>
      <button class="btn ${p.best ? 'btn-primary' : 'btn-ghost'}" data-buy="${p.id}">Choose</button>
    </div></div>`;
}

function renderWeb(root, s) {
  root.innerHTML = shell(
    (s.plan === 'free' && !s.trialStartedAt ? '<button class="btn btn-primary btn-block" data-trial style="margin-bottom:10px">🎁 Start free ' + TRIAL_DAYS + '-day trial</button>' : '') +
    WEB_PLANS.map(planCard).join(''), false);
  root.querySelector('[data-trial]')?.addEventListener('click', () => { startTrial(); save(); toast('Trial started — all tools unlocked.'); setTimeout(() => (location.hash = '#/home'), 600); });
  root.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', async () => { await purchase(b.dataset.buy, { webPlan: b.dataset.buy }); onPurchased(); }));
}

function renderNative(root) {
  root.innerHTML = shell('<p class="muted center">Loading plans…</p>', true);
  wireRestore(root);
  getPackages().then((pkgs) => {
    const host = root.querySelector('[data-plans]');
    if (!host) return;
    if (!pkgs || !pkgs.length) { host.innerHTML = '<p class="muted center">Plans unavailable right now — check your connection.</p>'; return; }
    const popular = pkgs.find((p) => /ANNUAL|YEARLY/i.test(p.period)) || pkgs[0];
    host.innerHTML = pkgs.map((p) => html`<div class="card" style="${p === popular ? 'border-color:var(--teal)' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><h3 style="margin:0">${p.title || p.period}${p === popular ? ' · Best value' : ''}</h3><p class="muted" style="margin:2px 0 0">${p.price} <span style="font-size:0.85rem">${PERIOD[p.period] || ''}</span></p></div>
        <button class="btn ${p === popular ? 'btn-primary' : 'btn-ghost'}" data-pkg="${p.id}">Subscribe</button>
      </div></div>`).join('');
    host.querySelectorAll('[data-pkg]').forEach((b) => b.addEventListener('click', async () => {
      try { const ok = await purchase(b.dataset.pkg); if (ok) onPurchased(); else toast('Purchase not completed.'); }
      catch (e) { if (!/cancel/i.test(e?.message || '')) toast('Purchase failed — try again.'); }
    }));
  }).catch(() => {});
}

function wireRestore(root) {
  root.querySelector('[data-restore]')?.addEventListener('click', async () => {
    try { const ok = await restore(); toast(ok ? 'Purchases restored!' : 'No active subscription found.'); if (ok) render(root); }
    catch { toast('Could not restore right now.'); }
  });
}
