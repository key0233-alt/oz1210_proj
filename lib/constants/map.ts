/**
 * @file lib/constants/map.ts
 * @description 지도 관련 상수 정의
 *
 * 네이버 지도 연동에 필요한 상수들을 정의합니다.
 * 지역 코드별 중심 좌표, 기본 줌 레벨 등을 포함합니다.
 */

import type { Coordinates } from "@/lib/utils/coordinates";

/**
 * 지역 코드별 중심 좌표 매핑
 * 한국관광공사 API의 지역 코드를 기준으로 합니다.
 */
export const REGION_CENTER_COORDINATES: Record<string, Coordinates> = {
  "1": { lng: 126.978, lat: 37.5665 }, // 서울
  "2": { lng: 126.7052, lat: 37.4563 }, // 인천
  "3": { lng: 127.3845, lat: 36.3504 }, // 대전
  "4": { lng: 128.5914, lat: 35.8714 }, // 대구
  "5": { lng: 126.8531, lat: 35.1595 }, // 광주
  "6": { lng: 129.0756, lat: 35.1796 }, // 부산
  "7": { lng: 129.3114, lat: 35.5384 }, // 울산
  "8": { lng: 127.2892, lat: 36.4800 }, // 세종
  "31": { lng: 127.5107, lat: 37.4138 }, // 경기
  "32": { lng: 128.3115, lat: 37.8228 }, // 강원
  "33": { lng: 127.4913, lat: 36.8000 }, // 충북
  "34": { lng: 126.8454, lat: 36.5184 }, // 충남
  "35": { lng: 128.5556, lat: 36.4919 }, // 경북
  "36": { lng: 128.3016, lat: 35.4606 }, // 경남
  "37": { lng: 127.1412, lat: 35.7175 }, // 전북
  "38": { lng: 126.8531, lat: 34.8679 }, // 전남
  "39": { lng: 126.5312, lat: 33.4996 }, // 제주
} as const;

/**
 * 기본 중심 좌표 (서울)
 */
export const DEFAULT_CENTER: Coordinates = {
  lng: 127.0,
  lat: 37.5,
};

/**
 * 기본 줌 레벨
 */
export const DEFAULT_ZOOM = 11;

/**
 * 지역별 기본 줌 레벨 (선택 사항)
 * 지역이 넓을수록 낮은 줌 레벨 사용
 */
export const REGION_ZOOM_LEVELS: Record<string, number> = {
  "1": 11, // 서울
  "2": 11, // 인천
  "3": 12, // 대전
  "4": 12, // 대구
  "5": 12, // 광주
  "6": 11, // 부산
  "7": 12, // 울산
  "8": 12, // 세종
  "31": 10, // 경기
  "32": 9, // 강원
  "33": 10, // 충북
  "34": 10, // 충남
  "35": 9, // 경북
  "36": 9, // 경남
  "37": 10, // 전북
  "38": 9, // 전남
  "39": 10, // 제주
} as const;

/**
 * 지역 코드로 중심 좌표 가져오기
 * @param areaCode 지역 코드
 * @returns 중심 좌표 또는 기본 좌표
 */
export function getRegionCenter(areaCode?: string): Coordinates {
  if (!areaCode) {
    return DEFAULT_CENTER;
  }
  return REGION_CENTER_COORDINATES[areaCode] || DEFAULT_CENTER;
}

/**
 * 지역 코드로 줌 레벨 가져오기
 * @param areaCode 지역 코드
 * @returns 줌 레벨 또는 기본 줌 레벨
 */
export function getRegionZoom(areaCode?: string): number {
  if (!areaCode) {
    return DEFAULT_ZOOM;
  }
  return REGION_ZOOM_LEVELS[areaCode] || DEFAULT_ZOOM;
}

