"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { useRun } from "@/hooks/useRun";
import { Skeleton } from "@/components/ui/skeleton";

import { RunDetailHero } from "./RunDetailHero";
import { RunImageGallery } from "./RunImageGallery";
import { RunInfoSidebar } from "./RunInfoSidebar";
import { RunDescription } from "./RunDescription";
import { RunningSpecs } from "./RunningSpecs";
import { NaverMapButton } from "./NaverMapButton";

interface Props {
  id: string;
}

export function RunDetailClient({ id }: Props) {
  const { data: run, isPending, isError } = useRun(id);

  if (isPending) return <RunDetailSkeleton />;
  if (isError || !run) return notFound();

  return (
    <main className="mx-auto max-w-screen-lg px-4 py-8">
      <Link
        href="/runs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-6">
          <RunImageGallery run={run} />
          <RunDetailHero run={run} />
          <RunDescription description={run.description} />
          <RunningSpecs run={run} />
          <NaverMapButton
            placeName={run.meeting_place_name}
            address={run.meeting_address}
            latitude={run.meeting_latitude}
            longitude={run.meeting_longitude}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:sticky lg:top-24 lg:w-72 lg:shrink-0">
          <RunInfoSidebar run={run} />
        </aside>
      </div>
    </main>
  );
}

function RunDetailSkeleton() {
  return (
    <main className="mx-auto max-w-screen-lg px-4 py-8">
      <Skeleton className="mb-6 h-5 w-32" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="min-w-0 flex-1 space-y-6">
          <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <aside className="w-full lg:w-72 lg:shrink-0">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </aside>
      </div>
    </main>
  );
}
