import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Activity, Calendar, Crown, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/types/supabase";

const RUNNING_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600&q=80";

const RUN_STATUS_LABEL: Record<string, string> = {
  open: "모집중",
  closed: "모집완료",
  canceled: "취소됨",
  completed: "완료",
};

interface HostedRunCardProps {
  run: Tables<"Runs">;
  variant: "upcoming" | "past";
}

export function HostedRunCard({ run, variant }: HostedRunCardProps) {
  const meetingDate = new Date(run.meeting_at);
  const isPast = variant === "past";

  return (
    <Link href={`/runs/${run.id}`} className="block">
      <Card
        className={`group overflow-hidden rounded-2xl border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
          isPast
            ? "border-slate-200 bg-card dark:border-slate-700"
            : "border-orange-200 bg-card dark:border-orange-900/50"
        }`}
      >
        <div className="relative h-40 w-full overflow-hidden sm:h-44">
          <Image
            src={run.thumbnail_url ?? RUNNING_PLACEHOLDER_IMAGE}
            alt={run.title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              isPast ? "grayscale" : ""
            }`}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge
              className={`flex items-center gap-1 ${
                isPast
                  ? "bg-slate-500 text-white hover:bg-slate-500"
                  : "bg-orange-600 text-white hover:bg-orange-600"
              }`}
            >
              <Crown className="h-3 w-3" />
              {isPast ? "호스팅 완료" : "호스팅"}
            </Badge>

            {!isPast && run.status && (
              <Badge
                className={
                  run.status === "closed"
                    ? "bg-emerald-500 text-white hover:bg-emerald-500"
                    : "bg-white/90 text-slate-700 hover:bg-white/90"
                }
              >
                {RUN_STATUS_LABEL[run.status] ?? run.status}
              </Badge>
            )}
          </div>
        </div>

        <CardContent
          className={`flex flex-col gap-2.5 px-4 py-3.5 sm:px-5 sm:py-4 ${
            isPast ? "opacity-70" : ""
          }`}
        >
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
            {run.title}
          </h2>

          <div className="flex flex-col gap-1.5">
            <InfoRow icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
              {format(meetingDate, "M월 d일 (EEE) HH:mm", { locale: ko })}
            </InfoRow>

            <InfoRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
              {run.meeting_place_name}
            </InfoRow>

            {(run.target_distance_km != null || run.target_pace_minute) && (
              <InfoRow
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              >
                {[
                  run.target_distance_km != null &&
                    `${run.target_distance_km}km`,
                  run.target_pace_minute && `페이스 ${run.target_pace_minute}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </InfoRow>
            )}

            {!isPast && (
              <InfoRow
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              >
                최대 {run.max_capacity}명
              </InfoRow>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span className="truncate">{children}</span>
    </div>
  );
}
