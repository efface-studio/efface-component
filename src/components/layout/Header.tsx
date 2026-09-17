import type { ReactNode, RefObject } from 'react'
import { cn } from '@/lib/cn'
import { useScrolledPast } from '@/hooks/useScrolledPast'
import { Logo } from '@/components/brand/Logo'

export interface HeaderProps {
  items: { label: string; href: string }[]
  homeHref?: string
  /** 오른쪽 아이콘·언어·CTA 슬롯 */
  actions?: ReactNode
  contained?: boolean
  /** 창 대신 이 스크롤 컨테이너의 스크롤을 본다 (contained 와 함께) */
  scrollTarget?: RefObject<HTMLElement | null>
  className?: string
}

/**
 * 고정 헤더 (v1). 8px 이상 스크롤하면 흰 반투명 + 블러 + 하단 선이 생긴다.
 * 라이트 테마용 — 로고가 v1 잉크 마크.
 */
export function Header({ items, homeHref = '#', actions, contained = false, scrollTarget, className }: HeaderProps) {
  const scrolled = useScrolledPast(8, scrollTarget)
  return (
    <header
      className={cn(
        contained ? 'absolute' : 'fixed',
        'top-0 right-0 left-0 z-40 transition-colors',
        scrolled ? 'border-b border-line bg-bg/80 backdrop-blur-md' : 'bg-transparent',
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-page-v1 items-center justify-between px-5 md:h-16 md:px-8">
        <a href={homeHref} className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo size={24} />
          <span>efface</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-fg-dim md:flex">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="transition hover:text-fg">
              {it.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">{actions}</div>
      </div>
    </header>
  )
}
