import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

export interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** 상단 그라데이션 선 + 우상단 블루 글로우 장식 (v1 exit-intent) */
  decorated?: boolean
  contained?: boolean
  className?: string
}

/**
 * 모달 (v1 exit-intent). 반투명 잉크 배경 + 블러, 카드는 아래에서 살짝 올라오며 커진다.
 * ESC와 배경 클릭으로 닫힌다.
 */
export function Modal({ open, onClose, children, decorated = true, contained = false, className }: ModalProps) {
  useBodyScrollLock(open && !contained)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(contained ? 'absolute' : 'fixed', 'inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm')}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className={cn('relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]', className)}
          >
            {decorated && (
              <>
                <div aria-hidden className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.5) 50%, transparent 100%)' }} />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)', filter: 'blur(20px)' }}
                />
              </>
            )}
            <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-bg-soft" aria-label="Close">
              <X size={15} />
            </button>
            <div className="relative px-8 pt-9 pb-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
