/**
 * @file lib/env.ts
 * @description 환경변수 검증 및 타입 안전한 접근 유틸리티
 *
 * 필수 환경변수를 검증하고 타입 안전하게 접근할 수 있도록 제공합니다.
 * 개발 환경에서 누락된 환경변수가 있으면 명확한 에러 메시지를 표시합니다.
 */

/**
 * 필수 환경변수 목록 (핵심 기능 - 클라이언트/서버 공통)
 */
const REQUIRED_ENV_VARS = {
  // 한국관광공사 API (핵심 기능)
  NEXT_PUBLIC_TOUR_API_KEY: "한국관광공사 API 키 (클라이언트)",
} as const;

/**
 * 서버 사이드 전용 필수 환경변수 목록
 */
const REQUIRED_SERVER_ENV_VARS = {
  // 한국관광공사 API (서버 전용)
  TOUR_API_KEY: "한국관광공사 API 키 (서버)",
} as const;

/**
 * 선택사항 환경변수 목록 (기능별로 필요)
 */
const OPTIONAL_ENV_VARS = {
  // 네이버 지도 (지도 기능 사용 시 필요)
  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: "네이버 지도 클라이언트 ID",
  // Clerk (인증 기능 사용 시 필요)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk Publishable Key",
  CLERK_SECRET_KEY: "Clerk Secret Key (서버 전용)",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "Clerk 로그인 URL",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "Clerk 로그인 후 리다이렉트 URL",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "Clerk 회원가입 후 리다이렉트 URL",
  // Supabase (북마크/데이터베이스 기능 사용 시 필요)
  NEXT_PUBLIC_SUPABASE_URL: "Supabase 프로젝트 URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Supabase Anon Key",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase Service Role Key (서버 전용)",
  NEXT_PUBLIC_STORAGE_BUCKET: "Supabase Storage 버킷 이름",
  // 기타
  NEXT_PUBLIC_SITE_URL: "사이트 URL (SEO, sitemap 등에 사용)",
  ANALYZE: "번들 분석 플래그 (true로 설정 시 번들 분석 활성화)",
} as const;

/**
 * 환경변수 fallback 매핑 (호환성을 위한 별칭)
 */
const ENV_FALLBACKS: Record<string, string[]> = {
  NEXT_PUBLIC_TOUR_API_KEY: ["PUBLIC_TOUR_API_KEY", "TOUR_API_KEY"],
  TOUR_API_KEY: ["PUBLIC_TOUR_API_KEY"],
};

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
    // 먼저 정확한 키로 확인
    let value = process.env[key];
    
    // 없으면 fallback 키들 확인
    if (!value && ENV_FALLBACKS[key]) {
      for (const fallbackKey of ENV_FALLBACKS[key]) {
        value = process.env[fallbackKey];
        if (value) {
          break;
        }
      }
    }
    
    if (!value || value.trim() === "") {
      missingVars.push(key);
      const fallbackKeys = ENV_FALLBACKS[key] || [];
      const allKeys = [key, ...fallbackKeys].join(", ");
      errors.push(`❌ ${allKeys}: ${description}이(가) 설정되지 않았습니다.`);
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
    // 클라이언트/서버 공통 필수 환경변수 검증
    const requiredResult = validateEnv(REQUIRED_ENV_VARS);
    if (!requiredResult.isValid) {
      console.warn("\n⚠️  필수 환경변수 검증 실패:\n");
      requiredResult.errors.forEach((error) => console.warn(error));
      
      // 각 누락된 환경변수에 대해 실제로 설정된 값 확인
      console.warn("\n📋 환경변수 확인:\n");
      for (const key of requiredResult.missingVars) {
        const fallbackKeys = ENV_FALLBACKS[key] || [];
        const allKeys = [key, ...fallbackKeys];
        const foundKey = allKeys.find(k => process.env[k]);
        if (foundKey) {
          console.warn(`✅ ${foundKey}: 설정됨 (${foundKey !== key ? `${key} 대신 사용` : ''})`);
        } else {
          console.warn(`❌ ${allKeys.join(", ")}: 모두 설정되지 않음`);
        }
      }
      
      console.warn(
        "\n💡 .env 파일을 확인하고 필요한 환경변수를 설정해주세요.\n"
      );
    } else {
      console.info("\n✅ 필수 환경변수 검증 통과\n");
    }

    // 서버 사이드 전용 환경변수 검증 (서버에서만)
    if (typeof window === "undefined") {
      const serverResult = validateEnv(REQUIRED_SERVER_ENV_VARS);
      if (!serverResult.isValid) {
        console.warn("\n⚠️  서버 사이드 필수 환경변수 검증 실패:\n");
        serverResult.errors.forEach((error) => console.warn(error));
        
        console.warn("\n📋 서버 환경변수 확인:\n");
        for (const key of serverResult.missingVars) {
          const fallbackKeys = ENV_FALLBACKS[key] || [];
          const allKeys = [key, ...fallbackKeys];
          const foundKey = allKeys.find(k => process.env[k]);
          if (foundKey) {
            console.warn(`✅ ${foundKey}: 설정됨 (${foundKey !== key ? `${key} 대신 사용` : ''})`);
          } else {
            console.warn(`❌ ${allKeys.join(", ")}: 모두 설정되지 않음`);
          }
        }
        
        console.warn(
          "\n💡 .env 파일을 확인하고 필요한 환경변수를 설정해주세요.\n"
        );
      } else {
        console.info("\n✅ 서버 사이드 필수 환경변수 검증 통과\n");
      }
    }

    // 선택사항 환경변수 검증 (정보만 표시)
    const optionalResult = validateEnv(OPTIONAL_ENV_VARS);
    if (!optionalResult.isValid) {
      console.info("\nℹ️  선택사항 환경변수 (기능별로 필요):\n");
      optionalResult.errors.forEach((error) => console.info(error.replace("❌", "⚠️")));
      console.info(
        "\n💡 해당 기능을 사용하지 않으면 설정하지 않아도 됩니다.\n"
      );
    }
  }
}

/**
 * 타입 안전한 환경변수 접근 함수
 * @param key 환경변수 키 (필수 또는 선택사항)
 * @param defaultValue 기본값 (선택사항)
 * @returns 환경변수 값 또는 기본값
 * @throws 필수 환경변수가 없고 기본값도 없으면 에러 발생
 */
export function getEnv(
  key: keyof typeof REQUIRED_ENV_VARS | keyof typeof REQUIRED_SERVER_ENV_VARS | keyof typeof OPTIONAL_ENV_VARS,
  defaultValue?: string
): string {
  // 먼저 정확한 키로 확인
  let value = process.env[key];
  
  // 없으면 fallback 키들 확인
  if (!value && ENV_FALLBACKS[key]) {
    for (const fallbackKey of ENV_FALLBACKS[key]) {
      value = process.env[fallbackKey];
      if (value) {
        console.info(
          `ℹ️ 환경변수 ${key} 대신 ${fallbackKey}를 사용합니다. (호환성)`
        );
        break;
      }
    }
  }
  
  if (value) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  // 필수 환경변수인 경우에만 에러 발생
  if (key in REQUIRED_ENV_VARS) {
    const fallbackKeys = ENV_FALLBACKS[key] || [];
    const allKeys = [key, ...fallbackKeys].join(", ");
    throw new Error(
      `환경변수 ${allKeys} 중 하나가 설정되지 않았습니다. (${REQUIRED_ENV_VARS[key as keyof typeof REQUIRED_ENV_VARS]})`
    );
  }
  
  // 서버 사이드 필수 환경변수인 경우
  if (key in REQUIRED_SERVER_ENV_VARS) {
    const fallbackKeys = ENV_FALLBACKS[key] || [];
    const allKeys = [key, ...fallbackKeys].join(", ");
    throw new Error(
      `환경변수 ${allKeys} 중 하나가 설정되지 않았습니다. (${REQUIRED_SERVER_ENV_VARS[key as keyof typeof REQUIRED_SERVER_ENV_VARS]})`
    );
  }
  
  // 선택사항 환경변수인 경우 경고만 표시하고 빈 문자열 반환
  console.warn(
    `⚠️ 선택사항 환경변수 ${key}가 설정되지 않았습니다. 해당 기능이 작동하지 않을 수 있습니다.`
  );
  return "";
}

/**
 * 서버 사이드 전용 환경변수 접근
 * 클라이언트에서 접근하면 에러 발생
 */
export function getServerEnv(
  key: "TOUR_API_KEY" | "CLERK_SECRET_KEY" | "SUPABASE_SERVICE_ROLE_KEY"
): string {
  if (typeof window !== "undefined") {
    throw new Error(
      `환경변수 ${key}는 서버 사이드에서만 접근 가능합니다.`
    );
  }
  return getEnv(key as keyof typeof REQUIRED_SERVER_ENV_VARS | keyof typeof REQUIRED_ENV_VARS | keyof typeof OPTIONAL_ENV_VARS);
}

// 개발 환경에서 자동 검증 실행
if (process.env.NODE_ENV === "development") {
  validateEnvOnDev();
}

