# Supabase 설정 가이드

이 문서는 Supabase 공식 문서를 기반으로 Next.js 프로젝트에 Supabase를 연결하는 방법을 설명합니다.

**참고**: [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 개요

이 프로젝트는 Supabase를 데이터베이스로 사용하며, Clerk를 인증 제공자로 사용합니다. Supabase와 Clerk의 네이티브 통합을 통해 인증된 사용자의 데이터에 안전하게 접근할 수 있습니다.

## 설정 단계

### 1. Supabase 프로젝트 생성

1. [database.new](https://database.new)에서 새 Supabase 프로젝트를 생성하거나
2. [Supabase Dashboard](https://supabase.com/dashboard/projects)에서 프로젝트 생성

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 추가하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**환경 변수 가져오기**:
- [Supabase Dashboard > Project Settings > API](https://supabase.com/dashboard/project/_/settings/api)
  - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** 키: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** 키: `SUPABASE_SERVICE_ROLE_KEY` (서버 전용, 클라이언트에 노출 금지)

### 3. 데이터베이스 마이그레이션 실행

프로젝트에는 다음 마이그레이션 파일들이 포함되어 있습니다:

- `supabase/migrations/create_instruments_table.sql`: Supabase 공식 문서 예시 테이블
- `supabase/migrations/create_tasks_table_with_rls.sql`: Clerk 통합 예시 테이블

**마이그레이션 실행 방법**:

#### 방법 1: Supabase Dashboard 사용
1. [Supabase Dashboard > SQL Editor](https://supabase.com/dashboard/project/_/sql/new)로 이동
2. 마이그레이션 파일의 내용을 복사하여 실행

#### 방법 2: Supabase CLI 사용
```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 4. 테이블 및 샘플 데이터 생성

Supabase 공식 문서의 예시를 따라 `instruments` 테이블을 생성할 수 있습니다:

```sql
-- 테이블 생성
CREATE TABLE instruments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL
);

-- 샘플 데이터 삽입
INSERT INTO instruments (name)
VALUES ('violin'), ('viola'), ('cello');

-- RLS 활성화
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 생성
CREATE POLICY "public can read instruments"
ON instruments
FOR SELECT
TO anon
USING (true);
```

또는 마이그레이션 파일을 사용하세요:
```bash
# Supabase Dashboard SQL Editor에서 실행
# supabase/migrations/create_instruments_table.sql
```

## 사용 방법

### Server Component에서 사용

Supabase 공식 문서 방식을 따릅니다:

```tsx
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function DataComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('instruments').select();
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

### Client Component에서 사용

Clerk 통합 클라이언트를 사용합니다:

```tsx
'use client';

import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { useUser } from '@clerk/nextjs';

export default function MyComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    const { data } = await supabase.from('tasks').select('*');
    return data;
  }

  return <div>...</div>;
}
```

### Server Action에서 사용

```tsx
'use server';

import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function addItem(name: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('인증이 필요합니다.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .insert({ name });

  return { data, error };
}
```

## 예시 페이지

프로젝트에 다음 예시 페이지들이 포함되어 있습니다:

- **`/instruments`**: Supabase 공식 문서 예시 (Server Component)
- **`/tasks`**: Clerk + Supabase 통합 예시 (Client Component)
- **`/tasks-ssr`**: Clerk + Supabase 통합 예시 (Server Component)

## Clerk와 Supabase 통합

이 프로젝트는 Clerk를 인증 제공자로 사용하며, Supabase와 네이티브 통합되어 있습니다.

자세한 내용은 [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)를 참고하세요.

## 문제 해결

### 연결 오류가 발생하는 경우

1. 환경 변수가 올바르게 설정되어 있는지 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. 네트워크 연결 확인

### 데이터를 조회할 수 없는 경우

1. RLS 정책이 올바르게 설정되어 있는지 확인
2. 테이블이 존재하는지 확인
3. 마이그레이션이 실행되었는지 확인

### 인증 오류가 발생하는 경우

Clerk와 Supabase 통합이 올바르게 설정되어 있는지 확인하세요:
- [Clerk Dashboard > Supabase Integration](https://dashboard.clerk.com/setup/supabase)
- [Supabase Dashboard > Authentication > Providers](https://supabase.com/dashboard/project/_/auth/third-party)

## 추가 리소스

- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Clerk + Supabase 통합 가이드](./CLERK_SUPABASE_INTEGRATION.md)

