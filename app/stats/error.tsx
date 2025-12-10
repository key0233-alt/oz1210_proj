/**
 * @file app/stats/error.tsx
 * @description 통계 대시보드 페이지 에러 처리
 *
 * Next.js Error Boundary로 사용되는 에러 컴포넌트입니다.
 * API 에러나 예상치 못한 오류 발생 시 사용자에게 친화적인 메시지를 표시합니다.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Error } from "@/components/ui/error";
import { Button } from "@/components/ui/button";

interface StatsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StatsError({ error, reset }: StatsErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // 에러 로깅 (개발 환경)
    if (process.env.NODE_ENV === "development") {
      console.error("통계 대시보드 페이지 에러:", error);
    }
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Error
          message={
            error.message ||
            "통계 데이터를 불러오는 중 오류가 발생했습니다."
          }
          type="api"
          onRetry={reset}
          retryText="다시 시도"
        />

        <div className="mt-6 flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            홈으로 돌아가기
          </Button>
          <Button onClick={reset}>다시 시도</Button>
        </div>
      </div>
    </div>
  );
}

