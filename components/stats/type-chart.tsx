/**
 * @file components/stats/type-chart.tsx
 * @description 관광 타입별 분포 Donut Chart 컴포넌트
 *
 * 관광 타입별 관광지 개수를 Donut Chart로 시각화합니다.
 * shadcn/ui Chart 컴포넌트(recharts 기반)를 사용합니다.
 *
 * 주요 기능:
 * 1. 8개 관광 타입의 비율과 개수 표시
 * 2. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 3. 호버 시 툴팁 표시 (타입명, 개수, 비율)
 * 4. 반응형 디자인
 *
 * 핵심 구현 로직:
 * - Client Component (Chart 컴포넌트가 "use client"이므로)
 * - 데이터는 props로 받음 (Server Component에서 전달)
 * - recharts PieChart with innerRadius 사용 (Donut Chart)
 * - chart-1~5 색상 사용 (다크/라이트 모드 자동 지원)
 *
 * @dependencies
 * - @/lib/types/stats: TypeStats 타입
 * - @/components/ui/chart: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
 * - @/components/ui/card: Card 컴포넌트
 * - recharts: PieChart, Pie, Cell, Legend
 * - next/navigation: useRouter
 */

"use client";

import type { TypeStats } from "@/lib/types/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface TypeChartProps {
  data: TypeStats[];
}

// chart-1~5 색상 배열 (8개 타입이므로 순환 사용)
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
] as const;

/**
 * 관광 타입별 분포 Donut Chart 컴포넌트
 */
export function TypeChart({ data }: TypeChartProps) {
  const router = useRouter();

  // 차트 데이터 준비 (비율 계산 포함)
  const chartData = useMemo(() => {
    const total = data.reduce((sum, type) => sum + type.count, 0);
    
    return data.map((type, index) => ({
      name: type.contentTypeName,
      value: type.count,
      contentTypeId: type.contentTypeId,
      percentage: total > 0 ? ((type.count / total) * 100).toFixed(1) : "0",
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data]);

  // 차트 설정
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  // 섹션 클릭 핸들러
  const handlePieClick = (_: unknown, index: number) => {
    const clickedData = chartData[index];
    if (clickedData?.contentTypeId) {
      router.push(`/?contentTypeId=${clickedData.contentTypeId}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>관광 타입별 분포</CardTitle>
        <CardDescription>
          8개 관광 타입의 비율과 개수를 표시합니다. 차트의 섹션을 클릭하면 해당 타입의 관광지 목록을 확인할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px]">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              onClick={handlePieClick}
              style={{ cursor: "pointer" }}
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const data = props.payload as typeof chartData[0];
                    return [
                      `${value?.toLocaleString()}개 (${data.percentage}%)`,
                      name,
                    ];
                  }}
                />
              }
            />
            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="name"
                  className="flex-wrap justify-center gap-4"
                />
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

