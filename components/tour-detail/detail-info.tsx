/**
 * @file components/tour-detail/detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보(이름, 이미지, 주소, 전화번호, 홈페이지, 개요 등)를 표시하는 컴포넌트입니다.
 * Server Component로 구현되어 있으며, 주소 복사 기능은 Client Component로 분리되어 있습니다.
 */

import Image from "next/image";
import { TourDetail } from "@/lib/types/tour";
import { getContentTypeNameById } from "@/lib/constants/tour-types";
import { AddressCopyButton } from "./address-copy-button";

interface DetailInfoProps {
  /** 관광지 상세 정보 */
  detail: TourDetail;
}

/**
 * 관광지 기본 정보 섹션 컴포넌트
 */
export function DetailInfo({ detail }: DetailInfoProps) {
  const {
    title,
    firstimage,
    addr1,
    addr2,
    tel,
    homepage,
    overview,
    contenttypeid,
    cat1,
    cat2,
    cat3,
  } = detail;

  // 관광 타입명 가져오기
  const typeName = getContentTypeNameById(contenttypeid);

  // 주소 조합
  const address = addr2 ? `${addr1} ${addr2}` : addr1;

  // 카테고리 배열 생성 (있는 것만)
  const categories = [cat1, cat2, cat3].filter(
    (cat): cat is string => Boolean(cat)
  );

  return (
    <section className="space-y-4" aria-label="기본 정보">
      {/* 대표 이미지 */}
      {firstimage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={firstimage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            priority
          />
        </div>
      )}

      {/* 관광지명 */}
      <h2 className="text-3xl font-bold">{title}</h2>

      {/* 관광 타입 및 카테고리 뱃지 */}
      {(typeName || categories.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* 관광 타입 뱃지 */}
          {typeName && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {typeName}
            </span>
          )}
          {/* 카테고리 뱃지 */}
          {categories.map((category, index) => (
            <span
              key={`${category}-${index}`}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* 주소 */}
      {addr1 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">주소</p>
          <div className="flex items-center gap-2">
            <p className="text-base">{address}</p>
            <AddressCopyButton address={address} />
          </div>
        </div>
      )}

      {/* 전화번호 */}
      {tel && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">전화번호</p>
          <a
            href={`tel:${tel}`}
            className="text-base text-primary hover:underline"
            aria-label={`${tel}로 전화하기`}
          >
            {tel}
          </a>
        </div>
      )}

      {/* 홈페이지 */}
      {homepage && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">홈페이지</p>
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-primary hover:underline break-all"
            aria-label={`${title} 홈페이지 열기 (새 창)`}
          >
            {homepage}
          </a>
        </div>
      )}

      {/* 개요 */}
      {overview && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">개요</p>
          <p className="whitespace-pre-line text-base leading-relaxed">
            {overview}
          </p>
        </div>
      )}
    </section>
  );
}

