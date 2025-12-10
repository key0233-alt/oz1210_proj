/**
 * @file app/tasks-ssr/actions.ts
 * @description Server Actions for Tasks
 *
 * Server Action을 사용하여 task를 생성합니다.
 * Server-side에서 실행되므로 Clerk 인증이 자동으로 적용됩니다.
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function addTask(name: string) {
  // Server Action에서 인증 확인
  const { userId } = await auth();

  if (!userId) {
    throw new Error("인증이 필요합니다.");
  }

  // Clerk 토큰을 사용하는 Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        name,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error);
      throw new Error(`작업 추가 실패: ${error.message}`);
    }

    console.log("Task successfully added!", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error adding task:", error.message);
    throw new Error(error.message || "작업 추가에 실패했습니다.");
  }
}

