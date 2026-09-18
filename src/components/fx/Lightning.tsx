import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface LightningProps {
  className?: string
}

interface Bolt {
  pts: [number, number][]
  life: number
  width: number
}

/**
 * 번개. 위에서 포인터(없으면 무작위 자리)까지 가지를 치며 내려꽂히고, 섬광이 화면을 밝힌 뒤 잔광이 남는다.
 * 누르면 그 자리에 바로 떨어진다.
 */
export function Lightning({ className }: LightningProps) {
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
    let flash = 0
    let next = 1.2
    let t = 0
    let pointer: { x: number; y: number } | null = null
    const bolts: Bolt[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    const strike = (tx: number, ty: number) => {
      const gen = (x0: number, y0: number, x1: number, y1: number, width: number, depth: number) => {
        const pts: [number, number][] = [[x0, y0]]
        const n = 14
        for (let i = 1; i < n; i++) {
          const u = i / n
          const jitter = (1 - u) * 26 + 6
          pts.push([x0 + (x1 - x0) * u + (Math.random() - 0.5) * jitter, y0 + (y1 - y0) * u + (Math.random() - 0.5) * jitter * 0.4])
          // 가지
          if (depth < 2 && Math.random() < 0.28) {
            const p = pts[pts.length - 1]!
            const bx = p[0] + (Math.random() - 0.5) * 140
            const by = p[1] + 40 + Math.random() * 90
            gen(p[0], p[1], bx, by, width * 0.45, depth + 1)
          }
        }
        pts.push([x1, y1])
        bolts.push({ pts, life: 1, width })
      }
      gen(tx + (Math.random() - 0.5) * 120, 0, tx, ty, 3, 0)
      flash = 1
    }
    const draw = () => {
      t += 0.016
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = `rgba(6,8,14,${0.35})`
      ctx.fillRect(0, 0, w, h)
      if (flash > 0) {
        ctx.fillStyle = `rgba(200,215,255,${flash * 0.22})`
        ctx.fillRect(0, 0, w, h)
        flash *= 0.8
      }
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]!
        b.life -= 0.05
        if (b.life <= 0) {
          bolts.splice(i, 1)
          continue
        }
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        // 잔광
        ctx.strokeStyle = `rgba(120,160,255,${b.life * 0.6})`
        ctx.lineWidth = b.width * 5
        ctx.shadowColor = '#7aa2ff'
        ctx.shadowBlur = 24
        ctx.beginPath()
        b.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.strokeStyle = `rgba(255,255,255,${b.life})`
        ctx.lineWidth = b.width
        ctx.stroke()
      }
      if (t > next) {
        const tx = pointer ? pointer.x : w * (0.2 + Math.random() * 0.6)
        const ty = pointer ? pointer.y : h * (0.55 + Math.random() * 0.4)
        strike(tx, ty)
        next = t + 1.1 + Math.random() * 1.8
      }
      raf = requestAnimationFrame(draw)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      strike(e.clientX - r.left, e.clientY - r.top)
      next = t + 1.5
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#06080e'
    ctx.fillRect(0, 0, w, h)
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
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#06080e]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
