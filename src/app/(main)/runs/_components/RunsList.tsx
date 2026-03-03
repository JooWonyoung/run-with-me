"use client";

import Link from "next/link";
import { addWeeks, endOfWeek, isWithinInterval, startOfWeek } from "date-fns";
import { Loader2 } from "lucide-react";

import { RunCard } from "@/components/runs/RunCard";
import { useRuns } from "@/hooks/useRuns";
import type { Tables } from "@/types/supabase";

type Run = Tables<"Runs">;

interface RunGroup {
  label: string;
  runs: Run[];
}

function groupRunsByDate(runs: Run[]): RunGroup[] {
  const now = new Date();
  const weekOptions = { weekStartsOn: 1 } as const;

  const thisWeekInterval = {
    start: startOfWeek(now, weekOptions),
    end: endOfWeek(now, weekOptions),
  };
  const nextWeekInterval = {
    start: startOfWeek(addWeeks(now, 1), weekOptions),
    end: endOfWeek(addWeeks(now, 1), weekOptions),
  };

  const thisWeek: Run[] = [];
  const nextWeek: Run[] = [];
  const upcoming: Run[] = [];

  for (const run of runs) {
    const date = new Date(run.meeting_at);
    if (isWithinInterval(date, thisWeekInterval)) {
      thisWeek.push(run);
    } else if (isWithinInterval(date, nextWeekInterval)) {
      nextWeek.push(run);
    } else if (date > now) {
      upcoming.push(run);
    }
  }

  return [
    { label: "이번 주", runs: thisWeek },
    { label: "다음 주", runs: nextWeek },
    { label: "다가오는 모임", runs: upcoming },
  ].filter((group) => group.runs.length > 0);
}

export function RunsList() {
  const { data: runs, isPending, isError, error } = useRuns();

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </p>
      </div>
    );
  }

  const groups = groupRunsByDate(runs ?? []);

  if (groups.length === 0) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-medium text-foreground">
          아직 예정된 모임이 없어요
        </p>
        <p className="text-sm text-muted-foreground">
          곧 새로운 모임이 등록될 예정이에요!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.label}>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <h2 className="text-lg font-semibold text-foreground">
              {group.label}
            </h2>
            <span className="text-sm text-muted-foreground">
              ({group.runs.length})
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.runs.map((run) => (
              <Link key={run.id} href={`/runs/${run.id}`}>
                <RunCard run={run} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
