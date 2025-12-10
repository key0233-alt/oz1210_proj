/**
 * @file components/tour-detail/address-copy-button.tsx
 * @description 주소 복사 버튼 컴포넌트
 *
 * 주소를 클립보드에 복사하는 기능을 제공하는 Client Component입니다.
 */

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/lib/utils/toast";

interface AddressCopyButtonProps {
  /** 복사할 주소 */
  address: string;
}

/**
 * 주소 복사 버튼 컴포넌트
 */
export function AddressCopyButton({ address }: AddressCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 클립보드 API 사용
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toastSuccess("주소가 복사되었습니다");

      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
      // 폴백: 구식 방법 시도
      try {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        toastSuccess("주소가 복사되었습니다");
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error("주소 복사 폴백 실패:", fallbackError);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={handleCopy}
      aria-label={copied ? "복사 완료" : "주소 복사"}
      title={copied ? "복사 완료" : "주소 복사"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

