/**
 * @file lib/types/api.ts
 * @description API 응답 래퍼 타입 정의
 */

/**
 * API 응답 래퍼 (한국관광공사 API 표준 응답 형식)
 */
export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * API 에러 응답
 */
export interface TourApiError {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
  };
}

/**
 * API 호출 결과 타입
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

