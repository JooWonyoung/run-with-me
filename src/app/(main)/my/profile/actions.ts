'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Enums, Json } from '@/types/supabase'

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

export type UpdateProfileParams = {
  nickname: string
  profileImageUrl: string | null
  gender: Enums<'gender'> | null
  birthYear: string
  mbti: string
  message: string
  raceRecords: RaceRecord[]
  snsLinks: SNSLinks
}

export async function updateProfile(
  params: UpdateProfileParams
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { nickname, profileImageUrl, gender, birthYear, mbti, message, raceRecords, snsLinks } = params

  if (!nickname.trim()) {
    return { error: '닉네임을 입력해 주세요.' }
  }

  const birthYearNum = birthYear ? parseInt(birthYear, 10) : null
  if (birthYear && isNaN(birthYearNum!)) {
    return { error: '올바른 출생년도를 입력해 주세요.' }
  }

  const cleanedSnsLinks: SNSLinks = Object.fromEntries(
    Object.entries(snsLinks).filter(([, v]) => v && v.trim() !== '')
  ) as SNSLinks

  const updatePayload: Record<string, unknown> = {
    nickname: nickname.trim(),
    gender: gender ?? null,
    birth_year: birthYearNum,
    mbti: mbti.trim() || null,
    message: message.trim() || null,
    race_records: raceRecords as unknown as Json,
    sns_links: cleanedSnsLinks as unknown as Json,
  }

  if (profileImageUrl !== undefined) {
    updatePayload.profile_img = profileImageUrl
  }

  const { error: updateError } = await supabase
    .from('User')
    .update(updatePayload)
    .eq('id', user.id)

  if (updateError) {
    return { error: '프로필 저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  revalidatePath('/my/profile')
  revalidatePath('/my/runs')

  return { success: true }
}
