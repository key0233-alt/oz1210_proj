/**
 * @file lib/types/area.ts
 * @description 지역 코드 관련 TypeScript 타입 정의
 *
 * 한국관광공사 API의 areaCode2 응답 데이터 구조를 기반으로 작성되었습니다.
 */

/**
 * 지역 코드 정보 (areaCode2 응답)
 * 
 * 한국관광공사 API의 areaCode2는 TourItem과 유사한 구조를 반환하지만,
 * 지역 코드 정보만 포함합니다.
 */
export interface AreaCode {
  /** 지역 코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 순번 */
  rnum?: string;
}

