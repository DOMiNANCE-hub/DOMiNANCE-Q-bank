/* DOMiNANCE Q Bank service worker.
   Shell + questions: network first when online (so a fresh launch shows the latest),
   cached copy when offline. The whole bank is precached on install, so it works fully
   offline after the first visit. Images: cache first (file names never change). */
const CACHE = 'dq-v49';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './fonts/inter.woff2', './fonts/anton.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];
const DATA = [
  './data/catalog.json', './data/comments.json', './data/topic-groups.json', './data/topics.json',
  './data/past-questions.json',
  './data/physiology/cvs-curated.json',
  './data/anatomy/embryo-past.json', './data/anatomy/embryo-topics.json',
  './data/anatomy/gross-curated.json', './data/anatomy/gross-past.json', './data/anatomy/gross-topics.json',
  './data/anatomy/micro-curated.json', './data/anatomy/micro-past.json', './data/anatomy/micro-topics.json',
  './data/biochem/biochem-curated.json', './data/biochem/past-questions.json', './data/biochem/topics.json',
  './data/physiology/cns-past.json', './data/physiology/cns-topics.json',
  './data/physiology/endocrine-past.json', './data/physiology/endocrine-topics.json',
  './data/physiology/gi-past.json', './data/physiology/gi-topics.json',
  './data/physiology/renal-past.json', './data/physiology/renal-topics.json',
  './data/physiology/resp-past.json', './data/physiology/resp-topics.json',
  './data/physiology/senses-past.json', './data/physiology/senses-topics.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(CORE).catch(() => {}).then(() =>
      Promise.allSettled(DATA.map(u => fetch(u).then(r => { if (r.ok) return c.put(u, r); }))))));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

function netFirst(req, c) {
  return fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })
    .catch(() => c.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')));
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.endsWith('reports.html')) return;
  if (/\.(webp|png|jpe?g|gif|svg|ico)$/i.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => netFirst(req, c)));
});
