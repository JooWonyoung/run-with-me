import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/server";
import { myRunsQueryKey, fetchMyRunsData } from "@/hooks/useMyRuns";
import { MyRunsClient } from "./_components/MyRunsClient";

export default async function MyRunsPage() {
  const queryClient = new QueryClient();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await queryClient.prefetchQuery({
      queryKey: myRunsQueryKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryFn: () => fetchMyRunsData(supabase as any, user.id),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="mx-auto max-w-screen-md px-4 py-6">
        <MyRunsClient />
      </div>
    </HydrationBoundary>
  );
}
