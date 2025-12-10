# 배포 가이드

이 문서는 My Trip 프로젝트를 Vercel에 배포하는 방법을 단계별로 설명합니다.

## 목차

- [배포 전 준비](#배포-전-준비)
- [Vercel 배포 설정](#vercel-배포-설정)
- [빌드 테스트](#빌드-테스트)
- [프로덕션 배포](#프로덕션-배포)
- [배포 후 테스트](#배포-후-테스트)
- [문제 해결](#문제-해결)

---

## 배포 전 준비

### 1. 필수 요구사항 확인

배포 전에 다음 항목을 확인하세요:

- [ ] Git 저장소에 코드가 푸시되어 있음 (GitHub, GitLab, Bitbucket 등)
- [ ] 모든 의존성이 `package.json`에 포함되어 있음
- [ ] 환경변수 목록 확인 (`docs/ENV_SETUP.md` 참고)
- [ ] 로컬에서 개발 서버가 정상 작동함 (`pnpm dev`)

### 2. 코드 품질 확인

```bash
# 린트 검사
pnpm lint

# 타입 체크 (빌드 시 자동 실행됨)
# 또는 수동 실행:
npx tsc --noEmit
```

### 3. 환경변수 준비

배포에 필요한 모든 환경변수 값을 준비하세요. 자세한 내용은 [`docs/ENV_SETUP.md`](./ENV_SETUP.md)를 참고하세요.

**필수 환경변수:**
- `NEXT_PUBLIC_TOUR_API_KEY`
- `TOUR_API_KEY`

**선택사항 환경변수 (사용하는 기능에 따라):**
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (지도 기능)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (인증 기능)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (데이터베이스 기능)
- `NEXT_PUBLIC_SITE_URL` (SEO 최적화)

---

## Vercel 배포 설정

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com)에 접속
2. **Sign Up** 클릭
3. GitHub, GitLab, Bitbucket 중 하나로 계정 생성 (권장: GitHub)

### 2. 프로젝트 생성

#### 방법 1: Vercel Dashboard 사용 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **Add New Project** 클릭
3. GitHub 저장소 선택 또는 **Import Git Repository** 클릭
4. 저장소 선택 후 **Import** 클릭

#### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 첫 배포 시:
# - Set up and deploy? Yes
# - Which scope? (계정 선택)
# - Link to existing project? No
# - Project name? (프로젝트 이름 입력)
# - Directory? ./
# - Override settings? No
```

### 3. 빌드 설정

**Next.js 15는 Vercel에서 자동으로 감지됩니다.** 별도의 `vercel.json` 파일이 필요하지 않습니다.

Vercel은 다음을 자동으로 감지합니다:
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (또는 `npm run build`, `yarn build`)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install` (또는 `npm install`, `yarn install`)

**수동 설정이 필요한 경우:**

Vercel Dashboard → 프로젝트 → **Settings** → **General** → **Build & Development Settings**에서 확인:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: (비워두기 - 자동 감지)
- **Install Command**: `pnpm install`
- **Root Directory**: (프로젝트 루트인 경우 비워두기)

### 4. 환경변수 설정

**중요**: 배포 전에 반드시 모든 필수 환경변수를 설정하세요.

#### Vercel Dashboard에서 설정

1. 프로젝트 선택 → **Settings** → **Environment Variables**
2. 각 환경변수를 추가:

**환경변수 추가 방법:**

1. **Key**: 환경변수 이름 (예: `NEXT_PUBLIC_TOUR_API_KEY`)
2. **Value**: 실제 값
3. **Environment**: 적용할 환경 선택
   - **Production**: 프로덕션 배포에만 적용
   - **Preview**: 프리뷰 배포 (Pull Request 등)에 적용
   - **Development**: 로컬 개발 환경 (Vercel CLI 사용 시)

**환경변수별 환경 설정 가이드:**

| 환경변수 | Production | Preview | Development |
|---------|:----------:|:-------:|:-----------:|
| `NEXT_PUBLIC_TOUR_API_KEY` | ✅ | ✅ | ✅ |
| `TOUR_API_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | ✅ | ✅ |
| `CLERK_SECRET_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_STORAGE_BUCKET` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ⚠️ | ❌ |

> **참고**: `NEXT_PUBLIC_SITE_URL`은 프로덕션 도메인으로 설정하세요. Preview와 Development는 자동으로 감지됩니다.

#### Vercel CLI로 설정

```bash
# 환경변수 추가
vercel env add NEXT_PUBLIC_TOUR_API_KEY
# 프롬프트에 따라 값 입력 및 환경 선택

# 모든 환경변수 추가 후
vercel env pull .env.local  # 로컬 개발용 .env.local 파일 생성
```

**환경변수 설정 체크리스트:**

- [ ] 모든 필수 환경변수 설정됨
- [ ] 환경변수가 올바른 환경(Production/Preview/Development)에 적용됨
- [ ] 서버 전용 키(`TOUR_API_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)가 클라이언트에 노출되지 않음
- [ ] `NEXT_PUBLIC_SITE_URL`이 프로덕션 도메인으로 설정됨

자세한 내용은 [`docs/ENV_SETUP.md`](./ENV_SETUP.md)를 참고하세요.

---

## 빌드 테스트

배포 전에 로컬에서 빌드 테스트를 수행하여 문제를 조기에 발견하세요.

### 1. 로컬 빌드 테스트

```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm build
```

**빌드 성공 확인:**

빌드가 성공하면 다음과 같은 메시지가 표시됩니다:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         85.3 kB
├ ○ /places/[contentId]                 8.1 kB         88.2 kB
├ ○ /stats                               6.4 kB         86.5 kB
└ ○ /bookmarks                           4.8 kB         84.9 kB

○  (Static)  prerendered as static content
```

### 2. 빌드 산출물 확인

빌드 후 `.next` 디렉토리가 생성됩니다:

```bash
# .next 디렉토리 확인
ls -la .next
```

**확인 항목:**
- [ ] `.next` 디렉토리가 생성됨
- [ ] `.next/static` 디렉토리에 정적 파일이 생성됨
- [ ] 빌드 로그에 에러가 없음

### 3. 프로덕션 서버 테스트

로컬에서 프로덕션 빌드를 테스트할 수 있습니다:

```bash
# 프로덕션 서버 시작
pnpm start

# 브라우저에서 http://localhost:3000 접속
```

**테스트 항목:**
- [ ] 홈페이지가 정상 로드됨
- [ ] JavaScript 에러가 없음 (브라우저 콘솔 확인)
- [ ] API 호출이 정상 작동함
- [ ] 이미지가 정상 로드됨

### 4. 빌드 에러 해결

**일반적인 빌드 에러:**

#### 타입 에러

```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결 방법:**
- 타입 정의 확인 및 수정
- `tsconfig.json`의 `strict` 설정 확인

#### 모듈을 찾을 수 없음

```
Module not found: Can't resolve 'xxx'
```

**해결 방법:**
```bash
# 의존성 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 환경변수 에러

```
Environment variable XXX is missing
```

**해결 방법:**
- `.env` 파일에 환경변수 추가
- 또는 빌드 시 환경변수 전달: `NEXT_PUBLIC_TOUR_API_KEY=xxx pnpm build`

#### 이미지 도메인 에러

```
Error: Invalid src prop on <Image>
```

**해결 방법:**
- `next.config.ts`의 `images.remotePatterns`에 도메인 추가

### 5. 빌드 성공 확인 체크리스트

- [ ] `pnpm build` 명령어가 에러 없이 완료됨
- [ ] 타입 체크 통과 (`tsc --noEmit` 또는 빌드 시 자동 체크)
- [ ] 린트 에러 없음 (`pnpm lint`)
- [ ] `.next` 디렉토리가 생성됨
- [ ] 프로덕션 서버(`pnpm start`)가 정상 작동함
- [ ] 브라우저에서 페이지가 정상 로드됨
- [ ] JavaScript 에러 없음 (브라우저 콘솔 확인)

---

## 프로덕션 배포

### 1. 자동 배포 (GitHub 연동)

Vercel은 GitHub 저장소와 연동하면 자동으로 배포됩니다:

1. **자동 배포 설정 확인:**
   - Vercel Dashboard → 프로젝트 → **Settings** → **Git**
   - **Production Branch**: `main` 또는 `master` (기본값)
   - **Automatic deployments from Git**: 활성화됨

2. **배포 트리거:**
   - `main` 브랜치에 푸시하면 자동으로 프로덕션 배포
   - Pull Request 생성 시 프리뷰 배포

### 2. 수동 배포

#### Vercel Dashboard에서

1. Vercel Dashboard → 프로젝트
2. **Deployments** 탭
3. **Redeploy** 클릭 (최신 커밋으로 재배포)

#### Vercel CLI로

```bash
# 프로덕션 배포
vercel --prod

# 프리뷰 배포
vercel
```

### 3. 배포 상태 확인

Vercel Dashboard에서 배포 상태를 확인할 수 있습니다:

- **Building**: 빌드 중
- **Ready**: 배포 완료
- **Error**: 배포 실패 (로그 확인 필요)

**배포 로그 확인:**

1. Vercel Dashboard → 프로젝트 → **Deployments**
2. 배포 항목 클릭
3. **Build Logs** 탭에서 빌드 로그 확인

---

## 배포 후 테스트

배포가 완료되면 다음 항목을 테스트하세요.

### 1. 기본 기능 테스트

#### 홈페이지

- [ ] 프로덕션 URL 접속 확인 (예: `https://my-trip.vercel.app`)
- [ ] 페이지가 정상 로드됨
- [ ] 로딩 시간이 적절함 (< 3초)
- [ ] JavaScript 에러 없음 (브라우저 개발자 도구 콘솔 확인)

#### 관광지 목록

- [ ] 관광지 목록이 표시됨
- [ ] 카드 레이아웃이 정상 작동함
- [ ] 이미지가 정상 로드됨
- [ ] 필터 기능이 작동함 (지역, 타입)
- [ ] 페이지네이션이 작동함

#### 검색 기능

- [ ] 검색창에 키워드 입력 가능
- [ ] 검색 결과가 표시됨
- [ ] 검색 결과가 정확함

#### 상세페이지

- [ ] 관광지 카드 클릭 시 상세페이지로 이동
- [ ] 상세 정보가 표시됨 (기본 정보, 운영 정보, 이미지 갤러리)
- [ ] 지도가 표시됨
- [ ] 북마크 기능이 작동함 (인증된 사용자)

### 2. API 연동 테스트

#### 한국관광공사 API

- [ ] 관광지 목록 API 호출 성공
- [ ] 상세 정보 API 호출 성공
- [ ] 검색 API 호출 성공
- [ ] API 에러 처리 확인 (네트워크 오류 시)

#### 네이버 지도 API

- [ ] 지도가 정상 로드됨
- [ ] 마커가 정상 표시됨
- [ ] 지도 인터랙션 작동 (줌, 이동)
- [ ] 길찾기 버튼 작동

#### Clerk 인증

- [ ] 로그인 버튼 작동
- [ ] 회원가입 작동
- [ ] 로그아웃 작동
- [ ] 인증 상태 유지

#### Supabase

- [ ] 북마크 추가/삭제 작동
- [ ] 북마크 목록 페이지 작동
- [ ] 사용자 데이터 동기화 확인

### 3. SEO 및 메타태그 테스트

- [ ] 페이지 제목이 올바르게 설정됨
- [ ] 메타 설명이 표시됨
- [ ] Open Graph 태그 확인 (소셜 미디어 공유 테스트)
  - Facebook: [Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - Twitter: [Card Validator](https://cards-dev.twitter.com/validator)
- [ ] `robots.txt` 접근 가능 (`/robots.txt`)
- [ ] `sitemap.xml` 접근 가능 (`/sitemap.xml`)

### 4. 반응형 디자인 테스트

- [ ] 모바일 화면 (375px, 414px)에서 정상 표시
- [ ] 태블릿 화면 (768px)에서 정상 표시
- [ ] 데스크톱 화면 (1024px, 1920px)에서 정상 표시
- [ ] 터치 인터랙션 작동 (모바일)
- [ ] 햄버거 메뉴 작동 (모바일)

### 5. 성능 테스트

- [ ] Lighthouse 점수 확인 (목표: > 80)
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- [ ] First Contentful Paint (FCP) < 1.8초
- [ ] Largest Contentful Paint (LCP) < 2.5초
- [ ] Time to Interactive (TTI) < 3.8초

**Lighthouse 실행 방법:**

1. Chrome 개발자 도구 열기 (F12)
2. **Lighthouse** 탭 선택
3. **Generate report** 클릭

### 6. 에러 모니터링

- [ ] Vercel Dashboard → 프로젝트 → **Logs**에서 에러 확인
- [ ] 브라우저 콘솔에 에러 없음
- [ ] 네트워크 탭에서 실패한 요청 없음

---

## 문제 해결

### 배포 실패

**문제**: 배포가 실패하고 빌드 에러가 발생함

**해결 방법:**

1. **빌드 로그 확인:**
   - Vercel Dashboard → 프로젝트 → **Deployments** → 배포 항목 → **Build Logs**

2. **로컬에서 빌드 테스트:**
   ```bash
   pnpm build
   ```

3. **일반적인 원인:**
   - 환경변수 누락
   - 타입 에러
   - 의존성 문제
   - 빌드 명령어 오류

### 환경변수 문제

**문제**: 환경변수가 적용되지 않음

**해결 방법:**

1. Vercel Dashboard에서 환경변수 확인
2. 환경변수가 올바른 환경(Production/Preview)에 설정되었는지 확인
3. 새 배포 트리거 (환경변수 변경 후 재배포 필요)

### 이미지 로드 실패

**문제**: 외부 이미지가 로드되지 않음

**해결 방법:**

1. `next.config.ts`의 `images.remotePatterns`에 도메인 추가
2. 변경사항 커밋 및 푸시
3. 재배포

### API 호출 실패

**문제**: API 호출이 실패함

**해결 방법:**

1. 환경변수 확인 (`NEXT_PUBLIC_TOUR_API_KEY` 등)
2. API 키가 유효한지 확인
3. CORS 문제 확인 (필요시)
4. 네트워크 탭에서 요청/응답 확인

### 성능 문제

**문제**: 페이지 로딩이 느림

**해결 방법:**

1. Lighthouse 리포트 확인
2. 이미지 최적화 확인 (`next/image` 사용)
3. 번들 크기 확인 (`pnpm analyze`)
4. 불필요한 의존성 제거

---

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel 환경변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 이미지 최적화](https://nextjs.org/docs/app/api-reference/components/image)

---

## 배포 체크리스트 요약

### 배포 전

- [ ] 코드가 Git 저장소에 푸시됨
- [ ] 로컬 빌드 테스트 통과 (`pnpm build`)
- [ ] 린트 에러 없음 (`pnpm lint`)
- [ ] 환경변수 목록 준비됨

### Vercel 설정

- [ ] Vercel 계정 생성 및 로그인
- [ ] GitHub 저장소 연결
- [ ] 프로젝트 생성
- [ ] 빌드 설정 확인 (자동 감지)
- [ ] 모든 필수 환경변수 설정

### 배포 후

- [ ] 홈페이지 정상 로드
- [ ] 모든 주요 기능 작동
- [ ] API 연동 확인
- [ ] 반응형 디자인 확인
- [ ] SEO 메타태그 확인
- [ ] 성능 점수 확인 (Lighthouse)

