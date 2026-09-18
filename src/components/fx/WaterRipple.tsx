import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface WaterRippleProps {
  /** 물 아래 이미지 */
  src: string
  className?: string
}

/**
 * 물결. 높이장을 두 버퍼로 파동 방정식으로 풀고(이웃 평균×2 − 이전), 기울기로 아래 이미지를 굴절시킨다.
 * 포인터가 스치면 물방울이 떨어지고, 누르면 큰 파문. 가만히 두면 가끔 빗방울.
 */
export function WaterRipple({ src, className }: WaterRippleProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    const S = 2 // 시뮬레이션 축소 배율
    let w = 0
    let h = 0
    let lw = 0
    let lh = 0
    let raf = 0
    let cur = new Float32Array(0)
    let prev = new Float32Array(0)
    let base: ImageData | null = null
    let out: ImageData | null = null
    let off: HTMLCanvasElement | null = null
    let img: HTMLImageElement | null = null
    let last: { x: number; y: number } | null = null
    let t = 0
    const drop = (x: number, y: number, r: number, str: number) => {
      for (let j = -r; j <= r; j++)
        for (let i = -r; i <= r; i++) {
          const xx = x + i
          const yy = y + j
          if (xx < 1 || yy < 1 || xx >= lw - 1 || yy >= lh - 1) continue
          const d = Math.sqrt(i * i + j * j)
          if (d <= r) cur[yy * lw + xx] = (cur[yy * lw + xx] ?? 0) + str * (1 - d / r)
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
      cur = new Float32Array(lw * lh)
      prev = new Float32Array(lw * lh)
      off = document.createElement('canvas')
      off.width = lw
      off.height = lh
      const c = off.getContext('2d')
      if (!c) return
      // 바탕 — 배경색 위에 로고를 contain 으로
      c.fillStyle = getComputedStyle(host).backgroundColor
      c.fillRect(0, 0, lw, lh)
      if (img) {
        const s = Math.min((lw * 0.6) / img.width, (lh * 0.6) / img.height)
        const dw = img.width * s
        const dh = img.height * s
        c.drawImage(img, (lw - dw) / 2, (lh - dh) / 2, dw, dh)
      }
      base = c.getImageData(0, 0, lw, lh)
      out = c.createImageData(lw, lh)
    }
    const step = () => {
      for (let y = 1; y < lh - 1; y++)
        for (let x = 1; x < lw - 1; x++) {
          const i = y * lw + x
          const v = ((cur[i - 1]! + cur[i + 1]! + cur[i - lw]! + cur[i + lw]!) / 2 - prev[i]!) * 0.985
          prev[i] = v
        }
      const tmp = cur
      cur = prev
      prev = tmp
    }
    const draw = () => {
      if (!base || !out || !off) return
      const b = base.data
      const o = out.data
      for (let y = 1; y < lh - 1; y++)
        for (let x = 1; x < lw - 1; x++) {
          const i = y * lw + x
          const dx = cur[i + 1]! - cur[i - 1]!
          const dy = cur[i + lw]! - cur[i - lw]!
          const sx = Math.min(lw - 1, Math.max(0, x + (dx * 1.6) | 0))
          const sy = Math.min(lh - 1, Math.max(0, y + (dy * 1.6) | 0))
          const j = (sy * lw + sx) * 4
          const k = i * 4
          const shade = 1 + (dx - dy) * 0.06 // 빛 — 기울기 방향에 따라 밝기
          o[k] = Math.min(255, b[j]! * shade)
          o[k + 1] = Math.min(255, b[j + 1]! * shade)
          o[k + 2] = Math.min(255, b[j + 2]! * shade + Math.max(0, dx) * 6)
          o[k + 3] = 255
        }
      off.getContext('2d')?.putImageData(out, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
    }
    const loop = () => {
      t += 1 / 60
      if (!last && Math.random() < 0.02) drop((Math.random() * lw) | 0, (Math.random() * lh) | 0, 3, 5)
      step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = ((e.clientX - r.left) / S) | 0
      const y = ((e.clientY - r.top) / S) | 0
      if (!last || Math.hypot(x - last.x, y - last.y) > 3) drop(x, y, 2, 2.2)
      last = { x, y }
    }
    const onLeave = () => {
      last = null
    }
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      drop(((e.clientX - r.left) / S) | 0, ((e.clientY - r.top) / S) | 0, 6, 14)
    }
    const im = new Image()
    im.onload = () => {
      img = im
      resize()
    }
    im.src = src
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
  }, [src, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none bg-[#0d1a33]', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
