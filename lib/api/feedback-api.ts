/**
 * @file lib/api/feedback-api.ts
 * @description 피드백 API 함수
 *
 * 피드백 제출을 위한 API 함수를 제공합니다.
 * Client Component에서 사용 가능합니다.
 */

import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";

export interface FeedbackData {
  type: "bug" | "suggestion" | "other";
  content: string;
  email?: string;
}

/**
 * 피드백 제출
 * @param data 피드백 데이터
 */
export async function submitFeedback(data: FeedbackData): Promise<void> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "피드백 전송에 실패했습니다.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("피드백 전송에 실패했습니다.");
  }
}

