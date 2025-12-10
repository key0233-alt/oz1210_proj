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
  /** 검색 키워드 (검색 모드일 때) */
  searchKeyword?: string;
  /** 선택된 관광지 ID (지도 연동용) */
  selectedContentId?: string;
  /** 카드 클릭 핸들러 (지도 연동용) */
  onCardClick?: (contentId: string) => void;
  /** 카드 호버 핸들러 (지도 연동용, 선택 사항) */
  onCardHover?: (contentId: string) => void;
  /** 카드 호버 해제 핸들러 (지도 연동용, 선택 사항) */
  onCardHoverLeave?: () => void;
}

/**
 * 관광지 목록 컴포넌트
 */
export function TourList({
  tours,
  isLoading = false,
  error = null,
  className,
  searchKeyword,
  selectedContentId,
  onCardClick,
  onCardHover,
  onCardHoverLeave,
}: TourListProps) {
  const isSearchMode = !!searchKeyword;
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
          {isSearchMode
            ? "검색 결과가 없습니다"
            : "관광지를 찾을 수 없습니다"}
        </p>
        <p className="text-sm text-muted-foreground text-center">
          {isSearchMode
            ? `"${searchKeyword}"에 대한 검색 결과가 없습니다. 다른 키워드로 시도해보세요.`
            : "다른 검색 조건으로 시도해보세요."}
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div className={cn("w-full", className)}>
      {/* 검색 결과 개수 표시 */}
      {isSearchMode && (
        <div className="mb-4 text-sm text-muted-foreground">
          검색 결과: <span className="font-medium text-foreground">{tours.length}개</span>
        </div>
      )}
      
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        )}
      >
        {tours.map((tour) => (
          <TourCard
            key={tour.contentid}
            tour={tour}
            isSelected={selectedContentId === tour.contentid}
            onClick={onCardClick}
            onMouseEnter={onCardHover}
            onMouseLeave={onCardHoverLeave}
          />
        ))}
      </div>
    </div>
  );
}

