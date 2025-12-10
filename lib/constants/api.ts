/**
 * @file lib/constants/api.ts
 * @description API 관련 상수 정의
 */

/**
 * 한국관광공사 API Base URL
 */
export const TOUR_API_BASE_URL =
  "https://apis.data.go.kr/B551011/KorService2";

/**
 * 공통 파라미터 기본값
 */
export const TOUR_API_DEFAULTS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/**
 * 페이지네이션 기본값
 */
export const PAGINATION_DEFAULTS = {
  numOfRows: 20, // 페이지당 항목 수
  pageNo: 1, // 기본 페이지 번호
} as const;

/**
 * API 재시도 설정
 */
export const API_RETRY_CONFIG = {
  maxRetries: 3, // 최대 재시도 횟수
  initialDelay: 1000, // 초기 지연 시간 (ms)
  maxDelay: 10000, // 최대 지연 시간 (ms)
} as const;

