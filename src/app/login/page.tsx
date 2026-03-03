import { signInWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footprints } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-sm rounded-2xl shadow-sm">
        <CardHeader className="items-center text-center pb-2">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
            <Footprints className="h-7 w-7 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Run With Me</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            함께 달리고 싶은 러너들을 위한 공간
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4">
          <form action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outline"
              className="w-full gap-3 rounded-xl border-slate-200 py-5 text-sm font-medium shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700"
            >
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              구글로 시작하기
            </Button>
          </form>
          {/* 추후 카카오 추가 시:
          <form action={signInWithKakao}>
            <Button type="submit" className="w-full ...">
              카카오로 시작하기
            </Button>
          </form>
          */}
          <p className="text-center text-xs text-muted-foreground">
            가입 시{' '}
            <span className="underline underline-offset-2">서비스 이용약관</span>
            {' '}및{' '}
            <span className="underline underline-offset-2">개인정보처리방침</span>
            에 동의하는 것으로 간주합니다.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
