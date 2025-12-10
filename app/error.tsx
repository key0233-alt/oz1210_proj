/**
 * @file app/error.tsx
 * @description 전역 라우트 에러 처리
 *
 * Next.js Error Boundary로 사용되는 에러 컴포넌트입니다.
 * 라우트 세그먼트 레벨의 에러를 처리하며, 페이지별 error.tsx가 없는 경우 이 컴포넌트가 사용됩니다.
 * API 에러나 예상치 못한 오류 발생 시 사용자에게 친화적인 메시지를 표시합니다.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Error } from "@/components/ui/error";
import { Button } from "@/components/ui/button";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 에러 타입 분류 함수
 */
function getErrorType(error: Error): "network" | "api" | "general" {
  const message = error.message.toLowerCase();
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("네트워크") ||
    message.includes("failed to fetch")
  ) {
    return "network";
  }
  if (
    message.includes("api") ||
    message.includes("http") ||
    message.includes("서버") ||
    message.includes("500") ||
    message.includes("404") ||
    message.includes("403")
  ) {
    return "api";
  }
  return "general";
}

/**
 * 사용자 친화적인 에러 메시지 생성
 */
function getUserFriendlyMessage(error: Error, errorType: "network" | "api" | "general"): string {
  // 이미 사용자 친화적인 메시지인 경우 그대로 사용
  if (error.message && !error.message.includes("Error:") && !error.message.includes("at ")) {
    return error.message;
  }

  // 에러 타입별 기본 메시지
  switch (errorType) {
    case "network":
      return "네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
    case "api":
      return "서버에서 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 전역 라우트 에러 처리 컴포넌트
 */
export default function AppError({ error, reset }: AppErrorProps) {
  const router = useRouter();
  const errorType = getErrorType(error);
  const userMessage = getUserFriendlyMessage(error, errorType);

  useEffect(() => {
    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      console.error("전역 라우트 에러:", error);
      console.error("에러 타입:", errorType);
      console.error("에러 메시지:", error.message);
      if (error.stack) {
        console.error("에러 스택:", error.stack);
      }
      if (error.digest) {
        console.error("에러 digest:", error.digest);
      }
    }
  }, [error, errorType]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Error
          message={userMessage}
          type={errorType}
          onRetry={reset}
          retryText="다시 시도"
        />

        {/* 개발 환경에서만 상세 정보 표시 */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 p-4 bg-muted rounded-lg border">
            <summary className="cursor-pointer text-sm text-muted-foreground font-medium mb-2">
              상세 에러 정보 (개발 환경)
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <strong>원본 메시지:</strong>
                <pre className="mt-1 p-2 bg-background rounded overflow-auto whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <strong>스택 트레이스:</strong>
                  <pre className="mt-1 p-2 bg-background rounded overflow-auto whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                </div>
              )}
              {error.digest && (
                <div>
                  <strong>Digest:</strong> <code className="px-1 py-0.5 bg-background rounded">{error.digest}</code>
                </div>
              )}
            </div>
          </details>
        )}

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
          <Button onClick={reset}>다시 시도</Button>
        </div>

        {/* 추가 안내 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

