-- Tasks 테이블 생성 및 RLS 정책 설정
-- Clerk + Supabase 통합 예시
-- 
-- 참고: https://clerk.com/docs/guides/development/integrations/databases/supabase
-- 
-- 이 마이그레이션은 Clerk 세션 토큰을 사용하여 RLS 정책을 설정하는 방법을 보여줍니다.
-- 개발 단계에서는 RLS를 비활성화할 수 있지만, 프로덕션에서는 반드시 활성화해야 합니다.

-- Tasks 테이블 생성
-- user_id는 Clerk 사용자 ID를 저장하며, 기본값으로 auth.jwt()->>'sub'를 사용
CREATE TABLE IF NOT EXISTS public.tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT (auth.jwt()->>'sub'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.tasks OWNER TO postgres;

-- 권한 부여
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;

-- 개발 단계에서는 RLS 비활성화 (프로덕션에서는 활성화 필요)
-- ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- RLS 활성화 (프로덕션에서 주석 해제)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자는 자신의 tasks만 조회할 수 있음
CREATE POLICY "User can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- 사용자는 자신의 tasks만 생성할 수 있음
CREATE POLICY "Users must insert their own tasks"
ON public.tasks
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- 사용자는 자신의 tasks만 수정할 수 있음
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
)
WITH CHECK (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- 사용자는 자신의 tasks만 삭제할 수 있음
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
    ((SELECT auth.jwt()->>'sub') = (user_id)::text)
);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

