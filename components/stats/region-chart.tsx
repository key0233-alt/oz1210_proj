/**
 * @file components/stats/region-chart.tsx
 * @description 지역별 관광지 분포 Bar Chart 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화합니다.
 * shadcn/ui Chart 컴포넌트(recharts 기반)를 사용합니다.
 *
 * 주요 기능:
 * 1. 상위 10개 지역의 관광지 개수 표시
 * 2. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 3. 호버 시 툴팁 표시
 * 4. 반응형 디자인
 *
 * 핵심 구현 로직:
 * - Client Component (Chart 컴포넌트가 "use client"이므로)
 * - 데이터는 props로 받음 (Server Component에서 전달)
 * - recharts BarChart 사용
 * - chart-1 색상 사용 (다크/라이트 모드 자동 지원)
 *
 * @dependencies
 * - @/lib/types/stats: RegionStats 타입
 * - @/components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent
 * - @/components/ui/card: Card 컴포넌트
 * - recharts: BarChart, Bar, XAxis, YAxis, CartesianGrid
 * - next/navigation: useRouter
 */

"use client";

import type { RegionStats } from "@/lib/types/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface RegionChartProps {
  data: RegionStats[];
}

/**
 * 지역별 관광지 분포 Bar Chart 컴포넌트
 */
export function RegionChart({ data }: RegionChartProps) {
  const router = useRouter();

  // 상위 10개 지역만 표시
  const chartData = useMemo(() => {
    return data.slice(0, 10).map((region) => ({
      name: region.areaName,
      count: region.count,
      areaCode: region.areaCode,
    }));
  }, [data]);

  // 차트 설정
  const chartConfig = {
    count: {
      label: "관광지 개수",
      color: "hsl(var(--chart-1))",
    },
  };

  // 바 클릭 핸들러
  const handleBarClick = (data: { areaCode: string } | undefined) => {
    if (data?.areaCode) {
      router.push(`/?areaCode=${data.areaCode}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>지역별 관광지 분포</CardTitle>
        <CardDescription>
          상위 10개 지역의 관광지 개수를 표시합니다. 바를 클릭하면 해당 지역의 관광지 목록을 확인할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px]">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => [
                    `${value?.toLocaleString()}개`,
                    "관광지 개수",
                  ]}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
              onClick={(data) => handleBarClick(data)}
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="var(--color-count)"
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

