import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";

export type RunWithHost = Tables<"Runs"> & {
  User: Tables<"User"> | null;
};

export function runQueryKey(id: string) {
  return ["runs", id] as const;
}

async function fetchRun(id: string): Promise<RunWithHost> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Runs")
    .select("*, User(*)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) throw new Error(error.message);
  return data as RunWithHost;
}

export function useRun(id: string) {
  return useQuery({
    queryKey: runQueryKey(id),
    queryFn: () => fetchRun(id),
  });
}
