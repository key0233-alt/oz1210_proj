/**
 * @file app/api/log-error/route.ts
 * @description 에러 로깅 API 엔드포인트
 *
 * 프로덕션 환경에서 클라이언트 에러를 수신하고 처리합니다.
 * Supabase에 저장하거나 외부 로깅 서비스로 전송할 수 있습니다.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const errorLog = await request.json();

    // 에러 로그 검증
    if (!errorLog.message || !errorLog.timestamp) {
      return NextResponse.json(
        { error: "Invalid error log format" },
        { status: 400 }
      );
    }

    // 개발 환경에서는 console.error로 출력
    if (process.env.NODE_ENV === "development") {
      console.error("Error log received:", errorLog);
      return NextResponse.json({ success: true });
    }

    // 프로덕션 환경에서는 Supabase에 저장하거나 외부 서비스로 전송
    // TODO: Supabase에 에러 로그 저장 또는 Sentry 등 외부 서비스로 전송
    // 예시:
    // const supabase = createServiceRoleClient();
    // await supabase.from('error_logs').insert(errorLog);

    // 현재는 로그만 출력 (실제 구현 시 위의 TODO를 활성화)
    console.error("Production error log:", errorLog);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process error log:", error);
    return NextResponse.json(
      { error: "Failed to process error log" },
      { status: 500 }
    );
  }
}

