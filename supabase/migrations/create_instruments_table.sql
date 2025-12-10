-- Instruments 테이블 생성 (Supabase 공식 문서 예시)
-- 
-- 참고: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
-- 
-- 이 마이그레이션은 Supabase 공식 문서의 Next.js Quickstart 예시를 기반으로 작성되었습니다.

-- Instruments 테이블 생성
CREATE TABLE IF NOT EXISTS public.instruments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.instruments OWNER TO postgres;

-- 권한 부여
GRANT ALL ON TABLE public.instruments TO anon;
GRANT ALL ON TABLE public.instruments TO authenticated;
GRANT ALL ON TABLE public.instruments TO service_role;

-- 샘플 데이터 삽입
INSERT INTO public.instruments (name)
VALUES 
    ('violin'),
    ('viola'),
    ('cello')
ON CONFLICT DO NOTHING;

-- RLS 활성화 (프로덕션에서는 필수)
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 생성 (Supabase 공식 문서 예시)
-- 개발 단계에서는 이 정책을 사용하고, 프로덕션에서는 더 엄격한 정책을 설정하세요
CREATE POLICY "public can read instruments"
ON public.instruments
FOR SELECT
TO anon
USING (true);

-- 인증된 사용자도 읽기 가능하도록 정책 추가
CREATE POLICY "authenticated can read instruments"
ON public.instruments
FOR SELECT
TO authenticated
USING (true);

