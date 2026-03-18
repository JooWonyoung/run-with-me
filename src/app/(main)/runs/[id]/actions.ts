'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ApplyToRunResult =
  | { success: true }
  | { error: string }

export async function applyToRun(runId: string): Promise<ApplyToRunResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing } = await supabase
    .from('Applications')
    .select('id, status')
    .eq('run_id', runId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: '이미 신청한 모임입니다.' }
  }

  const { data: run } = await supabase
    .from('Runs')
    .select('host_id, status')
    .eq('id', runId)
    .is('deleted_at', null)
    .single()

  if (!run) {
    return { error: '존재하지 않는 모임입니다.' }
  }

  if (run.host_id === user.id) {
    return { error: '본인이 호스트인 모임에는 신청할 수 없습니다.' }
  }

  if (run.status !== 'open' && run.status !== null) {
    return { error: '현재 모집 중인 모임이 아닙니다.' }
  }

  const { error } = await supabase
    .from('Applications')
    .insert({ run_id: runId, user_id: user.id, status: 'pending' })

  if (error) {
    return { error: '신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }
  }

  return { success: true }
}
