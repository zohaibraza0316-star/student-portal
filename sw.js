// ==========================================
// RAZA TUTORS — 100% OFFLINE-FIRST SERVICE WORKER
// Zero external CDN dependencies • GitHub Pages subpath safe
// ==========================================
const CACHE_NAME = 'raza-tutors-offline-pwa-v5.0';

const PRECACHE_ASSETS = [
  "./",
  "./auth.js",
  "./index.html",
  "./login.html",
  "./manifest.json",
  "./style.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./vendor/tailwind-offline.css",
  "./js/admin.js",
  "./js/attendance.js",
  "./js/backup.js",
  "./js/config.js",
  "./js/dashboard.js",
  "./js/db.js",
  "./js/demos.js",
  "./js/expenses.js",
  "./js/fees.js",
  "./js/main.js",
  "./js/marks.js",
  "./js/offline-charts.js",
  "./js/parent-portal.js",
  "./js/pwa.js",
  "./js/reports.js",
  "./js/sabaq.js",
  "./js/salaries.js",
  "./js/students.js",
  "./js/utils.js",
  "./views/admin.view.js",
  "./views/attendance.view.js",
  "./views/demos.view.js",
  "./views/expenses.view.js",
  "./views/fees.view.js",
  "./views/marks.view.js",
  "./views/modals.view.js",
  "./views/mount.js",
  "./views/parent-portal.view.js",
  "./views/reports.view.js",
  "./views/sabaq.view.js",
  "./views/salaries.view.js",
  "./views/students.view.js"
];

// 1. INSTALL: Pre-cache every single app file so offline works immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Clean old broken caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// 3. FETCH: Bulletproof Offline-First Strategy (Never shows 'You are offline')
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // A) Page Navigations (index.html, login.html, or directory root ./)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          // Update cache in background when online
          fetch(req).then((fresh) => {
            if (fresh && fresh.ok) {
              caches.open(CACHE_NAME).then((c) => c.put(req, fresh.clone()));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then((fresh) => {
          if (fresh && fresh.ok) {
            const clone = fresh.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return fresh;
        }).catch(() => {
          const fallback = url.pathname.endsWith('login.html') ? './login.html' : './index.html';
          return caches.match(fallback, { ignoreSearch: true });
        });
      })
    );
    return;
  }

  // B) Static Assets (CSS, JS, Views, Icons, Manifest): Cache-First + Stale-While-Revalidate
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const networkFetch = fetch(req).then((fresh) => {
        if (fresh && fresh.ok) {
          const clone = fresh.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return fresh;
      }).catch(() => null);

      return cached || networkFetch.then((res) => res || caches.match('./index.html'));
    })
  );
});
