/**
 * @file components/tour-filters/area-filter.tsx
 * @description 지역 필터 컴포넌트
 *
 * 시/도 단위 지역 선택 필터입니다.
 * getAreaCode API를 사용하여 지역 목록을 로드합니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAreaCode } from "@/lib/api/tour-api";
import { TourItem } from "@/lib/types/tour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 지역 필터 컴포넌트
 */
export function AreaFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [areas, setAreas] = useState<Array<{ code: string; name: string }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedAreaCode = searchParams.get("areaCode") || "";

  /**
   * 지역 목록 로드
   */
  useEffect(() => {
    async function loadAreas() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await getAreaCode(undefined, false);

        if (!result.success) {
          setError(result.error || "지역 목록을 불러올 수 없습니다.");
          return;
        }

        // TourItem에서 지역 코드와 이름 추출
        // areaCode2 API는 TourItem 구조를 반환하지만,
        // 지역 코드 정보만 포함합니다.
        // 실제 API 응답 구조에 따라 필드명이 다를 수 있으므로
        // 여러 가능성을 고려합니다.
        const areaList = (result.data || []).map((item: TourItem) => {
          // areacode 필드가 있으면 사용, 없으면 code 필드 확인
          const code = item.areacode || (item as any).code || "";
          // title 필드가 있으면 사용, 없으면 name 필드 확인
          const name = item.title || (item as any).name || `지역 ${code}`;
          return { code, name };
        });

        // 중복 제거 및 정렬
        const uniqueAreas = Array.from(
          new Map(areaList.map((area) => [area.code, area])).values()
        ).sort((a, b) => a.name.localeCompare(b.name, "ko"));

        setAreas(uniqueAreas);
      } catch (err) {
        setError("지역 목록을 불러오는 중 오류가 발생했습니다.");
        console.error("Failed to load areas:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAreas();
  }, []);

  /**
   * 지역 선택 변경 핸들러
   */
  const handleAreaChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "" || value === "all") {
      params.delete("areaCode");
    } else {
      params.set("areaCode", value);
    }

    // 페이지 번호 리셋
    params.delete("pageNo");

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="area-filter">지역</Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (
        <Select
          value={selectedAreaCode || "all"}
          onValueChange={handleAreaChange}
        >
          <SelectTrigger id="area-filter" className="w-full">
            <SelectValue placeholder="전체 지역" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.code} value={area.code}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

