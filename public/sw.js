// ============================================================
// Service Worker — Academia El Profe Oficial
// v3 — Network-first for navigation, cache-only for offline.
// NEVER cache _next/ assets (immutable hashed URLs).
// NEVER cache non-http(s) schemes (chrome-extension, etc.).
// ============================================================

const CACHE = 'aep-v3';

// Only cache these navigation pages (HTML shells) — NOT _next assets
const CORE_ASSETS = ['/', '/cursos', '/nosotros', '/soporte', '/manifest.json'];

// --- Install: pre-cache core navigation pages only ---
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(CORE_ASSETS).catch(() => {
        // If any pre-cache fails, continue — we'll fetch on demand
      })
    )
  );
  self.skipWaiting();
});

// Listen for skip waiting message from client
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// --- Activate: delete old caches, claim clients immediately ---
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

// --- Fetch: smart caching strategy ---
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Skip non-http(s) schemes entirely (chrome-extension, data, blob, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // NEVER cache _next/static assets — they have content hashes and are immutable.
  // Always network-first for these.
  if (url.includes('/_next/static/')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('', { status: 200 }))
    );
    return;
  }

  // NEVER cache _next/image requests (dynamic, can be large)
  if (url.includes('/_next/image')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 200 })));
    return;
  }

  // For API routes and server actions — always network
  if (url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Navigation requests (HTML pages): network-first, fallback to cache, then offline shell
  if (e.request.mode === 'navigate') {
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
        .catch(() => new Response('Offline', { status: 200 }))
    );
    return;
  }

  // Static assets (images, fonts, etc. not in _next/static): cache-first
  if (e.request.url.match(/\.(js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|eot)(\?|$)/i)) {
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

  // Everything else: network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
      .catch(() => new Response('Offline', { status: 200 }))
  );
});