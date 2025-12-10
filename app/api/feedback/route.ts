/**
 * @file app/api/feedback/route.ts
 * @description 피드백 제출 API 엔드포인트
 *
 * 사용자 피드백을 Supabase에 저장합니다.
 * 로그인한 사용자와 비로그인 사용자 모두 사용 가능합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();

    // 데이터 검증
    const { type, content, email } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "피드백 유형과 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.length < 10) {
      return NextResponse.json(
        { error: "피드백 내용은 최소 10자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "피드백 내용은 최대 1000자까지 입력 가능합니다." },
        { status: 400 }
      );
    }

    if (type !== "bug" && type !== "suggestion" && type !== "other") {
      return NextResponse.json(
        { error: "올바른 피드백 유형을 선택해주세요." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createServiceRoleClient();

    // 로그인한 사용자의 경우 user_id 조회
    let userIdInSupabase: string | null = null;
    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (userData) {
        userIdInSupabase = userData.id;
      }
    }

    // 피드백 저장
    const { error } = await supabase.from("feedback").insert({
      user_id: userIdInSupabase,
      type,
      content,
      email: email || null,
    });

    if (error) {
      console.error("Failed to save feedback:", error);
      return NextResponse.json(
        { error: "피드백 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "피드백 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

