'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type LoginLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'>

/**
 * 로그인 페이지로 이동하며, 로그인 완료 후 현재 페이지로 돌아오기 위한 next 쿼리를 붙입니다.
 * forwardRef를 적용하여 Button asChild(Radix Slot) 패턴과 함께 사용할 수 있습니다.
 */
export const LoginLink = forwardRef<HTMLAnchorElement, LoginLinkProps>(
  function LoginLink({ children, ...props }, ref) {
    const pathname = usePathname()
    const next = pathname && pathname !== '/login' ? pathname : undefined
    const href = next ? `/login?next=${encodeURIComponent(next)}` : '/login'

    return (
      <Link ref={ref} href={href} {...props}>
        {children}
      </Link>
    )
  }
)
