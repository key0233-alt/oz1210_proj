/**
 * @file app/stats/loading.tsx
 * @description 통계 대시보드 페이지 로딩 상태
 *
 * Suspense fallback으로 사용되는 로딩 컴포넌트입니다.
 * 스켈레톤 UI를 표시하여 사용자 경험을 개선합니다.
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
      {/* 헤더 스켈레톤 */}
      <header className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </header>

      {/* 통계 요약 카드 영역 스켈레톤 */}
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* 지역별 분포 차트 영역 스켈레톤 */}
      <section className="mb-8">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </section>

      {/* 타입별 분포 차트 영역 스켈레톤 */}
      <section className="mb-8">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex items-center justify-center">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
}

