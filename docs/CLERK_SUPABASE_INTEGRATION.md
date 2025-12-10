# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 네이티브 통합하는 방법을 설명합니다.

## 개요

Clerk와 Supabase의 네이티브 통합을 사용하면:
- JWT 템플릿이 불필요합니다 (2025년 4월 이후 권장 방식)
- Clerk 세션 토큰을 Supabase 요청에 자동으로 주입합니다
- Supabase의 RLS 정책에서 `auth.jwt()->>'sub'`로 Clerk 사용자 ID에 접근할 수 있습니다

**참고**: [Clerk 공식 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)

## 설정 단계

### 1. Clerk를 Supabase Third-party Auth Provider로 설정

1. **Clerk Dashboard에서 설정**:
   - [Supabase integration setup](https://dashboard.clerk.com/setup/supabase)으로 이동
   - 설정 옵션을 선택하고 **Activate Supabase integration** 클릭
   - **Clerk domain**을 복사 (예: `your-app.clerk.accounts.dev`)

2. **Supabase Dashboard에서 설정**:
   - [Authentication > Sign In / Up](https://supabase.com/dashboard/project/_/auth/third-party)로 이동
   - **Add provider** 클릭하고 **Clerk** 선택
   - 복사한 **Clerk domain**을 붙여넣기

### 2. 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 전용
```

**환경 변수 가져오기**:
- **Clerk**: [Clerk Dashboard > API Keys](https://dashboard.clerk.com/last-active?path=api-keys)
- **Supabase**: [Supabase Dashboard > Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)

### 3. 데이터베이스 마이그레이션 실행

RLS 정책이 포함된 예시 테이블을 생성합니다:

```bash
# Supabase CLI를 사용하는 경우
supabase migration up

# 또는 Supabase Dashboard의 SQL Editor에서 직접 실행
# supabase/migrations/create_tasks_table_with_rls.sql 파일의 내용을 실행
```

## 사용 방법

### Client Component에서 사용

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    return data;
  }

  return <div>...</div>;
}
```

### Server Component에서 사용

**권장 방식** (Supabase 공식 문서 방식):

```tsx
import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export default async function MyPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  return <div>...</div>;
}
```

**레거시 방식** (하위 호환성):

```tsx
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export default async function MyPage() {
  const supabase = createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  return <div>...</div>;
}
```

### Server Action에서 사용

**권장 방식** (Supabase 공식 문서 방식):

```tsx
'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function addTask(name: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('인증이 필요합니다.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  return { data, error };
}
```

**레거시 방식** (하위 호환성):

```tsx
'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function addTask(name: string) {
  const supabase = createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ name });

  return { data, error };
}
```

## RLS 정책 설정

RLS 정책을 사용하여 사용자별 데이터 접근을 제한할 수 있습니다:

```sql
-- 사용자는 자신의 데이터만 조회 가능
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- 사용자는 자신의 데이터만 생성 가능
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);
```

**중요**: `auth.jwt()->>'sub'`는 Clerk 사용자 ID를 반환합니다.

## 예시 페이지

프로젝트에 다음 예시 페이지들이 포함되어 있습니다:

- **`/tasks`**: Client-side 렌더링 예시
- **`/tasks-ssr`**: Server-side 렌더링 예시

이 페이지들을 참고하여 통합 방법을 학습할 수 있습니다.

## 문제 해결

### 인증 오류가 발생하는 경우

1. Clerk Dashboard에서 Supabase 통합이 활성화되어 있는지 확인
2. Supabase Dashboard에서 Clerk provider가 올바르게 설정되어 있는지 확인
3. 환경 변수가 올바르게 설정되어 있는지 확인

### RLS 정책이 작동하지 않는 경우

1. RLS가 활성화되어 있는지 확인: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. 정책이 올바르게 생성되어 있는지 확인
3. `auth.jwt()->>'sub'`가 올바른 Clerk 사용자 ID를 반환하는지 확인

### 개발 환경에서 RLS 비활성화

개발 단계에서는 RLS를 비활성화할 수 있습니다:

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**주의**: 프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

## 추가 리소스

- [Clerk Supabase 통합 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Third-party Auth 문서](https://supabase.com/docs/guides/auth/third-party/overview)

