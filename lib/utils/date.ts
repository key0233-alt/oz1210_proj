/**
 * @file lib/utils/date.ts
 * @description 날짜 포맷팅 유틸리티
 *
 * 한국어 로케일을 지원하는 날짜 포맷팅 함수를 제공합니다.
 */

/**
 * 날짜를 한국어 형식으로 포맷팅
 *
 * @param date 날짜 객체 또는 날짜 문자열
 * @param options Intl.DateTimeFormatOptions (선택사항)
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * ```ts
 * formatDateKR(new Date()) // "2024년 1월 1일"
 * formatDateKR(new Date(), { dateStyle: "short" }) // "24. 1. 1."
 * ```
 */
export function formatDateKR(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("ko-KR", defaultOptions).format(dateObj);
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 *
 * @param date 날짜 객체 또는 날짜 문자열
 * @returns 포맷팅된 날짜/시간 문자열
 *
 * @example
 * ```ts
 * formatDateTimeKR(new Date()) // "2024년 1월 1일 오후 3:30:00"
 * ```
 */
export function formatDateTimeKR(date: Date | string): string {
  return formatDateKR(date, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

/**
 * 상대 시간 표시 (예: "3일 전", "1시간 전")
 *
 * @param date 날짜 객체 또는 날짜 문자열
 * @returns 상대 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "방금 전";
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else {
    return formatDateKR(dateObj);
  }
}

