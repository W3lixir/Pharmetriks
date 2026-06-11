/* Pharmetriks Service Worker
 * Strategy:
 *   - Precache the app shell (HTML, manifest, icons) on install.
 *   - Cache-first for precached/static assets.
 *   - Stale-while-revalidate for Google Fonts CSS + font files.
 *   - Network-first with cache fallback for /app HTML.
 *   - Never cache /api/* (license, etc.) — always go to network.
 *
 * Bump SW_VERSION to roll out a new shell to existing installs.
 */
const SW_VERSION    = 'pharmetriks-v1.0.1';
const SHELL_CACHE   = `${SW_VERSION}-shell`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const FONTS_CACHE   = `${SW_VERSION}-fonts`;

// The app currently lives at /app. We also precache the bare HTML file path
// (rxaudit-local.html) for environments that serve it directly during dev.
const APP_SHELL = [
  '/app',
  '/app/',
  '/rxaudit-local.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
  '/icons/icon-monochrome.svg',
  '/icons/apple-touch-icon.svg',
];

const FONTS_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // addAll fails atomically; use individual adds so one missing file doesn't kill the install
    await Promise.all(APP_SHELL.map(url =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => null)
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => !k.startsWith(SW_VERSION))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Allow page to trigger immediate activation after an update is found.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1) Never intercept the license / auth API — always network.
  if (url.pathname.startsWith('/api/')) return;

  // 2) Never intercept auth/portal routes — let the server handle redirects.
  const AUTH_PATHS = ['/login', '/signup', '/logout', '/pending', '/upload-receipt', '/admin'];
  if (AUTH_PATHS.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) return;

  // 3) Navigation requests: network-first, fall back to cached /app shell.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  // 3) Google Fonts: stale-while-revalidate.
  if (FONTS_HOSTS.has(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, FONTS_CACHE));
    return;
  }

  // 4) Same-origin static assets: cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  // 5) Other cross-origin: try network, fall back to cache if present.
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

async function networkFirstNavigation(req) {
  try {
    const fresh = await fetch(req);
    // Only cache successful, non-redirect responses.
    if (fresh.status === 200 && fresh.type !== 'opaque') {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached =
      (await caches.match(req)) ||
      (await caches.match('/app')) ||
      (await caches.match('/rxaudit-local.html'));
    if (cached) return cached;
    return new Response(offlineFallbackHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200,
    });
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200 && fresh.type !== 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then(res => {
      if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

function offlineFallbackHTML() {
  return `<!doctype html><html lang="en"><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Pharmetriks — Offline</title>
<style>
  body{margin:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;
       background:linear-gradient(180deg,#F2E6EE,#e3ddff);
       color:#00003D;display:flex;min-height:100vh;
       align-items:center;justify-content:center;padding:24px;}
  .card{background:rgba(255,255,255,0.7);backdrop-filter:blur(14px);
        border:1px solid rgba(255,255,255,0.65);border-radius:18px;
        padding:28px;max-width:360px;text-align:center;
        box-shadow:0 12px 40px rgba(6,0,171,0.18);}
  h1{font-size:20px;margin:0 0 8px;letter-spacing:-0.3px;}
  p{font-size:14px;color:#0600AB;margin:0;line-height:1.5;}
</style>
<div class="card">
  <h1>You're offline</h1>
  <p>Pharmetriks hasn't been installed yet. Connect to the internet at least once to set it up, then it works offline forever.</p>
</div></html>`;
}
