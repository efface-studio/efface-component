import { useEffect, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { DURATION, menuItem, overlayFade } from '@/lib/motion'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useScrolledPast } from '@/hooks/useScrolledPast'
import { Wordmark } from '@/components/brand/Wordmark'

export interface NavItem {
  label: string
  href: string
}

export interface NavProps {
  items: NavItem[]
  /** 로고 링크 */
  homeHref?: string
  /** 오른쪽 슬롯 — 언어 토글 등 */
  aside?: ReactNode
  /** 오버레이 하단 슬롯 — 이메일, 언어 토글 */
  overlayFooter?: ReactNode
  /** 이 px 이상 스크롤하면 바가 사라진다. */
  hideAfter?: number
  /** `fixed` 대신 `absolute` — 문서 프리뷰처럼 컨테이너 안에 가둘 때 */
  contained?: boolean
  /** 창 대신 이 스크롤 컨테이너의 스크롤을 본다 (contained 와 함께) */
  scrollTarget?: RefObject<HTMLElement | null>
  /** 제어 모드 — 오버레이 열림 상태를 바깥에서 쥔다 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  labels?: { menu: string; close: string }
  className?: string
}

/**
 * 상단 바 + 햄버거 오버레이 메뉴 (v2).
 * 바는 맨 위에서만 보인다 — 아래 씬의 거대 타이포가 뷰포트 끝에 붙어 흐르는데
 * 고정 바가 그걸 잘랐다. 메뉴가 열려 있는 동안은 닫기 버튼이 닿도록 그대로 둔다.
 */
export function Nav({
  items,
  homeHref = '#',
  aside,
  overlayFooter,
  hideAfter = 8,
  contained = false,
  scrollTarget,
  open: openProp,
  onOpenChange,
  labels = { menu: 'Menu', close: 'Close' },
  className,
}: NavProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = (v: boolean) => {
    setOpenState(v)
    onOpenChange?.(v)
  }
  const scrolled = useScrolledPast(hideAfter, scrollTarget)
  const reduce = useReducedMotion()
  useBodyScrollLock(open && !contained)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpenState(false)
      onOpenChange?.(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const pos = contained ? 'absolute' : 'fixed'

  return (
    <>
      <header
        className={cn(
          pos,
          'inset-x-0 top-0 z-50 border-b border-transparent transition-[transform,opacity] duration-300 ease-out',
          scrolled && !open ? 'pointer-events-none -translate-y-full opacity-0' : 'translate-y-0 opacity-100',
          className,
        )}
      >
        <div className="mx-auto flex h-16 max-w-page items-center justify-between px-6 md:h-20 md:px-10">
          <Wordmark href={homeHref} />
          <div className="flex items-center gap-5 md:gap-7">
            {aside}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
              aria-label={open ? labels.close : labels.menu}
              aria-expanded={open}
            >
              <span className={cn('h-px w-6 bg-fg transition-all duration-300', open && 'translate-y-[3px] rotate-45')} />
              <span className={cn('h-px w-6 bg-fg transition-all duration-300', open && '-translate-y-[3px] -rotate-45')} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(pos, 'inset-0 z-40 bg-bg/95 backdrop-blur-xl')}
            variants={overlayFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className="mx-auto flex h-full max-w-page flex-col justify-center px-6 md:px-10">
              <ul className="space-y-2 md:space-y-3">
                {items.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-5 py-1"
                      variants={menuItem(i)}
                      initial={reduce ? false : 'hidden'}
                      animate="visible"
                      exit="exit"
                    >
                      <span className="font-mono text-sm text-fg-faint">0{i + 1}</span>
                      <span className="text-4xl font-semibold tracking-tight text-fg-dim transition-colors duration-300 group-hover:text-fg sm:text-5xl md:text-6xl">
                        {item.label}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
              {overlayFooter && (
                <motion.div
                  className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.fast, delay: 0.35 }}
                >
                  {overlayFooter}
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
