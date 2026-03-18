"use client";

import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApplication, useApplyToRun } from "@/hooks/useApplication";
import type { RunWithHost } from "@/hooks/useRun";

const STATUS_CONFIG = {
  pending: {
    label: "신청 완료 (검토 중)",
    icon: <Clock className="mr-1.5 h-4 w-4" />,
    className:
      "w-full rounded-xl bg-amber-500 font-semibold hover:bg-amber-600 cursor-default",
  },
  approved: {
    label: "참가 확정",
    icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    className:
      "w-full rounded-xl bg-emerald-500 font-semibold hover:bg-emerald-600 cursor-default",
  },
  rejected: {
    label: "신청 거절됨",
    icon: <XCircle className="mr-1.5 h-4 w-4" />,
    className: "w-full rounded-xl cursor-default",
    disabled: true,
  },
  canceled: {
    label: "신청 취소됨",
    icon: null,
    className: "w-full rounded-xl cursor-default",
    disabled: true,
  },
  completed: {
    label: "참가 완료",
    icon: <CheckCircle2 className="mr-1.5 h-4 w-4" />,
    className: "w-full rounded-xl bg-emerald-500 font-semibold cursor-default",
  },
} as const;

interface Props {
  run: RunWithHost;
}

export function ApplyButton({ run }: Props) {
  const [open, setOpen] = useState(false);
  const { data: application, isLoading } = useApplication(run.id);
  const { mutate: apply, isPending } = useApplyToRun(run.id);

  const isOpen = run.status === "open" || run.status == null;

  if (isLoading) {
    return (
      <Button className="w-full rounded-xl" disabled>
        불러오는 중…
      </Button>
    );
  }
  console.log(application);

  if (application?.status && application.status in STATUS_CONFIG) {
    const config =
      STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG];
    return (
      <Button className={config.className} disabled>
        {config.icon}
        {config.label}
      </Button>
    );
  }

  if (!isOpen) {
    return (
      <Button className="w-full rounded-xl" disabled>
        모집 마감
      </Button>
    );
  }

  function handleConfirm() {
    apply(undefined, {
      onSuccess: (result) => {
        if ("success" in result) {
          setOpen(false);
          toast.success("신청이 완료되었습니다!", {
            description: "호스트 승인 후 최종 참여가 확정됩니다.",
          });
        } else {
          toast.error(result.error);
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl bg-orange-600 font-semibold hover:bg-orange-700">
          참가 신청하기
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">러닝모임 신청 안내</DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-relaxed text-foreground">
            호스트가 프로필을 확인한 뒤 승인을 완료해야 최종 참여가 확정됩니다.
            <br />
            <br />
            승인 결과는{" "}
            <span className="font-semibold text-orange-600">
              마이페이지
            </span>{" "}
            혹은 알림을 통해 확인하실 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            className="flex-1 rounded-xl bg-orange-600 font-semibold hover:bg-orange-700"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "신청 중…" : "신청하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
