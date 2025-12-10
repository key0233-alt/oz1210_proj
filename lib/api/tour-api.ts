/**
 * @file lib/api/tour-api.ts
 * @description 한국관광공사 API 클라이언트
 *
 * 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 * 공통 파라미터 처리, 에러 처리, 재시도 로직을 포함합니다.
 */

import { getEnv, getServerEnv } from "@/lib/env";
import { TOUR_API_BASE_URL, TOUR_API_DEFAULTS, API_RETRY_CONFIG } from "@/lib/constants/api";
import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
} from "@/lib/types/tour";
import type { TourApiResponse, ApiResult } from "@/lib/types/api";

/**
 * 공통 파라미터 생성
 * @param isServer 서버 사이드 호출 여부 (기본값: false)
 * @returns 공통 파라미터 객체
 */
function getCommonParams(isServer: boolean = false): Record<string, string> {
  const serviceKey = isServer
    ? getServerEnv("TOUR_API_KEY")
    : getEnv("NEXT_PUBLIC_TOUR_API_KEY");

  return {
    serviceKey,
    MobileOS: TOUR_API_DEFAULTS.MobileOS,
    MobileApp: TOUR_API_DEFAULTS.MobileApp,
    _type: TOUR_API_DEFAULTS._type,
  };
}

/**
 * 지수 백오프를 사용한 지연 시간 계산
 */
function getDelayMs(retryCount: number): number {
  const delay = API_RETRY_CONFIG.initialDelay * Math.pow(2, retryCount);
  return Math.min(delay, API_RETRY_CONFIG.maxDelay);
}

/**
 * API 호출 재시도 로직
 */
async function fetchWithRetry<T>(
  url: string,
  retryCount: number = 0
): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    if (retryCount < API_RETRY_CONFIG.maxRetries) {
      const delay = getDelayMs(retryCount);
      console.warn(
        `API 호출 실패 (재시도 ${retryCount + 1}/${API_RETRY_CONFIG.maxRetries}):`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, retryCount + 1);
    }
    throw error;
  }
}

/**
 * API 응답 파싱 및 검증
 */
function parseApiResponse<T>(
  data: TourApiResponse<T>
): ApiResult<T extends Array<infer U> ? U[] : T> {
  const { response } = data;

  if (response.header.resultCode !== "0000") {
    return {
      success: false,
      error: response.header.resultMsg,
      code: response.header.resultCode,
    };
  }

  const items = response.body.items?.item;
  if (!items) {
    return {
      success: false,
      error: "응답 데이터가 없습니다.",
    };
  }

  // 배열이 아닌 경우 배열로 변환
  const itemArray = Array.isArray(items) ? items : [items];

  return {
    success: true,
    data: (itemArray.length === 1 && !Array.isArray(items)
      ? items
      : itemArray) as T extends Array<infer U> ? U[] : T,
  };
}

/**
 * 지역코드 조회
 *
 * @param areaCode 시/도 코드 (선택사항, 없으면 전체 시/도 조회)
 * @param isServer 서버 사이드 호출 여부
 * @returns 지역 코드 목록
 */
export async function getAreaCode(
  areaCode?: string,
  isServer: boolean = false
): Promise<ApiResult<TourItem[]>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      ...(areaCode && { areaCode }),
    });

    const url = `${TOUR_API_BASE_URL}/areaCode2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourItem[]>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "지역코드 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 지역 기반 관광지 목록 조회
 *
 * @param areaCode 지역 코드
 * @param contentTypeId 콘텐츠 타입 ID (선택사항)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @param isServer 서버 사이드 호출 여부
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  areaCode: string,
  contentTypeId?: number,
  numOfRows: number = 20,
  pageNo: number = 1,
  isServer: boolean = false
): Promise<ApiResult<TourItem[]>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      areaCode,
      numOfRows: numOfRows.toString(),
      pageNo: pageNo.toString(),
      ...(contentTypeId && { contentTypeId: contentTypeId.toString() }),
    });

    const url = `${TOUR_API_BASE_URL}/areaBasedList2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourItem[]>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "관광지 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 키워드 검색
 *
 * @param keyword 검색 키워드
 * @param areaCode 지역 코드 (선택사항)
 * @param contentTypeId 콘텐츠 타입 ID (선택사항)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @param isServer 서버 사이드 호출 여부
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  keyword: string,
  areaCode?: string,
  contentTypeId?: number,
  numOfRows: number = 20,
  pageNo: number = 1,
  isServer: boolean = false
): Promise<ApiResult<TourItem[]>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      keyword,
      numOfRows: numOfRows.toString(),
      pageNo: pageNo.toString(),
      ...(areaCode && { areaCode }),
      ...(contentTypeId && { contentTypeId: contentTypeId.toString() }),
    });

    const url = `${TOUR_API_BASE_URL}/searchKeyword2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourItem[]>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "키워드 검색 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관광지 공통 정보 조회
 *
 * @param contentId 콘텐츠 ID
 * @param isServer 서버 사이드 호출 여부
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string,
  isServer: boolean = false
): Promise<ApiResult<TourDetail>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      contentId,
    });

    const url = `${TOUR_API_BASE_URL}/detailCommon2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourDetail>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "관광지 상세 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관광지 소개 정보 조회 (운영 정보)
 *
 * @param contentId 콘텐츠 ID
 * @param contentTypeId 콘텐츠 타입 ID
 * @param isServer 서버 사이드 호출 여부
 * @returns 운영 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: number,
  isServer: boolean = false
): Promise<ApiResult<TourIntro>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      contentId,
      contentTypeId: contentTypeId.toString(),
    });

    const url = `${TOUR_API_BASE_URL}/detailIntro2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourIntro>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "운영 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 관광지 이미지 목록 조회
 *
 * @param contentId 콘텐츠 ID
 * @param isServer 서버 사이드 호출 여부
 * @returns 이미지 목록
 */
export async function getDetailImage(
  contentId: string,
  isServer: boolean = false
): Promise<ApiResult<TourImage[]>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      contentId,
    });

    const url = `${TOUR_API_BASE_URL}/detailImage2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<TourImage[]>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이미지 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 반려동물 동반 여행 정보 조회
 *
 * @param contentId 콘텐츠 ID
 * @param isServer 서버 사이드 호출 여부
 * @returns 반려동물 동반 정보
 */
export async function getDetailPetTour(
  contentId: string,
  isServer: boolean = false
): Promise<ApiResult<PetTourInfo>> {
  try {
    const params = new URLSearchParams({
      ...getCommonParams(isServer),
      contentId,
    });

    const url = `${TOUR_API_BASE_URL}/detailPetTour2?${params.toString()}`;
    const data = await fetchWithRetry<TourApiResponse<PetTourInfo>>(url);

    return parseApiResponse(data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "반려동물 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

