/**
 * @file lib/utils/naver-maps.ts
 * @description 네이버 지도 API 유틸리티
 *
 * 네이버 지도 API 스크립트를 동적으로 로드하는 함수를 제공합니다.
 * 여러 컴포넌트에서 재사용할 수 있도록 유틸리티로 분리했습니다.
 */

import { getEnv } from "@/lib/env";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver?: typeof naver;
  }
}

/**
 * 네이버 지도 스크립트 로드 상태
 */
let scriptLoadPromise: Promise<void> | null = null;

/**
 * 네이버 지도 API 스크립트 동적 로드
 * 중복 로드를 방지하기 위해 Promise를 캐싱합니다.
 *
 * @returns 네이버 지도 API가 로드될 때까지 대기하는 Promise
 */
export function loadNaverMapsScript(): Promise<void> {
  // 이미 로드 중이거나 로드 완료된 경우
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 이미 스크립트가 로드된 경우
  if (typeof window !== "undefined" && window.naver?.maps) {
    scriptLoadPromise = Promise.resolve();
    return scriptLoadPromise;
  }

  // 스크립트 로드
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }

    const clientId = getEnv("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID");
    const scriptId = "naver-maps-script";

    // 이미 스크립트가 존재하는 경우
    if (document.getElementById(scriptId)) {
      // 스크립트 로드 완료 대기
      const checkNaver = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkNaver);
          resolve();
        }
      }, 100);

      // 타임아웃 (10초)
      setTimeout(() => {
        clearInterval(checkNaver);
        if (!window.naver?.maps) {
          reject(new Error("네이버 지도 API 로드 타임아웃"));
        }
      }, 10000);
      return;
    }

    // 스크립트 생성 및 추가
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // 네이버 지도 API가 로드될 때까지 대기
      const checkNaver = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(checkNaver);
          resolve();
        }
      }, 100);

      // 타임아웃 (10초)
      setTimeout(() => {
        clearInterval(checkNaver);
        if (!window.naver?.maps) {
          reject(new Error("네이버 지도 API 로드 타임아웃"));
        }
      }, 10000);
    };

    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("네이버 지도 API 스크립트 로드 실패"));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

