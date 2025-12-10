/**
 * @file components/stats/stats-error.tsx
 * @description 통계 데이터 에러 표시 컴포넌트 (재시도 버튼 포함)
 *
 * Server Component에서 사용할 수 있는 에러 컴포넌트입니다.
 * 재시도 버튼을 클릭하면 페이지를 새로고침합니다.
 */

"use client";

import { useRouter } from "next/navigation";
import { Error } from "@/components/ui/error";

interface StatsErrorProps {
  /** 에러 메시지 */
  message: string;
  /** 에러 타입 */
  type?: "network" | "api" | "general";
}

/**
 * 통계 데이터 에러 표시 컴포넌트
 */
export function StatsError({ message, type = "api" }: StatsErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <Error
      message={message}
      type={type}
      onRetry={handleRetry}
      retryText="다시 시도"
    />
  );
}

