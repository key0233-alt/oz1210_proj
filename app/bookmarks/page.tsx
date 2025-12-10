/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하고 관리할 수 있는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 로그인하지 않은 경우 로그인 유도를 표시합니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 개별 삭제 기능
 * 4. 일괄 삭제 기능
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (Supabase 클라이언트 사용)
 * - Clerk 인증 확인 (useUser 훅)
 * - 북마크 목록 조회 및 관광지 정보 병렬 조회
 *
 * @dependencies
 * - @clerk/nextjs: useUser, SignInButton
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient
 * - @/lib/api/supabase-api: getUserBookmarks
 * - @/lib/api/tour-api: getDetailCommon
 * - @/components/bookmarks: 북마크 관련 컴포넌트들
 */

"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { BookmarkSort } from "@/components/bookmarks/bookmark-sort";
import { BookmarkBulkActions } from "@/components/bookmarks/bookmark-bulk-actions";
import { useState } from "react";
import { Bookmark } from "@/lib/api/supabase-api";
import { Loader2 } from "lucide-react";

export type SortOption = "latest" | "name" | "region";

/**
 * 북마크 목록 페이지 컴포넌트
 */
export default function BookmarksPage() {
  const { user, isLoaded } = useUser();
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(
    new Set()
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 로딩 중
  if (!isLoaded) {
    return (
      <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              내 북마크
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              북마크 기능을 사용하려면 로그인이 필요합니다.
              <br />
              로그인 후 관광지를 북마크하고 여기에서 확인할 수 있습니다.
            </p>
          </div>
          <SignInButton mode="modal">
            <Button size="lg" className="mt-4">
              로그인하기
            </Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  // 로그인한 사용자 - 북마크 목록 표시
  return (
    <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
      {/* 헤더 섹션 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          내 북마크
        </h1>
        <p className="mt-2 text-muted-foreground">
          북마크한 관광지를 확인하고 관리할 수 있습니다.
        </p>
      </header>

      {/* 정렬 및 일괄 삭제 영역 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BookmarkSort
          value={sortOption}
          onChange={setSortOption}
          className="w-full sm:w-auto"
        />
        <BookmarkBulkActions
          selectedBookmarks={selectedBookmarks}
          onSelectionChange={setSelectedBookmarks}
          onBookmarksChange={setBookmarks}
          bookmarks={bookmarks}
          onRefresh={() => {
            // 북마크 목록 새로고침을 위해 refreshKey 업데이트
            setRefreshKey((prev) => prev + 1);
          }}
          className="w-full sm:w-auto"
        />
      </div>

      {/* 북마크 목록 */}
      <section aria-label="북마크 목록">
        <BookmarkList
          key={refreshKey}
          sortOption={sortOption}
          selectedBookmarks={selectedBookmarks}
          onSelectionChange={setSelectedBookmarks}
          onBookmarksChange={setBookmarks}
          bookmarks={bookmarks}
          onRefresh={() => {
            // 북마크 목록 새로고침을 위해 refreshKey 업데이트
            setRefreshKey((prev) => prev + 1);
          }}
        />
      </section>
    </main>
  );
}

