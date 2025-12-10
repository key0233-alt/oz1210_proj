/**
 * @file components/tour-filters/type-filter.tsx
 * @description 관광 타입 필터 컴포넌트
 *
 * 관광 타입 다중 선택 필터입니다.
 * TOUR_CONTENT_TYPES 상수를 사용하여 타입 목록을 표시합니다.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TOUR_CONTENT_TYPES, TOUR_CONTENT_TYPE_IDS } from "@/lib/constants/tour-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * 관광 타입 필터 컴포넌트
 */
export function TypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 선택된 타입 ID들 파싱
  const selectedTypeIds = searchParams
    .get("contentTypeId")
    ?.split(",")
    .filter(Boolean)
    .map(Number) || [];

  const isAllSelected =
    selectedTypeIds.length === 0 ||
    selectedTypeIds.length === TOUR_CONTENT_TYPE_IDS.length;

  /**
   * 타입 선택 변경 핸들러
   */
  const handleTypeChange = (typeId: number, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    let newSelectedIds: number[];

    if (checked) {
      // 타입 추가
      newSelectedIds = [...selectedTypeIds, typeId];
    } else {
      // 타입 제거
      newSelectedIds = selectedTypeIds.filter((id) => id !== typeId);
    }

    // 모든 타입이 선택되었거나 아무것도 선택되지 않았으면 파라미터 제거
    if (
      newSelectedIds.length === 0 ||
      newSelectedIds.length === TOUR_CONTENT_TYPE_IDS.length
    ) {
      params.delete("contentTypeId");
    } else {
      params.set("contentTypeId", newSelectedIds.join(","));
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      // 모든 타입 선택
      params.set("contentTypeId", TOUR_CONTENT_TYPE_IDS.join(","));
    } else {
      // 전체 해제
      params.delete("contentTypeId");
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <Label>관광 타입</Label>
      <div className="space-y-3 rounded-md border bg-card p-3 lg:p-4">
        {/* 전체 선택 */}
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id="type-all"
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label
            htmlFor="type-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            전체
          </Label>
        </div>

        {/* 타입별 체크박스 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TOUR_CONTENT_TYPE_IDS.map((typeId) => {
            const isChecked = selectedTypeIds.includes(typeId);
            return (
              <div
                key={typeId}
                className="flex items-center space-x-2 min-w-0"
              >
                <Checkbox
                  id={`type-${typeId}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleTypeChange(typeId, checked as boolean)
                  }
                  className="shrink-0"
                />
                <Label
                  htmlFor={`type-${typeId}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer truncate"
                >
                  {TOUR_CONTENT_TYPES[typeId]}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

