"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RunWithHost } from "@/hooks/useRun";
import { ApplyButton } from "./ApplyButton";

interface Props {
  run: RunWithHost;
}

export function RunInfoSidebar({ run }: Props) {
  const meetingDate = new Date(run.meeting_at);
  const isOpen = run.status === "open" || run.status == null;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-3">
          <InfoRow
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            label="날짜"
            value={format(meetingDate, "yyyy년 M월 d일 (EEE)", { locale: ko })}
          />
          <InfoRow
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            label="시간"
            value={format(meetingDate, "a h:mm", { locale: ko })}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            label="장소"
            value={run.meeting_place_name}
          />
          <InfoRow
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            label="정원"
            value={`최대 ${run.max_capacity}명`}
          />
        </div>

        <Separator />

        <ApplyButton run={run} />

        {!isOpen && (
          <p className="text-center text-xs text-muted-foreground">
            이미 모집이 완료된 모임입니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
