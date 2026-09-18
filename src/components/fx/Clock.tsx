import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface ClockProps {
  size?: number
  className?: string
}

/**
 * 아날로그 시계. 초침이 미끄러지듯 흐르고(스텝 없음), 바늘 그림자가 빛 방향에 따라 떨어진다.
 * 포인터가 빛의 위치.
 */
export function Clock({ size = 200, className }: ClockProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    canvas.width = size * dpr
    canvas.height = size * dpr
    let raf = 0
    let fg = '#000'
    let accent = '#2563eb'
    let surface = '#fff'
    let line = '#ddd'
    const light = { x: -0.5, y: -0.6, tx: -0.5, ty: -0.6 }
    const hand = (a: number, len: number, wdt: number, color: string) => {
      const c = size / 2
      ctx.save()
      ctx.translate(c, c)
      // 그림자
      ctx.save()
      ctx.translate(-light.x * 6, -light.y * 6)
      ctx.rotate(a)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = wdt
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, len * 0.18)
      ctx.lineTo(0, -len)
      ctx.stroke()
      ctx.restore()
      ctx.rotate(a)
      ctx.strokeStyle = color
      ctx.lineWidth = wdt
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(0, len * 0.18)
      ctx.lineTo(0, -len)
      ctx.stroke()
      ctx.restore()
    }
    const draw = () => {
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      surface = cs.getPropertyValue('--surface').trim() || surface
      line = cs.getPropertyValue('--line').trim() || line
      light.x += (light.tx - light.x) * 0.08
      light.y += (light.ty - light.y) * 0.08
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      const c = size / 2
      const r = c - 6
      const g = ctx.createRadialGradient(c + light.x * r * 0.6, c + light.y * r * 0.6, 0, c, c, r)
      g.addColorStop(0, surface)
      g.addColorStop(1, line)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(c, c, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = line
      ctx.lineWidth = 1.5
      ctx.stroke()
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2
        const big = i % 5 === 0
        ctx.strokeStyle = big ? fg : line
        ctx.lineWidth = big ? 2 : 1
        ctx.beginPath()
        ctx.moveTo(c + Math.cos(a) * (r - (big ? 14 : 8)), c + Math.sin(a) * (r - (big ? 14 : 8)))
        ctx.lineTo(c + Math.cos(a) * (r - 4), c + Math.sin(a) * (r - 4))
        ctx.stroke()
      }
      const now = new Date()
      const ms = now.getMilliseconds()
      const s = now.getSeconds() + ms / 1000
      const m = now.getMinutes() + s / 60
      const h = (now.getHours() % 12) + m / 60
      hand((h / 12) * Math.PI * 2, r * 0.5, 6, fg)
      hand((m / 60) * Math.PI * 2, r * 0.74, 4, fg)
      hand((s / 60) * Math.PI * 2, r * 0.82, 1.6, accent)
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(c, c, 4, 0, Math.PI * 2)
      ctx.fill()
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const rct = canvas.getBoundingClientRect()
      light.tx = ((e.clientX - rct.left) / rct.width - 0.5) * 2
      light.ty = ((e.clientY - rct.top) / rct.height - 0.5) * 2
    }
    const onLeave = () => {
      light.tx = -0.5
      light.ty = -0.6
    }
    draw()
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [size, reduce])
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <canvas ref={ref} style={{ width: size, height: size }} role="img" aria-label="clock" />
    </div>
  )
}
