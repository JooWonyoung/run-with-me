"use client";

import Image from "next/image";
import { RunWithHost } from "@/hooks/useRun";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80";

interface Props {
  run: RunWithHost;
}

export function RunImageGallery({ run }: Props) {
  const images = run.image_urls?.length
    ? run.image_urls
    : run.thumbnail_url
      ? [run.thumbnail_url]
      : [FALLBACK_IMAGE];

  if (images.length === 1) {
    return (
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
        <Image
          src={images[0]}
          alt={run.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
    );
  }

  const gridClass = (() => {
    if (images.length === 2) return "grid-cols-2";
    return "grid-cols-3";
  })();

  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {images.slice(0, images.length <= 4 ? images.length : 3).map((url, idx) => {
        const isLast = images.length > 3 && idx === 2;
        return (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={url}
              alt={`${run.title} 이미지 ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="(max-width: 768px) 50vw, 260px"
            />
            {isLast && images.length > 3 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                <span className="text-xl font-bold text-white">
                  +{images.length - 3}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
