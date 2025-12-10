/**
 * @file components/ui/error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * 다양한 타입의 에러를 표시하고 재시도 기능을 제공합니다.
 */

import { AlertCircle, WifiOff, ServerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorType = "network" | "api" | "general";

interface ErrorProps {
  /** 에러 메시지 */
  message: string;
  /** 에러 타입 */
  type?: ErrorType;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 컴팩트 모드 (작은 크기) */
  compact?: boolean;
}

const iconMap = {
  network: WifiOff,
  api: ServerOff,
  general: AlertCircle,
};

const titleMap = {
  network: "네트워크 오류",
  api: "API 오류",
  general: "오류 발생",
};

/**
 * 에러 메시지 컴포넌트
 */
export function Error({
  message,
  type = "general",
  onRetry,
  retryText = "다시 시도",
  className,
  compact = false,
}: ErrorProps) {
  const Icon = iconMap[type];
  const title = titleMap[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-destructive/50 bg-destructive/10",
        compact && "p-4 gap-2",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2">
        <Icon
          className={cn(
            "text-destructive",
            compact ? "h-6 w-6" : "h-10 w-10"
          )}
          aria-hidden="true"
        />
        <h3
          className={cn(
            "font-semibold text-destructive",
            compact ? "text-sm" : "text-base"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-muted-foreground text-center",
            compact ? "text-sm" : "text-base"
          )}
        >
          {message}
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={compact ? "sm" : "default"}
          aria-label={retryText}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}

