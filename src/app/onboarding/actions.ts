'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Enums } from '@/types/supabase'

function getSafeNext(next: string): string {
  const trimmed = next.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }
  return '/'
}

type CompleteOnboardingParams = {
  profileImageUrl: string
  gender: Enums<'gender'>
  birthYear: string
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

  const { profileImageUrl, gender, birthYear: birthYearStr, next } = params
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

  const { error: updateError } = await supabase
    .from('User')
    .update({
      gender,
      birth_year: birthYear,
      profile_img: profileImageUrl,
      is_onboarded: true,
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: '프로필 저장에 실패했습니다. 다시 시도해 주세요.' }
  }

  redirect(nextPath)
}
