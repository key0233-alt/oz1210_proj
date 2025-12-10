/**
 * @file components/tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 썸네일 이미지, 관광지명, 주소, 타입 뱃지를 표시하고,
 * 클릭 시 상세페이지로 이동합니다.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TourItem } from "@/lib/types/tour";
import { getContentTypeNameById } from "@/lib/constants/tour-types";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * 공개 이미지 placeholder 사용
 */
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format";

/**
 * 관광지 카드 컴포넌트
 */
export function TourCard({ tour, className }: TourCardProps) {
  const {
    contentid,
    title,
    addr1,
    addr2,
    firstimage,
    contenttypeid,
  } = tour;

  // 이미지 에러 상태 관리
  const [imageError, setImageError] = useState(false);

  // 관광 타입명 가져오기
  const typeName = getContentTypeNameById(contenttypeid) || "관광지";

  // 이미지 URL 결정 (없거나 에러 발생 시 기본 이미지)
  const imageUrl =
    imageError || !firstimage ? DEFAULT_IMAGE_URL : firstimage;

  // 주소 조합
  const address = addr2 ? `${addr1} ${addr2}` : addr1;

  return (
    <Link
      href={`/places/${contentid}`}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => {
            // 이미지 로드 실패 시 기본 이미지로 대체
            setImageError(true);
          }}
        />
      </div>

      {/* 카드 내용 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* 주소 */}
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {address}
        </p>

        {/* 관광 타입 뱃지 */}
        <div className="mt-auto flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {typeName}
          </span>
        </div>
      </div>
    </Link>
  );
}

