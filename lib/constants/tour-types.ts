/**
 * @file lib/constants/tour-types.ts
 * @description 관광 타입 상수 정의
 *
 * Content Type ID와 이름 매핑, 타입별 메타데이터 제공
 */

/**
 * 관광 타입 ID와 이름 매핑
 */
export const TOUR_CONTENT_TYPES = {
  12: "관광지",
  14: "문화시설",
  15: "축제/행사",
  25: "여행코스",
  28: "레포츠",
  32: "숙박",
  38: "쇼핑",
  39: "음식점",
} as const;

/**
 * 관광 타입 ID 타입
 */
export type TourContentTypeId = keyof typeof TOUR_CONTENT_TYPES;

/**
 * 관광 타입 이름 타입
 */
export type TourContentTypeName =
  (typeof TOUR_CONTENT_TYPES)[TourContentTypeId];

/**
 * 관광 타입 ID 배열
 */
export const TOUR_CONTENT_TYPE_IDS = Object.keys(
  TOUR_CONTENT_TYPES
).map(Number) as TourContentTypeId[];

/**
 * 관광 타입 이름으로 ID 찾기
 */
export function getContentTypeIdByName(
  name: string
): TourContentTypeId | undefined {
  const entry = Object.entries(TOUR_CONTENT_TYPES).find(
    ([, typeName]) => typeName === name
  );
  return entry ? (Number(entry[0]) as TourContentTypeId) : undefined;
}

/**
 * 관광 타입 ID로 이름 찾기
 */
export function getContentTypeNameById(
  id: number | string
): TourContentTypeName | undefined {
  const numId = typeof id === "string" ? Number(id) : id;
  return TOUR_CONTENT_TYPES[numId as TourContentTypeId];
}

/**
 * 관광 타입별 마커 색상 매핑
 * 각 타입별로 구분되는 색상 제공
 */
export const TOUR_TYPE_MARKER_COLORS: Record<TourContentTypeId, string> = {
  12: "#3b82f6", // 관광지 - 파란색
  14: "#8b5cf6", // 문화시설 - 보라색
  15: "#ec4899", // 축제/행사 - 핑크색
  25: "#10b981", // 여행코스 - 초록색
  28: "#f59e0b", // 레포츠 - 주황색
  32: "#6366f1", // 숙박 - 인디고색
  38: "#ef4444", // 쇼핑 - 빨간색
  39: "#f97316", // 음식점 - 오렌지색
} as const;

/**
 * 관광 타입 ID로 마커 색상 찾기
 */
export function getMarkerColorByTypeId(
  id: number | string
): string {
  const numId = typeof id === "string" ? Number(id) : id;
  return TOUR_TYPE_MARKER_COLORS[numId as TourContentTypeId] || "#3b82f6"; // 기본 파란색
}

