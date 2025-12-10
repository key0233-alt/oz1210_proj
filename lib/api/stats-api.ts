/**
 * @file lib/api/stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 한국관광공사 API를 활용하여 통계 대시보드에 필요한 데이터를 수집하는 함수들을 제공합니다.
 * 지역별, 타입별 관광지 개수 집계 및 통계 요약 기능을 포함합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계 (getRegionStats)
 * 2. 관광 타입별 관광지 개수 집계 (getTypeStats)
 * 3. 전체 통계 요약 (getStatsSummary)
 *
 * 핵심 구현 로직:
 * - 병렬 API 호출로 성능 최적화 (Promise.all)
 * - 최소 데이터 요청 (numOfRows: 1, totalCount만 필요)
 * - 부분 실패 시에도 성공한 데이터 반환
 * - Server Component에서만 사용 (isServer: true)
 *
 * @dependencies
 * - @/lib/api/tour-api: getAreaCode, getAreaBasedList 함수
 * - @/lib/types/stats: RegionStats, TypeStats, StatsSummary 타입
 * - @/lib/types/api: ApiResult 타입
 * - @/lib/constants/tour-types: TOUR_CONTENT_TYPE_IDS, getContentTypeNameById
 */

import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";
import type { ApiResult } from "@/lib/types/api";
import {
  TOUR_CONTENT_TYPE_IDS,
  getContentTypeNameById,
} from "@/lib/constants/tour-types";
import type { TourItem } from "@/lib/types/tour";

/**
 * 지역별 관광지 개수 집계
 *
 * @returns 지역별 통계 정보 배열
 */
export async function getRegionStats(): Promise<
  ApiResult<RegionStats[]>
> {
  try {
    // 1. 전체 시/도 목록 조회
    const areaCodeResult = await getAreaCode(undefined, true);

    if (!areaCodeResult.success || !areaCodeResult.data) {
      return {
        success: false,
        error: areaCodeResult.error || "지역 코드 조회에 실패했습니다.",
      };
    }

    const areaCodes = areaCodeResult.data;

    // 2. 각 지역별로 관광지 개수 조회 (병렬 처리)
    const regionPromises = areaCodes.map(async (area) => {
      try {
        // totalCount만 필요하므로 최소 데이터만 요청
        const result = await getAreaBasedList(
          area.areacode,
          undefined, // contentTypeId 없음 (전체 타입)
          1, // numOfRows: 1
          1, // pageNo: 1
          true // isServer: true
        );

        if (result.success && result.totalCount !== undefined) {
          return {
            areaCode: area.areacode,
            areaName: area.title, // title 필드에 지역명이 포함됨
            count: result.totalCount,
          } as RegionStats;
        } else {
          // 에러 발생 시 로그만 남기고 null 반환
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `지역 ${area.areacode} (${area.title}) 통계 조회 실패:`,
              result.error
            );
          }
          return null;
        }
      } catch (error) {
        // 개별 지역 조회 실패 시 로그만 남기고 null 반환
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `지역 ${area.areacode} (${area.title}) 통계 조회 중 예외 발생:`,
            error
          );
        }
        return null;
      }
    });

    const regionResults = await Promise.all(regionPromises);

    // 3. 성공한 결과만 필터링하여 반환
    const regionStats = regionResults.filter(
      (result): result is RegionStats => result !== null
    );

    if (regionStats.length === 0) {
      return {
        success: false,
        error: "모든 지역의 통계 조회에 실패했습니다.",
      };
    }

    // 개수 기준 내림차순 정렬
    regionStats.sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: regionStats,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "지역별 통계 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관광 타입별 관광지 개수 집계
 *
 * 전체 지역을 조회하기 위해 각 지역별로 조회한 후 합산합니다.
 *
 * @returns 타입별 통계 정보 배열
 */
export async function getTypeStats(): Promise<ApiResult<TypeStats[]>> {
  try {
    // 1. 전체 시/도 목록 조회 (지역별 합산을 위해 필요)
    const areaCodeResult = await getAreaCode(undefined, true);

    if (!areaCodeResult.success || !areaCodeResult.data) {
      return {
        success: false,
        error: areaCodeResult.error || "지역 코드 조회에 실패했습니다.",
      };
    }

    const areaCodes = areaCodeResult.data;

    // 2. 각 타입별로 전체 지역의 관광지 개수 집계
    const typePromises = TOUR_CONTENT_TYPE_IDS.map(async (typeId) => {
      try {
        // 각 지역별로 해당 타입의 관광지 개수 조회 (병렬 처리)
        const regionPromises = areaCodes.map(async (area) => {
          try {
            const result = await getAreaBasedList(
              area.areacode,
              typeId,
              1, // numOfRows: 1
              1, // pageNo: 1
              true // isServer: true
            );

            if (result.success && result.totalCount !== undefined) {
              return result.totalCount;
            }
            return 0; // 실패 시 0으로 처리
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `타입 ${typeId}, 지역 ${area.areacode} 통계 조회 실패:`,
                error
              );
            }
            return 0;
          }
        });

        const regionCounts = await Promise.all(regionPromises);
        const totalCount = regionCounts.reduce((sum, count) => sum + count, 0);

        const typeName = getContentTypeNameById(typeId) || `타입 ${typeId}`;
        return {
          contentTypeId: typeId,
          contentTypeName: typeName,
          count: totalCount,
        } as TypeStats;
      } catch (error) {
        // 개별 타입 조회 실패 시 로그만 남기고 null 반환
        if (process.env.NODE_ENV === "development") {
          console.warn(`타입 ${typeId} 통계 조회 중 예외 발생:`, error);
        }
        return null;
      }
    });

    const typeResults = await Promise.all(typePromises);

    // 2. 성공한 결과만 필터링하여 반환
    const typeStats = typeResults.filter(
      (result): result is TypeStats => result !== null
    );

    if (typeStats.length === 0) {
      return {
        success: false,
        error: "모든 타입의 통계 조회에 실패했습니다.",
      };
    }

    // 개수 기준 내림차순 정렬
    typeStats.sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: typeStats,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "타입별 통계 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 전체 통계 요약 정보 생성
 *
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(): Promise<
  ApiResult<StatsSummary>
> {
  try {
    // 1. 지역별 및 타입별 통계 병렬 조회
    const [regionResult, typeResult] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 2. 에러 처리
    if (!regionResult.success || !typeResult.success) {
      return {
        success: false,
        error:
          regionResult.success === false
            ? regionResult.error
            : typeResult.error || "통계 요약 조회에 실패했습니다.",
      };
    }

    const regionStats = regionResult.data || [];
    const typeStats = typeResult.data || [];

    // 3. 전체 관광지 수 계산
    // 타입별 개수를 합산 (실제로는 중복이 있을 수 있으나, API 제약으로 인해 타입별 합산 사용)
    const totalCount = typeStats.reduce((sum, type) => sum + type.count, 0);

    // 4. Top 3 지역 추출
    const topRegions = regionStats.slice(0, 3);

    // 5. Top 3 타입 추출
    const topTypes = typeStats.slice(0, 3);

    // 6. 마지막 업데이트 시간
    const lastUpdated = new Date();

    return {
      success: true,
      data: {
        totalCount,
        topRegions,
        topTypes,
        lastUpdated,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "통계 요약 조회 중 오류가 발생했습니다.",
    };
  }
}

