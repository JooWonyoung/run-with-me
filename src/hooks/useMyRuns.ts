import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Database, Tables } from "@/types/supabase";

type RunHost = Pick<Tables<"User">, "id" | "nickname" | "profile_img">;

type RawRunWithHost = Tables<"Runs"> & { User: RunHost | null };

type RawApplicationRow = Tables<"Applications"> & {
  Runs: RawRunWithHost | null;
};

export type ApplicationWithRun = Tables<"Applications"> & {
  run: Tables<"Runs"> & { host: RunHost | null };
};

export type HistoryItem =
  | { kind: "hosted"; run: Tables<"Runs"> }
  | {
      kind: "participant";
      application: ApplicationWithRun;
      run: Tables<"Runs"> & { host: RunHost | null };
    };

export type MyRunsData = {
  user: Tables<"User">;
  upcomingHostedRuns: Tables<"Runs">[];
  upcomingParticipantRuns: ApplicationWithRun[];
  history: HistoryItem[];
  stats: { totalCount: number; totalDistanceKm: number };
};

export async function fetchMyRunsData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MyRunsData> {
  const now = new Date().toISOString();

  const [hostedResult, applicationsResult, userResult] = await Promise.all([
    supabase
      .from("Runs")
      .select("*")
      .eq("host_id", userId)
      .is("deleted_at", null)
      .order("meeting_at", { ascending: true }),
    supabase
      .from("Applications")
      .select("*, Runs(*, User(id, nickname, profile_img))")
      .eq("user_id", userId),
    supabase.from("User").select("*").eq("id", userId).single(),
  ]);

  if (hostedResult.error) throw new Error(hostedResult.error.message);
  if (applicationsResult.error)
    throw new Error(applicationsResult.error.message);
  if (userResult.error) throw new Error(userResult.error.message);

  const hostedRuns = hostedResult.data ?? [];
  const rawApplications = (applicationsResult.data ??
    []) as unknown as RawApplicationRow[];

  const validApplications: ApplicationWithRun[] = rawApplications
    .filter((a) => a.Runs !== null)
    .map((a) => ({
      ...a,
      run: { ...a.Runs!, host: a.Runs!.User ?? null },
    }));

  const upcomingHostedRuns = hostedRuns.filter((r) => r.meeting_at > now);
  const pastHostedRuns = hostedRuns.filter((r) => r.meeting_at <= now);
  const upcomingParticipantRuns = validApplications.filter(
    (a) => a.run.meeting_at > now
  );
  const pastParticipantRuns = validApplications.filter(
    (a) => a.run.meeting_at <= now
  );

  const history: HistoryItem[] = [
    ...pastHostedRuns.map((run) => ({ kind: "hosted" as const, run })),
    ...pastParticipantRuns.map((application) => ({
      kind: "participant" as const,
      application,
      run: application.run,
    })),
  ].sort(
    (a, b) =>
      new Date(b.run.meeting_at).getTime() -
      new Date(a.run.meeting_at).getTime()
  );

  const COUNTED_APPLICATION_STATUSES = new Set(["approved", "completed"]);

  const countableHistory = history.filter(
    (item) =>
      item.kind === "hosted" ||
      COUNTED_APPLICATION_STATUSES.has(item.application.status ?? "")
  );

  const totalDistanceKm = countableHistory.reduce(
    (sum, item) => sum + (item.run.target_distance_km ?? 0),
    0
  );

  return {
    user: userResult.data,
    upcomingHostedRuns,
    upcomingParticipantRuns,
    history,
    stats: { totalCount: countableHistory.length, totalDistanceKm },
  };
}

export const myRunsQueryKey = ["my-runs"] as const;

export function useMyRuns() {
  return useQuery({
    queryKey: myRunsQueryKey,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return fetchMyRunsData(supabase, user.id);
    },
  });
}
