/**
 * @file components/stats/type-chart-skeleton.tsx
 * @description 관광 타입별 분포 차트 스켈레톤 컴포넌트
 *
 * 관광 타입별 분포 차트의 로딩 상태를 표시하는 스켈레톤 UI입니다.
 * 실제 TypeChart 컴포넌트와 동일한 레이아웃을 가집니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 관광 타입별 분포 차트 스켈레톤 컴포넌트
 */
export function TypeChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px] flex items-center justify-center">
          {/* 원형 차트 스켈레톤 */}
          <div className="relative">
            <Skeleton className="h-64 w-64 rounded-full" />
            {/* 중앙 원형 (Donut 형태) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full bg-background" />
            </div>
            {/* 범례 스켈레톤 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 flex-wrap justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

