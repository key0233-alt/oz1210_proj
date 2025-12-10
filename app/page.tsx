/**
 * @file app/page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 관광지 목록을 표시하는 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 가져옵니다.
 */

import { Suspense } from "react";
import { getAreaBasedList, searchKeyword } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { HomeLayout } from "@/components/home-layout";
import { TourFilters } from "@/components/tour-filters";
import { PAGINATION_DEFAULTS } from "@/lib/constants/api";
import { TourItem } from "@/lib/types/tour";

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    pet?: string;
    petSize?: string;
    sort?: string;
    pageNo?: string;
  }>;
}

/**
 * 관광지 목록 데이터 페칭 컴포넌트
 */
async function TourListData({
  keyword,
  areaCode,
  contentTypeId,
  pet,
  petSize,
  sort,
  pageNo,
}: {
  keyword?: string;
  areaCode?: string;
  contentTypeId?: string;
  pet?: string;
  petSize?: string;
  sort?: string;
  pageNo?: string;
}) {
  // 기본값: 서울 지역 (areaCode: "1")
  const defaultAreaCode = "1";
  const finalAreaCode = areaCode || defaultAreaCode;
  
  // contentTypeId 파싱 (쉼표로 구분된 다중 값 지원)
  const contentTypeIds = contentTypeId
    ? contentTypeId.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean)
    : [];
  
  const finalPageNo = pageNo ? parseInt(pageNo, 10) : PAGINATION_DEFAULTS.pageNo;
  const finalSort = sort || "modifiedtime";

  let allTours: TourItem[] = [];
  let hasError = false;
  let errorMessage: string | null = null;
  let totalCount = 0;

  // 검색 모드: keyword가 있으면 searchKeyword API 사용
  if (keyword && keyword.trim()) {
    const trimmedKeyword = keyword.trim();
    
    // 검색 API는 단일 contentTypeId만 지원하므로 첫 번째 타입만 사용
    const singleContentTypeId = contentTypeIds.length > 0 ? contentTypeIds[0] : undefined;
    
    const result = await searchKeyword(
      trimmedKeyword,
      finalAreaCode,
      singleContentTypeId,
      PAGINATION_DEFAULTS.numOfRows,
      finalPageNo,
      true // 서버 사이드 호출
    );

    if (!result.success) {
      return (
        <HomeLayout
          tours={[]}
          isLoading={false}
          error={result.error || "검색 중 오류가 발생했습니다."}
          searchKeyword={trimmedKeyword}
          areaCode={finalAreaCode}
          totalCount={0}
          currentPage={finalPageNo}
        />
      );
    }

    allTours = result.data || [];
    totalCount = result.totalCount || allTours.length;
  } else {
    // 일반 모드: 기존 getAreaBasedList 로직
    // 다중 타입 선택 처리
    if (contentTypeIds.length > 0) {
    // 각 타입별로 API 호출 후 결과 병합
    const promises = contentTypeIds.map((typeId) =>
      getAreaBasedList(
        finalAreaCode,
        typeId,
        PAGINATION_DEFAULTS.numOfRows,
        finalPageNo,
        true // 서버 사이드 호출
      )
    );

    const results = await Promise.all(promises);

    // 성공한 결과만 수집
    for (const result of results) {
      if (result.success && result.data) {
        allTours.push(...result.data);
        // totalCount는 첫 번째 성공한 결과에서 가져오거나 합산
        if (result.totalCount) {
          totalCount = Math.max(totalCount, result.totalCount);
        }
      } else {
        hasError = true;
        errorMessage = result.error || "일부 관광지 목록을 불러오는 중 오류가 발생했습니다.";
      }
    }

    // 중복 제거 (contentid 기준)
    const uniqueTours = Array.from(
      new Map(allTours.map((tour) => [tour.contentid, tour])).values()
    );
    allTours = uniqueTours;
    // 중복 제거 후 실제 개수로 조정 (정확하지 않을 수 있음)
    if (totalCount === 0) {
      totalCount = allTours.length;
    }
  } else {
    // 단일 타입 또는 타입 미선택
    const result = await getAreaBasedList(
      finalAreaCode,
      undefined,
      PAGINATION_DEFAULTS.numOfRows,
      finalPageNo,
      true // 서버 사이드 호출
    );

    if (!result.success) {
      return (
        <HomeLayout
          tours={[]}
          isLoading={false}
          error={result.error || "관광지 목록을 불러오는 중 오류가 발생했습니다."}
          areaCode={finalAreaCode}
          totalCount={0}
          currentPage={finalPageNo}
        />
      );
    }

    allTours = result.data || [];
    totalCount = result.totalCount || allTours.length;
    }
  }

  // 정렬 처리 (클라이언트 사이드) - 검색 모드와 일반 모드 모두 적용
  if (finalSort === "title") {
    // 이름순 정렬 (가나다순)
    allTours.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  } else {
    // 최신순 정렬 (modifiedtime DESC)
    allTours.sort((a, b) => {
      const timeA = new Date(a.modifiedtime).getTime();
      const timeB = new Date(b.modifiedtime).getTime();
      return timeB - timeA;
    });
  }

  // 에러 처리
  if (hasError && allTours.length === 0) {
    return (
      <HomeLayout
        tours={[]}
        isLoading={false}
        error={errorMessage || "관광지 목록을 불러오는 중 오류가 발생했습니다."}
        areaCode={finalAreaCode}
        totalCount={0}
        currentPage={finalPageNo}
      />
    );
  }

  // 데이터 표시 (지도 통합을 위해 HomeLayout 사용)
  return (
    <HomeLayout
      tours={allTours}
      isLoading={false}
      error={hasError ? errorMessage : null}
      searchKeyword={keyword?.trim() || undefined}
      areaCode={finalAreaCode}
      totalCount={totalCount}
      currentPage={finalPageNo}
    />
  );
}

/**
 * 홈페이지 컴포넌트
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const { keyword, areaCode, contentTypeId, pet, petSize, sort, pageNo } = params;

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {keyword ? "검색 결과" : "관광지 목록"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {keyword
            ? `검색어: "${keyword}"`
            : "전국의 다양한 관광지를 탐색해보세요."}
        </p>
      </div>

      {/* 필터 컴포넌트 */}
      <div className="mb-6">
        <TourFilters />
      </div>

      <Suspense
        fallback={
          <HomeLayout tours={[]} isLoading={true} error={null} areaCode={areaCode} />
        }
      >
        <TourListData
          keyword={keyword}
          areaCode={areaCode}
          contentTypeId={contentTypeId}
          pet={pet}
          petSize={petSize}
          sort={sort}
          pageNo={pageNo}
        />
      </Suspense>
    </main>
  );
}
