import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/create', '/my', '/onboarding']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  let sessionRefreshed = false

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // setAll 호출 = access token 만료 후 refresh token으로 세션 갱신된 순간
          sessionRefreshed = true
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser()가 만료된 access token을 감지하면 refresh token으로 자동 갱신 시도
  const { data: { user }, error } = await supabase.auth.getUser()

  if (sessionRefreshed) {
    console.log(`[Middleware] Session refreshed for path: ${request.nextUrl.pathname}`)
  }

  if (error) {
    // refresh token도 만료되었거나 세션이 완전히 없는 경우
    console.warn(`[Middleware] Auth error on ${request.nextUrl.pathname}:`, error.message)
  }

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtectedPath) {
    console.log(`[Middleware] Unauthenticated access blocked: ${request.nextUrl.pathname}`)
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    // 스테일 Supabase 쿠키 정리
    request.cookies
      .getAll()
      .filter(({ name }) => name.startsWith('sb-'))
      .forEach(({ name }) => redirectResponse.cookies.delete(name))
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}