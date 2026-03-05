import { Activity, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const VALUE_PROPOSITIONS = [
  {
    icon: <Users className="h-6 w-6 text-orange-500" />,
    title: '함께 달리는 즐거움',
    description: '혼자 달리기 어렵다면? 같은 목표를 가진 러너들과 함께라면 더 멀리, 더 즐겁게 달릴 수 있어요.',
  },
  {
    icon: <MapPin className="h-6 w-6 text-blue-500" />,
    title: '내 주변 모임 발견',
    description: '서울 곳곳에서 열리는 러닝 모임을 쉽게 찾아보세요. 한강, 공원, 도심 어디든 달릴 수 있어요.',
  },
  {
    icon: <Activity className="h-6 w-6 text-orange-500" />,
    title: '실력에 맞는 페이스',
    description: '초보부터 고수까지, 거리와 페이스를 미리 확인하고 나에게 맞는 모임에 참가하세요.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-blue-600/10 dark:from-orange-600/20 dark:to-blue-600/20"
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
            <Activity className="h-4 w-4" />
            러닝 크루 매칭 플랫폼
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl">
            같이 달리면
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              더 멀리 갈 수 있어요
            </span>
          </h1>

          <p className="max-w-md text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            내 주변 러닝 모임을 찾고, 새로운 러닝 메이트를 만나보세요. 
            모든 페이스와 거리를 환영합니다.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-orange-600 px-8 text-white hover:bg-orange-700"
            >
              <Link href="/runs">모임 찾기</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-300 px-8 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Link href="/runs">어떻게 동작하나요?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="mx-auto w-full max-w-screen-lg px-4 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
            왜 Run With Me인가요?
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            함께 달릴 이유가 생깁니다
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {VALUE_PROPOSITIONS.map((item) => (
            <Card
              key={item.title}
              className="rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900"
            >
              <CardContent className="flex flex-col gap-4 px-6 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto w-full max-w-screen-lg px-4 pb-24">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-r from-orange-600 to-blue-600 px-6 py-14 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold sm:text-3xl">지금 바로 달려볼까요?</h2>
          <p className="max-w-sm text-white/80">
            오늘도 어딘가에서 러닝 모임이 열리고 있어요. 빈자리가 없어지기 전에 참가하세요.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white px-10 text-orange-600 hover:bg-white/90"
          >
            <Link href="/runs">모임 둘러보기</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
