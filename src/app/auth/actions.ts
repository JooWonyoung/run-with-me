'use server'

import { createClient } from '@/lib/supabase/server'
import { type Provider } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error(`[Auth] ${provider} sign-in error:`, error.message)
    redirect('/login?error=oauth_failed')
  }

  if (data.url) redirect(data.url)
}

export async function signInWithGoogle() {
  await signInWithOAuth('google')
}

// 추후 카카오 추가 시:
// export async function signInWithKakao() {
//   await signInWithOAuth('kakao')
// }
