import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface FloatingCTAAction {
  label: string
  href: string
  variant?: 'primary' | 'kakao' | 'outline'
  external?: boolean
}

export interface FloatingCTAProps {
  /** 버튼 텍스트 */
  bubble: string
  eyebrow?: string
  title: string
  actions: FloatingCTAAction[]
  note?: ReactNode
  /** true면 표시. v1은 300px 이상 스크롤 시 켰다. */
  visible?: boolean
  /** 문서 프리뷰용 — 컨테이너 안에 absolute */
  contained?: boolean
  className?: string
}

/**
 * 우하단 플로팅 CTA (v1). 알약 버튼 → 위로 펼쳐지는 패널. 호버 시 화살표 원이 12° 돈다.
 */
export function FloatingCTA({ bubble, eyebrow = 'Get in touch', title, actions, note, visible = true, contained = false, className }: FloatingCTAProps) {
  const [open, setOpen] = useState(false)
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className={cn(contained ? 'absolute' : 'fixed', 'right-5 bottom-5 z-40 flex flex-col items-end gap-3 md:right-7 md:bottom-7', className)}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="w-[280px] origin-bottom-right rounded-2xl border border-line bg-surface p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs tracking-[0.2em] text-fg-dim uppercase">{eyebrow}</p>
                    <p className="text-sm font-semibold">{title}</p>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-bg-soft" aria-label="닫기">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {actions.map((a) => (
                    <a
                      key={a.href}
                      href={a.href}
                      {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex h-11 items-center justify-between gap-2 rounded-lg px-3 text-sm font-medium transition',
                        (a.variant ?? 'primary') === 'primary' && 'bg-fg text-bg hover:opacity-90',
                        a.variant === 'kakao' && 'bg-kakao text-kakao-fg hover:opacity-90',
                        a.variant === 'outline' && 'border border-line font-normal hover:border-fg',
                      )}
                    >
                      <span>{a.label}</span>
                      <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
                {note && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-fg-dim">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {note}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-fg pr-3 pl-5 text-bg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.25)] transition hover:opacity-95"
            aria-label={bubble}
            aria-expanded={open}
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{open ? '×' : bubble}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-fg transition-transform group-hover:rotate-12">
              <ArrowUpRight size={14} />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
