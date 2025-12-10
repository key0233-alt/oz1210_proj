/**
 * @file components/ui/loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 다양한 크기와 스타일의 로딩 인디케이터를 제공합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /** 크기 (sm, md, lg) */
  size?: "sm" | "md" | "lg";
  /** 텍스트 표시 여부 */
  text?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 전체 화면 중앙 정렬 여부 */
  fullScreen?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const textSizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * 로딩 스피너 컴포넌트
 */
export function Loading({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || "로딩 중"}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeMap[size],
          !text && className
        )}
        aria-hidden="true"
      />
      {text && (
        <p className={cn("text-muted-foreground", textSizeMap[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

