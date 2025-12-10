/**
 * @file components/tour-pagination.tsx
 * @description 관광지 목록 페이지네이션 컴포넌트
 *
 * 무한 스크롤과 페이지 번호 선택 두 가지 모드를 지원합니다.
 * 사용자가 원하는 방식으로 관광지 목록을 탐색할 수 있습니다.
 *
 * 주요 기능:
 * - 무한 스크롤 모드: 스크롤 시 자동으로 다음 페이지 로드
 * - 페이지 번호 선택 모드: 이전/다음 버튼 및 페이지 번호 클릭
 * - 모드 전환 기능
 * - 반응형 디자인 (모바일: 무한 스크롤 권장)
 *
 * @dependencies
 * - hooks/use-infinite-scroll.ts: 무한 스크롤 훅
 * - components/ui/button.tsx: 버튼 컴포넌트
 * - components/ui/loading.tsx: 로딩 인디케이터
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaginationMode = "infinite" | "numbered";

interface TourPaginationProps {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 항목 수 */
  totalCount: number;
  /** 페이지당 항목 수 */
  pageSize: number;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 페이지 변경 핸들러 */
  onPageChange: (pageNo: number) => void;
  /** 페이지네이션 모드 (기본값: 'infinite') */
  mode?: PaginationMode;
  /** 모드 변경 핸들러 */
  onModeChange?: (mode: PaginationMode) => void;
  /** 무한 스크롤 트리거 요소 참조 (외부에서 제공) */
  scrollTriggerRef?: React.RefObject<HTMLDivElement>;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 페이지 번호 범위 계산
 */
function getPageRange(currentPage: number, totalPages: number, maxVisible: number = 10): number[] {
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // 끝에서 시작점 조정
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * 관광지 목록 페이지네이션 컴포넌트
 */
export function TourPagination({
  currentPage,
  totalCount,
  pageSize,
  isLoading = false,
  onPageChange,
  mode = "infinite",
  onModeChange,
  scrollTriggerRef,
  className,
}: TourPaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const [localMode, setLocalMode] = useState<PaginationMode>(mode);

  // 모드 동기화
  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  // 모드 변경 핸들러
  const handleModeChange = (newMode: PaginationMode) => {
    setLocalMode(newMode);
    onModeChange?.(newMode);
    // 모드 변경 시 localStorage에 저장 (선택 사항)
    if (typeof window !== "undefined") {
      localStorage.setItem("pagination-mode", newMode);
    }
  };

  // 초기 모드 로드 (localStorage에서)
  useEffect(() => {
    if (typeof window !== "undefined" && !onModeChange) {
      const savedMode = localStorage.getItem("pagination-mode") as PaginationMode | null;
      if (savedMode && (savedMode === "infinite" || savedMode === "numbered")) {
        setLocalMode(savedMode);
      }
    }
  }, []);

  // 무한 스크롤 모드
  if (localMode === "infinite") {
    return (
      <div className={cn("w-full", className)}>
        {/* 무한 스크롤 트리거 요소 */}
        <div
          ref={scrollTriggerRef || undefined}
          className="h-20 flex items-center justify-center"
          aria-hidden="true"
        >
          {isLoading && (
            <Loading size="sm" text="더 많은 관광지를 불러오는 중..." />
          )}
        </div>

        {/* 모드 전환 버튼 (하단) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleModeChange("numbered")}
              aria-label="페이지 번호 선택 모드로 전환"
              className="text-xs"
            >
              <Infinity className="h-3 w-3 mr-1" aria-hidden="true" />
              페이지 번호로 보기
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 페이지 번호 선택 모드
  const pageRange = getPageRange(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, targetPage: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPageChange(targetPage);
      }
    },
    [onPageChange]
  );

  return (
    <nav
      className={cn("w-full flex flex-col items-center gap-4", className)}
      aria-label="페이지네이션"
      role="navigation"
    >
      {/* 페이지 정보 */}
      <div className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
        전체 {totalCount.toLocaleString()}개 중 {((currentPage - 1) * pageSize + 1).toLocaleString()}-
        {Math.min(currentPage * pageSize, totalCount).toLocaleString()}개 표시
      </div>

      {/* 페이지네이션 컨트롤 */}
      <div className="flex items-center gap-1" role="group" aria-label="페이지 선택">
        {/* 첫 페이지로 이동 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage || isLoading}
          aria-label="첫 페이지로 이동"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 이전 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage || isLoading}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 페이지 번호 */}
        {pageRange.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            onKeyDown={(e) => handleKeyDown(e, page)}
            disabled={isLoading}
            aria-label={`${page}페이지로 이동`}
            aria-current={page === currentPage ? "page" : undefined}
            tabIndex={isLoading ? -1 : 0}
            className={cn(
              "min-w-[2.5rem]",
              page === currentPage && "font-semibold"
            )}
          >
            {page}
          </Button>
        ))}

        {/* 다음 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage || isLoading}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 마지막 페이지로 이동 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage || isLoading}
          aria-label="마지막 페이지로 이동"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 모드 전환 버튼 */}
      {onModeChange && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleModeChange("infinite")}
            aria-label="무한 스크롤 모드로 전환"
            className="text-xs"
          >
            <Infinity className="h-3 w-3 mr-1" aria-hidden="true" />
            무한 스크롤로 보기
          </Button>
        </div>
      )}
    </nav>
  );
}

