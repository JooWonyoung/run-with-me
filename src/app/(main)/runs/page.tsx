import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/server";
import { runsQueryKey } from "@/hooks/useRuns";
import { RunsList } from "./_components/RunsList";
import { CreateRunDialog } from "./_components/CreateRunDialog";

export default async function RunsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: runsQueryKey,
    queryFn: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("Runs")
        .select("*")
        .is("deleted_at", null)
        .order("meeting_at", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-screen-lg px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">러닝 모임</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              함께 달릴 모임을 찾아보세요
            </p>
          </div>
          <CreateRunDialog />
        </div>
        <RunsList />
      </main>
    </HydrationBoundary>
  );
}
