/**
 * @file lib/api/supabase-api.ts
 * @description Supabase 북마크 API 함수
 *
 * 북마크 관련 Supabase 쿼리 함수들을 제공합니다.
 * Client Component와 Server Component 모두에서 사용 가능합니다.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 북마크 데이터 타입
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * Clerk user ID를 Supabase users 테이블의 id로 변환하는 헬퍼 함수
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk user ID
 * @returns Supabase users 테이블의 id (UUID) 또는 null
 */
async function getUserIdByClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) {
    console.error("Failed to get user ID by Clerk ID:", error);
    return null;
  }

  return data.id;
}

/**
 * 북마크 조회
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk user ID
 * @param contentId 관광지 contentId
 * @returns 북마크 데이터 또는 null
 */
export async function getBookmark(
  supabase: SupabaseClient,
  clerkId: string,
  contentId: string
): Promise<Bookmark | null> {
  try {
    // Clerk ID로 Supabase user ID 조회
    const userId = await getUserIdByClerkId(supabase, clerkId);
    if (!userId) {
      return null;
    }

    // 북마크 조회
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("content_id", contentId)
      .single();

    if (error) {
      // PGRST116: No rows returned (북마크 없음)
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Failed to get bookmark:", error);
      return null;
    }

    return data as Bookmark;
  } catch (error) {
    console.error("Error in getBookmark:", error);
    return null;
  }
}

/**
 * 북마크 추가
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk user ID
 * @param contentId 관광지 contentId
 * @returns 성공 여부 및 북마크 데이터
 */
export async function addBookmark(
  supabase: SupabaseClient,
  clerkId: string,
  contentId: string
): Promise<{ success: boolean; data?: Bookmark; error?: string }> {
  try {
    // Clerk ID로 Supabase user ID 조회
    const userId = await getUserIdByClerkId(supabase, clerkId);
    if (!userId) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
      };
    }

    // 북마크 추가
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // 23505: unique_violation (이미 북마크된 경우)
      if (error.code === "23505") {
        return {
          success: false,
          error: "이미 북마크된 관광지입니다.",
        };
      }
      console.error("Failed to add bookmark:", error);
      return {
        success: false,
        error: error.message || "북마크 추가에 실패했습니다.",
      };
    }

    return {
      success: true,
      data: data as Bookmark,
    };
  } catch (error) {
    console.error("Error in addBookmark:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "북마크 추가 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 북마크 제거
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk user ID
 * @param contentId 관광지 contentId
 * @returns 성공 여부
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  clerkId: string,
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Clerk ID로 Supabase user ID 조회
    const userId = await getUserIdByClerkId(supabase, clerkId);
    if (!userId) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
      };
    }

    // 북마크 제거
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("content_id", contentId);

    if (error) {
      console.error("Failed to remove bookmark:", error);
      return {
        success: false,
        error: error.message || "북마크 제거에 실패했습니다.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in removeBookmark:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "북마크 제거 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 북마크 목록 조회
 * @param supabase Supabase 클라이언트
 * @param clerkId Clerk user ID
 * @returns 북마크 목록
 */
export async function getUserBookmarks(
  supabase: SupabaseClient,
  clerkId: string
): Promise<{ success: boolean; data?: Bookmark[]; error?: string }> {
  try {
    // Clerk ID로 Supabase user ID 조회
    const userId = await getUserIdByClerkId(supabase, clerkId);
    if (!userId) {
      return {
        success: false,
        error: "사용자를 찾을 수 없습니다. 로그인 상태를 확인해주세요.",
      };
    }

    // 북마크 목록 조회 (최신순)
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get user bookmarks:", error);
      return {
        success: false,
        error: error.message || "북마크 목록 조회에 실패했습니다.",
      };
    }

    return {
      success: true,
      data: (data || []) as Bookmark[],
    };
  } catch (error) {
    console.error("Error in getUserBookmarks:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "북마크 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

