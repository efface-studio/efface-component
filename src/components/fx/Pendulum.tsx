import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PendulumProps {
  className?: string
}

/**
 * 이중 진자. 두 마디가 카오스로 흔들리며 끝점이 색 궤적을 남긴다 — 같은 조건에서도 매번 다르다.
 * 포인터를 잡아끌면 진자를 들어 올렸다 놓을 수 있고, 누르면 궤적을 지운다.
 */
export function Pendulum({ className }: PendulumProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const trail = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    const tc = trail.current
    if (!canvas || !tc) return
    const ctx = canvas.getContext('2d')
    const tctx = tc.getContext('2d')
    if (!ctx || !tctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let fg = '#000'
    let hue = 210
    const s = { a1: Math.PI / 2 + 0.3, a2: Math.PI / 2, v1: 0, v2: 0 }
    const L1 = 90
    const L2 = 90
    const m1 = 2
    const m2 = 1.4
    let held = false
    let px = 0
    let py = 0
    let lastTip: [number, number] | null = null
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      for (const c of [canvas, tc]) {
        c.width = w * dpr
        c.height = h * dpr
        c.style.width = `${w}px`
        c.style.height = `${h}px`
      }
      fg = getComputedStyle(host).color
      lastTip = null
    }
    const step = () => {
      const g = 0.45
      const { a1, a2, v1, v2 } = s
      const num1 = -g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2) - 2 * Math.sin(a1 - a2) * m2 * (v2 * v2 * L2 + v1 * v1 * L1 * Math.cos(a1 - a2))
      const den1 = L1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2))
      const num2 = 2 * Math.sin(a1 - a2) * (v1 * v1 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1) + v2 * v2 * L2 * m2 * Math.cos(a1 - a2))
      const den2 = L2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2))
      s.v1 += num1 / den1
      s.v2 += num2 / den2
      s.v1 *= 0.9995
      s.v2 *= 0.9995
      s.a1 += s.v1
      s.a2 += s.v2
    }
    const draw = () => {
      const ox = w / 2
      const oy = h * 0.32
      if (held) {
        // 첫 마디를 포인터로, 둘째는 아래로 늘어뜨린 채
        s.a1 = Math.atan2(px - ox, py - oy)
        s.v1 = 0
        s.v2 *= 0.9
      } else step()
      const x1 = ox + L1 * Math.sin(s.a1)
      const y1 = oy + L1 * Math.cos(s.a1)
      const x2 = x1 + L2 * Math.sin(s.a2)
      const y2 = y1 + L2 * Math.cos(s.a2)
      // 궤적 — 지워지지 않고 쌓인다
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (lastTip && !held) {
        hue = (hue + 0.6) % 360
        tctx.strokeStyle = `hsla(${hue} 85% 60% / 0.7)`
        tctx.lineWidth = 1.6
        tctx.lineCap = 'round'
        tctx.beginPath()
        tctx.moveTo(lastTip[0], lastTip[1])
        tctx.lineTo(x2, y2)
        tctx.stroke()
      }
      lastTip = [x2, y2]
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = fg
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.fillStyle = fg
      for (const [x, y, r] of [[ox, oy, 4], [x1, y1, 9], [x2, y2, 7]] as const) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      px = e.clientX - r.left
      py = e.clientY - r.top
      const ox = w / 2
      const oy = h * 0.32
      const x1 = ox + L1 * Math.sin(s.a1)
      const y1 = oy + L1 * Math.cos(s.a1)
      if (Math.hypot(px - x1, py - y1) < 40) held = true
      else {
        tctx.clearRect(0, 0, w * dpr, h * dpr)
        lastTip = null
      }
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      px = e.clientX - r.left
      py = e.clientY - r.top
    }
    const onUp = () => {
      held = false
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 300; i++) step()
    }
    raf = requestAnimationFrame(draw)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    host.addEventListener('pointerleave', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointerleave', onUp)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={trail} className="absolute inset-0 block" aria-hidden />
      <canvas ref={ref} className="relative block" aria-hidden />
    </div>
  )
}
