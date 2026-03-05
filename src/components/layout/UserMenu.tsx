'use client'

import Link from 'next/link'
import { LogOut, Settings, Users } from 'lucide-react'

import { signOut } from '@/app/auth/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  nickname: string | null
  profileImg: string | null
}

export default function UserMenu({ nickname, profileImg }: UserMenuProps) {
  const initials = nickname?.[0]?.toUpperCase() ?? 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="프로필 메뉴"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImg ?? undefined} alt={nickname ?? '프로필'} />
            <AvatarFallback className="bg-orange-100 text-xs font-semibold text-orange-700">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
        {nickname && (
          <>
            <div className="px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-50">
              {nickname}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/my/runs" className="flex cursor-pointer items-center gap-2">
            <Users className="h-4 w-4" />
            내 러닝 모임
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/my/profile" className="flex cursor-pointer items-center gap-2">
            <Settings className="h-4 w-4" />
            프로필 설정
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" asChild>
          <form action={signOut} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
