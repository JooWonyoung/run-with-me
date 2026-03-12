"use client";

import { useState, useTransition, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Camera,
  AlertCircle,
  Plus,
  Trash2,
  Instagram,
  Youtube,
  Globe,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { completeOnboarding, type RaceRecord, type SNSLinks } from "../actions";
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

const TOTAL_STEPS = 4;
const STEP_LABELS = ["기본 정보", "자기소개", "대회기록", "SNS"];

type OnboardingFormProps = {
  next: string;
};

function createEmptyRaceRecord(): RaceRecord {
  return { raceName: "", date: "", distance: "5km", record: "" };
}

export function OnboardingForm({ next }: OnboardingFormProps) {
  const [step, setStep] = useState(1);

  // Step 1
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthYear, setBirthYear] = useState<string>("");

  // Step 2
  const [message, setMessage] = useState("");
  const [mbti, setMbti] = useState("");

  // Step 3
  const [raceRecords, setRaceRecords] = useState<RaceRecord[]>([]);

  // Step 4
  const [snsLinks, setSnsLinks] = useState<SNSLinks>({});

  const [error, setError] = useState<string | null>(null);
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
    reader.onload = (ev) => setProfilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!profileFile) {
        setError("프로필 사진을 등록해 주세요.");
        return false;
      }
      if (!gender) {
        setError("성별을 선택해 주세요.");
        return false;
      }
      if (!birthYear) {
        setError("출생년도를 선택해 주세요.");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setError(null);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    setStep((s) => s - 1);
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

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("로그인이 필요합니다.");
        return;
      }

      const fileExt = profileFile!.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `user-uploads/profiles/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("runs_images")
        .upload(filePath, profileFile!, {
          contentType: profileFile!.type,
          upsert: true,
        });

      if (uploadError) {
        setError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("runs_images").getPublicUrl(filePath);

      const result = await completeOnboarding({
        profileImageUrl: publicUrl,
        gender: gender!,
        birthYear,
        message,
        mbti,
        raceRecords,
        snsLinks,
        next,
      });

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < step;
          const isCurrent = stepNum === step;
          return (
            <div
              key={stepNum}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-orange-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  isCurrent
                    ? "text-orange-600 dark:text-orange-400"
                    : isCompleted
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-300 dark:text-slate-600"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Step 1: 기본 정보 ── */}
        {step === 1 && (
          <>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="pb-6 pt-6">
                <div className="flex flex-col items-center gap-5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 transition-all hover:ring-orange-400 dark:bg-slate-800 dark:ring-slate-700"
                    aria-label="프로필 사진 선택"
                  >
                    {profilePreview ? (
                      <>
                        <Image
                          src={profilePreview}
                          alt="프로필 미리보기"
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

                  <div className="space-y-2 text-center">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      함께 달리는 동료들을 위해 나를 표현해 주세요.
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      안전하고 즐거운 러닝 문화를 위해 프로필 사진 등록이
                      필요합니다. 꼭 얼굴이 나오지 않아도 괜찮아요! 평소 즐겨
                      신는 러닝화, 달리기 기록 캡처, 혹은 나를 잘 나타내는 운동
                      사진이면 충분합니다. 방장이 당신의 진정성을 확인할 수
                      있도록 도와주세요.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">출생년도</Label>
              <Select value={birthYear} onValueChange={setBirthYear}>
                <SelectTrigger className="rounded-xl bg-white">
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
          </>
        )}

        {/* ── Step 2: 자기소개 & MBTI ── */}
        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                자기소개{" "}
                <span className="font-normal text-muted-foreground">
                  (선택)
                </span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="나를 소개해 주세요. 좋아하는 러닝 코스, 러닝 스타일, 참여하고 싶은 대회 등 자유롭게 작성해 주세요."
                className="min-h-[160px] resize-none rounded-xl"
                maxLength={500}
              />
              <p className="text-right text-xs text-muted-foreground">
                {message.length}/500
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mbti" className="text-sm font-medium">
                MBTI{" "}
                <span className="font-normal text-muted-foreground">
                  (선택)
                </span>
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
          </>
        )}

        {/* ── Step 3: 러닝 대회기록 ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  러닝 대회기록{" "}
                  <span className="font-normal text-muted-foreground">
                    (선택)
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  참가한 대회 기록을 추가해 주세요.
                </p>
              </div>
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

            {raceRecords.length === 0 ? (
              <button
                type="button"
                onClick={addRaceRecord}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-10 text-slate-400 transition-colors hover:border-orange-300 hover:text-orange-400 dark:border-slate-700 dark:hover:border-orange-700"
              >
                <Plus className="h-6 w-6" />
                <p className="text-sm">대회기록 추가하기</p>
              </button>
            ) : (
              <div className="space-y-3">
                {raceRecords.map((record, index) => (
                  <Card key={index} className="rounded-2xl shadow-sm">
                    <CardContent className="pb-4 pt-4">
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
                              updateRaceRecord(
                                index,
                                "raceName",
                                e.target.value,
                              )
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: SNS 링크 ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                SNS 링크{" "}
                <span className="font-normal text-muted-foreground">
                  (선택)
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                러닝 친구들과 연결해 보세요.
              </p>
            </div>

            <div className="space-y-3">
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
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="flex-1 rounded-xl py-5 text-sm font-semibold"
            >
              이전
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 rounded-xl bg-orange-500 py-5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              다음
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-orange-500 py-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {isPending ? "저장 중..." : "시작하기"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
