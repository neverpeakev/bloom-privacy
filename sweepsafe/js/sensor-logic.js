/**
 * Pure sensor logic — no DOM, no platform APIs — so it's fully unit-testable.
 * Used by the magnetometer and Bluetooth tracker-radar views.
 */

// ── Magnetometer ────────────────────────────────────────────────────
// Earth's field is ~25–65 µT. Concealed electronics/magnets cause a local
// spike ABOVE the room baseline. We calibrate a baseline, then score the
// deviation.

export function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

/** Rolling baseline from an array of recent magnitudes (median is robust). */
export function baselineOf(samples) {
  if (!samples.length) return 0;
  const s = [...samples].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Classify how far a reading is above baseline. Returns level + 0..1 intensity. */
export function magLevel(value, baseline) {
  const dev = Math.max(0, value - baseline);
  if (dev < 15) return { level: 'calm', dev, intensity: Math.min(dev / 15, 1) * 0.33 };
  if (dev < 50) return { level: 'elevated', dev, intensity: 0.33 + (dev - 15) / 35 * 0.34 };
  return { level: 'alert', dev, intensity: Math.min(0.67 + (dev - 50) / 100 * 0.33, 1) };
}

// ── Bluetooth tracker classification ───────────────────────────────
// Map advertised manufacturer company IDs / service UUIDs to known trackers.
// Heuristic by design — surfaces candidates for the user to investigate.

const COMPANY = {
  0x004c: { name: 'Apple / Find My', tracker: true, note: 'AirTag, AirPods or a Find My accessory' },
  0x0075: { name: 'Samsung', tracker: true, note: 'Galaxy SmartTag' },
  0x00d2: { name: 'Tile', tracker: true, note: 'Tile tracker' },
  0x0157: { name: 'Chipolo', tracker: true, note: 'Chipolo tracker' },
};
const SERVICE = {
  fd5a: { name: 'Google Find My', tracker: true, note: 'Google/Android tracker tag' },
  feed: { name: 'Tile', tracker: true, note: 'Tile tracker' },
  feec: { name: 'Tile', tracker: true, note: 'Tile tracker' },
  fe2c: { name: 'Apple / Find My', tracker: true, note: 'Find My network device' },
};

/**
 * device: { name?, rssi, companyId?, serviceUuids?: string[] }
 * → { label, note, tracker, rssi }
 */
export function classifyDevice(device) {
  const svc = (device.serviceUuids || []).map((u) => String(u).toLowerCase().replace(/^0x/, '').slice(-4));
  for (const u of svc) if (SERVICE[u]) return { ...SERVICE[u], rssi: device.rssi, raw: device };
  if (device.companyId != null && COMPANY[device.companyId]) return { ...COMPANY[device.companyId], rssi: device.rssi, raw: device };
  return {
    name: device.name || 'Unknown device',
    note: 'Unrecognised — could be headphones, a watch, a speaker… or a tracker.',
    tracker: false,
    rssi: device.rssi,
    raw: device,
  };
}

/** Approx distance in metres from RSSI (log-distance path-loss model). */
export function rssiToMeters(rssi, txPower = -59, n = 2.2) {
  if (rssi == null || rssi === 0) return null;
  const d = Math.pow(10, (txPower - rssi) / (10 * n));
  return Math.round(Math.min(Math.max(d, 0.1), 60) * 10) / 10;
}

/** Coarse proximity bucket for the "warmer/colder" UI. */
export function proximity(rssi) {
  if (rssi == null) return 'unknown';
  if (rssi >= -55) return 'very close';
  if (rssi >= -70) return 'near';
  if (rssi >= -85) return 'in range';
  return 'far';
}

/** Signal-strength bars string for lists. */
export function bars(rssi) {
  const n = rssi == null ? 0 : rssi >= -55 ? 4 : rssi >= -67 ? 3 : rssi >= -78 ? 2 : rssi >= -90 ? 1 : 0;
  return '▮'.repeat(n) + '▯'.repeat(4 - n);
}
