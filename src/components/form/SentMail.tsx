import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'

const EASE = EASE_OUT_EXPO
const SPRING = { type: 'spring', stiffness: 380, damping: 26 } as const

/**
 * "메일을 보냈어요" 일러스트. 봉투 덮개가 열리고 편지가 위로 빠져나온 뒤
 * 모서리에 체크 배지가 맺힌다. 뒤에서 액센트 빛이 한 번 부풀었다 가라앉는다.
 */
export function SentMail({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const t = (delay: number) => (reduce ? { duration: 0 } : { ...SPRING, delay })
  return (
    <div className={cn('relative flex h-32 w-40 items-center justify-center', className)} aria-hidden>
      {/* 빛 — 편지가 나올 때 한 번 부푼다 */}
      <motion.span
        className="absolute h-24 w-24 rounded-full bg-[radial-gradient(circle,var(--accent-soft)_0%,transparent_70%)]"
        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.6, 1.2], opacity: [0, 1, 0.7] }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.35 }}
      />
      <svg viewBox="0 0 160 128" className="relative h-full w-full overflow-visible">
        {/* 봉투 뒤판 */}
        <rect x="32" y="48" width="96" height="60" rx="10" className="fill-surface-2 stroke-line-strong" strokeWidth="1.5" />
        {/* 덮개 — 위 모서리를 축으로 뒤로 젖혀진다 */}
        <motion.path
          d="M32 56 Q32 48 40 48 H120 Q128 48 128 56 L80 84 Z"
          className="fill-surface stroke-line-strong"
          strokeWidth="1.5"
          style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}
          initial={reduce ? false : { rotateX: 0 }}
          animate={{ rotateX: -175 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: 0.15 }}
        />
        {/* 편지 — 덮개가 열리면 위로 빠져나온다 */}
        <motion.g initial={reduce ? false : { y: 26, opacity: 0 }} animate={{ y: -18, opacity: 1 }} transition={t(0.45)}>
          <rect x="44" y="40" width="72" height="62" rx="6" className="fill-bg stroke-line" strokeWidth="1.5" />
          <rect x="54" y="52" width="30" height="4" rx="2" className="fill-fg-faint/60" />
          <rect x="54" y="62" width="52" height="3" rx="1.5" className="fill-line-strong" />
          <rect x="54" y="70" width="44" height="3" rx="1.5" className="fill-line-strong" />
          {/* 재설정 링크 — 액센트 한 줄이 왼쪽에서 그어진다 */}
          <motion.rect x="54" y="80" width="36" height="4" rx="2" className="fill-accent" style={{ transformBox: 'fill-box', transformOrigin: '0 50%' }} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.85 }} />
        </motion.g>
        {/* 봉투 앞주머니 — 편지의 아랫부분을 가린다 */}
        <path d="M32 60 L80 90 L128 60 V98 Q128 108 118 108 H42 Q32 108 32 98 Z" className="fill-surface stroke-line-strong" strokeWidth="1.5" strokeLinejoin="round" />
        {/* 체크 배지 */}
        <motion.g initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={t(0.95)} style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}>
          <circle cx="122" cy="34" r="14" className="fill-accent" />
          <motion.path d="M115 34.5 L120 39.5 L129 29" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE, delay: 1.15 }} />
        </motion.g>
      </svg>
    </div>
  )
}
