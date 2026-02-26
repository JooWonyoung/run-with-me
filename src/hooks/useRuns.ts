import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function fetchRuns() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Runs")
    .select("*")
    .is("deleted_at", null)
    .order("meeting_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export const runsQueryKey = ["runs"] as const;

export function useRuns() {
  return useQuery({
    queryKey: runsQueryKey,
    queryFn: fetchRuns,
  });
}
