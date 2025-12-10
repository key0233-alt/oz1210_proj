/**
 * @file components/bookmarks/bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자의 북마크 목록을 조회하고, 각 북마크의 관광지 정보를 가져와
 * TourCard로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 (getUserBookmarks)
 * 2. 관광지 정보 병렬 조회 (getDetailCommon)
 * 3. TourCard로 목록 표시
 * 4. 정렬 기능
 * 5. 개별 삭제 기능
 * 6. 로딩, 빈 상태, 에러 처리
 *
 * @dependencies
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient
 * - @/lib/api/supabase-api: getUserBookmarks, removeBookmark, Bookmark
 * - @/lib/api/tour-api: getDetailCommon
 * - @/components/tour-card: TourCard
 * - @/components/ui/skeleton-card: SkeletonCardList
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getUserBookmarks,
  removeBookmark,
  type Bookmark,
} from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import { TourCard } from "@/components/tour-card";
import { SkeletonCardList } from "@/components/ui/skeleton-card";
import { Error } from "@/components/ui/error";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TourItem } from "@/lib/types/tour";
import type { SortOption } from "@/app/bookmarks/page";

interface BookmarkListProps {
  /** 정렬 옵션 */
  sortOption: SortOption;
  /** 선택된 북마크 ID 목록 */
  selectedBookmarks: Set<string>;
  /** 선택 상태 변경 핸들러 */
  onSelectionChange: (selected: Set<string>) => void;
  /** 북마크 목록 변경 핸들러 */
  onBookmarksChange: (bookmarks: Bookmark[]) => void;
  /** 북마크 목록 (일괄 삭제용) */
  bookmarks?: Bookmark[];
  /** 북마크 삭제 후 새로고침 핸들러 */
  onRefresh?: () => void;
}

/**
 * 북마크와 관광지 정보를 함께 저장하는 타입
 */
interface BookmarkWithTour {
  bookmark: Bookmark;
  tour: TourItem | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({
  sortOption,
  selectedBookmarks,
  onSelectionChange,
  onBookmarksChange,
  bookmarks: externalBookmarks,
  onRefresh,
}: BookmarkListProps) {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [bookmarksWithTours, setBookmarksWithTours] = useState<
    BookmarkWithTour[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 북마크 목록 조회 및 관광지 정보 병렬 조회
   */
  const loadBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. 북마크 목록 조회
      const bookmarksResult = await getUserBookmarks(supabase, user.id);
      if (!bookmarksResult.success || !bookmarksResult.data) {
        setError(
          bookmarksResult.error || "북마크 목록을 불러오는데 실패했습니다."
        );
        setIsLoading(false);
        return;
      }

      const bookmarks = bookmarksResult.data;
      onBookmarksChange(bookmarks);

      if (bookmarks.length === 0) {
        setBookmarksWithTours([]);
        setIsLoading(false);
        return;
      }

      // 2. 각 북마크의 관광지 정보 병렬 조회
      const bookmarkWithToursPromises = bookmarks.map(async (bookmark) => {
        const result = await getDetailCommon(bookmark.content_id, false);
        return {
          bookmark,
          tour: result.success && result.data ? result.data : null,
          isLoading: false,
          error: result.success ? null : result.error || "정보 조회 실패",
        } as BookmarkWithTour;
      });

      const results = await Promise.all(bookmarkWithToursPromises);
      setBookmarksWithTours(results);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
      setError(
        err instanceof Error
          ? err.message
          : "북마크 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, onBookmarksChange]);

  // 초기 로드
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // 외부 북마크 목록 변경 시 동기화
  useEffect(() => {
    if (externalBookmarks && externalBookmarks.length > 0) {
      // externalBookmarks와 현재 북마크 목록을 비교하여 동기화
      const currentBookmarkIds = new Set(
        bookmarksWithTours.map((item) => item.bookmark.id)
      );
      const externalBookmarkIds = new Set(
        externalBookmarks.map((b) => b.id)
      );

      // 외부 북마크 목록에 없는 항목이 있으면 다시 로드
      const hasChanges = Array.from(currentBookmarkIds).some(
        (id) => !externalBookmarkIds.has(id)
      );

      if (hasChanges) {
        loadBookmarks();
      }
    }
  }, [externalBookmarks, bookmarksWithTours, loadBookmarks]);

  /**
   * 개별 북마크 삭제
   */
  const handleDelete = async (bookmarkId: string, contentId: string) => {
    if (!user) return;

    try {
      const result = await removeBookmark(supabase, user.id, contentId);
      if (result.success) {
        // 목록에서 제거
        setBookmarksWithTours((prev) =>
          prev.filter((item) => item.bookmark.id !== bookmarkId)
        );
        // 선택 목록에서도 제거
        const newSelected = new Set(selectedBookmarks);
        newSelected.delete(bookmarkId);
        onSelectionChange(newSelected);
        // 북마크 목록 업데이트
        const remainingBookmarks = bookmarksWithTours
          .filter((item) => item.bookmark.id !== bookmarkId)
          .map((item) => item.bookmark);
        onBookmarksChange(remainingBookmarks);
        // 새로고침 핸들러 호출
        if (onRefresh) {
          onRefresh();
        }
        toastSuccess("북마크가 삭제되었습니다");
      } else {
        toastError("북마크 삭제 실패", result.error);
      }
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
      toastError(
        "북마크 삭제 실패",
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  /**
   * 정렬된 북마크 목록 반환
   */
  const getSortedBookmarks = (): BookmarkWithTour[] => {
    const sorted = [...bookmarksWithTours];
    switch (sortOption) {
      case "latest":
        // created_at DESC (이미 getUserBookmarks에서 정렬됨)
        return sorted;
      case "name":
        return sorted.sort((a, b) => {
          const nameA = a.tour?.title || "";
          const nameB = b.tour?.title || "";
          return nameA.localeCompare(nameB, "ko");
        });
      case "region":
        return sorted.sort((a, b) => {
          const regionA = a.tour?.areacode || "";
          const regionB = b.tour?.areacode || "";
          return regionA.localeCompare(regionB);
        });
      default:
        return sorted;
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full" aria-live="polite" aria-busy="true">
        <div className="sr-only">북마크 목록을 불러오는 중입니다.</div>
        <SkeletonCardList count={6} />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full">
        <Error
          message={error}
          type="api"
          className="w-full"
          onRetry={loadBookmarks}
        />
      </div>
    );
  }

  const sortedBookmarks = getSortedBookmarks();
  const validBookmarks = sortedBookmarks.filter((item) => item.tour !== null);

  // 빈 상태
  if (sortedBookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 rounded-lg border bg-muted/50">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg font-semibold text-foreground">
            아직 북마크한 관광지가 없습니다
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            관광지를 북마크하면 여기에서 확인할 수 있습니다.
            <br />
            관광지 상세페이지에서 북마크 버튼을 클릭해보세요.
          </p>
        </div>
      </div>
    );
  }

  // 목록 표시
  return (
    <div className="w-full">
      {/* 유효한 북마크 개수 표시 */}
      {validBookmarks.length < sortedBookmarks.length && (
        <div className="mb-4 text-sm text-muted-foreground">
          {sortedBookmarks.length - validBookmarks.length}개의 북마크에서
          관광지 정보를 불러오지 못했습니다.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {sortedBookmarks.map((item) => {
          const { bookmark, tour, error: tourError } = item;
          const isSelected = selectedBookmarks.has(bookmark.id);

          // 관광지 정보가 없는 경우
          if (!tour) {
            return (
              <div
                key={bookmark.id}
                className="relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      관광지 정보를 불러올 수 없습니다
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Content ID: {bookmark.content_id}
                    </p>
                    {tourError && (
                      <p className="text-xs text-destructive mt-1">
                        {tourError}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleDelete(bookmark.id, bookmark.content_id)}
                    aria-label="북마크 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          }

          // 관광지 정보가 있는 경우 - TourCard 사용
          return (
            <div
              key={bookmark.id}
              className={cn(
                "relative group",
                isSelected && "ring-2 ring-primary ring-offset-2 rounded-lg"
              )}
            >
              {/* 체크박스 (일괄 삭제용) */}
              <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded p-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    const newSelected = new Set(selectedBookmarks);
                    if (checked) {
                      newSelected.add(bookmark.id);
                    } else {
                      newSelected.delete(bookmark.id);
                    }
                    onSelectionChange(newSelected);
                  }}
                  aria-label={`${tour.title} 선택`}
                />
              </div>
              {/* 삭제 버튼 (호버 시 표시) */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm",
                  isSelected && "opacity-100"
                )}
                onClick={() => handleDelete(bookmark.id, bookmark.content_id)}
                aria-label="북마크 삭제"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <TourCard tour={tour} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

