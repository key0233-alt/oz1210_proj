/**
 * @file components/tour-detail/detail-pet-tour.tsx
 * @description 반려동물 동반 정보 섹션 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 * Server Component로 구현되어 있습니다.
 */

import {
  PawPrint,
  DollarSign,
  Car,
  Home,
  TreePine,
  Info,
  AlertCircle,
} from "lucide-react";
import { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  /** 반려동물 동반 정보 */
  petTour: PetTourInfo | null;
}

/**
 * 정보 항목 컴포넌트 (재사용)
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  ariaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ariaLabel?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className="whitespace-pre-line text-base leading-relaxed pl-6"
        aria-label={ariaLabel}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * 크기별 뱃지 컴포넌트
 */
function SizeBadge({ size }: { size: string }) {
  // 크기별 색상 매핑
  const getBadgeColor = (sizeText: string) => {
    const lowerSize = sizeText.toLowerCase();
    if (lowerSize.includes("소형") || lowerSize.includes("소")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (lowerSize.includes("중형") || lowerSize.includes("중")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
    if (lowerSize.includes("대형") || lowerSize.includes("대")) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeColor(size)}`}
    >
      {size}
    </span>
  );
}

/**
 * 반려동물 동반 정보 섹션 컴포넌트
 */
export function DetailPetTour({ petTour }: DetailPetTourProps) {
  // 반려동물 정보가 없으면 섹션을 표시하지 않음
  if (!petTour) {
    return null;
  }

  const {
    chkpetleash,
    chkpetsize,
    chkpetplace,
    chkpetfee,
    petinfo,
    parking,
  } = petTour;

  // 표시할 정보가 있는지 확인
  const hasAnyInfo =
    chkpetleash ||
    chkpetsize ||
    chkpetplace ||
    chkpetfee ||
    petinfo ||
    parking;

  if (!hasAnyInfo) {
    return null;
  }

  // 입장 가능 장소 파싱 (실내/실외 구분)
  const parsePlaceInfo = (place?: string) => {
    if (!place) return null;
    const lowerPlace = place.toLowerCase();
    const isIndoor = lowerPlace.includes("실내") || lowerPlace.includes("내부");
    const isOutdoor = lowerPlace.includes("실외") || lowerPlace.includes("외부");
    return { isIndoor, isOutdoor, text: place };
  };

  const placeInfo = parsePlaceInfo(chkpetplace);

  return (
    <section className="space-y-4" aria-label="반려동물 동반 정보">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <PawPrint className="h-6 w-6" aria-hidden="true" />
        반려동물 동반 정보
      </h3>

      <div className="space-y-3">
        {/* 목줄 착용 여부 */}
        {chkpetleash && (
          <InfoItem
            icon={AlertCircle}
            label="목줄 착용"
            value={chkpetleash}
            ariaLabel="목줄 착용 정보"
          />
        )}

        {/* 반려동물 크기 제한 */}
        {chkpetsize && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">크기 제한</p>
            </div>
            <div className="pl-6">
              <div className="flex flex-wrap items-center gap-2">
                {chkpetsize.split(/[,，、]/).map((size, index) => (
                  <SizeBadge key={index} size={size.trim()} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 입장 가능 장소 */}
        {chkpetplace && placeInfo && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {placeInfo.isIndoor && placeInfo.isOutdoor ? (
                <Home className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              ) : placeInfo.isIndoor ? (
                <Home className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              ) : (
                <TreePine className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
              <p className="text-sm font-medium text-muted-foreground">입장 가능 장소</p>
            </div>
            <div className="pl-6">
              <div className="flex flex-wrap items-center gap-2">
                {placeInfo.isIndoor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Home className="h-3 w-3" />
                    실내 가능
                  </span>
                )}
                {placeInfo.isOutdoor && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <TreePine className="h-3 w-3" />
                    실외 가능
                  </span>
                )}
                {!placeInfo.isIndoor && !placeInfo.isOutdoor && (
                  <p className="text-base leading-relaxed">{placeInfo.text}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 추가 요금 */}
        {chkpetfee && (
          <InfoItem
            icon={DollarSign}
            label="추가 요금"
            value={chkpetfee}
            ariaLabel="반려동물 동반 추가 요금 정보"
          />
        )}

        {/* 주차장 정보 */}
        {parking && (
          <InfoItem
            icon={Car}
            label="주차장 정보"
            value={parking}
            ariaLabel="반려동물 하차 공간 및 주차장 정보"
          />
        )}

        {/* 기타 반려동물 정보 */}
        {petinfo && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">기타 정보</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 pl-6">
              <p
                className="whitespace-pre-line text-base leading-relaxed"
                aria-label="기타 반려동물 정보"
              >
                {petinfo}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

