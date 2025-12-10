/**
 * @file components/tour-detail/detail-recommendations.tsx
 * @description 추천 관광지 섹션 컴포넌트
 *
 * 현재 관광지와 같은 지역 또는 같은 타입의 다른 관광지를 추천하는 컴포넌트입니다.
 * Server Component로 구현되어 있으며, 추천 관광지 데이터를 서버에서 미리 가져옵니다.
 */

import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourItem } from "@/lib/types/tour";
import { TourCard } from "@/components/tour-card";
import { SkeletonCardList } from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";

interface DetailRecommendationsProps {
  /** 현재 관광지 ID (제외할 관광지) */
  currentContentId: string;
  /** 지역 코드 */
  areaCode: string;
  /** 콘텐츠 타입 ID */
  contentTypeId: string;
  /** 섹션 제목 (기본값: "추천 관광지") */
  title?: string;
  /** 추천 개수 (기본값: 6) */
  maxCount?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 추천 관광지 섹션 컴포넌트
 */
export async function DetailRecommendations({
  currentContentId,
  areaCode,
  contentTypeId,
  title = "추천 관광지",
  maxCount = 6,
  className,
}: DetailRecommendationsProps) {
  // API 호출로 추천 관광지 조회
  // 같은 지역 + 같은 타입의 관광지를 조회 (현재 관광지 제외)
  const result = await getAreaBasedList(
    areaCode,
    Number(contentTypeId),
    10, // 최대 10개 조회 (현재 관광지 제외 후 6개 선택)
    1,
    true // 서버 사이드 호출
  );

  // 에러 발생 시 빈 상태로 처리 (선택 사항이므로 에러 메시지 표시 안 함)
  if (!result.success || !result.data) {
    return null;
  }

  // 현재 관광지 제외 및 최대 개수 제한
  const recommendations = result.data
    .filter((tour) => tour.contentid !== currentContentId)
    .slice(0, maxCount);

  // 추천 관광지가 없으면 표시하지 않음
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label="추천 관광지 섹션"
    >
      {/* 섹션 제목 */}
      <h2 className="text-2xl font-bold">{title}</h2>

      {/* 추천 관광지 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {recommendations.map((tour) => (
          <TourCard key={tour.contentid} tour={tour} />
        ))}
      </div>
    </section>
  );
}

/**
 * 추천 관광지 섹션 로딩 컴포넌트
 * Suspense fallback으로 사용
 */
export function DetailRecommendationsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <section
      className={cn("space-y-4", className)}
      aria-label="추천 관광지 섹션 (로딩 중)"
    >
      {/* 섹션 제목 스켈레톤 */}
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />

      {/* 카드 리스트 스켈레톤 */}
      <SkeletonCardList count={6} />
    </section>
  );
}

