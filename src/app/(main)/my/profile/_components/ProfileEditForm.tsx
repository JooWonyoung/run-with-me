"use client";

import { useState, useTransition, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Instagram,
  Youtube,
  Globe,
  Activity,
  User,
  Mail,
  Sparkles,
  Trophy,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile, type RaceRecord, type SNSLinks } from "../actions";
import { createClient } from "@/lib/supabase/client";
import type { Enums } from "@/types/supabase";

type Gender = Enums<"gender">;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "none", label: "선택 안함" },
];

const DISTANCE_OPTIONS: { value: RaceRecord["distance"]; label: string }[] = [
  { value: "5km", label: "5km" },
  { value: "10km", label: "10km" },
  { value: "Half", label: "하프 (21.1km)" },
  { value: "Full", label: "풀 (42.2km)" },
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from(
  { length: CURRENT_YEAR - 1939 - 16 },
  (_, i) => CURRENT_YEAR - 16 - i,
);

function createEmptyRaceRecord(): RaceRecord {
  return { raceName: "", date: "", distance: "5km", record: "" };
}

export type ProfileEditFormProps = {
  userId: string;
  initialNickname: string | null;
  initialEmail: string | null;
  initialProfileImg: string | null;
  initialGender: Gender | null;
  initialBirthYear: number | null;
  initialMbti: string | null;
  initialMessage: string | null;
  initialRaceRecords: RaceRecord[];
  initialSnsLinks: SNSLinks;
  provider: string | null;
};

export function ProfileEditForm({
  userId,
  initialNickname,
  initialEmail,
  initialProfileImg,
  initialGender,
  initialBirthYear,
  initialMbti,
  initialMessage,
  initialRaceRecords,
  initialSnsLinks,
  provider,
}: ProfileEditFormProps) {
  const router = useRouter();

  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [profileImg, setProfileImg] = useState<string | null>(initialProfileImg);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [gender, setGender] = useState<Gender | null>(initialGender);
  const [birthYear, setBirthYear] = useState<string>(
    initialBirthYear ? String(initialBirthYear) : "",
  );
  const [mbti, setMbti] = useState(initialMbti ?? "");
  const [message, setMessage] = useState(initialMessage ?? "");
  const [raceRecords, setRaceRecords] = useState<RaceRecord[]>(initialRaceRecords);
  const [snsLinks, setSnsLinks] = useState<SNSLinks>(initialSnsLinks);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setError(null);
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function addRaceRecord() {
    setRaceRecords((prev) => [...prev, createEmptyRaceRecord()]);
  }

  function removeRaceRecord(index: number) {
    setRaceRecords((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRaceRecord<K extends keyof RaceRecord>(
    index: number,
    field: K,
    value: RaceRecord[K],
  ) {
    setRaceRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const supabase = createClient();
      let finalProfileImgUrl: string | null = initialProfileImg;

      if (profileFile) {
        const fileExt = profileFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filePath = `user-uploads/profiles/${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("runs_images")
          .upload(filePath, profileFile, {
            contentType: profileFile.type,
            upsert: true,
          });

        if (uploadError) {
          setError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("runs_images").getPublicUrl(filePath);

        finalProfileImgUrl = publicUrl;
      }

      const result = await updateProfile({
        nickname,
        profileImageUrl: finalProfileImgUrl,
        gender,
        birthYear,
        mbti,
        message,
        raceRecords,
        snsLinks,
      });

      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccessMsg("프로필이 저장되었습니다.");
        setProfileFile(null);
        router.refresh();
      }
    });
  }

  const providerLabel =
    provider === "google" ? "Google" : provider === "kakao" ? "카카오" : provider;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Section: 프로필 사진 & 기본 정보 ── */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4 text-orange-500" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Profile image */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 transition-all hover:ring-orange-400 dark:bg-slate-800 dark:ring-slate-700"
              aria-label="프로필 사진 변경"
            >
              {profileImg ? (
                <>
                  <Image
                    src={profileImg}
                    alt="프로필 사진"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <Camera className="h-7 w-7 text-slate-400" />
                  <span className="text-xs text-slate-400">사진 추가</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              클릭하여 프로필 사진을 변경하세요 (최대 5MB)
            </p>
          </div>

          <Separator />

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label htmlFor="nickname" className="text-sm font-medium">
              닉네임 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해 주세요"
              maxLength={20}
              className="rounded-xl"
            />
            <p className="text-right text-xs text-muted-foreground">
              {nickname.length}/20
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              이메일
            </Label>
            <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
              <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">
                {initialEmail ?? "이메일 없음"}
              </span>
              {providerLabel && (
                <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  {providerLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              이메일은 로그인 수단과 연결되어 변경할 수 없습니다.
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">성별</Label>
            <div className="flex gap-2">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-all ${
                    gender === value
                      ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Birth Year */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">출생년도</Label>
            <Select value={birthYear} onValueChange={setBirthYear}>
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900">
                <SelectValue placeholder="출생년도를 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {BIRTH_YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Section: 자기소개 & MBTI ── */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-orange-500" />
            자기소개
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-medium">
              한 줄 소개{" "}
              <span className="font-normal text-muted-foreground">(선택)</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="나를 소개해 주세요. 좋아하는 러닝 코스, 러닝 스타일, 참여하고 싶은 대회 등 자유롭게 작성해 주세요."
              className="min-h-[140px] resize-none rounded-xl"
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">
              {message.length}/500
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mbti" className="text-sm font-medium">
              MBTI{" "}
              <span className="font-normal text-muted-foreground">(선택)</span>
            </Label>
            <Input
              id="mbti"
              value={mbti}
              onChange={(e) => setMbti(e.target.value.toUpperCase())}
              placeholder="ENFJ"
              maxLength={4}
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section: 러닝 대회기록 ── */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Trophy className="h-4 w-4 text-orange-500" />
              대회기록{" "}
              <span className="text-sm font-normal text-muted-foreground">
                (선택)
              </span>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRaceRecord}
              className="gap-1.5 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {raceRecords.length === 0 ? (
            <button
              type="button"
              onClick={addRaceRecord}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-slate-400 transition-colors hover:border-orange-300 hover:text-orange-400 dark:border-slate-700 dark:hover:border-orange-700"
            >
              <Plus className="h-5 w-5" />
              <p className="text-sm">대회기록 추가하기</p>
            </button>
          ) : (
            <div className="space-y-3">
              {raceRecords.map((record, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-orange-500">
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRaceRecord(index)}
                      className="text-slate-400 transition-colors hover:text-red-500"
                      aria-label="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        대회명
                      </Label>
                      <Input
                        value={record.raceName}
                        onChange={(e) =>
                          updateRaceRecord(index, "raceName", e.target.value)
                        }
                        placeholder="서울마라톤"
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          날짜
                        </Label>
                        <Input
                          type="date"
                          value={record.date}
                          onChange={(e) =>
                            updateRaceRecord(index, "date", e.target.value)
                          }
                          className="h-9 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          종목
                        </Label>
                        <Select
                          value={record.distance}
                          onValueChange={(v) =>
                            updateRaceRecord(
                              index,
                              "distance",
                              v as RaceRecord["distance"],
                            )
                          }
                        >
                          <SelectTrigger className="h-9 rounded-xl text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DISTANCE_OPTIONS.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        기록 (시:분:초)
                      </Label>
                      <Input
                        value={record.record}
                        onChange={(e) =>
                          updateRaceRecord(index, "record", e.target.value)
                        }
                        placeholder="00:55:00"
                        className="h-9 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section: SNS 링크 ── */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Share2 className="h-4 w-4 text-orange-500" />
            SNS 링크{" "}
            <span className="text-sm font-normal text-muted-foreground">
              (선택)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </Label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-xl border border-r-0 bg-slate-50 px-3 text-xs text-muted-foreground dark:bg-slate-800">
                instagram.com/
              </span>
              <Input
                value={snsLinks.instagram ?? ""}
                onChange={(e) =>
                  setSnsLinks((p) => ({ ...p, instagram: e.target.value }))
                }
                placeholder="username"
                className="h-9 rounded-l-none rounded-r-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              Strava
            </Label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-xl border border-r-0 bg-slate-50 px-3 text-xs text-muted-foreground dark:bg-slate-800">
                strava.com/athletes/
              </span>
              <Input
                value={snsLinks.strava ?? ""}
                onChange={(e) =>
                  setSnsLinks((p) => ({ ...p, strava: e.target.value }))
                }
                placeholder="athlete-id"
                className="h-9 rounded-l-none rounded-r-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Youtube className="h-3.5 w-3.5" />
              YouTube
            </Label>
            <div className="flex items-center">
              <span className="flex h-9 items-center rounded-l-xl border border-r-0 bg-slate-50 px-3 text-xs text-muted-foreground dark:bg-slate-800">
                youtube.com/
              </span>
              <Input
                value={snsLinks.youtube ?? ""}
                onChange={(e) =>
                  setSnsLinks((p) => ({ ...p, youtube: e.target.value }))
                }
                placeholder="@channel"
                className="h-9 rounded-l-none rounded-r-xl text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              블로그 / 웹사이트
            </Label>
            <Input
              value={snsLinks.blog ?? ""}
              onChange={(e) =>
                setSnsLinks((p) => ({ ...p, blog: e.target.value }))
              }
              placeholder="https://myblog.com"
              className="h-9 rounded-xl text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-orange-500 py-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "저장하기"}
      </Button>
    </form>
  );
}
