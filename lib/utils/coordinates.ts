/**
 * @file lib/utils/coordinates.ts
 * @description 좌표 변환 유틸리티
 *
 * KATEC 좌표계를 WGS84 좌표계로 변환하는 함수를 제공합니다.
 */

/**
 * 좌표 쌍 타입
 */
export interface Coordinates {
  /** 경도 (longitude) */
  lng: number;
  /** 위도 (latitude) */
  lat: number;
}

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * 한국관광공사 API는 KATEC 좌표계를 사용하며,
 * 정수형으로 저장되어 있습니다 (예: 1270000000).
 * 이를 10000000으로 나누어 WGS84 좌표로 변환합니다.
 *
 * @param mapx 경도 (KATEC 좌표계, 정수형 문자열)
 * @param mapy 위도 (KATEC 좌표계, 정수형 문자열)
 * @returns WGS84 좌표 (경도, 위도)
 * @throws mapx 또는 mapy가 유효하지 않은 경우 에러 발생
 *
 * @example
 * ```ts
 * const coords = katecToWgs84("1270000000", "370000000");
 * // { lng: 127.0, lat: 37.0 }
 * ```
 */
export function katecToWgs84(
  mapx: string | number,
  mapy: string | number
): Coordinates {
  const x = typeof mapx === "string" ? parseFloat(mapx) : mapx;
  const y = typeof mapy === "string" ? parseFloat(mapy) : mapy;

  if (isNaN(x) || isNaN(y)) {
    throw new Error(
      `유효하지 않은 좌표입니다. mapx: ${mapx}, mapy: ${mapy}`
    );
  }

  return {
    lng: x / 10000000,
    lat: y / 10000000,
  };
}

/**
 * TourItem의 좌표를 WGS84로 변환
 *
 * @param item TourItem 객체
 * @returns WGS84 좌표
 */
export function tourItemToCoordinates(item: {
  mapx: string;
  mapy: string;
}): Coordinates {
  return katecToWgs84(item.mapx, item.mapy);
}

