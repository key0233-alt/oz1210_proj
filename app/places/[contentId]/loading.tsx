/**
 * @file app/places/[contentId]/loading.tsx
 * @description 상세페이지 로딩 상태
 *
 * Suspense fallback으로 사용되는 로딩 컴포넌트입니다.
 * 스켈레톤 UI를 표시하여 사용자 경험을 개선합니다.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlaceLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 스켈레톤 */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-6 w-48" />
        </div>
      </header>

      {/* 메인 영역 스켈레톤 */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* 이미지 스켈레톤 */}
          <Skeleton className="aspect-video w-full rounded-lg" />

          {/* 제목 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-9 w-1/2" />
          </div>

          {/* 정보 카드 스켈레톤 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>

          {/* 개요 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

