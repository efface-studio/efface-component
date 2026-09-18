import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TentacleProps {
  segments?: number
  className?: string
}

/**
 * 촉수. 마디들이 사슬처럼 이어져 머리가 포인터를 쫓고 몸통이 뒤따른다(역기구학, FABRIK 식).
 * 굵기는 뿌리에서 끝으로 가늘어지고, 가만히 두면 스스로 헤엄친다.
 */
export function Tentacle({ segments = 28, className }: TentacleProps) {
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
    const L = 14
    const pts: { x: number; y: number }[] = Array.from({ length: segments }, () => ({ x: 0, y: 0 }))
    let target: { x: number; y: number } | null = null
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
      pts.forEach((p, i) => {
        p.x = w / 2
        p.y = h - i * L
      })
    }
    const tick = () => {
      t += 0.016
      const root = { x: w / 2, y: h }
      const goal = target ?? { x: w / 2 + Math.sin(t * 0.9) * w * 0.3, y: h * 0.45 + Math.cos(t * 1.3) * h * 0.2 }
      const head = pts[segments - 1]!
      head.x += (goal.x - head.x) * 0.12
      head.y += (goal.y - head.y) * 0.12
      // 머리부터 뿌리로 당기고
      for (let i = segments - 2; i >= 0; i--) {
        const a = pts[i + 1]!
        const b = pts[i]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        b.x = a.x + (dx / d) * L
        b.y = a.y + (dy / d) * L
      }
      // 뿌리를 고정하고 다시 머리로
      pts[0]!.x = root.x
      pts[0]!.y = root.y
      for (let i = 1; i < segments; i++) {
        const a = pts[i - 1]!
        const b = pts[i]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        b.x = a.x + (dx / d) * L
        b.y = a.y + (dy / d) * L
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (let i = 1; i < segments; i++) {
        const a = pts[i - 1]!
        const b = pts[i]!
        const k = i / segments
        ctx.strokeStyle = k > 0.8 ? accent : fg
        ctx.lineWidth = 16 * (1 - k) + 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      // 머리
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(head.x, head.y, 6, 0, Math.PI * 2)
      ctx.fill()
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      target = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      target = null
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(tick)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [segments, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
