"use client";

import { Activity, Footprints } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RunWithHost } from "@/hooks/useRun";

interface Props {
  run: RunWithHost;
}

export function RunningSpecs({ run }: Props) {
  const hasDistance = run.target_distance_km != null;
  const hasPace = run.target_pace_minute != null;

  if (!hasDistance && !hasPace) return null;

  return (
    <div className="space-y-3">
      <Separator />
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">러닝 스펙</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {hasDistance && (
            <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <Activity className="h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">목표 거리</p>
                <p className="text-sm font-semibold text-foreground">
                  {run.target_distance_km} km
                </p>
              </div>
            </div>
          )}
          {hasPace && (
            <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <Footprints className="h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">목표 페이스</p>
                <p className="text-sm font-semibold text-foreground">
                  {run.target_pace_minute} /km
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
