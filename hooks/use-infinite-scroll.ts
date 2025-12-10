/**
 * @file hooks/use-infinite-scroll.ts
 * @description 무한 스크롤 훅
 *
 * Intersection Observer API를 사용하여 스크롤 위치를 감지하고
 * 다음 페이지 로드를 트리거하는 훅입니다.
 *
 * 주요 기능:
 * - 스크롤 하단 감지
 * - 자동 다음 페이지 로드 트리거
 * - 로딩 상태 관리
 * - 성능 최적화 (메모이제이션, 옵션 최적화)
 *
 * @dependencies
 * - React: useState, useEffect, useRef, useCallback
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** 다음 페이지 로드 트리거 핸들러 */
  onLoadMore: () => void | Promise<void>;
  /** 로딩 상태 (외부에서 관리) */
  isLoading?: boolean;
  /** 더 이상 로드할 데이터가 있는지 여부 */
  hasMore?: boolean;
  /** Intersection Observer 옵션 */
  rootMargin?: string;
  /** 트리거 요소가 뷰포트에 들어왔을 때 즉시 실행할지 여부 */
  threshold?: number;
  /** 활성화 여부 (기본값: true) */
  enabled?: boolean;
}

/**
 * 무한 스크롤 훅
 *
 * @param options 옵션 객체
 * @returns 트리거 요소에 연결할 ref와 상태
 */
export function useInfiniteScroll({
  onLoadMore,
  isLoading = false,
  hasMore = true,
  rootMargin = "100px",
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // onLoadMore를 메모이제이션하여 불필요한 재생성 방지
  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore && enabled) {
      await onLoadMore();
    }
  }, [onLoadMore, isLoading, hasMore, enabled]);

  // Intersection Observer 설정
  useEffect(() => {
    if (!enabled || !hasMore) {
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    // 기존 Observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 새로운 Observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        // 요소가 뷰포트에 들어왔고, 로딩 중이 아니고, 더 로드할 데이터가 있으면
        if (entry.isIntersecting && !isLoading && hasMore) {
          handleLoadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // 요소 관찰 시작
    observerRef.current.observe(element);

    // 정리 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, rootMargin, threshold, handleLoadMore]);

  // 수동으로 다음 페이지 로드 (필요한 경우)
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && enabled) {
      handleLoadMore();
    }
  }, [isLoading, hasMore, enabled, handleLoadMore]);

  return {
    /** 트리거 요소에 연결할 ref */
    elementRef,
    /** 현재 교차 상태 */
    isIntersecting,
    /** 수동으로 다음 페이지 로드 */
    loadMore,
  };
}

