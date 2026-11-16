/* DOMiNANCE Q Bank service worker: fast repeat visits and offline use.
   Pages and code: network first, cached copy when offline. Question files: cache first with background refresh
   (the cache name changes with every release, so new questions arrive on the next visit).
   Images: cache first (file names never change once published). */
const CACHE = 'dq-v30';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './styles.css', './app.js', './data/catalog.json', './fonts/inter.woff2', './fonts/anton.woff2']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.endsWith('reports.html')) return;
  if (/\.(webp|png|jpe?g|gif|svg)$/i.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    // question files: answer instantly from cache, refresh in the background
    e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    })));
    return;
  }
  e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html'))));
});
