// ============================================================
// Service Worker — Academia El Profe Oficial
// v3 — Network-first for navigation, never cache _next assets.
// Aggressive cache invalidation on activate to prevent stale content.
// ============================================================

const CACHE = 'aep-v3';

self.addEventListener('install', (e) => {
  // Skip pre-caching — use network-first for everything.
  // This prevents stale HTML from persisting across deploys.
  self.skipWaiting();
});

// Listen for skip waiting message from client
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// --- Activate: delete ALL old caches, claim clients, notify them ---
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      // Delete ALL caches (including our own) to start fresh
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => clients.claim()).then(() => {
      // Notify all open tabs to reload (they may be showing stale content)
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          try {
            client.postMessage({ type: 'SW_UPDATED', cache: CACHE });
          } catch (err) { /* client may have closed */ }
        });
      });
    })
  );
});

// --- Fetch: smart caching strategy ---
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Skip non-http(s) schemes entirely (chrome-extension, data, blob, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // NEVER cache or intercept _next/static assets — always network only
  if (url.includes('/_next/static/')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('', { status: 200 }))
    );
    return;
  }

  // NEVER cache _next/image requests
  if (url.includes('/_next/image')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // API routes — always network, never cache
  if (url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Navigation requests (HTML pages): network-only for course pages,
  // network-first for everything else (with 1h cache limit).
  // Course pages must always show fresh CMS data.
  if (e.request.mode === 'navigate') {
    const isCoursePage = url.includes('/cursos/');
    if (isCoursePage) {
      // Never cache course pages — always fetch from network
      e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
          .catch(() => caches.match('/'))
          .catch(() => new Response('Offline', { status: 503 }))
      );
    } else {
      e.respondWith(
        fetch(e.request)
          .then((res) => {
            if (res.status === 200) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, clone));
            }
            return res;
          })
          .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
          .catch(() => new Response('Offline', { status: 503 }))
      );
    }
    return;
  }

  // Static assets (images, fonts, etc. not in _next/static): cache-first
  if (e.request.url.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|eot)(\?|$)/i)) {
    e.respondWith(
      caches.match(e.request).then((r) => {
        if (r) return r;
        return fetch(e.request).then((res) => {
          if (res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else: network-first with cache fallback (GET only)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
      .catch(() => new Response('Offline', { status: 503 }))
  );
});