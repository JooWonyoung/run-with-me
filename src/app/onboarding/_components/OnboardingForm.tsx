'use client'

import { useState, useTransition, useRef, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Camera, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { completeOnboarding } from '../actions'
import { createClient } from '@/lib/supabase/client'
import type { Enums } from '@/types/supabase'

type Gender = Enums<'gender'>

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'none', label: '선택 안함' },
]

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS = Array.from(
  { length: CURRENT_YEAR - 1939 - 16 },
  (_, i) => CURRENT_YEAR - 16 - i
)

type OnboardingFormProps = {
  next: string
}

export function OnboardingForm({ next }: OnboardingFormProps) {
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender | null>(null)
  const [birthYear, setBirthYear] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setError(null)
    setProfileFile(file)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfilePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!profileFile) {
      setError('프로필 사진을 등록해 주세요.')
      return
    }
    if (!gender) {
      setError('성별을 선택해 주세요.')
      return
    }
    if (!birthYear) {
      setError('출생년도를 선택해 주세요.')
      return
    }

    setError(null)
    startTransition(async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('로그인이 필요합니다.')
        return
      }

      const fileExt = profileFile.name.split('.').pop() ?? 'jpg'
      const filePath = `user-uploads/profiles/${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('run-images')
        .upload(filePath, profileFile, { upsert: true, contentType: profileFile.type })

      if (uploadError) {
        setError('이미지 업로드에 실패했습니다. 다시 시도해 주세요.')
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('run-images').getPublicUrl(filePath)

      const result = await completeOnboarding({
        profileImageUrl: publicUrl,
        gender,
        birthYear,
        next,
      })
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Profile Photo */}
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
                안전하고 즐거운 러닝 문화를 위해 프로필 사진 등록이 필요합니다.
                꼭 얼굴이 나오지 않아도 괜찮아요! 평소 즐겨 신는 러닝화, 달리기
                기록 캡처, 혹은 나를 잘 나타내는 운동 사진이면 충분합니다.
                방장이 당신의 진정성을 확인할 수 있도록 도와주세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gender */}
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
                  ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Year */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">출생년도</Label>
        <Select value={birthYear} onValueChange={setBirthYear}>
          <SelectTrigger className="rounded-xl">
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-orange-500 py-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? '저장 중...' : '시작하기'}
      </Button>
    </form>
  )
}
