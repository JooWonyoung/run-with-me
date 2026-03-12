'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfileImage(
  profileImageUrl: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error: updateError, count } = await supabase
    .from('User')
    .update({ profile_img: profileImageUrl })
    .eq('id', user.id)

  if (updateError) {
    return { error: '프로필 사진 업데이트에 실패했습니다.' }
  }

  if (count === 0) {
    return { error: '프로필 업데이트 권한이 없습니다. 잠시 후 다시 시도해 주세요.' }
  }
}
