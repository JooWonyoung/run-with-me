"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RunWithHost } from "@/hooks/useRun";

interface Props {
  run: RunWithHost;
}

export function RunDetailHero({ run }: Props) {
  const isOpen = run.status === "open" || run.status == null;
  const hostName = run.User?.nickname ?? "알 수 없는 호스트";
  const hostImg = run.User?.profile_img ?? undefined;
  const hostInitial = hostName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {run.title}
        </h1>
        <Badge
          className={
            isOpen
              ? "shrink-0 bg-orange-100 text-orange-700 hover:bg-orange-100"
              : "shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          }
          variant="secondary"
        >
          {isOpen ? "모집 중" : "모집 완료"}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage className="object-cover" src={hostImg} alt={hostName} />
          <AvatarFallback className="bg-orange-100 text-sm font-semibold text-orange-700">
            {hostInitial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{hostName}</p>
          <p className="text-xs text-muted-foreground">주최자</p>
        </div>
      </div>
    </div>
  );
}
