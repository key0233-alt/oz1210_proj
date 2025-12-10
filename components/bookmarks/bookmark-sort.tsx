/**
 * @file components/bookmarks/bookmark-sort.tsx
 * @description 북마크 정렬 옵션 컴포넌트
 *
 * 북마크 목록을 정렬하는 옵션을 제공하는 컴포넌트입니다.
 * 최신순, 이름순, 지역별 정렬을 지원합니다.
 *
 * @dependencies
 * - @/components/ui/select: Select 컴포넌트
 * - @/app/bookmarks/page: SortOption 타입
 */

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/app/bookmarks/page";

interface BookmarkSortProps {
  /** 현재 선택된 정렬 옵션 */
  value: SortOption;
  /** 정렬 옵션 변경 핸들러 */
  onChange: (value: SortOption) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 정렬 옵션 라벨 맵
 */
const sortLabels: Record<SortOption, string> = {
  latest: "최신순",
  name: "이름순",
  region: "지역별",
};

/**
 * 북마크 정렬 컴포넌트
 */
export function BookmarkSort({
  value,
  onChange,
  className,
}: BookmarkSortProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="bookmark-sort" className="text-sm font-medium">
        정렬:
      </label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as SortOption)}
      >
        <SelectTrigger id="bookmark-sort" className="w-[140px]">
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">{sortLabels.latest}</SelectItem>
          <SelectItem value="name">{sortLabels.name}</SelectItem>
          <SelectItem value="region">{sortLabels.region}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

