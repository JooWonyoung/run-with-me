import { Footprints } from 'lucide-react'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/server";
import { runsQueryKey } from "@/hooks/useRuns";
import { Button } from "@/components/ui/button";
import { LoginLink } from "@/components/LoginLink";
import { RunsList } from "./_components/RunsList";

export default async function RunsPage() {
  const queryClient = new QueryClient();
  const supabase = await createClient();

  const [, { data: { user } }] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: runsQueryKey,
      queryFn: async () => {
        const { data, error } = await supabase
          .from("Runs")
          .select("*")
          .is("deleted_at", null)
          .order("meeting_at", { ascending: true });

        if (error) throw new Error(error.message);
        return data;
      },
    }),
    supabase.auth.getUser(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-screen-lg px-4 py-10">

        {/* 비로그인 유저 넛지 배너 */}
        {!user && (
          <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-blue-50 px-5 py-4 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-blue-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50">
                <Footprints className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  나만의 러닝 모임을 만들어보세요
                </p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  로그인하고 직접 러닝 크루를 이끌어보세요.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-orange-600 text-white hover:bg-orange-700"
            >
              <LoginLink>로그인하기</LoginLink>
            </Button>
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">러닝 모임</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            함께 달릴 모임을 찾아보세요
          </p>
        </div>

        <RunsList />
      </div>
    </HydrationBoundary>
  );
}
