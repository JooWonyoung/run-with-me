import Link from 'next/link'
import { Footprints } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CreateRunDialog } from '@/components/runs/CreateRunDialog'
import { LoginLink } from '@/components/LoginLink'
import UserMenu from './UserMenu'

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { nickname: string | null; profile_img: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('User')
      .select('nickname, profile_img')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-slate-900 transition-opacity hover:opacity-80 dark:text-slate-50"
        >
          <Footprints className="h-5 w-5 text-orange-500" />
          <span className="text-base tracking-tight">Run With Me</span>
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">
            <CreateRunDialog size="sm" />
            <UserMenu
              nickname={profile?.nickname ?? null}
              profileImg={profile?.profile_img ?? null}
            />
          </div>
        ) : (
          <Button asChild variant="outline" size="sm">
            <LoginLink>로그인</LoginLink>
          </Button>
        )}
      </div>
    </header>
  )
}
