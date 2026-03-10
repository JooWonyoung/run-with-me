import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/** next가 같은 오리진 내 경로인지 검사 (오픈 리다이렉트 방지) */
function getSafeNext(next: string | null): string {
  if (!next || typeof next !== 'string') return '/'
  const trimmed = next.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }
  return '/'
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = getSafeNext(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('[Auth] OAuth session exchange successful')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('User')
          .select('is_onboarded')
          .eq('id', user.id)
          .single()

        if (!userData?.is_onboarded) {
          const onboardingUrl = new URL('/onboarding', origin)
          if (next !== '/') {
            onboardingUrl.searchParams.set('next', next)
          }
          return NextResponse.redirect(onboardingUrl.toString())
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[Auth] exchangeCodeForSession error:', error.message)
  } else {
    console.warn('[Auth] Callback called without authorization code')
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
