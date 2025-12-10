/**
 * @file components/stats/stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드 페이지에서 전체 관광지 수, Top 3 지역, Top 3 타입을 카드 형태로 표시합니다.
 * Server Component로 구현되어 서버에서 데이터를 받아 표시합니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 카드 (큰 숫자로 강조)
 * 2. Top 3 지역 카드 (리스트 형태)
 * 3. Top 3 타입 카드 (리스트 형태)
 * 4. 마지막 업데이트 시간 표시
 *
 * 핵심 구현 로직:
 * - shadcn/ui Card 컴포넌트 사용
 * - 반응형 그리드 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 4열)
 * - lucide-react 아이콘 사용
 * - 날짜 포맷팅 유틸리티 사용
 *
 * @dependencies
 * - @/lib/types/stats: StatsSummary 타입
 * - @/components/ui/card: Card 컴포넌트
 * - @/lib/utils/date: 날짜 포맷팅 함수
 * - lucide-react: 아이콘
 */

import type { StatsSummary } from "@/lib/types/stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Trophy, Award, BarChart3 } from "lucide-react";
import { formatDateTimeKR } from "@/lib/utils/date";

interface StatsSummaryProps {
  data: StatsSummary;
}

/**
 * 통계 요약 카드 컴포넌트
 */
export function StatsSummary({ data }: StatsSummaryProps) {
  const { totalCount, topRegions, topTypes, lastUpdated } = data;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 전체 관광지 수 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 관광지
            </CardTitle>
            <MapPin className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCount.toLocaleString()}</div>
          <CardDescription className="mt-2">개</CardDescription>
        </CardContent>
      </Card>

      {/* Top 3 지역 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              인기 지역 Top 3
            </CardTitle>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRegions.map((region, index) => (
              <div
                key={region.areaCode}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{region.areaName}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {region.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 타입 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              인기 타입 Top 3
            </CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topTypes.map((type, index) => (
              <div
                key={type.contentTypeId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">
                    {type.contentTypeName}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {type.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 마지막 업데이트 시간 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              업데이트
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {formatDateTimeKR(lastUpdated)}
          </div>
          <CardDescription className="mt-2">
            마지막 데이터 갱신 시간
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

