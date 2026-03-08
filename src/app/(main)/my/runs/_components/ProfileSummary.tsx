import { Activity, Footprints } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/types/supabase";

interface ProfileSummaryProps {
  user: Tables<"User">;
  stats: { totalCount: number; totalDistanceKm: number };
}

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  kakao: "Kakao",
};

export function ProfileSummary({ user, stats }: ProfileSummaryProps) {
  const initials = user.nickname?.[0]?.toUpperCase() ?? "U";
  const providerLabel = user.provider
    ? (PROVIDER_LABEL[user.provider] ?? user.provider)
    : null;

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-blue-50 p-5 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-blue-950/30">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 shrink-0 ring-2 ring-orange-200 ring-offset-2 dark:ring-orange-800 dark:ring-offset-slate-950">
          <AvatarImage
            src={user.profile_img ?? undefined}
            alt={user.nickname ?? "프로필"}
          />
          <AvatarFallback className="bg-orange-100 text-2xl font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {user.nickname ?? "러너"}
            </h1>
            {providerLabel && (
              <Badge
                variant="outline"
                className="border-slate-300 text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400"
              >
                {providerLabel}로 가입
              </Badge>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-2.5 sm:max-w-[260px]">
            <StatCard
              icon={<Footprints className="h-4 w-4 text-orange-500" />}
              label="완료한 모임"
              value={`${stats.totalCount}회`}
            />
            <StatCard
              icon={<Activity className="h-4 w-4 text-blue-500" />}
              label="누적 거리"
              value={`${stats.totalDistanceKm.toFixed(1)}km`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/70 px-3 py-2.5 dark:bg-slate-900/50">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      <span className="text-base font-bold text-slate-900 dark:text-slate-50">
        {value}
      </span>
    </div>
  );
}
