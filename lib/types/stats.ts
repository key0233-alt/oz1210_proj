/**
 * @file lib/types/stats.ts
 * @description 통계 관련 TypeScript 타입 정의
 */

/**
 * 지역별 통계 정보
 */
export interface RegionStats {
  /** 지역 코드 */
  areaCode: string;
  /** 지역명 */
  areaName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 관광 타입별 통계 정보
 */
export interface TypeStats {
  /** 콘텐츠 타입 ID */
  contentTypeId: number;
  /** 콘텐츠 타입 이름 */
  contentTypeName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** Top 3 지역 */
  topRegions: RegionStats[];
  /** Top 3 타입 */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}

