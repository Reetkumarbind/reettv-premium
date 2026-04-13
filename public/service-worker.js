const CACHE_NAME = 'reet-tv-v3';
const M3U_CACHE = 'reet-tv-m3u-v1';
const URLS_TO_CACHE = ['/', '/index.html'];

// M3U source to cache for offline
const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';

// Install — cache shell + prefetch M3U
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)),
      caches.open(M3U_CACHE).then((cache) =>
        fetch(M3U_URL).then((res) => {
          if (res.ok) cache.put(M3U_URL, res);
        }).catch(() => {})
      ),
    ])
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_NAME, M3U_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Fetch — stale-while-revalidate for M3U, cache-first for assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // M3U playlist — serve cached immediately, refresh in background
  if (url.href === M3U_URL || url.pathname.endsWith('.m3u')) {
    event.respondWith(
      caches.open(M3U_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          }).catch(() => cached || new Response('', { status: 503 }));
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Skip non-origin URLs (streams, external APIs)
  if (url.origin !== self.location.origin) return;

  // Static assets — cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|json)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // HTML — network-first with offline fallback
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match('/index.html')))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
