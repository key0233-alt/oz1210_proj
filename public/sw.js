/**
 * @file public/sw.js
 * @description Service Worker
 *
 * PWA 오프라인 지원을 위한 Service Worker입니다.
 * 정적 자산 캐싱 및 오프라인 페이지 제공을 담당합니다.
 */

const CACHE_NAME = "my-trip-v1";
const OFFLINE_PAGE = "/offline.html";

// 캐시할 정적 자산 목록
const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 설치 이벤트: 정적 자산 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// fetch 이벤트: 네트워크 우선, 실패 시 캐시 사용
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET 요청만 처리
  if (request.method !== "GET") {
    return;
  }

  // API 요청은 네트워크만 사용 (캐싱하지 않음)
  if (request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 네트워크 응답이 성공하면 캐시에 저장
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 찾기
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // HTML 요청이고 캐시에 없으면 오프라인 페이지 반환
          if (
            request.headers.get("accept")?.includes("text/html") &&
            request.mode === "navigate"
          ) {
            return caches.match(OFFLINE_PAGE);
          }
          return new Response("오프라인 상태입니다.", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

