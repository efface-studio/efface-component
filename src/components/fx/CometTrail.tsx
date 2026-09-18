import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface CometTrailProps {
  /** 꼬리 길이(점 개수) */
  length?: number
  className?: string
}

/**
 * 포인터 뒤로 액센트 꼬리가 혜성처럼 따라온다. 멈추면 꼬리가 머리로 빨려 들어가 사라진다.
 */
export function CometTrail({ length = 28, className }: CometTrailProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduce) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let accent = '#2563eb'
    const pts: { x: number; y: number }[] = []
    let head: { x: number; y: number } | null = null

    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      accent = getComputedStyle(host).getPropertyValue('--accent').trim() || accent
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      // 머리 쪽으로 점들이 따라붙는다
      if (head) {
        pts.unshift({ x: head.x, y: head.y })
        if (pts.length > length) pts.length = length
      } else if (pts.length) pts.pop()
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        if (!a || !b) continue
        const k = 1 - i / pts.length
        ctx.strokeStyle = accent
        ctx.globalAlpha = k * 0.9
        ctx.lineWidth = 1 + k * 9
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      if (head) {
        ctx.fillStyle = accent
        ctx.shadowColor = accent
        ctx.shadowBlur = 16
        ctx.beginPath()
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      head = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      head = null
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    raf = requestAnimationFrame(draw)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [length, reduce])
  return (
    <div className={cn('relative h-full w-full cursor-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
