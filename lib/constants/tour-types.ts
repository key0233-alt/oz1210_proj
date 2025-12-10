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

