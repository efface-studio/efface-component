import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface FlowFieldProps {
  count?: number
  className?: string
}

/**
 * 흐름장. 수천 개의 입자가 노이즈로 만든 벡터장을 따라 흐르며 긴 실 궤적을 남긴다 —
 * 장은 천천히 변하고, 포인터는 소용돌이가 되어 흐름을 감아 돌린다. 누르면 캔버스를 비운다.
 */
export function FlowField({ count = 1800, className }: FlowFieldProps) {
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
    let fg = '#000'
    let accent = '#2563eb'
    let bg = 'rgb(255,255,255)'
    let pointer: { x: number; y: number } | null = null
    const px = new Float32Array(count)
    const py = new Float32Array(count)
    const life = new Float32Array(count)
    const seed = (i: number) => {
      px[i] = Math.random() * w
      py[i] = Math.random() * h
      life[i] = 60 + Math.random() * 160
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
      fg = cs.color
      accent = cs.getPropertyValue('--accent').trim() || accent
      bg = cs.backgroundColor
      for (let i = 0; i < count; i++) seed(i)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
    }
    // 값싼 2D 노이즈 — 사인 합
    const angle = (x: number, y: number) => {
      const nx = x * 0.006
      const ny = y * 0.006
      return (Math.sin(nx * 1.7 + t * 0.3) + Math.cos(ny * 1.3 - t * 0.2) + Math.sin((nx + ny) * 0.9 + t * 0.15)) * 1.4
    }
    const draw = () => {
      t += 0.016
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 아주 옅게 덮어 궤적이 서서히 사라진다
      const m = bg.match(/[\d.]+/g)
      ctx.fillStyle = m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},0.045)` : 'rgba(255,255,255,0.045)'
      ctx.fillRect(0, 0, w, h)
      ctx.lineWidth = 1
      for (let i = 0; i < count; i++) {
        const x = px[i]!
        const y = py[i]!
        let a = angle(x, y)
        let sp = 1.4
        if (pointer) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 160) {
            const k = 1 - d / 160
            a = a * (1 - k) + (Math.atan2(dy, dx) + Math.PI / 2) * k // 소용돌이
            sp += k * 2.2
          }
        }
        const nx = x + Math.cos(a) * sp
        const ny = y + Math.sin(a) * sp
        ctx.strokeStyle = i % 11 === 0 ? accent : fg
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        px[i] = nx
        py[i] = ny
        life[i] = life[i]! - 1
        if (life[i]! <= 0 || nx < 0 || ny < 0 || nx > w || ny > h) seed(i)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < count; i++) seed(i)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 90; i++) {
        t += 0.016
        for (let j = 0; j < count; j++) {
          const a = angle(px[j]!, py[j]!)
          const nx = px[j]! + Math.cos(a) * 1.4
          const ny = py[j]! + Math.sin(a) * 1.4
          ctx.strokeStyle = fg
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.moveTo(px[j]!, py[j]!)
          ctx.lineTo(nx, ny)
          ctx.stroke()
          px[j] = nx
          py[j] = ny
        }
      }
    } else raf = requestAnimationFrame(draw)
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
  }, [count, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
