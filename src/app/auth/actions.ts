'use server'

import { createClient } from '@/lib/supabase/server'
import { type Provider } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

const SAFE_NEXT_PREFIX = '/'

/** next가 같은 오리진 내 경로인지 검사 (오픈 리다이렉트 방지) */
function getSafeNext(next: string | null | undefined): string | undefined {
  if (!next || typeof next !== 'string') return undefined
  const trimmed = next.trim()
  if (trimmed.startsWith(SAFE_NEXT_PREFIX) && !trimmed.startsWith('//')) {
    return trimmed
  }
  return undefined
}

async function signInWithOAuth(provider: Provider, next?: string) {
  const supabase = await createClient()
  const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL)
  const safeNext = getSafeNext(next)
  if (safeNext) {
    callbackUrl.searchParams.set('next', safeNext)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    console.error(`[Auth] ${provider} sign-in error:`, error.message)
    redirect('/login?error=oauth_failed')
  }

  if (data.url) redirect(data.url)
}

export async function signInWithGoogle(formData?: FormData) {
  const next = formData?.get('next')
  const nextStr = typeof next === 'string' ? next : undefined
  await signInWithOAuth('google', nextStr)
}

// 추후 카카오 추가 시:
// export async function signInWithKakao() {
//   await signInWithOAuth('kakao')
// }
