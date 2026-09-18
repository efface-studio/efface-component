import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { cssColorToRgb } from '@/lib/color'

export interface MetaballsProps {
  count?: number
  className?: string
}

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * 메타볼 — 픽셀마다 장(field)을 더해 문턱값으로 자른다. 덩이들이 가까워지면 목이 생기며 하나로 합쳐지고
 * 멀어지면 늘어나다 끊어진다. 포인터도 덩이라 끌고 다닐 수 있고, 가장자리엔 굴절 하이라이트.
 * 저해상도 ImageData 로 계산해 확대한다.
 */
export function Metaballs({ count = 7, className }: MetaballsProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const SCALE = 3
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let img: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    let pointer: Ball | null = null
    let accent: [number, number, number] = [59, 98, 229]
    let bg: [number, number, number] = [11, 12, 16]
    const balls: Ball[] = []
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lw = Math.ceil(w / SCALE)
      lh = Math.ceil(h / SCALE)
      off = document.createElement('canvas')
      off.width = lw
      off.height = lh
      img = off.getContext('2d')?.createImageData(lw, lh) ?? null
      const cs = getComputedStyle(host)
      accent = cssColorToRgb(cs.getPropertyValue('--accent').trim() || '#2563eb')
      const m = cs.backgroundColor.match(/[\d.]+/g)
      if (m && m.length >= 3) bg = [Number(m[0]), Number(m[1]), Number(m[2])]
      if (!balls.length) for (let i = 0; i < count; i++) balls.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 1.6, vy: (Math.random() - 0.5) * 1.6, r: 26 + Math.random() * 30 })
    }
    const draw = () => {
      if (!img || !off) return
      const all = pointer ? [...balls, pointer] : balls
      const data = img.data
      const n = all.length
      const xs = new Float32Array(n)
      const ys = new Float32Array(n)
      const rs = new Float32Array(n)
      all.forEach((b, i) => {
        xs[i] = b.x / SCALE
        ys[i] = b.y / SCALE
        rs[i] = (b.r / SCALE) ** 2
      })
      for (let y = 0; y < lh; y++)
        for (let x = 0; x < lw; x++) {
          let f = 0
          for (let i = 0; i < n; i++) {
            const dx = x - xs[i]!
            const dy = y - ys[i]!
            f += rs[i]! / (dx * dx + dy * dy + 1)
          }
          const o = (y * lw + x) * 4
          if (f > 1) {
            // 안쪽: 가장자리(문턱 근처)는 밝은 림, 중심은 액센트
            const edge = Math.min(1, (f - 1) * 1.6)
            const rim = 1 - edge
            data[o] = accent[0] + (255 - accent[0]) * rim * 0.75
            data[o + 1] = accent[1] + (255 - accent[1]) * rim * 0.75
            data[o + 2] = accent[2] + (255 - accent[2]) * rim * 0.75
            data[o + 3] = 255
          } else if (f > 0.72) {
            // 부드러운 경계
            const a = (f - 0.72) / 0.28
            data[o] = bg[0] + (accent[0] - bg[0]) * a
            data[o + 1] = bg[1] + (accent[1] - bg[1]) * a
            data[o + 2] = bg[2] + (accent[2] - bg[2]) * a
            data[o + 3] = 255
          } else data[o + 3] = 0
        }
      off.getContext('2d')?.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(off, 0, 0, w, h)
    }
    const loop = () => {
      for (const b of balls) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < b.r * 0.5 || b.x > w - b.r * 0.5) b.vx *= -1
        if (b.y < b.r * 0.5 || b.y > h - b.r * 0.5) b.vy *= -1
        if (pointer) {
          const dx = pointer.x - b.x
          const dy = pointer.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          if (d < 200) {
            b.vx += (dx / d) * 0.03
            b.vy += (dy / d) * 0.03
          }
        }
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        if (sp > 2.2) {
          b.vx *= 2.2 / sp
          b.vy *= 2.2 / sp
        }
      }
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top, vx: 0, vy: 0, r: 44 }
    }
    const onLeave = () => {
      pointer = null
    }
    const onDown = () => {
      for (const b of balls) {
        b.vx = (Math.random() - 0.5) * 6
        b.vy = (Math.random() - 0.5) * 6
      }
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
  }, [count, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-bg', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
