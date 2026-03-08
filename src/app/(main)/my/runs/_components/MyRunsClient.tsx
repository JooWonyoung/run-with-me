"use client";

import { Crown, History, Footprints, Ticket } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useMyRuns } from "@/hooks/useMyRuns";
import { HostedRunCard } from "./HostedRunCard";
import { ParticipantRunCard } from "./ParticipantRunCard";
import { ProfileSummary } from "./ProfileSummary";

export function MyRunsClient() {
  const { data, isLoading, isError } = useMyRuns();

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState />;

  const { user, upcomingHostedRuns, upcomingParticipantRuns, history, stats } =
    data;

  const hasAnyRuns =
    upcomingHostedRuns.length > 0 ||
    upcomingParticipantRuns.length > 0 ||
    history.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <ProfileSummary user={user} stats={stats} />

      {!hasAnyRuns && <EmptyState />}

      {upcomingHostedRuns.length > 0 && (
        <RunSection
          title="내가 호스팅 중인 모임"
          icon={<Crown className="h-5 w-5 text-orange-500" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {upcomingHostedRuns.map((run) => (
              <HostedRunCard key={run.id} run={run} variant="upcoming" />
            ))}
          </div>
        </RunSection>
      )}

      {upcomingParticipantRuns.length > 0 && (
        <RunSection
          title="다가오는 참가 모임"
          icon={<Ticket className="h-5 w-5 text-blue-500" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {upcomingParticipantRuns.map((application) => (
              <ParticipantRunCard
                key={application.id}
                application={application}
                variant="upcoming"
              />
            ))}
          </div>
        </RunSection>
      )}

      {history.length > 0 && (
        <RunSection
          title="히스토리"
          icon={<History className="h-5 w-5 text-slate-400" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {history.map((item) =>
              item.kind === "hosted" ? (
                <HostedRunCard key={item.run.id} run={item.run} variant="past" />
              ) : (
                <ParticipantRunCard
                  key={item.application.id}
                  application={item.application}
                  variant="past"
                />
              )
            )}
          </div>
        </RunSection>
      )}
    </div>
  );
}

function RunSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
        {icon}
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Footprints className="h-7 w-7 text-slate-400" />
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          아직 참여한 러닝 모임이 없어요
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          첫 번째 러닝 모임에 참여해보세요!
        </p>
      </div>
      <Button
        asChild
        size="sm"
        className="bg-orange-600 text-white hover:bg-orange-700"
      >
        <Link href="/runs">러닝 모임 찾기</Link>
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="flex flex-col gap-4">
        <div className="h-5 w-40 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-60 rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-slate-500 dark:text-slate-400">
        데이터를 불러오는 중 오류가 발생했습니다.
      </p>
    </div>
  );
}
