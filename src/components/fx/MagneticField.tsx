import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface MagneticFieldProps {
  className?: string
}

/**
 * 자기장. 격자의 쇠가루(작은 바늘)가 자석 방향으로 돌아선다 — 자석 두 개가 떠다니고 포인터는 세 번째 자석.
 * 바늘은 장의 세기로 길이·색이 달라진다. 누르면 극이 뒤집힌다.
 */
export function MagneticField({ className }: MagneticFieldProps) {
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
    let pointer: { x: number; y: number } | null = null
    let flip = 1
    const GAP = 16
    const angles = new Float32Array(0)
    let cur = angles
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
      cur = new Float32Array(Math.ceil(w / GAP) * Math.ceil(h / GAP))
    }
    const draw = () => {
      const poles: { x: number; y: number; q: number }[] = [
        { x: w * 0.3 + Math.sin(t * 0.6) * w * 0.12, y: h * 0.5 + Math.cos(t * 0.8) * h * 0.2, q: 1 * flip },
        { x: w * 0.7 + Math.cos(t * 0.5) * w * 0.12, y: h * 0.5 + Math.sin(t * 0.7) * h * 0.2, q: -1 * flip },
      ]
      if (pointer) poles.push({ x: pointer.x, y: pointer.y, q: 1.6 })
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      const cols = Math.ceil(w / GAP)
      const rows = Math.ceil(h / GAP)
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = i * GAP + GAP / 2
          const y = j * GAP + GAP / 2
          let fx = 0
          let fy = 0
          for (const p of poles) {
            const dx = x - p.x
            const dy = y - p.y
            const d2 = dx * dx + dy * dy + 400
            fx += (p.q * dx) / d2
            fy += (p.q * dy) / d2
          }
          const mag = Math.sqrt(fx * fx + fy * fy)
          const target = Math.atan2(fy, fx)
          const k = j * cols + i
          let a = cur[k] ?? target
          let diff = target - a
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          a += diff * 0.2
          cur[k] = a
          const len = Math.min(GAP * 0.55, 3 + mag * 2600)
          const strong = Math.min(1, mag * 900)
          ctx.strokeStyle = strong > 0.55 ? accent : fg
          ctx.globalAlpha = 0.3 + strong * 0.7
          ctx.lineWidth = 1 + strong * 1.2
          ctx.beginPath()
          ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len)
          ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
          ctx.stroke()
        }
      ctx.globalAlpha = 1
      for (const p of poles) {
        ctx.fillStyle = p.q > 0 ? '#ff5c8a' : '#5cc8ff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 9px system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.q > 0 ? 'N' : 'S', p.x, p.y)
      }
    }
    const loop = () => {
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      flip *= -1
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
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
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
