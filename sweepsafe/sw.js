/* SweepSafe — offline-first service worker. */
const CACHE = 'sweepsafe-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './assets/icon.svg', './assets/css/styles.css',
  './js/main.js', './js/state.js', './js/ui.js', './js/billing.js',
  './js/data/sweep.js',
  './js/views/home.js', './js/views/scan-camera.js', './js/views/sweep.js',
  './js/views/learn.js', './js/views/sensors.js', './js/views/more.js', './js/views/premium.js',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const c = res.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); }
    return res;
  })));
});
