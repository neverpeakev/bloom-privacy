/**
 * Platform sensor access.
 *  • Magnetometer: Web Generic Sensor API (Android/Chromium) → native bridge
 *    (window.__SWEEPSAFE_MAG__, supplied by the iOS plugin) → unavailable.
 *  • Bluetooth: Capacitor BluetoothLe plugin on device → unavailable on web
 *    (iOS Safari has no Web Bluetooth).
 *
 * A DEMO mode (URL ?demo=1) feeds realistic synthetic data so the UI can be
 * shown/tested without hardware. Real builds use real sensors only.
 */

export function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
}
export function isDemo() {
  try { return new URLSearchParams(location.search).has('demo') || !!window.__SWEEPSAFE_DEMO__; } catch { return false; }
}
function cap() { return window.Capacitor && window.Capacitor.Plugins; }

// ── Magnetometer ────────────────────────────────────────────────────
export const magnetometer = {
  available() {
    return isDemo() || typeof window.Magnetometer === 'function' || !!(window.__SWEEPSAFE_MAG__);
  },
  /** start(onReading {x,y,z}) → returns a stop() function */
  start(onReading) {
    if (isDemo()) return demoMag(onReading);
    if (typeof window.Magnetometer === 'function') {
      try {
        const sensor = new window.Magnetometer({ frequency: 12 });
        sensor.addEventListener('reading', () => onReading({ x: sensor.x, y: sensor.y, z: sensor.z }));
        sensor.start();
        return () => { try { sensor.stop(); } catch {} };
      } catch { /* permission/secure-context issue */ }
    }
    const bridge = window.__SWEEPSAFE_MAG__;
    if (bridge?.addListener) {
      const h = bridge.addListener('reading', (r) => onReading(r));
      bridge.start?.();
      return () => { try { h.remove?.(); bridge.stop?.(); } catch {} };
    }
    return () => {};
  },
};

function demoMag(onReading) {
  let t = 0;
  const id = setInterval(() => {
    t += 1;
    const base = 45 + Math.sin(t / 9) * 3;
    // periodic "hot object" spikes to demonstrate the alert state
    const spike = (t % 40) > 32 ? 70 + Math.random() * 50 : Math.random() * 8;
    const m = base + spike;
    onReading({ x: m * 0.6, y: m * 0.55, z: m * 0.4 });
  }, 120);
  return () => clearInterval(id);
}

// ── Bluetooth tracker scan ──────────────────────────────────────────
export const ble = {
  available() { return isDemo() || !!(cap() && cap().BluetoothLe); },
  /** scan(onDevice) → returns async stop() */
  async start(onDevice) {
    if (isDemo()) return demoBle(onDevice);
    const Ble = cap() && cap().BluetoothLe;
    if (!Ble) return async () => {};
    try {
      await Ble.initialize();
      await Ble.requestLEScan({ allowDuplicates: true });
      const handle = await Ble.addListener('onScanResult', (r) => {
        const companyId = r.manufacturerData ? parseInt(Object.keys(r.manufacturerData)[0], 10) : null;
        onDevice({
          id: r.device?.deviceId || r.device?.name || Math.random().toString(36),
          name: r.device?.name, rssi: r.rssi, txPower: r.txPower,
          companyId: Number.isNaN(companyId) ? null : companyId,
          serviceUuids: r.uuids || r.serviceUuids || [],
        });
      });
      return async () => { try { await handle.remove(); await Ble.stopLEScan(); } catch {} };
    } catch {
      return async () => {};
    }
  },
};

function demoBle(onDevice) {
  const fleet = [
    { id: 'd1', name: 'AirTag', rssi: -48, companyId: 0x004c, serviceUuids: ['fe2c'] },
    { id: 'd2', name: null, rssi: -73, companyId: 0x0075, serviceUuids: [] },
    { id: 'd3', name: 'Tile', rssi: -88, companyId: 0x00d2, serviceUuids: ['feed'] },
    { id: 'd4', name: 'JBL Speaker', rssi: -66, companyId: 0x0057, serviceUuids: [] },
    { id: 'd5', name: null, rssi: -95, companyId: null, serviceUuids: [] },
  ];
  const id = setInterval(() => {
    const d = fleet[Math.floor(Math.random() * fleet.length)];
    onDevice({ ...d, rssi: d.rssi + Math.round((Math.random() - 0.5) * 8) });
  }, 700);
  return () => clearInterval(id);
}
