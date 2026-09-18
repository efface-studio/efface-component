import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface TerrainProps {
  className?: string
}

/**
 * 지형 비행. 절차적으로 만든 산맥 위를 끝없이 날아간다 — 높이에 따라 눈·바위·풀 색이 바뀌고
 * 멀수록 안개에 잠긴다. 포인터가 기수를 돌리고(좌우) 고도를 바꾼다(상하). 누르면 가속.
 */
export function Terrain({ className }: TerrainProps) {
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
    let speed = 0.9
    let targetSpeed = 0.9
    const cam = { yaw: 0, tyaw: 0, alt: 0, talt: 0 }
    const noise = (x: number, z: number) =>
      Math.sin(x * 0.7 + z * 0.35) * 0.6 + Math.sin(x * 0.23 - z * 0.61) * 1.1 + Math.sin(x * 1.7 + z * 1.1) * 0.25 + Math.cos(x * 0.11 + z * 0.13) * 1.6
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
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#070a14')
      sky.addColorStop(0.55, '#1c2a55')
      sky.addColorStop(1, '#0b0c10')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
      const ROWS = 46
      const COLS = 40
      const horizon = h * 0.42
      const cx = w / 2
      // 뒤(먼 곳)부터 앞으로 그려 겹침을 맞춘다
      let prevRow: { x: number; y: number; hgt: number }[] | null = null
      for (let r = ROWS; r >= 1; r--) {
        const z = r * 0.55 + 0.6
        const row: { x: number; y: number; hgt: number }[] = []
        const fog = Math.min(1, (r / ROWS) ** 1.4)
        for (let c = 0; c <= COLS; c++) {
          const wx = (c - COLS / 2) * 0.8 + cam.yaw * z * 0.6
          const wz = z + t
          const hgt = noise(wx, wz)
          const scale = (h * 0.9) / z
          const sx = cx + ((c - COLS / 2) * 0.8) * scale * 0.9 - cam.yaw * 120
          const sy = horizon + (2.6 - hgt * 0.55 + cam.alt) * scale * 0.5
          row.push({ x: sx, y: sy, hgt })
        }
        if (prevRow) {
          for (let c = 0; c < COLS; c++) {
            const a = row[c]!
            const b = row[c + 1]!
            const d = prevRow[c]!
            const e = prevRow[c + 1]!
            const hh = (a.hgt + b.hgt) / 2
            // 높이 → 색 (풀 → 바위 → 눈)
            let col: [number, number, number] = hh > 1.9 ? [235, 240, 250] : hh > 0.6 ? [90, 96, 120] : [38, 90, 84]
            const sun = Math.max(0.35, 1 - Math.abs(a.hgt - b.hgt) * 0.8)
            const fogC: [number, number, number] = [28, 42, 85]
            col = [col[0] * sun * (1 - fog) + fogC[0] * fog, col[1] * sun * (1 - fog) + fogC[1] * fog, col[2] * sun * (1 - fog) + fogC[2] * fog]
            ctx.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`
            ctx.strokeStyle = `rgba(150,180,255,${0.35 * (1 - fog)})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.lineTo(e.x, e.y)
            ctx.lineTo(d.x, d.y)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          }
        }
        prevRow = row
      }
      // 해
      const sg = ctx.createRadialGradient(cx - cam.yaw * 60, horizon - 40, 0, cx - cam.yaw * 60, horizon - 40, 90)
      sg.addColorStop(0, 'rgba(255,220,160,0.55)')
      sg.addColorStop(1, 'rgba(255,220,160,0)')
      ctx.fillStyle = sg
      ctx.fillRect(0, 0, w, horizon + 60)
    }
    const loop = () => {
      speed += (targetSpeed - speed) * 0.05
      t += 0.016 * speed * 4
      cam.yaw += (cam.tyaw - cam.yaw) * 0.05
      cam.alt += (cam.talt - cam.alt) * 0.05
      draw()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      cam.tyaw = ((e.clientX - r.left) / r.width - 0.5) * 2
      cam.talt = ((e.clientY - r.top) / r.height - 0.5) * -1.6
    }
    const onLeave = () => {
      cam.tyaw = 0
      cam.talt = 0
      targetSpeed = 0.9
    }
    const onDown = () => {
      targetSpeed = 2.6
    }
    const onUp = () => {
      targetSpeed = 0.9
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (reduce) draw()
    else raf = requestAnimationFrame(loop)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointerup', onUp)
    }
  }, [reduce])
  return (
    <div className={cn('relative h-full w-full touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
