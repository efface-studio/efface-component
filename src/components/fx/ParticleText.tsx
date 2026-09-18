import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ParticleTextProps {
  /** 글자 — src 가 없을 때 */
  text?: string
  /** 이미지(svg/png) URL — 알파가 있는 픽셀이 입자가 된다. 채도 있는 픽셀은 --accent, 나머지는 color */
  src?: string
  /** 입자 간격(px). 작을수록 촘촘하고 무겁다 */
  gap?: number
  /** 포인터가 밀어내는 반지름(px) */
  radius?: number
  /** 글자 크기 — 컨테이너 폭 대비 비율 */
  scale?: number
  className?: string
}

interface P {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
  r: number
  accent: boolean
}

/**
 * 입자들이 흩어져 있다가 글자(또는 이미지 — 로고)로 모인다. 포인터를 가져가면 밀려났다 되돌아오고,
 * 누르면 폭발했다가 다시 모양을 이룬다. 색은 컨테이너의 color / --accent 를 읽는다.
 */
export function ParticleText({ text = '', src, gap = 5, radius = 90, scale = 0.82, className }: ParticleTextProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let parts: P[] = []
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let pointer = { x: -9999, y: -9999 }
    let fg = '#000'
    let accent = '#2563eb'
    let settled = false

    let img: HTMLImageElement | null = null
    const FONT = `800 {size}px 'Pretendard Variable', Pretendard, system-ui, sans-serif`
    const fontAt = (size: number) => FONT.replace('{size}', String(size))

    // 글자(또는 이미지)를 오프스크린에 그려 픽셀을 표본화 → 입자 목표점 (+ 색)
    const sample = (): [number, number, boolean][] => {
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const c = off.getContext('2d')
      if (!c) return []
      if (src) {
        if (!img) return []
        const pad = 0.12
        const s = Math.min((w * (1 - pad * 2)) / img.width, (h * scale) / img.height)
        const dw = img.width * s
        const dh = img.height * s
        c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
      } else {
        let size = Math.min(h * scale, (w * 1.6) / Math.max(text.length, 1))
        c.font = fontAt(size)
        // 폭에 맞춰 줄인다
        const tw = c.measureText(text).width
        if (tw > w * 0.92) {
          size *= (w * 0.92) / tw
          c.font = fontAt(size)
        }
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillStyle = '#fff'
        c.fillText(text, w / 2, h / 2)
      }
      const data = c.getImageData(0, 0, w, h).data
      const pts: [number, number, boolean][] = []
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const i = (y * w + x) * 4
          const a = data[i + 3] ?? 0
          if (a <= 128) continue
          let accentPx = false
          if (src) {
            // 채도가 있으면 액센트, 무채색이면 테마 글자색
            const r = data[i] ?? 0
            const g = data[i + 1] ?? 0
            const b = data[i + 2] ?? 0
            accentPx = Math.max(r, g, b) - Math.min(r, g, b) > 40
          } else accentPx = Math.random() < 0.08
          pts.push([x + (Math.random() - 0.5) * 1.2, y + (Math.random() - 0.5) * 1.2, accentPx])
        }
      }
      return pts
    }

    const build = () => {
      const pts = sample()
      const prev = parts
      parts = pts.map(([tx, ty, accentPx], i) => {
        const old = prev[i]
        return {
          x: old ? old.x : Math.random() * w,
          y: old ? old.y : Math.random() * h,
          tx,
          ty,
          vx: old ? old.vx : 0,
          vy: old ? old.vy : 0,
          r: gap * 0.34 + Math.random() * gap * 0.16,
          accent: accentPx,
        }
      })
      settled = false
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      build()
      if (reduce) drawStatic()
    }

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        ctx.fillStyle = p.accent ? accent : fg
        ctx.beginPath()
        ctx.arc(p.tx, p.ty, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const r2 = radius * radius
      let moving = 0
      for (const p of parts) {
        // 목표점으로 당기는 스프링
        let ax = (p.tx - p.x) * 0.045
        let ay = (p.ty - p.y) * 0.045
        // 포인터 반발
        const dx = p.x - pointer.x
        const dy = p.y - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1
          const f = ((radius - d) / radius) * 2.2
          ax += (dx / d) * f
          ay += (dy / d) * f
        }
        p.vx = (p.vx + ax) * 0.82
        p.vy = (p.vy + ay) * 0.82
        p.x += p.vx
        p.y += p.vy
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.05) moving++
        ctx.fillStyle = p.accent ? accent : fg
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      settled = moving === 0 && pointer.x < -999
      if (!settled) raf = requestAnimationFrame(step)
      else raf = 0
    }
    const wake = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      wake()
    }
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 }
      wake()
    }
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      for (const p of parts) {
        const dx = p.x - cx
        const dy = p.y - cy
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        const f = Math.max(0, 1 - d / (w * 0.6)) * 26 + Math.random() * 4
        p.vx += (dx / d) * f
        p.vy += (dy / d) * f
      }
      wake()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    wake()
    // 웹폰트/이미지가 늦게 오면 다시 표본화한다 — 그 전엔 대체 글꼴 모양
    if (src) {
      const im = new Image()
      im.onload = () => {
        img = im
        resize()
        wake()
      }
      im.src = src
    } else {
      document.fonts?.load(fontAt(64)).then(() => {
        resize()
        wake()
      }).catch(() => {})
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    // 테마가 바뀌면 색을 다시 읽는다
    const mo = new MutationObserver(resize)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [text, src, gap, radius, scale, reduce])

  return (
    <div className={cn('relative h-full w-full cursor-crosshair touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-label={text || 'logo'} role="img" />
    </div>
  )
}
