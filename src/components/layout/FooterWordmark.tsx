import { useEffect, useRef } from 'react'

/** 스포트라이트 창 폭 (글자 폭 대비) — v2는 폭의 약 40% */
const WINDOW_RATIO = 0.4
/** 스포트라이트 창 높이 (글자 높이 대비) */
const WINDOW_H_RATIO = 1.3
/** 보간 계수 (클수록 빠르게 따라옴) */
const LERP = 0.12
/** 비hover 시 왕복 주기 (ms) */
const SWEEP_MS = 7000

export interface FooterWordmarkProps {
  active: boolean
  text?: string
}

/**
 * 대형 EFFACE 워드마크 — CSS 버전 (Mom-Work, v2 캔버스 재현).
 * 글자는 가로로만 늘려(scaleX) 컨테이너 폭을 채우고, 그라데이션이 전체에 옅게
 * 깔리며 포인터(없으면 스윕) 주변 창 안에서만 선명해진다. 위치는 rAF에서 보간해
 * CSS 변수로 직접 쓴다(리렌더 없음). 부모에 `[container-type:inline-size]`가 필요하다.
 */
export function FooterWordmark({ active, text = 'EFFACE' }: FooterWordmarkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    const scaler = scaleRef.current
    const txt = textRef.current
    if (!el || !scaler || !txt) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const size = () => {
      const w = txt.offsetWidth
      const h = txt.offsetHeight
      const sx = w > 0 ? el.clientWidth / w : 1
      return { w, h, sx, gw: w * WINDOW_RATIO, gh: h * WINDOW_H_RATIO }
    }
    const applyScale = () => {
      const { sx, h } = size()
      scaler.style.setProperty('--sx', String(sx))
      el.style.height = `${h}px`
    }
    const setVars = (gx: number, gy: number) => {
      const { gw, gh } = size()
      scaler.style.setProperty('--gx', `${gx}px`)
      scaler.style.setProperty('--gy', `${gy}px`)
      scaler.style.setProperty('--gw', `${gw}px`)
      scaler.style.setProperty('--gh', `${gh}px`)
    }
    const centered = () => {
      const { w, h, gw, gh } = size()
      return { x: (w - gw) / 2, y: (h - gh) / 2 }
    }

    applyScale()
    const ro = new ResizeObserver(applyScale)
    ro.observe(el)

    if (reduced || !active) {
      const c = centered()
      setVars(c.x, c.y)
      return () => ro.disconnect()
    }

    let raf = 0
    let cur = centered()
    const start = performance.now()
    const tick = (now: number) => {
      const { w, h, gw, gh } = size()
      const minX = -gw / 2
      const maxX = w - gw / 2
      const minY = -gh / 2
      const maxY = h - gh / 2
      const t = (now - start) / SWEEP_MS
      const p = pointer.current
      const target = p
        ? { x: Math.min(maxX, Math.max(minX, p.x - gw / 2)), y: Math.min(maxY, Math.max(minY, p.y - gh / 2)) }
        : {
            x: minX + (0.5 + 0.5 * Math.sin(t * Math.PI * 2)) * (maxX - minX),
            y: minY + (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 0.6 + 1)) * (maxY - minY),
          }
      cur = { x: cur.x + (target.x - cur.x) * LERP, y: cur.y + (target.y - cur.y) * LERP }
      setVars(cur.x, cur.y)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [active])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="footer-wordmark"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !textRef.current) return
        const r = e.currentTarget.getBoundingClientRect()
        const sx = r.width / textRef.current.offsetWidth
        pointer.current = { x: (e.clientX - r.left) / sx, y: e.clientY - r.top }
      }}
      onPointerLeave={() => {
        pointer.current = null
      }}
    >
      <div ref={scaleRef} className="footer-wordmark__scale">
        <span ref={textRef} className="footer-wordmark__text">
          {text}
        </span>
        <span className="footer-wordmark__text footer-wordmark__tint">{text}</span>
        <div className="footer-wordmark__window">
          <span className="footer-wordmark__text footer-wordmark__glow">{text}</span>
        </div>
      </div>
    </div>
  )
}
