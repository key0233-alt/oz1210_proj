/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 한국관광공사 API를 활용하여 전국 관광지 통계를 시각화하는 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 가져옵니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 분포 차트 (Bar Chart)
 * 2. 관광 타입별 분포 차트 (Donut Chart)
 * 3. 통계 요약 카드 (전체 개수, Top 3 지역/타입)
 *
 * 핵심 구현 로직:
 * - Server Component로 구현하여 초기 로딩 속도 최적화
 * - 데이터 캐싱 전략 (revalidate: 3600)
 * - 반응형 디자인 (모바일 우선)
 *
 * @dependencies
 * - @/lib/api/stats-api: 통계 데이터 수집 함수들 (향후 구현)
 * - @/components/stats: 통계 컴포넌트들 (향후 구현)
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계 대시보드 - My Trip",
  description: "전국 관광지 통계를 한눈에 확인하세요. 지역별, 타입별 분포를 차트로 시각화합니다.",
  keywords: ["통계", "관광지 통계", "지역별 분포", "관광 타입", "대시보드"],
  openGraph: {
    title: "통계 대시보드 - My Trip",
    description: "전국 관광지 통계를 한눈에 확인하세요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    title: "통계 대시보드 - My Trip",
    description: "전국 관광지 통계를 한눈에 확인하세요.",
  },
};

/**
 * 통계 대시보드 페이지 컴포넌트
 */
export default async function StatsPage() {
  return (
    <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
      {/* 헤더 섹션 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          통계 대시보드
        </h1>
        <p className="mt-2 text-muted-foreground">
          전국의 관광지 통계를 지역별, 타입별로 확인할 수 있습니다.
        </p>
      </header>

      {/* 통계 요약 카드 영역 (향후 컴포넌트 추가 예정) */}
      <section
        className="mb-8"
        aria-label="통계 요약"
      >
        {/* StatsSummary 컴포넌트가 여기에 추가될 예정 */}
      </section>

      {/* 지역별 분포 차트 영역 (향후 컴포넌트 추가 예정) */}
      <section
        className="mb-8"
        aria-label="지역별 관광지 분포"
      >
        {/* RegionChart 컴포넌트가 여기에 추가될 예정 */}
      </section>

      {/* 타입별 분포 차트 영역 (향후 컴포넌트 추가 예정) */}
      <section
        className="mb-8"
        aria-label="관광 타입별 분포"
      >
        {/* TypeChart 컴포넌트가 여기에 추가될 예정 */}
      </section>
    </main>
  );
}

