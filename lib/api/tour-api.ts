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
 * 에러 타입 분류
 */
function classifyError(error: unknown): {
  type: "network" | "api" | "parse" | "unknown";
  message: string;
  statusCode?: number;
} {
  // 네트워크 에러 (fetch 실패, 타임아웃 등)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: "network",
      message: "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.",
    };
  }

  // HTTP 에러
  if (error instanceof Error && error.message.includes("HTTP")) {
    const statusMatch = error.message.match(/HTTP (\d+)/);
    const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : undefined;

    let message = "서버에서 오류가 발생했습니다.";
    if (statusCode === 400) {
      message = "잘못된 요청입니다. 입력값을 확인해주세요.";
    } else if (statusCode === 401) {
      message = "인증이 필요합니다. API 키를 확인해주세요.";
    } else if (statusCode === 403) {
      message = "접근이 거부되었습니다. 권한을 확인해주세요.";
    } else if (statusCode === 404) {
      message = "요청한 리소스를 찾을 수 없습니다.";
    } else if (statusCode === 429) {
      message = "요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.";
    } else if (statusCode === 500) {
      message = "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } else if (statusCode === 503) {
      message = "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }

    return {
      type: "api",
      message,
      statusCode,
    };
  }

  // JSON 파싱 에러
  if (error instanceof SyntaxError) {
    return {
      type: "parse",
      message: "서버 응답을 처리하는 중 오류가 발생했습니다.",
    };
  }

  // 기타 에러
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "알 수 없는 오류가 발생했습니다.";

  return {
    type: "unknown",
    message: errorMessage,
  };
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
      const errorInfo = classifyError(
        new Error(`HTTP ${response.status}: ${response.statusText}`)
      );
      const error = new Error(errorInfo.message);
      (error as any).statusCode = errorInfo.statusCode;
      (error as any).errorType = errorInfo.type;
      throw error;
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    // 네트워크 에러나 일시적 서버 에러인 경우에만 재시도
    const errorInfo = classifyError(error);
    const shouldRetry =
      retryCount < API_RETRY_CONFIG.maxRetries &&
      (errorInfo.type === "network" ||
        (errorInfo.type === "api" &&
          errorInfo.statusCode &&
          errorInfo.statusCode >= 500));

    if (shouldRetry) {
      const delay = getDelayMs(retryCount);
      // 개발 환경에서만 상세 로깅
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `API 호출 실패 (재시도 ${retryCount + 1}/${API_RETRY_CONFIG.maxRetries}):`,
          errorInfo.type,
          errorInfo.message,
          error
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, retryCount + 1);
    }

    // 재시도 불가능한 경우 에러 정보를 포함하여 throw
    const finalError =
      error instanceof Error
        ? error
        : new Error(errorInfo.message);
    (finalError as any).errorType = errorInfo.type;
    if (errorInfo.statusCode) {
      (finalError as any).statusCode = errorInfo.statusCode;
    }
    throw finalError;
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
    // 한국관광공사 API 에러 코드별 사용자 친화적 메시지
    const errorCode = response.header.resultCode;
    let userMessage = response.header.resultMsg || "API 호출 중 오류가 발생했습니다.";

    // 에러 코드별 메시지 개선 (한국어)
    if (errorCode === "01") {
      userMessage = "필수 파라미터가 누락되었습니다.";
    } else if (errorCode === "02") {
      userMessage = "잘못된 파라미터 값입니다.";
    } else if (errorCode === "03") {
      userMessage = "서비스키가 유효하지 않습니다.";
    } else if (errorCode === "04") {
      userMessage = "서비스키가 만료되었습니다.";
    } else if (errorCode === "05") {
      userMessage = "일일 호출 한도를 초과했습니다.";
    }

    // 개발 환경에서만 원본 메시지 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("API 에러 코드:", errorCode);
      console.error("API 에러 메시지:", response.header.resultMsg);
    }

    return {
      success: false,
      error: userMessage,
      code: errorCode,
    };
  }

  const items = response.body.items?.item;
  if (!items) {
    return {
      success: false,
      error: "조회된 데이터가 없습니다.",
    };
  }

  // 배열이 아닌 경우 배열로 변환
  const itemArray = Array.isArray(items) ? items : [items];

  return {
    success: true,
    data: (itemArray.length === 1 && !Array.isArray(items)
      ? items
      : itemArray) as T extends Array<infer U> ? U[] : T,
    totalCount: response.body.totalCount,
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("지역코드 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "지역코드 조회 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("관광지 목록 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "관광지 목록 조회 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("키워드 검색 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "키워드 검색 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("관광지 상세 정보 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "관광지 상세 정보 조회 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("운영 정보 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "운영 정보 조회 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("이미지 목록 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "이미지 목록 조회 중 오류가 발생했습니다.",
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
    const errorInfo = classifyError(error);
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === "development") {
      console.error("반려동물 정보 조회 에러:", errorInfo, error);
    }
    return {
      success: false,
      error: errorInfo.message || "반려동물 정보 조회 중 오류가 발생했습니다.",
    };
  }
}

