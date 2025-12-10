-- =====================================================
-- 마이그레이션: feedback 테이블 생성
-- 작성일: 2025-01-01
-- 설명: 사용자 피드백 수집을 위한 테이블
--       - 로그인/비로그인 사용자 모두 사용 가능
--       - 버그 리포트, 기능 제안, 기타 피드백 지원
-- =====================================================

-- =====================================================
-- feedback 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'other')),
    content TEXT NOT NULL,
    email TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.feedback OWNER TO postgres;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Row Level Security (RLS) 비활성화
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE public.feedback TO anon;
GRANT ALL ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;

-- 테이블 설명
COMMENT ON TABLE public.feedback IS '사용자 피드백 정보 - 버그 리포트, 기능 제안 등';
COMMENT ON COLUMN public.feedback.user_id IS 'users 테이블의 사용자 ID (nullable - 비로그인 사용자도 가능)';
COMMENT ON COLUMN public.feedback.type IS '피드백 유형: bug, suggestion, other';
COMMENT ON COLUMN public.feedback.content IS '피드백 내용 (최소 10자, 최대 1000자)';
COMMENT ON COLUMN public.feedback.email IS '이메일 주소 (선택 사항, 답변 받기용)';
COMMENT ON COLUMN public.feedback.screenshot_url IS '스크린샷 URL (선택 사항, 향후 구현)';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ feedback 테이블 마이그레이션 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 생성된 테이블:';
    RAISE NOTICE '   - feedback (사용자 피드백)';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS: 비활성화 (DISABLE ROW LEVEL SECURITY)';
    RAISE NOTICE '🔑 인덱스: feedback(user_id, type, created_at)';
END $$;

