/**
 * @file components/tour-detail/image-slider.tsx
 * @description 이미지 슬라이더 컴포넌트
 *
 * Swiper.js를 사용하여 이미지 슬라이드 기능을 제공하는 Client Component입니다.
 * 터치 제스처, 네비게이션 버튼, 반응형 디자인을 지원합니다.
 */

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TourImage } from "@/lib/types/tour";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ImageSliderProps {
  /** 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (alt 텍스트용) */
  title: string;
  /** 이미지 클릭 핸들러 (전체화면 모달 열기) */
  onImageClick?: (index: number) => void;
  /** 초기 슬라이드 인덱스 */
  initialSlide?: number;
}

/**
 * 이미지 슬라이더 컴포넌트
 */
export function ImageSlider({
  images,
  title,
  onImageClick,
  initialSlide = 0,
}: ImageSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <div className="relative w-full" aria-label="이미지 갤러리">
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        keyboard={{
          enabled: true,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        initialSlide={initialSlide}
        className="w-full"
        breakpoints={{
          640: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 2.5,
            spaceBetween: 24,
          },
        }}
        // 모바일 터치 최적화
        touchEventsTarget="container"
        touchRatio={1}
        threshold={10}
      >
        {images.map((image, index) => {
          const hasError = imageErrors.has(index);
          return (
            <SwiperSlide key={`${image.contentid}-${index}`}>
              <div
                className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-pointer group"
                onClick={() => onImageClick?.(index)}
                role="button"
                tabIndex={0}
                aria-label={`${title} 이미지 ${index + 1} 보기`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onImageClick?.(index);
                  }
                }}
              >
                {!hasError ? (
                  <Image
                    src={image.originimgurl || image.smallimageurl}
                    alt={image.imgname || `${title} 이미지 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 40vw, 33vw"
                    loading={index < 3 ? "eager" : "lazy"}
                    quality={80}
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">이미지를 불러올 수 없습니다</p>
                  </div>
                )}
              {/* 호버 시 확대 아이콘 표시 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="rounded-full bg-white/90 p-2">
                    <svg
                      className="h-6 w-6 text-gray-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
          );
        })}
      </Swiper>

      {/* 커스텀 네비게이션 버튼 */}
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "swiper-button-prev-custom absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hidden sm:flex" // 모바일에서는 숨김 (터치 제스처 사용)
            )}
            aria-label="이전 이미지"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "swiper-button-next-custom absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hidden sm:flex" // 모바일에서는 숨김 (터치 제스처 사용)
            )}
            aria-label="다음 이미지"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  );
}

