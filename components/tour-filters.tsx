/**
 * @file components/tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 제공하는 필터 컴포넌트입니다.
 * 필터 상태는 URL 쿼리 파라미터로 관리되어 공유 가능한 링크를 지원합니다.
 *
 * 주요 기능:
 * - 지역 필터 (시/도 선택)
 * - 관광 타입 필터 (다중 선택)
 * - 정렬 옵션
 * - 필터 초기화
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - components/tour-filters/area-filter.tsx
 * - components/tour-filters/type-filter.tsx
 * - components/tour-filters/sort-filter.tsx
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AreaFilter } from "@/components/tour-filters/area-filter";
import { TypeFilter } from "@/components/tour-filters/type-filter";
import { SortFilter } from "@/components/tour-filters/sort-filter";
import { PetFilter } from "@/components/tour-filters/pet-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 필터 컴포넌트 Props
 */
interface TourFiltersProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 필터 컴포넌트
 */
export function TourFilters({ className }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * 필터 초기화
   */
  const handleReset = () => {
    router.push("/");
  };

  /**
   * 활성 필터 개수 확인
   */
  const activeFiltersCount =
    (searchParams.get("areaCode") ? 1 : 0) +
    (searchParams.get("contentTypeId") ? 1 : 0) +
    (searchParams.get("pet") === "true" ? 1 : 0) +
    (searchParams.get("sort") && searchParams.get("sort") !== "modifiedtime"
      ? 1
      : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col gap-6">
          {/* 첫 번째 행: 지역 필터, 정렬, 초기화 버튼 */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
            {/* 지역 필터 */}
            <div className="flex-1 min-w-0">
              <AreaFilter />
            </div>

            {/* 정렬 옵션 */}
            <div className="w-full lg:w-auto lg:min-w-[150px]">
              <SortFilter />
            </div>

            {/* 초기화 버튼 */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full lg:w-auto shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                초기화
              </Button>
            )}
          </div>

          {/* 두 번째 행: 관광 타입 필터 */}
          <div className="w-full">
            <TypeFilter />
          </div>

          {/* 세 번째 행: 반려동물 필터 */}
          <div className="w-full">
            <PetFilter />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

