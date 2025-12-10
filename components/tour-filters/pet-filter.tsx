/**
 * @file components/tour-filters/pet-filter.tsx
 * @description 반려동물 동반 가능 필터 컴포넌트
 *
 * 반려동물 동반 가능 여부 및 크기별 필터를 제공합니다.
 * MVP 2.5 기능으로, 기본 UI만 구현하고 필터링 로직은 향후 개선 예정입니다.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * 반려동물 크기 타입
 */
type PetSize = "small" | "medium" | "large";

/**
 * 반려동물 크기 라벨 매핑
 */
const PET_SIZE_LABELS: Record<PetSize, string> = {
  small: "소형",
  medium: "중형",
  large: "대형",
};

/**
 * 반려동물 필터 컴포넌트
 */
export function PetFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 반려동물 필터 상태 파싱
  const isPetEnabled = searchParams.get("pet") === "true";
  const selectedPetSizes = searchParams
    .get("petSize")
    ?.split(",")
    .filter(Boolean) as PetSize[] || [];

  /**
   * 반려동물 필터 토글 핸들러
   */
  const handlePetToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set("pet", "true");
    } else {
      params.delete("pet");
      params.delete("petSize"); // 반려동물 필터 해제 시 크기 필터도 제거
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  /**
   * 반려동물 크기 선택 변경 핸들러
   */
  const handlePetSizeChange = (size: PetSize, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    // 반려동물 필터가 활성화되어 있지 않으면 활성화
    if (!isPetEnabled) {
      params.set("pet", "true");
    }

    let newSelectedSizes: PetSize[];

    if (checked) {
      // 크기 추가
      newSelectedSizes = [...selectedPetSizes, size];
    } else {
      // 크기 제거
      newSelectedSizes = selectedPetSizes.filter((s) => s !== size);
    }

    // 모든 크기가 선택되었거나 아무것도 선택되지 않았으면 파라미터 제거
    if (newSelectedSizes.length === 0) {
      params.delete("petSize");
      // 크기가 없으면 반려동물 필터도 제거
      params.delete("pet");
    } else {
      params.set("petSize", newSelectedSizes.join(","));
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-3 rounded-md border bg-card p-3 lg:p-4">
      {/* 반려동물 동반 가능 토글 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🐾</span>
          <Label
            htmlFor="pet-filter"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            반려동물 동반 가능
          </Label>
        </div>
        <Switch
          id="pet-filter"
          checked={isPetEnabled}
          onCheckedChange={handlePetToggle}
        />
      </div>

      {/* 크기별 필터 (반려동물 필터가 활성화된 경우에만 표시) */}
      {isPetEnabled && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground">크기별 필터</Label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(PET_SIZE_LABELS) as PetSize[]).map((size) => {
              const isChecked = selectedPetSizes.includes(size);
              return (
                <div
                  key={size}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`pet-size-${size}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlePetSizeChange(size, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`pet-size-${size}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {PET_SIZE_LABELS[size]}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

