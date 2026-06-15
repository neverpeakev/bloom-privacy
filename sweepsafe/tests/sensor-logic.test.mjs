import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  magnitude, baselineOf, magLevel, classifyDevice, rssiToMeters, proximity, bars,
} from '../js/sensor-logic.js';

test('magnitude is euclidean', () => {
  assert.equal(magnitude(3, 4, 0), 5);
  assert.ok(Math.abs(magnitude(10, 10, 10) - 17.32) < 0.01);
});

test('baseline uses the median (robust to spikes)', () => {
  assert.equal(baselineOf([44, 45, 46, 45, 300]), 45); // spike ignored
  assert.equal(baselineOf([]), 0);
  assert.equal(baselineOf([40, 50]), 45);
});

test('magLevel escalates calm → elevated → alert above baseline', () => {
  const base = 45;
  assert.equal(magLevel(base + 5, base).level, 'calm');
  assert.equal(magLevel(base + 30, base).level, 'elevated');
  assert.equal(magLevel(base + 90, base).level, 'alert');
  assert.equal(magLevel(base - 10, base).dev, 0, 'below baseline = no deviation');
  const a = magLevel(base + 200, base);
  assert.ok(a.intensity <= 1 && a.intensity > 0.9);
});

test('classifyDevice flags known trackers by company id', () => {
  assert.equal(classifyDevice({ rssi: -50, companyId: 0x004c }).tracker, true); // Apple
  assert.equal(classifyDevice({ rssi: -50, companyId: 0x0075 }).name, 'Samsung');
  assert.equal(classifyDevice({ rssi: -50, companyId: 0x00d2 }).name, 'Tile');
});

test('classifyDevice flags trackers by service uuid (case/0x-insensitive)', () => {
  assert.equal(classifyDevice({ rssi: -60, serviceUuids: ['FEED'] }).tracker, true);
  assert.equal(classifyDevice({ rssi: -60, serviceUuids: ['0x0000fe2c'] }).name, 'Apple / Find My');
});

test('classifyDevice leaves ordinary devices unflagged', () => {
  const d = classifyDevice({ rssi: -66, name: 'JBL Speaker', companyId: 0x0057 });
  assert.equal(d.tracker, false);
  assert.equal(d.name, 'JBL Speaker');
});

test('rssiToMeters: stronger signal = closer, clamped & rounded', () => {
  const near = rssiToMeters(-50);
  const far = rssiToMeters(-90);
  assert.ok(near < far, 'stronger rssi is nearer');
  assert.equal(rssiToMeters(0), null);
  assert.ok(rssiToMeters(-200) <= 60, 'clamped');
});

test('proximity + bars buckets', () => {
  assert.equal(proximity(-50), 'very close');
  assert.equal(proximity(-80), 'in range');
  assert.equal(proximity(null), 'unknown');
  assert.equal(bars(-50).length, 4);
  assert.equal(bars(-50), '▮▮▮▮');
  assert.equal(bars(-200), '▯▯▯▯');
});
