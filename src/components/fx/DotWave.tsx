import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface DotWaveProps {
  /** 점 간격(px) */
  gap?: number
  /** 포인터 영향 반지름(px) */
  radius?: number
  className?: string
}

interface Ripple {
  x: number
  y: number
  t: number
}

/**
 * 점 격자가 포인터 주위로 부풀고 액센트색으로 물들며, 누르면 파문이 퍼져 나간다.
 * 가만히 두면 아주 느린 숨결만 남는다.
 */
export function DotWave({ gap = 22, radius = 140, className }: DotWaveProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let pointer = { x: -9999, y: -9999 }
    let fg = '#000'
    let accent = '#2563eb'
    const ripples: Ripple[] = []

    const rgb = (color: string) => {
      const c = document.createElement('canvas').getContext('2d')
      if (!c) return [0, 0, 0]
      c.fillStyle = color
      const v = c.fillStyle // #rrggbb 로 정규화
      return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]
    }
    let fgRgb = [0, 0, 0]
    let acRgb = [37, 99, 235]

    const resize = () => {
      const rect = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      fgRgb = rgb(fg)
      acRgb = rgb(accent)
      draw()
    }

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const cols = Math.ceil(w / gap) + 1
      const rows = Math.ceil(h / gap) + 1
      const ox = (w - (cols - 1) * gap) / 2
      const oy = (h - (rows - 1) * gap) / 2
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * gap
          const y = oy + j * gap
          // 숨결
          let k = 0.08 + 0.05 * Math.sin(t * 0.8 + (i + j) * 0.35)
          // 포인터
          const dx = x - pointer.x
          const dy = y - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < radius) k += (1 - d / radius) ** 2 * 1.1
          // 파문 — 링이 지나갈 때 부푼다
          for (const r of ripples) {
            const rd = Math.sqrt((x - r.x) ** 2 + (y - r.y) ** 2)
            const ring = r.t * 260
            const width = 46
            const dd = Math.abs(rd - ring)
            if (dd < width) k += (1 - dd / width) * (1 - r.t) * 1.2
          }
          k = Math.min(1.4, k)
          const mix = Math.min(1, Math.max(0, (k - 0.12) / 0.9))
          const cr = Math.round((fgRgb[0] ?? 0) + ((acRgb[0] ?? 0) - (fgRgb[0] ?? 0)) * mix)
          const cg = Math.round((fgRgb[1] ?? 0) + ((acRgb[1] ?? 0) - (fgRgb[1] ?? 0)) * mix)
          const cb = Math.round((fgRgb[2] ?? 0) + ((acRgb[2] ?? 0) - (fgRgb[2] ?? 0)) * mix)
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, 0.18 + k * 0.7)})`
          ctx.beginPath()
          ctx.arc(x, y, 1.1 + k * 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    const loop = () => {
      t += 1 / 60
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        if (!r) continue
        r.t += 1 / 75
        if (r.t >= 1) ripples.splice(i, 1)
      }
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 }
    }
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: 0 })
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
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
  }, [gap, radius, reduce])

  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
