import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import type { ShowcaseShot } from '@/docs/showcase.data'

export interface LightboxProps {
  shots: ShowcaseShot[]
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
  host: string
}

/** 풀페이지 스크린샷을 세로로 스크롤하며 보는 라이트박스. ← → 로 이전/다음, ESC 로 닫기. */
export function Lightbox({ shots, index, onClose, onIndex, host }: LightboxProps) {
  const open = index !== null
  const shot = index !== null ? shots[index] : undefined
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index !== null && index < shots.length - 1) onIndex(index + 1)
      if (e.key === 'ArrowLeft' && index !== null && index > 0) onIndex(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, shots.length, onClose, onIndex])

  return (
    <AnimatePresence>
      {open && shot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/85 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="flex h-12 shrink-0 items-center justify-between px-4 text-white md:px-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-sm font-medium">{shot.title || shot.path}</span>
              <span className="hidden truncate font-mono text-[11px] text-white/50 sm:inline">
                {host}
                {shot.path}
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] text-white/60 uppercase">
                {shot.viewport} · {shot.w}×{shot.h}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-2 font-mono text-[11px] text-white/50">
                {(index ?? 0) + 1} / {shots.length}
              </span>
              <button type="button" onClick={() => index !== null && index > 0 && onIndex(index - 1)} disabled={index === 0} className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Previous">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => index !== null && index < shots.length - 1 && onIndex(index + 1)} disabled={index === shots.length - 1} className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Next">
                <ChevronRight size={16} />
              </button>
              <button type="button" onClick={onClose} className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close">
                <X size={16} />
              </button>
            </div>
          </div>
          <motion.div
            key={shot.file}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 md:px-8"
          >
            <img
              src={shot.file}
              alt={shot.title}
              width={shot.w}
              height={shot.h}
              onClick={(e) => e.stopPropagation()}
              className={cn('mx-auto block h-auto rounded-lg shadow-[0_30px_80px_rgba(0,0,0,0.5)]', shot.viewport === 'mobile' ? 'w-full max-w-[420px]' : 'w-full max-w-[1440px]')}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
