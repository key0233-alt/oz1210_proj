/**
 * @file components/bookmarks/bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 제거하는 기능을 제공하는 Client Component입니다.
 * 인증된 사용자만 사용 가능하며, 로그인하지 않은 경우 로그인 유도를 표시합니다.
 */

"use client";

import { useState, useEffect } from "react";
import { Star, StarOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  getBookmark,
  addBookmark,
  removeBookmark,
} from "@/lib/api/supabase-api";
import { toastSuccess, toastError, toastInfo } from "@/lib/utils/toast";

interface BookmarkButtonProps {
  /** 북마크할 관광지 contentId */
  contentId: string;
}

/**
 * 북마크 버튼 컴포넌트
 */
export function BookmarkButton({ contentId }: BookmarkButtonProps) {
  const { user, isLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 북마크 상태 확인
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bookmark = await getBookmark(supabase, user.id, contentId);
        setIsBookmarked(!!bookmark);
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkBookmarkStatus();
  }, [isLoaded, user, supabase, contentId]);

  // 북마크 토글 핸들러
  const handleToggle = async () => {
    if (!user || !isLoaded) {
      toastInfo("로그인이 필요합니다", "북마크 기능을 사용하려면 로그인해주세요");
      return;
    }

    if (isToggling) {
      return; // 이미 처리 중이면 무시
    }

    try {
      setIsToggling(true);

      if (isBookmarked) {
        // 북마크 제거
        const result = await removeBookmark(supabase, user.id, contentId);
        if (result.success) {
          setIsBookmarked(false);
          toastSuccess("북마크가 제거되었습니다");
        } else {
          toastError("북마크 제거 실패", result.error);
        }
      } else {
        // 북마크 추가
        const result = await addBookmark(supabase, user.id, contentId);
        if (result.success) {
          setIsBookmarked(true);
          toastSuccess("북마크에 추가되었습니다");
        } else {
          // 이미 북마크된 경우는 에러가 아니라 상태만 업데이트
          if (result.error?.includes("이미 북마크")) {
            setIsBookmarked(true);
            toastInfo("이미 북마크된 관광지입니다");
          } else {
            toastError("북마크 추가 실패", result.error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toastError(
        "북마크 처리 실패",
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsToggling(false);
    }
  };

  // 로딩 중이거나 인증 상태 확인 중
  if (!isLoaded || isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled
        aria-label="북마크 로딩 중"
      >
        <Star className="h-5 w-5 opacity-50" />
      </Button>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="로그인하여 북마크하기"
          title="로그인하여 북마크하기"
        >
          <StarOff className="h-5 w-5" />
        </Button>
      </SignInButton>
    );
  }

  // 로그인한 사용자 - 북마크 버튼
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0"
      onClick={handleToggle}
      disabled={isToggling}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
      title={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      {isBookmarked ? (
        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
      ) : (
        <StarOff className="h-5 w-5" />
      )}
    </Button>
  );
}

