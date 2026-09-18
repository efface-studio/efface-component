import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface EqualizerProps {
  bars?: number
  className?: string
}

/**
 * 이퀄라이저. 막대들이 음악을 듣는 것처럼 오르내리고, 봉우리는 천천히 떨어진다.
 * 포인터가 지나는 자리는 솟구치고, 누르면 전부 튄다.
 */
export function Equalizer({ bars = 48, className }: EqualizerProps) {
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
    let accent = '#2563eb'
    let fg = '#000'
    let pointer: number | null = null
    let kick = 0
    const level = new Float32Array(bars)
    const peak = new Float32Array(bars)
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      accent = cs.getPropertyValue('--accent').trim() || accent
      fg = cs.color
    }
    const draw = () => {
      t += 0.016
      kick *= 0.9
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const gap = 3
      const bw = (w - gap * (bars - 1)) / bars
      for (let i = 0; i < bars; i++) {
        const u = i / bars
        // 가짜 스펙트럼 — 저음이 크고 고음으로 갈수록 작은, 여러 주기의 합
        let target = 0.25 + 0.35 * (1 - u) * (Math.sin(t * 3.1 + i * 0.7) * 0.5 + 0.5) + 0.25 * (Math.sin(t * 7.3 + i * 1.9) * 0.5 + 0.5) * (Math.sin(t * 0.9) * 0.5 + 0.5)
        if (pointer != null) target += Math.max(0, 1 - Math.abs(pointer - u) * 6) * 0.6
        target += kick * 0.5
        target = Math.min(1, target)
        const cur = level[i] ?? 0
        level[i] = cur + (target - cur) * (target > cur ? 0.35 : 0.08)
        const lv = level[i] ?? 0
        const pk = Math.max(lv, (peak[i] ?? 0) - 0.008)
        peak[i] = pk
        const x = i * (bw + gap)
        const bh = lv * (h - 20)
        const g = ctx.createLinearGradient(0, h - bh, 0, h)
        g.addColorStop(0, accent)
        g.addColorStop(1, fg)
        ctx.fillStyle = g
        ctx.globalAlpha = 0.9
        ctx.fillRect(x, h - bh, bw, bh)
        ctx.globalAlpha = 1
        ctx.fillStyle = accent
        ctx.fillRect(x, h - pk * (h - 20) - 3, bw, 2)
      }
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = (e.clientX - r.left) / r.width
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      kick = 1
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [bars, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
