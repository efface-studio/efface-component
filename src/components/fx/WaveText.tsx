import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface WaveTextProps {
  text: string
  className?: string
}

/**
 * 글자가 출렁이는 물결 위를 흘러간다 — SVG textPath 의 경로 자체가 매 프레임 바뀌고,
 * 글자는 경로를 따라 끝없이 흐른다. 포인터가 물결을 높인다.
 */
export function WaveText({ text, className }: WaveTextProps) {
  const id = useId().replace(/:/g, '')
  const path = useRef<SVGPathElement>(null)
  const tp = useRef<SVGTextPathElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const p = path.current
    const t = tp.current
    const el = host.current
    if (!p || !t || !el) return
    let raf = 0
    let time = 0
    let amp = 18
    let targetAmp = 18
    let px = 0.5
    const build = (time: number) => {
      const pts: string[] = []
      for (let x = 0; x <= 1000; x += 25) {
        const near = Math.exp(-((x / 1000 - px) ** 2) * 18)
        const y = 60 + Math.sin(x / 90 + time * 1.6) * amp * (0.6 + near * 1.2) + Math.sin(x / 41 - time * 2.3) * 5
        pts.push(`${pts.length ? 'L' : 'M'}${x} ${y.toFixed(1)}`)
      }
      return pts.join(' ')
    }
    const tick = () => {
      time += 0.016
      amp += (targetAmp - amp) * 0.06
      p.setAttribute('d', build(time))
      t.setAttribute('startOffset', `${(-(time * 60) % 1000) - 1000}`)
      raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      px = (e.clientX - r.left) / r.width
      targetAmp = 34
    }
    const onLeave = () => {
      targetAmp = 18
    }
    if (reduce) p.setAttribute('d', build(0))
    else raf = requestAnimationFrame(tick)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce])
  const repeated = `${text} · `.repeat(12)
  return (
    <div ref={host} className={cn('h-full w-full select-none', className)} aria-label={text}>
      <svg viewBox="0 0 1000 120" className="h-full w-full overflow-visible" aria-hidden>
        <path ref={path} id={`${id}-p`} d="M0 60 L1000 60" fill="none" />
        <text className="fill-fg font-display text-[44px] font-bold tracking-tight" dominantBaseline="middle">
          <textPath ref={tp} href={`#${id}-p`} startOffset="0">
            {repeated}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
