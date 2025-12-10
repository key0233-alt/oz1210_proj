/**
 * @file components/tour-detail/share-button.tsx
 * @description URL 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지 URL을 클립보드에 복사하는 기능을 제공하는 Client Component입니다.
 */

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess, toastError } from "@/lib/utils/toast";

interface ShareButtonProps {
  /** 공유할 관광지 contentId */
  contentId: string;
}

/**
 * URL 공유 버튼 컴포넌트
 */
export function ShareButton({ contentId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // 절대 URL 생성
    const url = `${window.location.origin}/places/${contentId}`;

    try {
      // HTTPS 환경 확인
      if (!window.isSecureContext) {
        throw new Error("HTTPS 환경이 아닙니다");
      }

      // 클립보드 API 사용
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toastSuccess("URL이 복사되었습니다");

      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      // 폴백: 구식 방법 시도
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          toastSuccess("URL이 복사되었습니다");
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        } else {
          throw new Error("복사 명령 실행 실패");
        }
      } catch (fallbackError) {
        console.error("URL 복사 폴백 실패:", fallbackError);
        toastError("URL 복사에 실패했습니다", "수동으로 URL을 복사해주세요");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0"
      onClick={handleShare}
      aria-label={copied ? "URL 복사 완료" : "URL 공유"}
      title={copied ? "URL 복사 완료" : "URL 공유"}
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Share2 className="h-5 w-5" />
      )}
    </Button>
  );
}

