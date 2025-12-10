/**
 * @file lib/env.ts
 * @description 환경변수 검증 및 타입 안전한 접근 유틸리티
 *
 * 필수 환경변수를 검증하고 타입 안전하게 접근할 수 있도록 제공합니다.
 * 개발 환경에서 누락된 환경변수가 있으면 명확한 에러 메시지를 표시합니다.
 */

/**
 * 필수 환경변수 목록
 */
const REQUIRED_ENV_VARS = {
  // 한국관광공사 API
  NEXT_PUBLIC_TOUR_API_KEY: "한국관광공사 API 키 (클라이언트)",
  TOUR_API_KEY: "한국관광공사 API 키 (서버)",
  // 네이버 지도
  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: "네이버 지도 클라이언트 ID",
  // Clerk (선택사항 - 이미 설정되어 있을 수 있음)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk Publishable Key",
  CLERK_SECRET_KEY: "Clerk Secret Key",
  // Supabase (선택사항 - 이미 설정되어 있을 수 있음)
  NEXT_PUBLIC_SUPABASE_URL: "Supabase URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Supabase Anon Key",
} as const;

/**
 * 환경변수 검증 결과
 */
interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

/**
 * 필수 환경변수 검증
 * @param requiredVars 검증할 환경변수 목록 (기본값: REQUIRED_ENV_VARS)
 * @returns 검증 결과
 */
export function validateEnv(
  requiredVars: Record<string, string> = REQUIRED_ENV_VARS
): EnvValidationResult {
  const missingVars: string[] = [];
  const errors: string[] = [];

  for (const [key, description] of Object.entries(requiredVars)) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missingVars.push(key);
      errors.push(`❌ ${key}: ${description}이(가) 설정되지 않았습니다.`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    errors,
  };
}

/**
 * 개발 환경에서 환경변수 검증 및 경고 표시
 */
export function validateEnvOnDev(): void {
  if (process.env.NODE_ENV === "development") {
    const result = validateEnv();
    if (!result.isValid) {
      console.warn("\n⚠️  환경변수 검증 실패:\n");
      result.errors.forEach((error) => console.warn(error));
      console.warn(
        "\n💡 .env.local 파일을 생성하고 필요한 환경변수를 설정해주세요.\n"
      );
    }
  }
}

/**
 * 타입 안전한 환경변수 접근 함수
 * @param key 환경변수 키
 * @param defaultValue 기본값 (선택사항)
 * @returns 환경변수 값 또는 기본값
 * @throws 환경변수가 없고 기본값도 없으면 에러 발생
 */
export function getEnv(
  key: keyof typeof REQUIRED_ENV_VARS,
  defaultValue?: string
): string {
  const value = process.env[key];
  if (value) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(
    `환경변수 ${key}가 설정되지 않았습니다. (${REQUIRED_ENV_VARS[key]})`
  );
}

/**
 * 서버 사이드 전용 환경변수 접근
 * 클라이언트에서 접근하면 에러 발생
 */
export function getServerEnv(key: "TOUR_API_KEY" | "CLERK_SECRET_KEY"): string {
  if (typeof window !== "undefined") {
    throw new Error(
      `환경변수 ${key}는 서버 사이드에서만 접근 가능합니다.`
    );
  }
  return getEnv(key as keyof typeof REQUIRED_ENV_VARS);
}

// 개발 환경에서 자동 검증 실행
if (process.env.NODE_ENV === "development") {
  validateEnvOnDev();
}

