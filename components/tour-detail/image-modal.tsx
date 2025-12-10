/**
 * @file components/tour-detail/image-modal.tsx
 * @description 전체화면 이미지 모달 컴포넌트
 *
 * 이미지를 클릭하면 전체화면으로 확대하여 보여주는 모달입니다.
 * 모달 내에서도 이미지 슬라이드가 가능하며, 키보드 네비게이션을 지원합니다.
 */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TourImage } from "@/lib/types/tour";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";

interface ImageModalProps {
  /** 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (alt 텍스트용) */
  title: string;
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 초기 이미지 인덱스 */
  initialIndex?: number;
}

/**
 * 전체화면 이미지 모달 컴포넌트
 */
export function ImageModal({
  images,
  title,
  open,
  onClose,
  initialIndex = 0,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 모달이 열릴 때 초기 인덱스 설정
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // 키보드 네비게이션 (ESC, 좌우 화살표)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length, onClose]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-0 shadow-none"
        aria-label="이미지 전체화면 보기"
      >
        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground"
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* 이미지 슬라이더 */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Swiper
            modules={[Navigation, Keyboard]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              prevEl: ".modal-swiper-button-prev",
              nextEl: ".modal-swiper-button-next",
            }}
            keyboard={{
              enabled: true,
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            initialSlide={initialIndex}
            className="w-full h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={`${image.contentid}-${index}`}>
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                    <Image
                      src={image.originimgurl || image.smallimageurl}
                      alt={image.imgname || `${title} 이미지 ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="95vw"
                      priority={index === initialIndex}
                      quality={90}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 네비게이션 버튼 (이미지가 2개 이상일 때만 표시) */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "modal-swiper-button-prev absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "modal-swiper-button-next absolute right-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* 이미지 인덱스 표시 (이미지가 2개 이상일 때만) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 text-sm text-foreground">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

