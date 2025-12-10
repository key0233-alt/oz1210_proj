/**
 * @file components/tour-detail/gallery-client.tsx
 * @description 이미지 갤러리 클라이언트 컴포넌트
 *
 * 이미지 슬라이더와 모달의 상태 관리를 담당하는 Client Component입니다.
 */

"use client";

import { useState } from "react";
import { ImageSlider } from "./image-slider";
import { ImageModal } from "./image-modal";
import type { TourImage } from "@/lib/types/tour";

interface GalleryClientProps {
  /** 이미지 목록 */
  images: TourImage[];
  /** 관광지명 */
  title: string;
}

/**
 * 이미지 갤러리 클라이언트 컴포넌트
 */
export function GalleryClient({ images, title }: GalleryClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ImageSlider
        images={images}
        title={title}
        onImageClick={handleImageClick}
      />
      <ImageModal
        images={images}
        title={title}
        open={isModalOpen}
        onClose={handleCloseModal}
        initialIndex={selectedIndex}
      />
    </>
  );
}

