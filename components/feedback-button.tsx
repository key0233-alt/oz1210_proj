/**
 * @file components/feedback-button.tsx
 * @description 피드백 버튼 컴포넌트
 *
 * 고정 위치 플로팅 버튼으로, 클릭 시 피드백 모달을 엽니다.
 */

"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/feedback-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        aria-label="피드백 보내기"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">피드백 보내기</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>피드백 보내기</DialogTitle>
            <DialogDescription>
              버그 리포트, 기능 제안, 또는 기타 의견을 보내주세요.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

