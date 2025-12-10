/**
 * @file components/pwa-register.tsx
 * @description Service Worker 등록 컴포넌트
 *
 * Service Worker를 등록하고 업데이트를 처리합니다.
 * 클라이언트 컴포넌트로 구현되어 브라우저에서만 실행됩니다.
 */

"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Service Worker 등록
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker 등록 성공:",
            registration.scope
          );

          // 업데이트 확인
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // 새 버전이 설치되었을 때 사용자에게 알림
                  if (
                    confirm(
                      "새 버전이 사용 가능합니다. 새로고침하시겠습니까?"
                    )
                  ) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker 등록 실패:", error);
        });

      // 페이지가 온라인 상태로 돌아왔을 때 Service Worker 업데이트 확인
      window.addEventListener("online", () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      });
    }
  }, []);

  return null;
}

