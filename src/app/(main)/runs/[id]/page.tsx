import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { runQueryKey, RunWithHost } from "@/hooks/useRun";
import { RunDetailClient } from "./_components/RunDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("Runs")
    .select("title, description")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!data) return { title: "런윗미 - 러닝 모임" };

  return {
    title: `${data.title} | 런윗미`,
    description: data.description?.slice(0, 160),
  };
}

export default async function RunDetailPage({ params }: Props) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: runQueryKey(id),
    queryFn: async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("Runs")
        .select("*, User(*)")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) return null;
      return data as RunWithHost;
    },
  });

  const run = queryClient.getQueryData<RunWithHost | null>(runQueryKey(id));
  if (!run) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RunDetailClient id={id} />
    </HydrationBoundary>
  );
}
