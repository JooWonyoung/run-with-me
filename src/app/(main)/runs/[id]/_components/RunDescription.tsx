"use client";

import { Separator } from "@/components/ui/separator";

interface Props {
  description: string;
}

export function RunDescription({ description }: Props) {
  return (
    <div className="space-y-3">
      <Separator />
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">상세 설명</h2>
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
