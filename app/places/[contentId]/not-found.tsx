/**
 * @file app/places/[contentId]/not-found.tsx
 * @description 상세페이지 404 처리
 *
 * 존재하지 않는 관광지 ID로 접근했을 때 표시되는 페이지입니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";

export default function PlaceNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">관광지를 찾을 수 없습니다</h1>
          <p className="text-lg text-muted-foreground">
            요청하신 관광지 정보가 존재하지 않거나 삭제되었습니다.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Search className="mr-2 h-4 w-4" />
              관광지 검색하기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

