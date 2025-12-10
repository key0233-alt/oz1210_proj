/**
 * @file components/stats/region-chart-skeleton.tsx
 * @description 지역별 분포 차트 스켈레톤 컴포넌트
 *
 * 지역별 분포 차트의 로딩 상태를 표시하는 스켈레톤 UI입니다.
 * 실제 RegionChart 컴포넌트와 동일한 레이아웃을 가집니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 지역별 분포 차트 스켈레톤 컴포넌트
 */
export function RegionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px] space-y-4">
          {/* 차트 영역 스켈레톤 */}
          <div className="flex items-end justify-between h-full gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton
                  className="w-full"
                  style={{
                    height: `${Math.random() * 60 + 40}%`,
                  }}
                />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

