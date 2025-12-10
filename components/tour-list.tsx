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
  /** 재시도 핸들러 */
  onRetry?: () => void;
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
  onRetry,
}: TourListProps) {
  const isSearchMode = !!searchKeyword;
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={cn("w-full", className)} aria-live="polite" aria-busy="true">
        <div className="sr-only">관광지 목록을 불러오는 중입니다.</div>
        <SkeletonCardList count={6} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    // 에러 타입 판단 (네트워크 에러인지 API 에러인지)
    const errorType = error.toLowerCase().includes("network") || 
                      error.toLowerCase().includes("fetch") ||
                      error.toLowerCase().includes("네트워크")
                      ? "network" 
                      : "api";
    
    return (
      <div className={cn("w-full", className)}>
        <Error
          message={error}
          type={errorType}
          className="w-full"
          onRetry={onRetry}
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
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-semibold text-foreground">
            {isSearchMode
              ? "검색 결과가 없습니다"
              : "관광지를 찾을 수 없습니다"}
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            {isSearchMode ? (
              <>
                <span className="font-medium">"{searchKeyword}"</span>에 대한 검색 결과가 없습니다.
                <br />
                다른 키워드로 검색하거나 필터를 조정해보세요.
              </>
            ) : (
              <>
                선택한 조건에 맞는 관광지가 없습니다.
                <br />
                다른 지역이나 관광 타입을 선택하거나 필터를 초기화해보세요.
              </>
            )}
          </p>
        </div>
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
        {tours.map((tour, index) => (
          <TourCard
            key={tour.contentid}
            tour={tour}
            isSelected={selectedContentId === tour.contentid}
            onClick={onCardClick}
            onMouseEnter={onCardHover}
            onMouseLeave={onCardHoverLeave}
            priority={index < 6}
          />
        ))}
      </div>
    </div>
  );
}

