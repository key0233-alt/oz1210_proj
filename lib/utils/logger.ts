/**
 * @file lib/utils/logger.ts
 * @description 에러 로깅 유틸리티
 *
 * 개발 환경에서는 console.error를 사용하고,
 * 프로덕션 환경에서는 API 엔드포인트로 에러를 전송합니다.
 */

interface ErrorLog {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  errorType?: string;
}

/**
 * 에러를 로깅합니다.
 * @param error - 에러 객체 또는 에러 메시지
 * @param context - 추가 컨텍스트 정보
 */
export async function logError(
  error: Error | string,
  context?: Record<string, unknown>
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorType = error instanceof Error ? error.constructor.name : "Unknown";

  const errorLog: ErrorLog = {
    message: errorMessage,
    stack: errorStack,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    errorType,
    ...context,
  };

  // 개발 환경에서는 console.error 사용
  if (process.env.NODE_ENV === "development") {
    console.error("Error logged:", errorLog);
    return;
  }

  // 프로덕션 환경에서는 API 엔드포인트로 전송
  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorLog),
    });
  } catch (logError) {
    // 에러 로깅 실패는 무시 (무한 루프 방지)
    console.error("Failed to log error:", logError);
  }
}

/**
 * 정보 로그를 기록합니다.
 * @param message - 로그 메시지
 * @param data - 추가 데이터
 */
export function logInfo(message: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[INFO] ${message}`, data || "");
  }
}

/**
 * 경고 로그를 기록합니다.
 * @param message - 경고 메시지
 * @param data - 추가 데이터
 */
export function logWarning(
  message: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[WARNING] ${message}`, data || "");
  }
}

