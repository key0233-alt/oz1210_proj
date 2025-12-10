/**
 * @file app/tasks-ssr/page.tsx
 * @description Clerk + Supabase 통합 예시 페이지 (Server-side)
 *
 * 이 페이지는 Server Component에서 Clerk와 Supabase를 사용하는 예시입니다.
 * Server-side rendering을 통해 초기 로딩 성능을 향상시킵니다.
 *
 * 주요 기능:
 * 1. Server Component에서 Clerk 인증 확인
 * 2. Supabase를 통한 tasks 조회
 * 3. Server Action을 통한 task 생성
 *
 * 참고: https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import AddTaskForm from "./add-task-form";

interface Task {
  id: number;
  name: string;
  user_id: string;
  created_at: string;
}

export default async function TasksSSRPage() {
  // Server Component에서 인증 확인
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 사용자 정보 가져오기 (선택사항)
  const user = await currentUser();

  // Clerk 토큰을 사용하는 Supabase 클라이언트 생성
  const supabase = createClerkSupabaseClient();

  // Tasks 조회
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading tasks:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Tasks (Server-side)</h1>
        {user && (
          <p className="text-muted-foreground mb-6">
            안녕하세요, {user.firstName || user.emailAddresses[0]?.emailAddress}님!
          </p>
        )}

        {/* Task 생성 폼 (Client Component) */}
        <AddTaskForm />

        {/* Tasks 목록 */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            오류: {error.message}
          </div>
        )}

        {tasks && tasks.length > 0 ? (
          <div className="space-y-2 mt-8">
            {tasks.map((task: Task) => (
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
        ) : (
          <p className="text-muted-foreground text-center py-8 mt-8">
            작업이 없습니다. 위에서 새 작업을 추가해보세요.
          </p>
        )}
      </div>
    </div>
  );
}

