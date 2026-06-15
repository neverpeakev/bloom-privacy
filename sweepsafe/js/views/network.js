import { get, isPro } from '../state.js';
import { html } from '../ui.js';

/**
 * Honest network tool. iOS does not let apps enumerate arbitrary LAN devices
 * (no ARP scan; Local Network permission only exposes mDNS/Bonjour services).
 * Rather than fake a "scan", we guide the user through the checks that actually
 * find Wi-Fi cameras, and surface mDNS smart-devices where the platform allows.
 */
export function render(root) {
  const s = get();
  if (!isPro(s)) {
    root.innerHTML = html`<header class="page-head"><h1>🌐 Network Check</h1></header>
      <div class="card"><p>The network camera check is a <b>Pro</b> tool.</p><a class="btn btn-primary btn-block" href="#/premium" style="margin-top:10px">Unlock Pro</a></div>`;
    return;
  }
  root.innerHTML = html`
    <header class="page-head"><a class="card-link" href="#/sensors">← Sensors</a>
      <h1 style="margin-top:8px">🌐 Wi-Fi Camera Check</h1>
      <p>Most spy cams stream over Wi-Fi. Here’s how to catch them on the network.</p></header>
    <div class="card notice">Straight talk: iOS doesn’t allow apps to list every device on a Wi-Fi network (that needs router access). So this is a guided check, not a fake "scanner" — it’s what actually works.</div>
    <section class="card"><h3 class="card-title">1 · Open the router’s device list</h3><p class="muted">On the host’s router page (or the printed label) look at “Connected devices / DHCP clients”. Unknown entries named <i>cam, ipc, ipcam, camera, hd, goke, hi3518, wansview, sricam</i> or an unfamiliar brand are red flags.</p></section>
    <section class="card"><h3 class="card-title">2 · Watch for hidden SSIDs</h3><p class="muted">Some cameras broadcast their own setup Wi-Fi. In your phone’s Wi-Fi list, note any odd networks like <i>“CAM-xxxx”, “HD-xxxx”, “GoPro-…”, random hex names</i> near the bed/bathroom.</p></section>
    <section class="card"><h3 class="card-title">3 · Bandwidth tell</h3><p class="muted">A streaming camera uses constant upload. If the router shows a always-busy unknown device, investigate it physically with the Lens scanner.</p></section>
    <section class="card"><h3 class="card-title">4 · Combine with the physical sweep</h3><p class="muted">Network clues + the Lens/IR scan + the guided sweep together are far more reliable than any single method.</p>
      <a class="btn btn-primary btn-block" href="#/sweep/bedroom" style="margin-top:10px">Run the deep sweep →</a></section>
  `;
}
