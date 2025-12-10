/**
 * @file app/page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 관광지 목록을 표시하는 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 가져옵니다.
 */

import { Suspense } from "react";
import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { PAGINATION_DEFAULTS } from "@/lib/constants/api";

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    pageNo?: string;
  }>;
}

/**
 * 관광지 목록 데이터 페칭 컴포넌트
 */
async function TourListData({
  areaCode,
  contentTypeId,
  pageNo,
}: {
  areaCode?: string;
  contentTypeId?: string;
  pageNo?: string;
}) {
  // 기본값: 서울 지역 (areaCode: "1")
  const defaultAreaCode = "1";
  const finalAreaCode = areaCode || defaultAreaCode;
  const finalContentTypeId = contentTypeId
    ? parseInt(contentTypeId, 10)
    : undefined;
  const finalPageNo = pageNo ? parseInt(pageNo, 10) : PAGINATION_DEFAULTS.pageNo;

  // API 호출
  const result = await getAreaBasedList(
    finalAreaCode,
    finalContentTypeId,
    PAGINATION_DEFAULTS.numOfRows,
    finalPageNo,
    true // 서버 사이드 호출
  );

  // 에러 처리
  if (!result.success) {
    return (
      <TourList
        tours={[]}
        isLoading={false}
        error={result.error || "관광지 목록을 불러오는 중 오류가 발생했습니다."}
      />
    );
  }

  // 데이터 표시
  return (
    <TourList
      tours={result.data || []}
      isLoading={false}
      error={null}
    />
  );
}

/**
 * 홈페이지 컴포넌트
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const { areaCode, contentTypeId, pageNo } = params;

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          관광지 목록
        </h1>
        <p className="mt-2 text-muted-foreground">
          전국의 다양한 관광지를 탐색해보세요.
        </p>
      </div>

      <Suspense
        fallback={
          <TourList tours={[]} isLoading={true} error={null} />
        }
      >
        <TourListData
          areaCode={areaCode}
          contentTypeId={contentTypeId}
          pageNo={pageNo}
        />
      </Suspense>
    </main>
  );
}
