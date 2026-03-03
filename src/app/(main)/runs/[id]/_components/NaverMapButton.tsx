"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  placeName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export function NaverMapButton({
  placeName,
  address,
  latitude,
  longitude,
}: Props) {
  const naverMapUrl = (() => {
    if (latitude != null && longitude != null) {
      return `https://map.naver.com/?lng=${longitude}&lat=${latitude}&title=${encodeURIComponent(placeName)}`;
    }
    return `https://map.naver.com/search?query=${encodeURIComponent(address)}`;
  })();

  return (
    <div className="space-y-3">
      <Separator />
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">장소</h2>
        <div className="flex items-start justify-between gap-3 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-foreground">{placeName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{address}</p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs"
          >
            <a href={naverMapUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              네이버 지도
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
