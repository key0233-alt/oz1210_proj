/**
 * @file components/tour-filters/sort-filter.tsx
 * @description 정렬 옵션 필터 컴포넌트
 *
 * 관광지 목록 정렬 옵션을 제공합니다.
 * - 최신순 (modifiedtime DESC)
 * - 이름순 (title ASC, 가나다순)
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * 정렬 옵션 타입
 */
type SortOption = "modifiedtime" | "title";

/**
 * 정렬 옵션 라벨 매핑
 */
const SORT_OPTIONS: Record<SortOption, string> = {
  modifiedtime: "최신순",
  title: "이름순",
};

/**
 * 정렬 필터 컴포넌트
 */
export function SortFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedSort =
    (searchParams.get("sort") as SortOption) || "modifiedtime";

  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "modifiedtime") {
      // 기본값이면 파라미터 제거
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sort-filter">정렬</Label>
      <Select value={selectedSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-filter" className="w-full lg:w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

