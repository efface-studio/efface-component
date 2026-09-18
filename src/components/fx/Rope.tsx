import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface RopeProps {
  className?: string
}

interface P {
  x: number
  y: number
  px: number
  py: number
}

/**
 * 밧줄. 양 끝이 고정된 줄이 중력으로 늘어져 있고, 어디든 잡아 끌면 무겁게 따라오다 놓으면 출렁이며 가라앉는다.
 * 굵기가 있는 매듭 질감으로 그린다(베를레 + 거리 제약).
 */
export function Rope({ className }: RopeProps) {
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
    let fg = '#000'
    let accent = '#2563eb'
    const N = 40
    let pts: P[] = []
    let seg = 10
    let held = -1
    let pointer = { x: 0, y: 0 }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const cs = getComputedStyle(host)
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      seg = (w * 0.86) / (N - 1)
      pts = Array.from({ length: N }, (_, i) => {
        const x = w * 0.07 + i * seg
        const y = h * 0.3
        return { x, y, px: x, py: y }
      })
    }
    const step = () => {
      for (let i = 0; i < N; i++) {
        const p = pts[i]!
        if (i === 0 || i === N - 1) continue
        if (i === held) {
          p.px = p.x
          p.py = p.y
          p.x = pointer.x
          p.y = pointer.y
          continue
        }
        const vx = (p.x - p.px) * 0.985
        const vy = (p.y - p.py) * 0.985
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 0.45
      }
      for (let it = 0; it < 10; it++) {
        for (let i = 0; i < N - 1; i++) {
          const a = pts[i]!
          const b = pts[i + 1]!
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.sqrt(dx * dx + dy * dy) || 0.001
          const diff = ((d - seg) / d) * 0.5
          const ox = dx * diff
          const oy = dy * diff
          const aFixed = i === 0 || i === held
          const bFixed = i + 1 === N - 1 || i + 1 === held
          if (!aFixed) {
            a.x += ox * (bFixed ? 2 : 1)
            a.y += oy * (bFixed ? 2 : 1)
          }
          if (!bFixed) {
            b.x -= ox * (aFixed ? 2 : 1)
            b.y -= oy * (aFixed ? 2 : 1)
          }
        }
      }
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const path = () => {
        ctx.beginPath()
        ctx.moveTo(pts[0]!.x, pts[0]!.y)
        for (let i = 1; i < N - 1; i++) {
          const p = pts[i]!
          const q = pts[i + 1]!
          ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2)
        }
        ctx.lineTo(pts[N - 1]!.x, pts[N - 1]!.y)
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 12
      ctx.save()
      ctx.translate(0, 8)
      path()
      ctx.stroke()
      ctx.restore()
      ctx.strokeStyle = fg
      ctx.lineWidth = 10
      path()
      ctx.stroke()
      // 꼬임 질감
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = 2
      for (let i = 1; i < N - 1; i += 1) {
        const p = pts[i]!
        const q = pts[i + 1]!
        const a = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 3
        ctx.beginPath()
        ctx.moveTo(p.x - Math.cos(a) * 4, p.y - Math.sin(a) * 4)
        ctx.lineTo(p.x + Math.cos(a) * 4, p.y + Math.sin(a) * 4)
        ctx.stroke()
      }
      // 고정핀
      for (const i of [0, N - 1]) {
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(pts[i]!.x, pts[i]!.y, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      if (held >= 0) {
        ctx.strokeStyle = accent
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pointer.x, pointer.y, 14, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    const loop = () => {
      step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    const at = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e: PointerEvent) => {
      pointer = at(e)
      let best = -1
      let bd = 40
      for (let i = 1; i < N - 1; i++) {
        const d = Math.hypot(pts[i]!.x - pointer.x, pts[i]!.y - pointer.y)
        if (d < bd) {
          bd = d
          best = i
        }
      }
      held = best
    }
    const onMove = (e: PointerEvent) => {
      pointer = at(e)
    }
    const onUp = () => {
      held = -1
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 200; i++) step()
      draw()
    } else raf = requestAnimationFrame(loop)
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
    <div className={cn('relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
