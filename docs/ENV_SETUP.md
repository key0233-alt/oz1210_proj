# 환경변수 설정 가이드

이 문서는 My Trip 프로젝트의 환경변수를 설정하는 방법을 설명합니다.

## 목차

- [개발 환경 설정](#개발-환경-설정)
- [프로덕션 환경 설정 (Vercel)](#프로덕션-환경-설정-vercel)
- [환경변수 보안 주의사항](#환경변수-보안-주의사항)
- [환경변수 검증](#환경변수-검증)
- [프로덕션 배포 체크리스트](#프로덕션-배포-체크리스트)

---

## 개발 환경 설정

### 1. `.env.example` 파일 복사

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
cp .env.example .env
```

### 2. 환경변수 값 입력

`.env` 파일을 열고 각 환경변수에 실제 값을 입력하세요.

#### 필수 환경변수

**한국관광공사 API**

1. [한국관광공사 공공데이터포털](https://www.data.go.kr/data/15101578/openapi.do)에서 API 키 발급
2. 다음 환경변수에 동일한 키를 입력:

```env
NEXT_PUBLIC_TOUR_API_KEY=your_actual_api_key
TOUR_API_KEY=your_actual_api_key
```

#### 선택사항 환경변수

**네이버 지도 API** (지도 기능 사용 시)

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 Maps API 서비스 활성화
2. 클라이언트 ID 발급 (신용카드 등록 필요)
3. 환경변수 설정:

```env
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

**Clerk 인증** (인증 기능 사용 시)

1. [Clerk Dashboard](https://dashboard.clerk.com/api-keys)에서 API 키 발급
2. 환경변수 설정:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**Supabase** (북마크/데이터베이스 기능 사용 시)

1. [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)에서 API 키 발급
2. 환경변수 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**기타**

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. 환경변수 검증

개발 서버를 실행하면 자동으로 환경변수가 검증됩니다:

```bash
pnpm dev
```

필수 환경변수가 누락된 경우 콘솔에 경고 메시지가 표시됩니다.

---

## 프로덕션 환경 설정 (Vercel)

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **Add New Project** 클릭
3. GitHub 저장소 연결 또는 직접 배포

### 2. 환경변수 설정

**Vercel Dashboard에서 설정:**

1. 프로젝트 선택 → **Settings** → **Environment Variables**
2. 각 환경변수를 추가:

#### 필수 환경변수

| 환경변수 | 값 | 환경 |
|---------|-----|------|
| `NEXT_PUBLIC_TOUR_API_KEY` | 한국관광공사 API 키 | Production, Preview, Development |
| `TOUR_API_KEY` | 한국관광공사 API 키 (서버 전용) | Production, Preview, Development |

#### 선택사항 환경변수

| 환경변수 | 값 | 환경 |
|---------|-----|------|
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도 클라이언트 ID | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key | Production, Preview, Development |
| `CLERK_SECRET_KEY` | Clerk Secret Key | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Production, Preview, Development |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `uploads` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | 프로덕션 도메인 (예: `https://my-trip.vercel.app`) | Production |

**환경 설정 옵션:**
- **Production**: 프로덕션 배포에만 적용
- **Preview**: 프리뷰 배포 (Pull Request 등)에 적용
- **Development**: 로컬 개발 환경에 적용 (Vercel CLI 사용 시)

### 3. Vercel CLI로 설정 (선택사항)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경변수 추가
vercel env add NEXT_PUBLIC_TOUR_API_KEY
vercel env add TOUR_API_KEY
# ... (나머지 환경변수도 동일하게 추가)
```

### 4. 배포 및 확인

1. 환경변수 설정 후 **Deployments** 탭에서 새 배포 트리거
2. 배포 완료 후 사이트가 정상 작동하는지 확인
3. 브라우저 개발자 도구 콘솔에서 환경변수 관련 에러 확인

---

## 환경변수 보안 주의사항

### 클라이언트 노출 가능 환경변수 (`NEXT_PUBLIC_` 접두사)

다음 환경변수는 클라이언트 번들에 포함되어 브라우저에서 접근 가능합니다:

- `NEXT_PUBLIC_TOUR_API_KEY`
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STORAGE_BUCKET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

**주의사항:**
- 이러한 키들은 공개되어도 안전하도록 설계되어 있습니다 (예: Anon Key는 RLS 정책으로 보호됨)
- 하지만 API 사용량 제한이 있을 수 있으므로 과도한 노출은 피하세요

### 서버 전용 환경변수 (절대 클라이언트 노출 금지)

다음 환경변수는 **절대** 클라이언트에 노출되어서는 안 됩니다:

- `TOUR_API_KEY` - 서버 사이드 API 호출 전용
- `CLERK_SECRET_KEY` - Clerk 인증 서버 전용
- `SUPABASE_SERVICE_ROLE_KEY` - 모든 RLS를 우회하는 관리자 권한

**보안 체크리스트:**
- ✅ `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- ✅ 환경변수가 GitHub/GitLab 등에 커밋되지 않았는지 확인
- ✅ Vercel 환경변수 설정에서 서버 전용 키가 올바르게 설정되었는지 확인
- ✅ 코드에서 `process.env.SECRET_KEY` 같은 직접 참조가 클라이언트 컴포넌트에 없는지 확인

---

## 환경변수 검증

### 개발 환경 자동 검증

개발 서버 실행 시 (`pnpm dev`) 자동으로 환경변수가 검증됩니다:

```bash
✅ 필수 환경변수 검증 통과
✅ 서버 사이드 필수 환경변수 검증 통과
ℹ️  선택사항 환경변수 (기능별로 필요):
⚠️ NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: 네이버 지도 클라이언트 ID이(가) 설정되지 않았습니다.
```

### 수동 검증

`lib/env.ts`의 `validateEnv()` 함수를 사용하여 수동으로 검증할 수 있습니다:

```typescript
import { validateEnv } from '@/lib/env';

const result = validateEnv();
if (!result.isValid) {
  console.error('환경변수 검증 실패:', result.errors);
}
```

### 프로덕션 환경 검증

프로덕션 환경에서는 환경변수 검증이 자동으로 실행되지 않습니다. 배포 전에 다음을 확인하세요:

1. **Vercel Dashboard**에서 모든 필수 환경변수가 설정되었는지 확인
2. **빌드 로그**에서 환경변수 관련 에러 확인
3. **런타임 에러** 모니터링 (Vercel Logs 또는 에러 추적 도구)

---

## 프로덕션 배포 체크리스트

배포 전에 다음 항목을 확인하세요:

### 필수 환경변수

- [ ] `NEXT_PUBLIC_TOUR_API_KEY` 설정됨
- [ ] `TOUR_API_KEY` 설정됨

### 선택사항 환경변수 (사용하는 기능에 따라)

- [ ] `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (지도 기능 사용 시)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (인증 기능 사용 시)
- [ ] `CLERK_SECRET_KEY` (인증 기능 사용 시)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (데이터베이스 기능 사용 시)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (데이터베이스 기능 사용 시)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (데이터베이스 기능 사용 시)
- [ ] `NEXT_PUBLIC_STORAGE_BUCKET` (Storage 기능 사용 시)
- [ ] `NEXT_PUBLIC_SITE_URL` (SEO 최적화 시)

### 보안 확인

- [ ] 서버 전용 키 (`TOUR_API_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)가 클라이언트에 노출되지 않음
- [ ] `.env` 파일이 Git에 커밋되지 않음
- [ ] Vercel 환경변수 설정이 올바른 환경(Production/Preview/Development)에 적용됨

### 기능 테스트

- [ ] 홈페이지가 정상 로드됨
- [ ] 관광지 목록이 표시됨 (한국관광공사 API 연동 확인)
- [ ] 지도가 표시됨 (네이버 지도 API 연동 확인)
- [ ] 로그인이 작동함 (Clerk 연동 확인)
- [ ] 북마크 기능이 작동함 (Supabase 연동 확인)
- [ ] SEO 메타태그가 올바르게 설정됨 (`NEXT_PUBLIC_SITE_URL` 확인)

---

## 문제 해결

### 환경변수가 인식되지 않는 경우

1. **개발 환경:**
   - `.env` 파일이 프로젝트 루트에 있는지 확인
   - 개발 서버를 재시작 (`pnpm dev`)
   - 환경변수 이름에 오타가 없는지 확인

2. **프로덕션 환경 (Vercel):**
   - Vercel Dashboard에서 환경변수가 올바르게 설정되었는지 확인
   - 새 배포를 트리거 (환경변수 변경 후 재배포 필요)
   - 빌드 로그에서 환경변수 관련 에러 확인

### 환경변수 관련 에러

**에러: "환경변수 XXX가 설정되지 않았습니다"**

- 필수 환경변수가 누락되었습니다
- `.env` 파일 또는 Vercel 환경변수 설정을 확인하세요

**에러: "환경변수 XXX는 서버 사이드에서만 접근 가능합니다"**

- 서버 전용 환경변수를 클라이언트 컴포넌트에서 사용하려고 했습니다
- 해당 환경변수는 Server Component 또는 API Route에서만 사용하세요

---

## 추가 리소스

- [Next.js 환경변수 문서](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 환경변수 설정 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
- [Clerk 환경변수 설정](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase 환경변수 설정](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

