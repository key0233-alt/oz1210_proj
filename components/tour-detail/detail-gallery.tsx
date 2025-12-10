/**
 * @file components/tour-detail/detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지 목록을 표시하는 갤러리 컴포넌트입니다.
 * Server Component로 구현되어 있으며, 이미지 슬라이더와 전체화면 모달을 제공합니다.
 */

import { getDetailImage } from "@/lib/api/tour-api";
import { ImageSlider } from "./image-slider";
import { ImageModal } from "./image-modal";
import { GalleryClient } from "./gallery-client";

interface DetailGalleryProps {
  /** 콘텐츠 ID */
  contentId: string;
  /** 관광지명 (alt 텍스트용) */
  title: string;
}

/**
 * 관광지 이미지 갤러리 컴포넌트 (Server Component)
 */
export async function DetailGallery({
  contentId,
  title,
}: DetailGalleryProps) {
  // 이미지 목록 조회
  const result = await getDetailImage(contentId, true);

  // 이미지가 없거나 에러 발생 시 null 반환
  if (!result.success || !result.data || result.data.length === 0) {
    return null;
  }

  const images = result.data;

  return (
    <section className="space-y-4" aria-label="이미지 갤러리">
      <h3 className="text-xl font-semibold">이미지 갤러리</h3>
      <GalleryClient images={images} title={title} />
    </section>
  );
}

