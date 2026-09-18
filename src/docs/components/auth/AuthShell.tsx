import { type ReactNode } from 'react'
import { motion, type Variants } from 'motion/react'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { LogoMark } from '@/components/brand/LogoMark'
import { LogoScene3D } from '@/components/brand/LogoScene3D'
import { Wordmark } from '@/components/brand/Wordmark'
import { Label } from '@/components/ui/Label'

/**
 * 왼쪽 브랜드 패널(3D 유리 로고가 포인터를 따라 기운다) + 오른쪽 폼.
 * 폼 안 필드들은 차례로 떠오르고, 하나에 포커스하면 나머지는 살짝 물러난다.
 */
export function AuthShell({ children, eyebrow, headline }: { children: ReactNode; eyebrow: string; headline: string }) {
  return (
    <div className="grid min-h-[680px] md:grid-cols-[5fr_7fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-[#0b0c10] p-10 text-[#f6f6f7] md:flex">
        {/* 3D 로고 — 투명 배경, 가운데, 포인터 추종 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,#1b2340_0%,#0b0c10_65%)]" />
        <div className="absolute inset-x-0 top-[6%] bottom-[22%]">
          <LogoScene3D transparent centered follow scale={0.62} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/80 to-transparent" />
        <div className="relative">
          <Wordmark />
        </div>
        <div className="relative">
          <Label>{eyebrow}</Label>
          <p className="mt-4 max-w-sm text-balance text-3xl font-semibold leading-[1.15] tracking-tight">{headline}</p>
          <p className="mt-6 font-mono text-[11px] text-fg-faint">© efface</p>
        </div>
      </aside>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[380px] [&:has(.ef-field:focus-within)_.ef-field:not(:focus-within)]:opacity-70 [&_.ef-field]:transition-opacity [&_.ef-field]:duration-300">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <LogoMark className="h-6 w-6 text-fg" />
            <span className="font-semibold tracking-tight">efface</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/** 자식들이 아래서 차례로 떠오른다 */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}>
      {children}
    </motion.div>
  )
}
const item: Variants = { hidden: { opacity: 0, y: 14, filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE_OUT_EXPO } } }
export const Item = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div variants={item} className={className}>
    {children}
  </motion.div>
)

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[11px] text-fg-faint">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

