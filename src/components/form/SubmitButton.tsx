import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SubmitButtonProps {
  status?: SubmitStatus
  children: ReactNode
  loadingLabel?: string
  successLabel?: string
  errorLabel?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'submit' | 'button'
}

const SPRING = { type: 'spring', stiffness: 520, damping: 32 } as const

/**
 * 제출 버튼. 누르면 알약으로 둥글어지며 빛이 스윕하고, 성공이면 체크가 그려지고 실패면 흔들린다.
 */
export function SubmitButton({ status = 'idle', children, loadingLabel = '확인 중', successLabel = '완료', errorLabel = '다시 시도', className, disabled, onClick, type = 'submit' }: SubmitButtonProps) {
  const reduce = useReducedMotion()
  const busy = status === 'loading'
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || busy || status === 'success'}
      aria-busy={busy || undefined}
      className={cn(
        'relative flex h-12 w-full items-center justify-center overflow-hidden font-medium transition-colors duration-300 disabled:cursor-default',
        status === 'success' ? 'bg-accent text-white' : status === 'error' ? 'bg-danger text-white' : 'bg-fg text-bg hover:bg-fg-2',
        className,
      )}
      animate={{ borderRadius: busy || status === 'success' ? 24 : 6, x: status === 'error' && !reduce ? [0, -8, 8, -6, 6, -3, 3, 0] : 0 }}
      transition={{ borderRadius: SPRING, x: { duration: 0.45 } }}
    >
      {busy && !reduce && (
        <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" initial={{ x: '-150%' }} animate={{ x: '400%' }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          aria-live="polite"
          className="relative flex items-center gap-2"
          initial={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        >
          {status === 'loading' && (
            <>
              <span className="flex gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-current" animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} />
                ))}
              </span>
              {loadingLabel}
            </>
          )}
          {status === 'success' && (
            <>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }} />
              </svg>
              {successLabel}
            </>
          )}
          {status === 'error' && errorLabel}
          {status === 'idle' && children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
