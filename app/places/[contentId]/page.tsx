/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세페이지
 *
 * 한국관광공사 API를 활용하여 관광지 상세 정보를 표시하는 페이지입니다.
 * Server Component로 구현되어 초기 데이터를 서버에서 가져옵니다.
 */

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDetailCommon, getDetailIntro } from "@/lib/api/tour-api";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { TourDetail } from "@/lib/types/tour";

interface PlacePageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 동적 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PlacePageProps): Promise<Metadata> {
  const { contentId } = await params;
  const result = await getDetailCommon(contentId, true);

  if (!result.success || !result.data) {
    return {
      title: "관광지 정보 - My Trip",
      description: "관광지 상세 정보를 확인하세요.",
    };
  }

  const detail = result.data;
  const description =
    detail.overview?.substring(0, 100).replace(/\s+/g, " ") || "관광지 상세 정보";

  return {
    title: `${detail.title} - My Trip`,
    description,
    openGraph: {
      title: detail.title,
      description,
      images: detail.firstimage ? [{ url: detail.firstimage }] : [],
      url: `/places/${contentId}`,
      type: "website",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: detail.title,
      description,
      images: detail.firstimage ? [detail.firstimage] : [],
    },
  };
}

/**
 * 관광지 상세페이지
 */
export default async function PlacePage({ params }: PlacePageProps) {
  const { contentId } = await params;

  // API 호출로 기본 정보 조회
  const result = await getDetailCommon(contentId, true);

  // 데이터가 없거나 에러 발생 시 404 페이지로 리다이렉트
  if (!result.success || !result.data) {
    notFound();
  }

  const detail: TourDetail = result.data;

  // 운영 정보 조회 (contenttypeid 필요)
  const contentTypeId = Number(detail.contenttypeid);
  const introResult = await getDetailIntro(
    contentId,
    contentTypeId,
    true
  );

  // 운영 정보는 없어도 페이지는 표시 (에러는 무시)
  const intro = introResult.success ? introResult.data : null;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 영역: 뒤로가기 버튼 */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="truncate text-lg font-semibold md:text-xl">
            {detail.title}
          </h1>
        </div>
      </header>

      {/* 메인 영역 */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 기본 정보 섹션 */}
          <DetailInfo detail={detail} />

          {/* 운영 정보 섹션 */}
          <DetailIntro intro={intro} />

          {/* 추가 섹션들은 다음 단계에서 구현 */}
          <div className="text-center text-muted-foreground">
            <p>추가 정보 섹션은 다음 단계에서 구현됩니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

