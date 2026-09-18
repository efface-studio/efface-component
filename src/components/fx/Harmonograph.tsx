import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface HarmonographProps {
  className?: string
}

/**
 * 하모노그래프. 감쇠하는 진자 넷의 합이 펜을 끌고 다니며 한 획으로 문양을 그린다 —
 * 진동수 비가 조금만 달라도 전혀 다른 그림. 포인터가 진동수를 바꾸고, 누르면 새로 그린다.
 */
export function Harmonograph({ className }: HarmonographProps) {
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
    let time = 0
    let accent = '#2563eb'
    let fg = '#000'
    const p = { f1: 2.01, f2: 3, f3: 3, f4: 2, p1: 0, p2: Math.PI / 2, p3: Math.PI / 4, p4: 0, d: 0.004 }
    let last: [number, number] | null = null
    const target = { f1: 2.01, f3: 3 }
    const reseed = () => {
      time = 0
      last = null
      p.p1 = Math.random() * Math.PI * 2
      p.p2 = Math.random() * Math.PI * 2
      p.p3 = Math.random() * Math.PI * 2
      p.p4 = Math.random() * Math.PI * 2
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
    }
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
      reseed()
    }
    const pos = (tt: number): [number, number] => {
      const A = Math.min(w, h) * 0.22
      const e = Math.exp(-p.d * tt)
      const x = A * Math.sin(p.f1 * tt + p.p1) * e + A * Math.sin(p.f2 * tt + p.p2) * e
      const y = A * Math.sin(p.f3 * tt + p.p3) * e + A * Math.sin(p.f4 * tt + p.p4) * e
      return [w / 2 + x, h / 2 + y]
    }
    const loop = () => {
      p.f1 += (target.f1 - p.f1) * 0.02
      p.f3 += (target.f3 - p.f3) * 0.02
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      for (let s = 0; s < 40; s++) {
        time += 0.008
        const q = pos(time)
        if (last) {
          const k = Math.exp(-p.d * time)
          ctx.strokeStyle = k > 0.6 ? accent : fg
          ctx.globalAlpha = 0.25 + k * 0.5
          ctx.lineWidth = 0.6 + k * 1.2
          ctx.beginPath()
          ctx.moveTo(last[0], last[1])
          ctx.lineTo(q[0], q[1])
          ctx.stroke()
        }
        last = q
      }
      ctx.globalAlpha = 1
      // 펜
      if (last) {
        ctx.fillStyle = accent
        ctx.beginPath()
        ctx.arc(last[0], last[1], 3, 0, Math.PI * 2)
        ctx.fill()
      }
      if (Math.exp(-p.d * time) < 0.03) reseed()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      target.f1 = 1.5 + ((e.clientX - r.left) / r.width) * 2
      target.f3 = 1.5 + ((e.clientY - r.top) / r.height) * 2.5
    }
    const onDown = () => reseed()
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.strokeStyle = fg
      ctx.beginPath()
      for (let tt = 0; tt < 300; tt += 0.01) {
        const q = pos(tt)
        if (tt === 0) ctx.moveTo(q[0], q[1])
        else ctx.lineTo(q[0], q[1])
      }
      ctx.stroke()
    } else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
