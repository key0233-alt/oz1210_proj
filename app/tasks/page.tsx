/**
 * @file app/tasks/page.tsx
 * @description Clerk + Supabase 통합 예시 페이지 (Client-side)
 *
 * 이 페이지는 Clerk와 Supabase의 네이티브 통합을 보여주는 예시입니다.
 * 사용자는 자신의 tasks를 조회하고 생성할 수 있습니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 상태 확인
 * 2. Supabase를 통한 tasks 조회 및 생성
 * 3. RLS 정책을 통한 사용자별 데이터 격리
 *
 * 참고: https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clerk 인증 상태 확인
  const { user } = useUser();
  const { session } = useSession();

  // Clerk 토큰을 사용하는 Supabase 클라이언트 생성
  const supabase = useClerkSupabaseClient();

  // Tasks 로드
  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("tasks").select().order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading tasks:", error);
        } else {
          setTasks(data || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, supabase]);

  // Task 생성
  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          name: name.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        alert("작업 생성에 실패했습니다: " + error.message);
      } else {
        // 새로 생성된 task를 목록에 추가
        setTasks((prev) => [data, ...prev]);
        setName("");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("예상치 못한 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Tasks</h1>
          <p className="text-muted-foreground">작업을 관리하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tasks</h1>

        {/* Task 생성 폼 */}
        <form onSubmit={createTask} className="mb-8 space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              name="name"
              placeholder="새 작업 입력..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>

        {/* Tasks 목록 */}
        {loading && <p className="text-muted-foreground">로딩 중...</p>}

        {!loading && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <p className="font-medium">{task.name}</p>
                <p className="text-sm text-muted-foreground">
                  생성일: {new Date(task.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-muted-foreground text-center py-8">작업이 없습니다. 위에서 새 작업을 추가해보세요.</p>
        )}
      </div>
    </div>
  );
}

