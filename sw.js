/* Flag Explorer 2026 — offline-first service worker. */

const CACHE = 'flagexplorer-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/css/styles.css',
  './js/main.js',
  './js/state.js',
  './js/ui.js',
  './js/audio.js',
  './js/confetti.js',
  './js/flags.js',
  './js/data/teams.js',
  './js/data/matches.js',
  './js/games/questions.js',
  './js/views/home.js',
  './js/views/color.js',
  './js/views/games.js',
  './js/views/trivia.js',
  './js/views/flagmatch.js',
  './js/views/continents.js',
  './js/views/worldcup.js',
  './js/views/passport.js',
  './js/views/premium.js',
  './js/views/grownups.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok && new URL(e.request.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
