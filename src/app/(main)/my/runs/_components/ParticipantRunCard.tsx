import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Activity, Calendar, MapPin, Ticket, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ApplicationWithRun } from "@/hooks/useMyRuns";

const RUNNING_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600&q=80";

interface ParticipantRunCardProps {
  application: ApplicationWithRun;
  variant: "upcoming" | "past";
}

type BadgeConfig = {
  label: string;
  className: string;
  icon?: React.ReactNode;
};

function getStatusBadge(
  status: string | null,
  isPast: boolean
): BadgeConfig {
  if (isPast) {
    if (status === "canceled") {
      return { label: "취소됨", className: "bg-slate-400 text-white hover:bg-slate-400" };
    }
    if (status === "pending" || status === "rejected") {
      return { label: "승인 대기 중", className: "bg-amber-500 text-white hover:bg-amber-500" };
    }
    return { label: "참가 완료", className: "bg-slate-500 text-white hover:bg-slate-500" };
  }

  if (status === "canceled") {
    return { label: "취소됨", className: "bg-slate-400 text-white hover:bg-slate-400" };
  }
  if (status === "pending" || status === "rejected") {
    return { label: "승인 대기 중", className: "bg-amber-500 text-white hover:bg-amber-500" };
  }
  return {
    label: "참가예정",
    className: "flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-600",
    icon: <Ticket className="h-3 w-3" />,
  };
}

function getCardBorderClass(status: string | null, isPast: boolean): string {
  if (isPast) return "border-slate-200 bg-card dark:border-slate-700";
  if (status === "canceled") return "border-slate-200 bg-card dark:border-slate-700";
  if (status === "pending" || status === "rejected") {
    return "border-amber-200 bg-card dark:border-amber-900/50";
  }
  return "border-blue-200 bg-card dark:border-blue-900/50";
}

export function ParticipantRunCard({
  application,
  variant,
}: ParticipantRunCardProps) {
  const { run } = application;
  const meetingDate = new Date(run.meeting_at);
  const isPast = variant === "past";
  const status = application.status;

  const badge = getStatusBadge(status, isPast);
  const borderClass = getCardBorderClass(status, isPast);
  const isGrayscale = isPast || status === "canceled";

  return (
    <Link href={`/runs/${run.id}`} className="block">
      <Card
        className={`group overflow-hidden rounded-2xl border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${borderClass}`}
      >
        <div className="relative h-40 w-full overflow-hidden sm:h-44">
          <Image
            src={run.thumbnail_url ?? RUNNING_PLACEHOLDER_IMAGE}
            alt={run.title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              isGrayscale ? "grayscale" : ""
            }`}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <div className="absolute left-3 top-3">
            <Badge className={badge.className}>
              {badge.icon}
              {badge.label}
            </Badge>
          </div>
        </div>

        <CardContent
          className={`flex flex-col gap-2.5 px-4 py-3.5 sm:px-5 sm:py-4 ${
            isGrayscale ? "opacity-70" : ""
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

            {run.host?.nickname && (
              <InfoRow icon={<User className="h-4 w-4 text-muted-foreground" />}>
                호스트: {run.host.nickname}
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
