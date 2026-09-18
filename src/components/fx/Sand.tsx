import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface SandProps {
  /** 격자 셀 크기(px) */
  cell?: number
  className?: string
}

/**
 * 떨어지는 모래(셀 자동자). 포인터가 있는 자리에서 모래가 쏟아져 쌓이고 비탈을 타고 흘러내린다.
 * 누르면 색이 바뀐다. 가만히 두면 위에서 조금씩 흩뿌려진다.
 */
export function Sand({ cell = 4, className }: SandProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const host = canvas.parentElement ?? canvas
    let cols = 0
    let rows = 0
    let grid = new Uint8Array(0)
    let raf = 0
    let pointer: { x: number; y: number } | null = null
    let hue = 0
    let palette: string[] = []
    let t = 0
    const resize = () => {
      const r = host.getBoundingClientRect()
      cols = Math.max(1, Math.floor(r.width / cell))
      rows = Math.max(1, Math.floor(r.height / cell))
      canvas.width = cols * cell
      canvas.height = rows * cell
      canvas.style.width = `${cols * cell}px`
      canvas.style.height = `${rows * cell}px`
      grid = new Uint8Array(cols * rows)
      const cs = getComputedStyle(host)
      const accent = cs.getPropertyValue('--accent').trim() || '#2563eb'
      palette = [accent, '#14b8b0', '#7c3aed', '#f59e0b', cs.color]
    }
    const drop = (cx: number, cy: number, color: number, amount: number) => {
      for (let i = 0; i < amount; i++) {
        const x = cx + Math.floor((Math.random() - 0.5) * 6)
        const y = cy + Math.floor((Math.random() - 0.5) * 6)
        if (x >= 0 && x < cols && y >= 0 && y < rows && grid[y * cols + x] === 0) grid[y * cols + x] = color + 1
      }
    }
    const step = () => {
      for (let y = rows - 2; y >= 0; y--) {
        const dir = Math.random() > 0.5 ? 1 : -1
        for (let xx = 0; xx < cols; xx++) {
          const x = dir > 0 ? xx : cols - 1 - xx
          const i = y * cols + x
          const v = grid[i]
          if (!v) continue
          const below = (y + 1) * cols + x
          if (grid[below] === 0) {
            grid[below] = v
            grid[i] = 0
            continue
          }
          const l = x - 1
          const r = x + 1
          const first = Math.random() > 0.5 ? l : r
          const second = first === l ? r : l
          for (const nx of [first, second]) {
            if (nx < 0 || nx >= cols) continue
            const j = (y + 1) * cols + nx
            if (grid[j] === 0) {
              grid[j] = v
              grid[i] = 0
              break
            }
          }
        }
      }
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const v = grid[y * cols + x]
          if (!v) continue
          ctx.fillStyle = palette[(v - 1) % palette.length] ?? '#000'
          ctx.fillRect(x * cell, y * cell, cell, cell)
        }
    }
    const loop = () => {
      t += 1 / 60
      if (pointer) drop(Math.floor(pointer.x / cell), Math.floor(pointer.y / cell), hue, 6)
      else if (Math.random() < 0.5) drop(Math.floor(cols * (0.5 + Math.sin(t * 0.7) * 0.35)), 1, hue, 2)
      // 가득 차면 아래를 비운다
      let filled = 0
      for (let x = 0; x < cols; x += 7) if (grid[Math.floor(rows * 0.15) * cols + x]) filled++
      if (filled > cols / 14) for (let i = 0; i < grid.length; i++) if (Math.random() < 0.03) grid[i] = 0
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
    const onDown = () => {
      hue = (hue + 1) % 5
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()
    if (!reduce) raf = requestAnimationFrame(loop)
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
  }, [cell, reduce])
  return (
    <div className={cn('relative flex h-full w-full items-end justify-center touch-none select-none', className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  )
}
