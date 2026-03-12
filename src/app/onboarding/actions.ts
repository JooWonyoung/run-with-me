'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Enums, Json } from '@/types/supabase'

function getSafeNext(next: string): string {
  const trimmed = next.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }
  return '/'
}

export interface RaceRecord {
  raceName: string
  date: string
  distance: '5km' | '10km' | 'Half' | 'Full'
  record: string
}

export interface SNSLinks {
  instagram?: string
  strava?: string
  youtube?: string
  blog?: string
}

type CompleteOnboardingParams = {
  profileImageUrl: string
  gender: Enums<'gender'>
  birthYear: string
  message: string
  mbti: string
  raceRecords: RaceRecord[]
  snsLinks: SNSLinks
  next: string
}

export async function completeOnboarding(
  params: CompleteOnboardingParams
): Promise<{ error: string } | void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { profileImageUrl, gender, birthYear: birthYearStr, message, mbti, raceRecords, snsLinks, next } = params
  const birthYear = parseInt(birthYearStr, 10)
  const nextPath = getSafeNext(next || '/')

  if (!profileImageUrl) {
    return { error: '프로필 사진을 등록해 주세요.' }
  }

  if (!gender || !['male', 'female', 'none'].includes(gender)) {
    return { error: '성별을 선택해 주세요.' }
  }

  if (!birthYear || isNaN(birthYear)) {
    return { error: '출생년도를 선택해 주세요.' }
  }

  const cleanedSnsLinks: SNSLinks = Object.fromEntries(
    Object.entries(snsLinks).filter(([, v]) => v && v.trim() !== '')
  ) as SNSLinks

  const { error: updateError } = await supabase
    .from('User')
    .update({
      gender,
      birth_year: birthYear,
      profile_img: profileImageUrl,
      message: message.trim() || null,
      mbti: mbti.trim() || null,
      race_records: raceRecords as unknown as Json,
      sns_links: cleanedSnsLinks as unknown as Json,
      is_onboarded: true,
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: '프로필 저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  redirect(nextPath)
}
