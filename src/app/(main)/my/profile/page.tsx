import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "./_components/ProfileEditForm";
import type { RaceRecord, SNSLinks } from "./actions";

export const metadata = {
  title: "내 정보 수정",
};

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("User")
    .select(
      "nickname, email, profile_img, gender, birth_year, mbti, message, race_records, sns_links, provider",
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const raceRecords = (
    Array.isArray(profile.race_records) ? profile.race_records : []
  ) as RaceRecord[];

  const snsLinks = (
    profile.sns_links && typeof profile.sns_links === "object" && !Array.isArray(profile.sns_links)
      ? profile.sns_links
      : {}
  ) as SNSLinks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <Link
            href="/my/runs"
            className="flex items-center justify-center rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            내 정보 수정
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-lg px-4 py-6">
        <ProfileEditForm
          userId={user.id}
          initialNickname={profile.nickname}
          initialEmail={profile.email}
          initialProfileImg={profile.profile_img}
          initialGender={profile.gender}
          initialBirthYear={profile.birth_year}
          initialMbti={profile.mbti}
          initialMessage={profile.message}
          initialRaceRecords={raceRecords}
          initialSnsLinks={snsLinks}
          provider={profile.provider}
        />
      </div>
    </div>
  );
}
