import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Footprints } from 'lucide-react'
import { OnboardingForm } from './_components/OnboardingForm'

type OnboardingPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { next } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('User')
    .select('is_onboarded')
    .eq('id', user.id)
    .single()

  if (userData?.is_onboarded) {
    redirect(next ?? '/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
            <Footprints className="h-7 w-7 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            런위드미 시작하기
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            함께 달리기 전에 간단한 정보를 알려주세요
          </p>
        </div>
        <OnboardingForm next={next ?? '/'} />
      </div>
    </main>
  )
}
