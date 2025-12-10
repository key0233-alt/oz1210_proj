/**
 * @file components/ui/skeleton-card.tsx
 * @description 카드 스켈레톤 컴포넌트
 *
 * 관광지 카드 로딩 상태를 표시하는 스켈레톤 UI입니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 카드 스켈레톤 컴포넌트
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        className
      )}
    >
      {/* 이미지 */}
      <Skeleton className="h-48 w-full rounded-md" />
      
      {/* 제목 */}
      <Skeleton className="h-6 w-3/4" />
      
      {/* 주소 */}
      <Skeleton className="h-4 w-full" />
      
      {/* 타입 뱃지 */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * 카드 리스트 스켈레톤 컴포넌트
 */
export function SkeletonCardList({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

