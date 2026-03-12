"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import {
  Activity,
  Camera,
  Footprints,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { myRunsQueryKey } from "@/hooks/useMyRuns";
import type { Tables } from "@/types/supabase";
import { updateProfileImage } from "../actions";

interface ProfileSummaryProps {
  user: Tables<"User">;
  stats: { totalCount: number; totalDistanceKm: number };
}

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  kakao: "Kakao",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function ProfileSummary({ user, stats }: ProfileSummaryProps) {
  const initials = user.nickname?.[0]?.toUpperCase() ?? "U";
  const providerLabel = user.provider
    ? (PROVIDER_LABEL[user.provider] ?? user.provider)
    : null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imgStatus, setImgStatus] = useState<"idle" | "loading" | "loaded" | "error">(
    user.profile_img ? "loading" : "idle",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  function handleAvatarClick() {
    if (isPending) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setUploadError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setUploadError(null);

    startTransition(async () => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);

      const supabase = createClient();

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUploadError("로그인이 필요합니다.");
        return;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // 타임스탬프를 파일명에 추가해 CDN 캐시 우회
      const filePath = `user-uploads/profiles/${authUser.id}-${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from("runs_images")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (storageError) {
        setPreviewUrl(null);
        setUploadError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("runs_images").getPublicUrl(filePath);

      const result = await updateProfileImage(publicUrl);
      if (result?.error) {
        setPreviewUrl(null);
        setUploadError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: myRunsQueryKey });
      router.refresh();
    });
  }

  const avatarSrc = previewUrl ?? user.profile_img ?? undefined;

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-blue-50 p-5 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-blue-950/30">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isPending}
            aria-label="프로필 사진 변경"
            className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          >
            <Avatar className="h-20 w-20 ring-2 ring-orange-200 ring-offset-2 dark:ring-orange-800 dark:ring-offset-slate-950">
              <AvatarImage
                className="object-cover"
                src={avatarSrc}
                alt={user.nickname ?? "프로필"}
                onLoadingStatusChange={(s) =>
                  setImgStatus(s as "idle" | "loading" | "loaded" | "error")
                }
              />
              <AvatarFallback className="bg-orange-100 text-2xl font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                {imgStatus === "loading" ? (
                  <span className="block size-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>

            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity ${
                isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

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

          {uploadError && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

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
