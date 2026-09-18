import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface SilkProps {
  cols?: number
  rows?: number
  className?: string
}

interface P {
  x: number
  y: number
  z: number
  px: number
  py: number
  pz: number
  pin: boolean
}

/**
 * 비단 천(클로스 시뮬레이션). 위 가장자리가 핀으로 고정된 천이 바람에 흔들리고,
 * 포인터가 스치면 밀려나며 주름이 잡힌다. 법선으로 빛을 계산해 접힌 데가 어두워진다(베를레 + 제약 반복).
 */
export function Silk({ cols = 34, rows = 22, className }: SilkProps) {
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
    let pointer: { x: number; y: number; vx: number; vy: number } | null = null
    const pts: P[] = []
    let spacing = 10
    const build = () => {
      pts.length = 0
      spacing = Math.min((w * 0.8) / (cols - 1), (h * 0.8) / (rows - 1))
      const ox = (w - spacing * (cols - 1)) / 2
      const oy = h * 0.08
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const x = ox + i * spacing
          const y = oy + j * spacing
          pts.push({ x, y, z: 0, px: x, py: y, pz: 0, pin: j === 0 && i % 3 === 0 })
        }
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
      build()
    }
    const at = (i: number, j: number) => pts[j * cols + i]!
    const step = () => {
      const g = 0.18
      const wind = Math.sin(t * 0.7) * 0.6 + Math.sin(t * 1.9) * 0.25
      for (const p of pts) {
        if (p.pin) continue
        const vx = (p.x - p.px) * 0.985
        const vy = (p.y - p.py) * 0.985
        const vz = (p.z - p.pz) * 0.985
        p.px = p.x
        p.py = p.y
        p.pz = p.z
        p.x += vx + wind * 0.08 * Math.sin(p.y * 0.02 + t)
        p.y += vy + g
        p.z += vz + wind * 0.35 * Math.sin(p.x * 0.015 + t * 1.3) // z 로 물결
        if (pointer) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 70) {
            const k = (1 - d / 70)
            p.x += pointer.vx * k * 0.6 + (dx / (d || 1)) * k * 2
            p.y += pointer.vy * k * 0.6
            p.z += k * 14
          }
        }
      }
      // 제약 — 이웃 간 거리 유지
      for (let it = 0; it < 4; it++) {
        for (let j = 0; j < rows; j++)
          for (let i = 0; i < cols; i++) {
            const a = at(i, j)
            if (i < cols - 1) relax(a, at(i + 1, j))
            if (j < rows - 1) relax(a, at(i, j + 1))
          }
      }
      if (pointer) {
        pointer.vx *= 0.5
        pointer.vy *= 0.5
      }
    }
    const relax = (a: P, b: P) => {
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001
      const diff = ((d - spacing) / d) * 0.5
      const ox = dx * diff
      const oy = dy * diff
      const oz = dz * diff
      if (!a.pin) {
        a.x += ox
        a.y += oy
        a.z += oz
      }
      if (!b.pin) {
        b.x -= ox
        b.y -= oy
        b.z -= oz
      }
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const L = [0.35, -0.5, 0.79] // 빛 방향
      for (let j = 0; j < rows - 1; j++)
        for (let i = 0; i < cols - 1; i++) {
          const a = at(i, j)
          const b = at(i + 1, j)
          const c = at(i + 1, j + 1)
          const d = at(i, j + 1)
          // 법선 (b-a) × (d-a)
          const ux = b.x - a.x
          const uy = b.y - a.y
          const uz = b.z - a.z
          const vx = d.x - a.x
          const vy = d.y - a.y
          const vz = d.z - a.z
          let nx = uy * vz - uz * vy
          let ny = uz * vx - ux * vz
          let nz = ux * vy - uy * vx
          const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
          nx /= nl
          ny /= nl
          nz /= nl
          const light = Math.max(0, nx * L[0]! + ny * L[1]! + nz * L[2]!)
          const u = i / cols
          const hue = 225 + u * 55
          const lum = 22 + light * 50
          // z 로 살짝 원근
          const pz = (p: P) => 1 + p.z / 900
          ctx.fillStyle = `hsl(${hue} 80% ${lum}%)`
          ctx.strokeStyle = ctx.fillStyle
          ctx.beginPath()
          ctx.moveTo(w / 2 + (a.x - w / 2) * pz(a), a.y)
          ctx.lineTo(w / 2 + (b.x - w / 2) * pz(b), b.y)
          ctx.lineTo(w / 2 + (c.x - w / 2) * pz(c), c.y)
          ctx.lineTo(w / 2 + (d.x - w / 2) * pz(d), d.y)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
      // 핀
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (const p of pts) if (p.pin) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const loop = () => {
      t += 0.016
      step()
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      pointer = { x, y, vx: pointer ? x - pointer.x : 0, vy: pointer ? y - pointer.y : 0 }
    }
    const onLeave = () => {
      pointer = null
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) {
      for (let i = 0; i < 60; i++) step()
      draw()
    } else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [cols, rows, reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
