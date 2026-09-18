import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface PhysarumProps {
  agents?: number
  className?: string
}

/**
 * 점균(피사룸). 수천 마리가 페로몬 자국을 남기고, 앞·좌·우 세 감지점 중 자국이 진한 쪽으로 돈다 —
 * 그것만으로 혈관 같은 그물이 스스로 짜인다. 포인터는 먹이(자국을 뿌림), 누르면 흩어진다.
 */
export function Physarum({ agents = 4000, className }: PhysarumProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const S = 3
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let trail = new Float32Array(0)
    let next = new Float32Array(0)
    let img: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    let pointer: { x: number; y: number } | null = null
    const ax = new Float32Array(agents)
    const ay = new Float32Array(agents)
    const aa = new Float32Array(agents)
    let accent: [number, number, number] = [59, 98, 229]
    let fg: [number, number, number] = [240, 240, 245]
    const rgb = (color: string): [number, number, number] => {
      const m = color.match(/[\d.]+/g)
      if (m && m.length >= 3 && !color.startsWith('#')) return [Number(m[0]), Number(m[1]), Number(m[2])]
      const c = document.createElement('canvas').getContext('2d')
      if (!c) return [0, 0, 0]
      c.fillStyle = color
      const v = c.fillStyle
      return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]
    }
    const scatter = () => {
      for (let i = 0; i < agents; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() * Math.min(lw, lh) * 0.35
        ax[i] = lw / 2 + Math.cos(a) * r
        ay[i] = lh / 2 + Math.sin(a) * r
        aa[i] = Math.random() * Math.PI * 2
      }
    }
    const resize = () => {
      const r = host.getBoundingClientRect()
      w = Math.max(1, Math.floor(r.width))
      h = Math.max(1, Math.floor(r.height))
      canvas.width = w
      canvas.height = h
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lw = Math.ceil(w / S)
      lh = Math.ceil(h / S)
      trail = new Float32Array(lw * lh)
      next = new Float32Array(lw * lh)
      off = document.createElement('canvas')
      off.width = lw
      off.height = lh
      img = off.getContext('2d')?.createImageData(lw, lh) ?? null
      const cs = getComputedStyle(host)
      accent = rgb(cs.getPropertyValue('--accent').trim() || '#3b62e5')
      fg = rgb(cs.color)
      scatter()
    }
    const sense = (x: number, y: number) => {
      const xi = x | 0
      const yi = y | 0
      if (xi < 0 || yi < 0 || xi >= lw || yi >= lh) return 0
      return trail[yi * lw + xi]!
    }
    const step = () => {
      const SA = 0.45
      const SD = 7
      const TURN = 0.3
      const SPEED = 1.1
      for (let i = 0; i < agents; i++) {
        const x = ax[i]!
        const y = ay[i]!
        const a = aa[i]!
        const f = sense(x + Math.cos(a) * SD, y + Math.sin(a) * SD)
        const l = sense(x + Math.cos(a - SA) * SD, y + Math.sin(a - SA) * SD)
        const r = sense(x + Math.cos(a + SA) * SD, y + Math.sin(a + SA) * SD)
        let na = a
        if (f > l && f > r) na = a
        else if (l > r) na = a - TURN
        else if (r > l) na = a + TURN
        else na = a + (Math.random() - 0.5) * TURN
        let nx = x + Math.cos(na) * SPEED
        let ny = y + Math.sin(na) * SPEED
        if (nx < 0 || nx >= lw || ny < 0 || ny >= lh) {
          na = Math.random() * Math.PI * 2
          nx = Math.min(lw - 1, Math.max(0, nx))
          ny = Math.min(lh - 1, Math.max(0, ny))
        }
        ax[i] = nx
        ay[i] = ny
        aa[i] = na
        const k = (ny | 0) * lw + (nx | 0)
        trail[k] = Math.min(1, trail[k]! + 0.25)
      }
      if (pointer) {
        const px = (pointer.x / S) | 0
        const py = (pointer.y / S) | 0
        for (let j = -3; j <= 3; j++)
          for (let i = -3; i <= 3; i++) {
            const xx = px + i
            const yy = py + j
            if (xx >= 0 && yy >= 0 && xx < lw && yy < lh) trail[yy * lw + xx] = 1
          }
      }
      // 확산 + 증발
      for (let y = 0; y < lh; y++)
        for (let x = 0; x < lw; x++) {
          let s = 0
          let n = 0
          for (let j = -1; j <= 1; j++) {
            const yy = y + j
            if (yy < 0 || yy >= lh) continue
            for (let i = -1; i <= 1; i++) {
              const xx = x + i
              if (xx < 0 || xx >= lw) continue
              s += trail[yy * lw + xx]!
              n++
            }
          }
          next[y * lw + x] = (s / n) * 0.93
        }
      const tmp = trail
      trail = next
      next = tmp
    }
    const draw = () => {
      if (!img || !off) return
      const d = img.data
      for (let i = 0; i < lw * lh; i++) {
        const v = trail[i]!
        const k = Math.min(1, v * 1.6)
        const hot = Math.max(0, k - 0.6) / 0.4
        d[i * 4] = fg[0] * k * (1 - hot) + accent[0] * hot
        d[i * 4 + 1] = fg[1] * k * (1 - hot) + accent[1] * hot
        d[i * 4 + 2] = fg[2] * k * (1 - hot) + accent[2] * hot
        d[i * 4 + 3] = 255
      }
      off.getContext('2d')?.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
    }
    const loop = () => {
      step()
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
    const onDown = () => scatter()
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 120; i++) step()
      draw()
    } else raf = requestAnimationFrame(loop)
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
  }, [agents, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#07090d] text-[#e8ecf5]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
