/**
 * @file components/tour-detail/detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보(운영시간, 휴무일, 이용요금, 주차 정보 등)를 표시하는 컴포넌트입니다.
 * Server Component로 구현되어 있습니다.
 */

import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  Sparkles,
  Baby,
  PawPrint,
  Phone,
  Calendar,
  Info,
  CreditCard,
} from "lucide-react";
import { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  /** 관광지 운영 정보 */
  intro: TourIntro | null;
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
 * 관광지 운영 정보 섹션 컴포넌트
 */
export function DetailIntro({ intro }: DetailIntroProps) {
  // 운영 정보가 없으면 섹션을 표시하지 않음
  if (!intro) {
    return null;
  }

  const {
    usetime,
    restdate,
    usefee,
    parking,
    parkingfee,
    accomcount,
    expguide,
    babycarriage,
    chkpet,
    pet,
    expagerange,
    infocenter,
    reservation,
    discountinfo,
    refund,
  } = intro;

  // 표시할 정보가 있는지 확인
  const hasAnyInfo =
    usetime ||
    restdate ||
    usefee ||
    parking ||
    parkingfee ||
    accomcount ||
    expguide ||
    babycarriage ||
    chkpet ||
    pet ||
    expagerange ||
    infocenter ||
    reservation ||
    discountinfo ||
    refund;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <section className="space-y-4" aria-label="운영 정보">
      <h3 className="text-2xl font-bold">운영 정보</h3>

      <div className="space-y-3">
        {/* 운영시간 */}
        {usetime && (
          <InfoItem
            icon={Clock}
            label="운영시간"
            value={usetime}
            ariaLabel="운영시간 정보"
          />
        )}

        {/* 휴무일 */}
        {restdate && (
          <InfoItem
            icon={CalendarX}
            label="휴무일"
            value={restdate}
            ariaLabel="휴무일 정보"
          />
        )}

        {/* 이용요금 */}
        {usefee && (
          <InfoItem
            icon={DollarSign}
            label="이용요금"
            value={usefee}
            ariaLabel="이용요금 정보"
          />
        )}

        {/* 주차 가능 여부 */}
        {parking && (
          <InfoItem
            icon={Car}
            label="주차"
            value={parking}
            ariaLabel="주차 정보"
          />
        )}

        {/* 주차요금 */}
        {parkingfee && (
          <InfoItem
            icon={CreditCard}
            label="주차요금"
            value={parkingfee}
            ariaLabel="주차요금 정보"
          />
        )}

        {/* 수용인원 */}
        {accomcount && (
          <InfoItem
            icon={Users}
            label="수용인원"
            value={accomcount}
            ariaLabel="수용인원 정보"
          />
        )}

        {/* 체험 프로그램 */}
        {expguide && (
          <InfoItem
            icon={Sparkles}
            label="체험 프로그램"
            value={expguide}
            ariaLabel="체험 프로그램 정보"
          />
        )}

        {/* 체험가능연령 */}
        {expagerange && (
          <InfoItem
            icon={Calendar}
            label="체험가능연령"
            value={expagerange}
            ariaLabel="체험가능연령 정보"
          />
        )}

        {/* 유모차 대여 */}
        {babycarriage && (
          <InfoItem
            icon={Baby}
            label="유모차 대여"
            value={babycarriage}
            ariaLabel="유모차 대여 정보"
          />
        )}

        {/* 반려동물 동반 */}
        {(chkpet || pet) && (
          <InfoItem
            icon={PawPrint}
            label="반려동물 동반"
            value={chkpet || pet || ""}
            ariaLabel="반려동물 동반 정보"
          />
        )}

        {/* 문의처 */}
        {infocenter && (
          <InfoItem
            icon={Phone}
            label="문의처"
            value={infocenter}
            ariaLabel="문의처 정보"
          />
        )}

        {/* 예약안내 */}
        {reservation && (
          <InfoItem
            icon={Calendar}
            label="예약안내"
            value={reservation}
            ariaLabel="예약안내 정보"
          />
        )}

        {/* 할인정보 */}
        {discountinfo && (
          <InfoItem
            icon={DollarSign}
            label="할인정보"
            value={discountinfo}
            ariaLabel="할인정보"
          />
        )}

        {/* 취소/환불 안내 */}
        {refund && (
          <InfoItem
            icon={Info}
            label="취소/환불 안내"
            value={refund}
            ariaLabel="취소/환불 안내 정보"
          />
        )}
      </div>
    </section>
  );
}

