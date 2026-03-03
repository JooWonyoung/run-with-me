import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('[Auth] OAuth session exchange successful')
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[Auth] exchangeCodeForSession error:', error.message)
  } else {
    console.warn('[Auth] Callback called without authorization code')
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
