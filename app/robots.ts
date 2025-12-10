/**
 * @file app/robots.ts
 * @description robots.txt 생성
 *
 * Next.js App Router의 robots 기능을 사용하여 검색 엔진 크롤러에 대한 규칙을 제공합니다.
 */

import type { MetadataRoute } from "next";

// Base URL 설정 (환경변수 또는 기본값)
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://localhost:3000`;
}

/**
 * robots.txt 생성
 *
 * 모든 크롤러가 모든 경로를 크롤링할 수 있도록 설정합니다.
 * sitemap URL을 포함합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

