/**
 * @file app/sitemap.ts
 * @description 동적 sitemap 생성
 *
 * Next.js App Router의 sitemap 기능을 사용하여 검색 엔진에 사이트 구조를 제공합니다.
 * 정적 페이지와 동적 페이지(관광지 상세페이지)를 포함합니다.
 */

import type { MetadataRoute } from "next";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { PAGINATION_DEFAULTS } from "@/lib/constants/api";

// Base URL 설정 (환경변수 또는 기본값)
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://localhost:3000`;
}

/**
 * 동적 sitemap 생성
 *
 * 정적 페이지와 관광지 상세페이지를 포함합니다.
 * 성능을 고려하여 샘플 관광지만 포함합니다 (최대 100개).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // 동적 페이지: 관광지 상세페이지
  // 성능을 고려하여 샘플 관광지만 포함 (서울 지역, 첫 페이지만)
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // 서울 지역(areaCode: 1)의 관광지 목록 조회 (최대 100개)
    const result = await getAreaBasedList(
      "1", // 서울
      undefined, // 모든 타입
      Math.min(100, PAGINATION_DEFAULTS.numOfRows * 5), // 최대 100개
      1, // 첫 페이지
      true // 서버 사이드 호출
    );

    if (result.success && result.data) {
      dynamicPages = result.data.map((item) => ({
        url: `${baseUrl}/places/${item.contentid}`,
        lastModified: item.modifiedtime
          ? new Date(item.modifiedtime)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    // sitemap 생성 실패 시 정적 페이지만 반환
    console.error("Sitemap 생성 중 오류:", error);
  }

  return [...staticPages, ...dynamicPages];
}

