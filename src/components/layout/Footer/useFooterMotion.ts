import { useEffect, useRef, type RefObject } from 'react'
import { clamp, easeOutCubic } from '@/lib/motion'
import { createWordmarkPainter, type PointerSample } from './wordmarkCanvas'

/** 진입 시퀀스가 앞으로 걸리는 초, 그리고 나갈 때 되감기는 초. */
const SEQ_IN = 1.6
const SEQ_OUT = 0.45
/** 시퀀스가 앞으로 재생되려면 푸터가 차지해야 하는 뷰포트 띠. */
const VISIBLE_TOP = 0.72
const VISIBLE_BOTTOM = 0.2

export interface FooterRefs {
  rootRef: RefObject<HTMLElement | null>
  wipeRef: RefObject<HTMLDivElement | null>
  headRef: RefObject<HTMLDivElement | null>
  metaRef: RefObject<HTMLDivElement | null>
  strikeRef: RefObject<HTMLSpanElement | null>
  barRef: RefObject<HTMLDivElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  cwrapRef: RefObject<HTMLDivElement | null>
}

/**
 * 푸터 진입 (v2): 대각선 와이프가 블록을 드러내고, 락업과 메타 컬럼이 스태거로
 * 떠오르고, 태그라인의 취소선이 그어지고, 워드마크가 왼쪽에서 오른쪽으로 벗겨지고,
 * 하단 바가 떠오른다. 스크롤 가역 — 푸터가 뷰포트를 떠나면 되감긴다.
 * rAF 루프 하나가 이 전부와 워드마크 커서 트레일을 돌린다.
 */
export function useFooterMotion(): FooterRefs {
  const rootRef = useRef<HTMLElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const strikeRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cwrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer: PointerSample = { x: -9999, y: -9999, t: 0 }
    const painter = createWordmarkPainter(canvas, reduced)
    let raf = 0
    let seq = 0
    let lastT = 0

    const onMouse = (e: MouseEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.t = performance.now()
    }
    const onResize = () => painter.setup()
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize', onResize)

    // 워드마크는 텍스트로 그리므로 디스플레이 서체가 실제로 로드된 뒤에야 측정할 수 있다.
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => painter.setup())

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const vh = window.innerHeight
      const rect = root.getBoundingClientRect()
      const now = performance.now()
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000)
      lastT = now

      const visible = rect.top < vh * VISIBLE_TOP && rect.bottom > vh * VISIBLE_BOTTOM
      seq = clamp(seq + (visible ? dt / SEQ_IN : -dt / SEQ_OUT), 0, 1)
      const p = reduced ? 1 : seq

      if (wipeRef.current) {
        const wt = easeOutCubic(clamp(p / 0.55, 0, 1))
        const el = wipeRef.current
        if (wt >= 1) {
          if (el.style.maskImage !== 'none') {
            el.style.maskImage = 'none'
            el.style.webkitMaskImage = 'none'
          }
        } else {
          const e2 = -15 + wt * 145
          const m = `linear-gradient(115deg, rgba(0,0,0,1) ${e2 - 14}%, rgba(0,0,0,0) ${e2}%)`
          el.style.maskImage = m
          el.style.webkitMaskImage = m
        }
      }
      if (headRef.current) {
        const tt = easeOutCubic(clamp(p / 0.2, 0, 1))
        headRef.current.style.opacity = String(0.1 + 0.9 * tt)
        headRef.current.style.transform = `translateY(${(1 - tt) * 14}px)`
        headRef.current.style.filter = tt >= 1 ? 'none' : `blur(${(1 - tt) * 8}px)`
      }
      if (metaRef.current) {
        metaRef.current.style.opacity = String(clamp(p * 6, 0, 1))
        const cols = Array.from(metaRef.current.children) as HTMLElement[]
        cols.forEach((col, i) => {
          const tt = easeOutCubic(clamp((p - 0.14 - i * 0.07) / 0.24, 0, 1))
          col.style.opacity = String(tt)
          col.style.transform = `translateY(${(1 - tt) * 18}px)`
          col.style.filter = tt >= 1 ? 'none' : `blur(${(1 - tt) * 8}px)`
        })
      }
      if (strikeRef.current) {
        strikeRef.current.style.transform = `scaleX(${easeOutCubic(clamp((p - 0.1) / 0.18, 0, 1))})`
      }
      if (cwrapRef.current) {
        const tt = easeOutCubic(clamp((p - 0.38) / 0.32, 0, 1))
        cwrapRef.current.style.clipPath = `inset(0 ${(1 - tt) * 100}% 0 0)`
      }
      if (barRef.current) {
        barRef.current.style.opacity = String(easeOutCubic(clamp((p - 0.66) / 0.22, 0, 1)))
      }

      painter.paint(pointer, now)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return { rootRef, wipeRef, headRef, metaRef, strikeRef, barRef, canvasRef, cwrapRef }
}
