import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { useDisplayFonts } from '@/hooks/useDisplayFonts'

export interface TileFlipProps {
  cols?: number
  rows?: number
  /** 앞·뒤 면 */
  front: string
  back: string
  every?: number
  className?: string
}

/**
 * 모자이크 타일이 왼쪽 위부터 물결처럼 뒤집히며 다른 면을 드러낸다.
 * 앞면은 글자 큰 타이포, 뒷면은 액센트 — 주기적으로 오간다. 타일에 마우스를 올리면 그 칸만 먼저 뒤집힌다.
 */
export function TileFlip({ cols = 10, rows = 5, front, back, every = 3200, className }: TileFlipProps) {
  useDisplayFonts()
  const [flipped, setFlipped] = useState(false)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const t = window.setInterval(() => setFlipped((v) => !v), every)
    return () => window.clearInterval(t)
  }, [every, reduce])
  const tiles = Array.from({ length: cols * rows })
  return (
    <div className={cn('relative h-full w-full select-none', className)} style={{ perspective: 900 }} aria-label={flipped ? back : front}>
      <div className="grid h-full w-full gap-[2px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {tiles.map((_, i) => {
          const c = i % cols
          const r = Math.floor(i / cols)
          const delay = (c + r) * 45
          return (
            <div key={i} className="relative [transform-style:preserve-3d]" aria-hidden>
              <div className="tile-flip absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `rotateY(${flipped ? 180 : 0}deg)`, transition: reduce ? 'none' : `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}>
                <Face text={front} c={c} r={r} cols={cols} rows={rows} className="bg-surface text-fg" />
                <Face text={back} c={c} r={r} cols={cols} rows={rows} className="bg-accent text-white [transform:rotateY(180deg)]" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 큰 글자 한 장을 타일 크기로 잘라 보이는 조각 */
function Face({ text, c, r, cols, rows, className }: { text: string; c: number; r: number; cols: number; rows: number; className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden rounded-[3px] [backface-visibility:hidden]', className)}>
      <div className="absolute flex items-center justify-center font-display font-bold tracking-tight whitespace-nowrap" style={{ width: `${cols * 100}%`, height: `${rows * 100}%`, left: `${-c * 100}%`, top: `${-r * 100}%`, fontSize: `${rows * 62}%` }}>
        {text}
      </div>
    </div>
  )
}
