/**
 * @file components/bookmarks/bookmark-bulk-actions.tsx
 * @description 북마크 일괄 삭제 기능 컴포넌트
 *
 * 북마크 목록에서 여러 항목을 선택하고 일괄 삭제하는 기능을 제공합니다.
 * 체크박스 선택, 확인 다이얼로그, 선택 항목 삭제 기능을 포함합니다.
 *
 * @dependencies
 * - @/components/ui/checkbox: Checkbox
 * - @/components/ui/button: Button
 * - @/components/ui/alert-dialog: AlertDialog
 * - @/lib/api/supabase-api: removeBookmark, Bookmark
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { removeBookmark, type Bookmark } from "@/lib/api/supabase-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface BookmarkBulkActionsProps {
  /** 선택된 북마크 ID 목록 */
  selectedBookmarks: Set<string>;
  /** 선택 상태 변경 핸들러 */
  onSelectionChange: (selected: Set<string>) => void;
  /** 북마크 목록 변경 핸들러 */
  onBookmarksChange: (bookmarks: Bookmark[]) => void;
  /** 북마크 목록 (삭제용) */
  bookmarks: Bookmark[];
  /** 북마크 삭제 후 새로고침 핸들러 */
  onRefresh?: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 일괄 삭제 컴포넌트
 */
export function BookmarkBulkActions({
  selectedBookmarks,
  onSelectionChange,
  onBookmarksChange,
  bookmarks,
  onRefresh,
  className,
}: BookmarkBulkActionsProps) {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * 선택된 북마크 일괄 삭제
   */
  const handleBulkDelete = async () => {
    if (!user || selectedBookmarks.size === 0) return;

    setIsDeleting(true);
    try {
      // 선택된 북마크 ID들을 배열로 변환
      const bookmarkIds = Array.from(selectedBookmarks);

      // 북마크 목록에서 선택된 항목들의 content_id 가져오기
      const bookmarksToDelete = bookmarks.filter((bookmark) =>
        bookmarkIds.includes(bookmark.id)
      );

      // 병렬로 삭제 처리
      const deletePromises = bookmarksToDelete.map(async (bookmark) => {
        const result = await removeBookmark(
          supabase,
          user.id,
          bookmark.content_id
        );
        if (!result.success) {
          throw new Error(result.error || "북마크 삭제 실패");
        }
        return result;
      });

      await Promise.all(deletePromises);

      // 선택 해제
      onSelectionChange(new Set());
      // 북마크 목록에서 삭제된 항목 제거
      const remainingBookmarks = bookmarks.filter(
        (bookmark) => !bookmarkIds.includes(bookmark.id)
      );
      onBookmarksChange(remainingBookmarks);
      setIsDialogOpen(false);
      // 새로고침 핸들러 호출
      if (onRefresh) {
        onRefresh();
      }
      toastSuccess(`${selectedBookmarks.size}개의 북마크가 삭제되었습니다`);
    } catch (err) {
      console.error("Failed to delete bookmarks:", err);
      toastError(
        "북마크 삭제 실패",
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * 전체 선택/해제
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 전체 선택
      const allBookmarkIds = new Set(bookmarks.map((b) => b.id));
      onSelectionChange(allBookmarkIds);
    } else {
      // 전체 해제
      onSelectionChange(new Set());
    }
  };

  const isAllSelected =
    bookmarks.length > 0 &&
    selectedBookmarks.size === bookmarks.length;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {bookmarks.length > 0 && (
        <>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label="전체 선택"
          />
          <span className="text-sm text-muted-foreground">
            전체 선택
          </span>
        </>
      )}
      {selectedBookmarks.size > 0 && (
        <>
          <span className="text-sm text-muted-foreground">
            {selectedBookmarks.size}개 선택됨
          </span>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            선택 항목 삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>북마크 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedBookmarks.size}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}

