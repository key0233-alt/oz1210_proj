/**
 * @file components/ui/skeleton-list.tsx
 * @description 리스트 스켈레톤 컴포넌트
 *
 * 리스트 로딩 상태를 표시하는 스켈레톤 UI입니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonListProps {
  /** 항목 개수 */
  count?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 리스트 스켈레톤 컴포넌트
 */
export function SkeletonList({
  count = 5,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

