import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TentacleProps {
  segments?: number
  className?: string
}

/**
 * 촉수. 머리가 포인터를 쫓고 몸통이 사슬처럼 뒤따른다(FABRIK). 관절은 이웃 중점으로 둥글리고,
 * 그리는 점은 실제 점을 시간으로 따라가서 접히거나 뚝뚝 끊기지 않는다. 몸통은 하나의 매끈한 외곽선으로 채운다.
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
    const goal = { x: 0, y: 0 }
    const draw_: { x: number; y: number }[] = []
    let target: { x: number; y: number } | null = null
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
      accent = cs.getPropertyValue('--accent').trim() || accent
      fg = cs.color
      pts.forEach((p, i) => {
        p.x = w / 2
        p.y = h - i * L
      })
      goal.x = w / 2
      goal.y = h * 0.45
    }
    const backward = (hx: number, hy: number) => {
      const head = pts[segments - 1]!
      head.x = hx
      head.y = hy
      for (let i = segments - 2; i >= 0; i--) {
        const a = pts[i + 1]!
        const b = pts[i]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        b.x = a.x + (dx / d) * L
        b.y = a.y + (dy / d) * L
      }
    }
    const forward = (rx: number, ry: number) => {
      pts[0]!.x = rx
      pts[0]!.y = ry
      for (let i = 1; i < segments; i++) {
        const a = pts[i - 1]!
        const b = pts[i]!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 1
        b.x = a.x + (dx / d) * L
        b.y = a.y + (dy / d) * L
      }
    }
    const tick = () => {
      t += 0.016
      const root = { x: w / 2, y: h }
      const want = target ?? { x: w / 2 + Math.sin(t * 0.9) * w * 0.3, y: h * 0.45 + Math.cos(t * 1.3) * h * 0.2 }
      goal.x += (want.x - goal.x) * 0.14
      goal.y += (want.y - goal.y) * 0.14
      // 머리는 (이미 완화된) 목표에 그대로 — 스프링을 두면 목표 주위를 맴돌며 스스로 돈다
      const hx = goal.x
      const hy = goal.y
      const tip = pts[segments - 1]!
      // 목표가 멈추고 머리가 닿아 있으면 풀지 않는다 — 반복 풀이가 조금씩 기어가며 스스로 움직이는 걸 막는다
      const moving = Math.hypot(want.x - goal.x, want.y - goal.y) > 0.08 || Math.hypot(hx - tip.x, hy - tip.y) > 0.4
      if (moving) {
        // FABRIK: 머리→뿌리, 뿌리→머리
        for (let it = 0; it < 2; it++) {
          backward(hx, hy)
          forward(root.x, root.y)
        }
        // 관절 둥글리기 — 안쪽 마디를 이웃의 중점 쪽으로 살짝(끝 쪽은 약하게) — 그 뒤 머리를 다시 목표에 붙인다
        for (let it = 0; it < 2; it++) {
          for (let i = 1; i < segments - 1; i++) {
            const p0 = pts[i - 1]!
            const p1 = pts[i]!
            const p2 = pts[i + 1]!
            const k = 0.4 * (1 - (i / segments) ** 2)
            p1.x += ((p0.x + p2.x) / 2 - p1.x) * k
            p1.y += ((p0.y + p2.y) / 2 - p1.y) * k
          }
          backward(hx, hy)
          forward(root.x, root.y)
        }
      }
      // 시간 완화 — 그리는 점은 실제 점을 천천히 따라간다(끊김 제거)
      for (let i = 0; i < segments; i++) {
        const p = pts[i]!
        const q = draw_[i] ?? (draw_[i] = { x: p.x, y: p.y })
        q.x += (p.x - q.x) * 0.45
        q.y += (p.y - q.y) * 0.45
      }
      const head = draw_[segments - 1] ?? pts[segments - 1]!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      // Catmull-Rom 으로 마디 사이를 잘게 나눈 중심선 → 양쪽으로 굵기만큼 벌린 외곽선을 한 번에 채운다(이음새 없음)
      const SUB = 6
      const P = draw_
      const center: { x: number; y: number; k: number }[] = [{ x: P[0]!.x, y: P[0]!.y, k: 0 }]
      for (let i = 0; i < segments - 1; i++) {
        const p0 = P[Math.max(0, i - 1)]!
        const p1 = P[i]!
        const p2 = P[i + 1]!
        const p3 = P[Math.min(segments - 1, i + 2)]!
        for (let s = 1; s <= SUB; s++) {
          const u = s / SUB
          const u2 = u * u
          const u3 = u2 * u
          const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3)
          const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3)
          center.push({ x, y, k: (i + u) / (segments - 1) })
        }
      }
      const left: [number, number][] = []
      const right: [number, number][] = []
      for (let i = 0; i < center.length; i++) {
        const c = center[i]!
        const prev = center[Math.max(0, i - 1)]!
        const next = center[Math.min(center.length - 1, i + 1)]!
        let tx = next.x - prev.x
        let ty = next.y - prev.y
        const tl = Math.sqrt(tx * tx + ty * ty) || 1
        tx /= tl
        ty /= tl
        const half = (9 * (1 - c.k) ** 1.15 + 1.2)
        left.push([c.x - ty * half, c.y + tx * half])
        right.push([c.x + ty * half, c.y - tx * half])
      }
      const grad = ctx.createLinearGradient(root.x, root.y, head.x, head.y)
      grad.addColorStop(0, fg)
      grad.addColorStop(0.78, fg)
      grad.addColorStop(1, accent)
      ctx.fillStyle = grad
      ctx.strokeStyle = grad
      ctx.lineJoin = 'round'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(left[0]![0], left[0]![1])
      for (let i = 1; i < left.length; i++) ctx.lineTo(left[i]![0], left[i]![1])
      ctx.arc(head.x, head.y, 1.2, 0, Math.PI, true)
      for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i]![0], right[i]![1])
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
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
