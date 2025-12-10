/**
 * @file components/home-layout.tsx
 * @description 홈페이지 레이아웃 컴포넌트 (클라이언트)
 *
 * 지도와 리스트를 통합하는 클라이언트 컴포넌트입니다.
 * 반응형 레이아웃을 제공합니다:
 * - 데스크톱: 리스트(좌측) + 지도(우측) 분할
 * - 모바일: 탭 형태로 리스트/지도 전환
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TourItem } from "@/lib/types/tour";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import { TourPagination, PaginationMode } from "@/components/tour-pagination";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Map } from "lucide-react";
import { PAGINATION_DEFAULTS } from "@/lib/constants/api";

interface HomeLayoutProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 메시지 */
  error?: string | null;
  /** 검색 키워드 */
  searchKeyword?: string;
  /** 지역 코드 */
  areaCode?: string;
  /** 전체 항목 수 */
  totalCount?: number;
  /** 현재 페이지 번호 */
  currentPage?: number;
}

/**
 * 홈페이지 레이아웃 컴포넌트
 */
export function HomeLayout({
  tours,
  isLoading = false,
  error = null,
  searchKeyword,
  areaCode,
  totalCount = 0,
  currentPage = 1,
}: HomeLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedContentId, setSelectedContentId] = useState<string | undefined>();
  const [paginationMode, setPaginationMode] = useState<PaginationMode>("infinite");

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (pageNo: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (pageNo === 1) {
        params.delete("pageNo");
      } else {
        params.set("pageNo", pageNo.toString());
      }
      router.push(`/?${params.toString()}`);
      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, searchParams]
  );

  // 무한 스크롤: 다음 페이지 로드
  const handleLoadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    handlePageChange(nextPage);
  }, [currentPage, handlePageChange]);

  // 무한 스크롤 훅
  const { elementRef: scrollTriggerRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    isLoading,
    hasMore: totalCount > currentPage * PAGINATION_DEFAULTS.numOfRows,
    enabled: paginationMode === "infinite" && !error,
  });

  // 카드 클릭 핸들러 (지도로 이동)
  const handleCardClick = useCallback((contentId: string) => {
    setSelectedContentId(contentId);
  }, []);

  // 마커 클릭 핸들러 (리스트로 스크롤)
  const handleMarkerClick = useCallback((contentId: string) => {
    setSelectedContentId(contentId);
    // 해당 카드로 스크롤 (약간의 지연 후)
    setTimeout(() => {
      const cardElement = document.getElementById(`tour-card-${contentId}`);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  }, []);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <>
      {/* 데스크톱 레이아웃: 분할 (≥1024px) */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 lg:h-[calc(100vh-300px)] lg:min-h-[600px]">
        {/* 리스트 영역 */}
        <div className="overflow-y-auto pr-2 flex flex-col">
          <div className="flex-1">
            <TourList
              tours={tours}
              isLoading={isLoading}
              error={error}
              searchKeyword={searchKeyword}
              selectedContentId={selectedContentId}
              onCardClick={handleCardClick}
              onRetry={handleRetry}
            />
          </div>
          {/* 페이지네이션 */}
          {!error && totalCount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <TourPagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={PAGINATION_DEFAULTS.numOfRows}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                mode={paginationMode}
                onModeChange={setPaginationMode}
                scrollTriggerRef={paginationMode === "infinite" ? scrollTriggerRef : undefined}
              />
            </div>
          )}
        </div>

        {/* 지도 영역 */}
        <div className="sticky top-0 h-full">
          <NaverMap
            tours={tours}
            selectedContentId={selectedContentId}
            onMarkerClick={handleMarkerClick}
            areaCode={areaCode}
            className="h-full"
          />
        </div>
      </div>

      {/* 모바일 레이아웃: 탭 (<1024px) */}
      <div className="lg:hidden">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              목록
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              지도
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0">
            <div className="max-h-[600px] overflow-y-auto flex flex-col">
              <div className="flex-1">
                <TourList
                  tours={tours}
                  isLoading={isLoading}
                  error={error}
                  searchKeyword={searchKeyword}
                  selectedContentId={selectedContentId}
                  onCardClick={handleCardClick}
                />
              </div>
              {/* 페이지네이션 */}
              {!error && totalCount > 0 && (
                <div className="mt-4 pt-4 border-t sticky bottom-0 bg-background">
                  <TourPagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={PAGINATION_DEFAULTS.numOfRows}
                    isLoading={isLoading}
                    onPageChange={handlePageChange}
                    mode={paginationMode}
                    onModeChange={setPaginationMode}
                    scrollTriggerRef={paginationMode === "infinite" ? scrollTriggerRef : undefined}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[600px]">
              <NaverMap
                tours={tours}
                selectedContentId={selectedContentId}
                onMarkerClick={handleMarkerClick}
                areaCode={areaCode}
                className="h-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

