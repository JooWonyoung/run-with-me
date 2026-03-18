import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Activity, Calendar, MapPin, Users } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_RUN_IMAGE } from "@/lib/constants/images";
import type { Tables } from "@/types/supabase";

type Run = Tables<"Runs">;

interface RunCardProps {
  run: Run;
}

const STATUS_LABEL: Record<string, string> = {
  closed: "모집완료",
  open: "모집중",
};

export function RunCard({ run }: RunCardProps) {
  const meetingDate = new Date(run.meeting_at);
  const isClosed = run.status === "closed";

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={run.thumbnail_url ?? DEFAULT_RUN_IMAGE}
          alt={run.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {run.status && (
          <div className="absolute left-3 top-3">
            <Badge
              className={
                isClosed
                  ? "bg-emerald-500 text-white hover:bg-emerald-500"
                  : "bg-orange-600 text-white hover:bg-orange-600"
              }
            >
              {STATUS_LABEL[run.status] ?? run.status}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 px-5 py-4">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {run.title}
        </h2>

        <div className="flex flex-col gap-1.5">
          <InfoRow
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          >
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
                run.target_distance_km != null && `${run.target_distance_km}km`,
                run.target_pace_minute && `페이스 ${run.target_pace_minute}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </InfoRow>
          )}

          <InfoRow icon={<Users className="h-4 w-4 text-muted-foreground" />}>
            최대 {run.max_capacity}명
          </InfoRow>
        </div>
      </CardContent>
    </Card>
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
