import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component/Server Action용)
 *
 * Supabase 공식 문서 및 Clerk 통합 가이드 기반 구현:
 * - Supabase 공식 문서: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * - Clerk 통합 가이드: https://clerk.com/docs/guides/development/integrations/databases/supabase
 *
 * 주요 특징:
 * - JWT 템플릿 불필요 (네이티브 통합 사용, 2025년 권장 방식)
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 * - accessToken 옵션을 통해 Clerk 토큰을 Supabase 요청에 자동 주입
 * - Server Component에서 async 함수로 사용 (Supabase 공식 문서 권장)
 *
 * @example
 * ```tsx
 * // Server Component (Supabase 공식 문서 방식)
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('instruments').select('*');
 *   return <div>...</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Server Action
 * 'use server';
 *
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function addTask(name: string) {
 *   const supabase = await createClient();
 *   const { data, error } = await supabase.from('tasks').insert({ name });
 *   return { data, error };
 * }
 * ```
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      // Clerk 세션 토큰을 Supabase 요청에 자동 주입
      // 이 토큰은 Supabase의 auth.jwt()->>'sub'에서 접근 가능
      return (await auth()).getToken();
    },
  });
}

/**
 * @deprecated 이 함수는 하위 호환성을 위해 유지됩니다.
 * 새로운 코드에서는 `createClient()`를 사용하세요.
 *
 * Clerk + Supabase 네이티브 통합 클라이언트 (레거시)
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
