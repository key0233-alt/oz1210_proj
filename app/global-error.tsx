/**
 * @file app/global-error.tsx
 * @description 루트 레이아웃 레벨 에러 처리
 *
 * Next.js Global Error Boundary로 사용되는 에러 컴포넌트입니다.
 * 루트 레이아웃(layout.tsx) 자체의 에러를 처리합니다.
 * ClerkProvider, SyncUserProvider 등 레이아웃 레벨 컴포넌트의 에러를 캐치합니다.
 *
 * 주의사항:
 * - 반드시 <html> 태그를 포함해야 합니다.
 * - 레이아웃 컴포넌트를 사용할 수 없으므로 인라인 스타일을 사용합니다.
 * - 최소한의 UI만 포함하여 레이아웃이 깨진 경우에도 동작하도록 합니다.
 */

"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      console.error("전역 에러 (루트 레이아웃):", error);
      console.error("에러 스택:", error.stack);
      if (error.digest) {
        console.error("에러 digest:", error.digest);
      }
    }
  }, [error]);

  // 에러 타입 분류
  const getErrorType = (error: Error): "network" | "api" | "general" => {
    const message = error.message.toLowerCase();
    if (message.includes("network") || message.includes("fetch") || message.includes("네트워크")) {
      return "network";
    }
    if (message.includes("api") || message.includes("http") || message.includes("서버")) {
      return "api";
    }
    return "general";
  };

  const errorType = getErrorType(error);
  const errorTitle =
    errorType === "network"
      ? "네트워크 오류"
      : errorType === "api"
        ? "API 오류"
        : "시스템 오류";

  const errorMessage =
    error.message ||
    "애플리케이션을 초기화하는 중 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.";

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#f9fafb",
          color: "#1f2937",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "2rem",
            margin: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              padding: "2rem",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* 에러 아이콘 */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 1rem",
                  backgroundColor: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                }}
              >
                ⚠️
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#dc2626",
                  margin: "0 0 0.5rem",
                }}
              >
                {errorTitle}
              </h1>
            </div>

            {/* 에러 메시지 */}
            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  color: "#4b5563",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                {errorMessage}
              </p>
            </div>

            {/* 개발 환경에서만 상세 정보 표시 */}
            {process.env.NODE_ENV === "development" && error.stack && (
              <details
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.375rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                  }}
                >
                  상세 에러 정보 (개발 환경)
                </summary>
                <pre
                  style={{
                    fontSize: "0.75rem",
                    color: "#374151",
                    overflow: "auto",
                    margin: "0.5rem 0 0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {error.stack}
                </pre>
              </details>
            )}

            {/* 액션 버튼 */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#ffffff",
                  backgroundColor: "#3b82f6",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                style={{
                  padding: "0.625rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                  backgroundColor: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                홈으로 돌아가기
              </button>
            </div>

            {/* 추가 안내 */}
            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  margin: "0",
                }}
              >
                문제가 계속되면 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

