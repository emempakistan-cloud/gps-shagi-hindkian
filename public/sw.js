// GPS Shagi Hindkian - minimal service worker
// Hand-written, no third-party dependency. Provides basic offline support
// for the app shell and satisfies browser "installable PWA" requirements.

const CACHE_NAME = 'gsh-teacher-data-v1';
const OFFLINE_URL = '/';

// Assets to pre-cache on install (safe, static, unlikely to change often)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy: always try the network (fresh data matters for
// this app - documents, approvals, etc.), fall back to cache only when
// genuinely offline. This avoids ever serving stale document lists.
self.addEventListener('fetch', (event) => {
  // Only handle GET requests; let POST/PUT/DELETE (uploads, deletes, auth)
  // go straight to the network untouched.
  if (event.request.method !== 'GET') return;

  // Never cache API calls or Supabase requests - these must always be live.
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase.co')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
