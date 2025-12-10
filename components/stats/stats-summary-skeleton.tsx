/**
 * @file components/stats/stats-summary-skeleton.tsx
 * @description 통계 요약 카드 스켈레톤 컴포넌트
 *
 * 통계 요약 카드의 로딩 상태를 표시하는 스켈레톤 UI입니다.
 * 실제 StatsSummary 컴포넌트와 동일한 레이아웃을 가집니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * 통계 요약 카드 스켈레톤 컴포넌트
 */
export function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 전체 관광지 수 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-4 w-12" />
        </CardContent>
      </Card>

      {/* Top 3 지역 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 타입 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 마지막 업데이트 시간 카드 스켈레톤 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

