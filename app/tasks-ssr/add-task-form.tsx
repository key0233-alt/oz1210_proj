/**
 * @file app/tasks-ssr/add-task-form.tsx
 * @description Task 생성 폼 컴포넌트 (Client Component)
 *
 * Server Action을 사용하여 task를 생성하는 Client Component입니다.
 * Server Component와 함께 사용하여 하이브리드 렌더링을 구현합니다.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTask } from "./actions";

export default function AddTaskForm() {
  const [taskName, setTaskName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!taskName.trim() || isPending) return;

    startTransition(async () => {
      try {
        await addTask(taskName.trim());
        setTaskName("");
        // Server Component를 다시 렌더링하여 최신 데이터 표시
        router.refresh();
      } catch (error) {
        console.error("Error adding task:", error);
        alert("작업 추가에 실패했습니다.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          name="name"
          placeholder="새 작업 입력..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !taskName.trim()}>
          {isPending ? "추가 중..." : "추가"}
        </Button>
      </div>
    </form>
  );
}

