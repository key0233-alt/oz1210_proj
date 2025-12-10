/**
 * @file app/instruments/page.tsx
 * @description Supabase 공식 문서 예시 페이지
 *
 * Supabase 공식 문서의 Next.js Quickstart 예시를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 *
 * 이 페이지는 Supabase에서 instruments 테이블의 데이터를 조회하여 표시합니다.
 * Server Component에서 Supabase 클라이언트를 사용하는 방법을 보여줍니다.
 */

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase.from("instruments").select();

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        <p className="font-semibold">오류 발생</p>
        <p>{error.message}</p>
        <p className="text-sm mt-2">
          instruments 테이블이 존재하지 않을 수 있습니다. Supabase Dashboard에서 테이블을 생성하거나
          마이그레이션을 실행해주세요.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p>데이터가 없습니다.</p>
        <p className="text-sm mt-2">
          Supabase Dashboard의 SQL Editor에서 다음 쿼리를 실행하여 샘플 데이터를 추가할 수 있습니다:
        </p>
        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
          {`INSERT INTO instruments (name)
VALUES ('violin'), ('viola'), ('cello');`}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {instruments.map((instrument: { id: number; name: string }) => (
        <div key={instrument.id} className="p-4 border rounded-lg">
          <p className="font-medium">{instrument.name}</p>
        </div>
      ))}
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Instruments</h1>
        <p className="text-muted-foreground mb-6">
          Supabase 공식 문서의 Next.js Quickstart 예시입니다. instruments 테이블의 데이터를 조회합니다.
        </p>

        <Suspense fallback={<div className="text-muted-foreground">로딩 중...</div>}>
          <InstrumentsData />
        </Suspense>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">참고:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>
              이 페이지는 Supabase 공식 문서의 예시를 기반으로 작성되었습니다.
            </li>
            <li>
              instruments 테이블이 없으면 Supabase Dashboard에서 생성하거나 마이그레이션을 실행하세요.
            </li>
            <li>
              RLS 정책이 활성화되어 있다면 적절한 정책을 설정해야 데이터를 조회할 수 있습니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

