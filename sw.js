/* =========================================================
 * HIDDENSTONE — 서비스 워커 (오프라인 지원)
 *
 * 인터넷이 끊겨도 튜토리얼·AI 대전·기보 다시보기는 그대로 돌아가야 한다.
 * (온라인 대전만 네트워크가 필요하고, 그건 이미 실패 안내가 있다.)
 *
 * 전략
 *  - HTML: 네트워크 우선 → 실패하면 캐시. 새 버전이 바로 반영되게.
 *  - 그 외 자원: 캐시 우선. js/css는 ?v=N 으로 버전이 붙어 있어 안전하다.
 *  - 캐시 이름에 버전을 넣고, activate에서 옛 캐시를 지운다.
 * ========================================================= */
const VERSION = 'hs-v9';
const CACHE = VERSION;

/* 앱이 돌아가는 데 필요한 최소 자원 */
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './css/style.css?v=9',
  './js/i18n.js?v=9',
  './js/guide.js?v=9',
  './js/maps.js?v=9',
  './js/engine.js?v=9',
  './js/ai.js?v=9',
  './js/ui.js?v=9',
  './js/records.js?v=9',
  './js/replay.js?v=9',
  './js/tutorial.js?v=9',
  './js/net.js?v=9',
  './js/audio.js?v=9',
  './js/main.js?v=9',
  './vendor/peerjs-1.5.4.min.js',
  './vendor/mqtt-5.10.1.min.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 하나라도 실패하면 설치가 통째로 실패하므로 개별로 담는다
    await Promise.all(SHELL.map((u) =>
      cache.add(new Request(u, { cache: 'reload' })).catch((err) => {
        console.warn('[sw] 캐시 실패:', u, err);
      })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 다른 출처(P2P 시그널링·MQTT 브로커 등)는 건드리지 않는다
  if (url.origin !== self.location.origin) return;

  const isDoc = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isDoc) {
    // 문서는 네트워크 우선 — 새로 배포한 버전이 바로 보이게
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match('./index.html');
        return cached || Response.error();
      }
    })());
    return;
  }

  // 나머지는 캐시 우선 (js/css는 ?v=N 으로 버전이 붙어 캐시가 오래되지 않는다)
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      return cached || Response.error();
    }
  })());
});
