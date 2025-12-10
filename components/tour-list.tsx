/**
 * @file components/tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩 상태, 빈 상태, 에러 상태를 처리합니다.
 */

"use client";

import { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { SkeletonCardList } from "@/components/ui/skeleton-card";
import { Error } from "@/components/ui/error";
import { cn } from "@/lib/utils";

interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 메시지 */
  error?: string | null;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  error = null,
  className,
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <SkeletonCardList count={6} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <Error
          message={error}
          type="api"
          className="w-full"
        />
      </div>
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 p-12 rounded-lg border bg-muted/50",
          className
        )}
      >
        <p className="text-lg font-medium text-muted-foreground">
          관광지를 찾을 수 없습니다
        </p>
        <p className="text-sm text-muted-foreground text-center">
          다른 검색 조건으로 시도해보세요.
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
        className
      )}
    >
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

