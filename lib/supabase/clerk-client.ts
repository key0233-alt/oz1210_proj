"use client";

import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * Clerk 공식 문서 기반 구현 (2025년 권장 방식):
 * - JWT 템플릿 불필요 (네이티브 통합 사용)
 * - useSession().getToken()으로 현재 세션 토큰 사용
 * - accessToken 옵션을 통해 Clerk 토큰을 Supabase 요청에 자동 주입
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * 참고: https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data } = await supabase.from('tasks').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // Clerk 세션 토큰을 Supabase 요청에 자동 주입
        // 이 토큰은 Supabase의 auth.jwt()->>'sub'에서 접근 가능
        return (await session?.getToken()) ?? null;
      },
    });
  }, [session]);

  return supabase;
}
