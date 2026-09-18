import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

export interface GhostPointerProps {
  active: boolean
  /** 주기적으로 누른다 */
  click?: boolean
  /** 누르는 간격(초). 기본 2.2~4.2 사이 무작위 */
  clickEvery?: number
  speed?: number
  className?: string
}

/** target 에서 host 까지의 조상들 */
function chain(from: Element | null, host: Element): Element[] {
  const out: Element[] = []
  let el: Element | null = from
  while (el && host.contains(el)) {
    out.push(el)
    if (el === host) break
    el = el.parentElement
  }
  return out
}

/**
 * 가짜 커서. 부모(host) 안을 리사주 곡선으로 떠다니며 그 자리의 요소에
 * pointermove / mousemove / mouseover·out / pointerenter·leave (· 가끔 pointerdown·up) 을 보낸다.
 * 진짜 포인터가 들어오면 카드가 active 를 끄고, 이 커서는 사라진다.
 */
export function GhostPointer({ active: activeProp, click = false, clickEvery, speed = 1, className }: GhostPointerProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 애니메이션 줄이기면 가짜 커서도 쉰다 — 사용자가 직접 움직이는 건 그대로
  const reduce = useReducedMotion()
  const active = activeProp && !reduce

  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host || !active) return
    let raf = 0
    let t = Math.random() * 20
    let last: Element | null = null
    let nextClick = t + 1.5
    const timers = new Set<number>()
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }
    const init = { clientX: 0, clientY: 0, bubbles: true, pointerType: 'mouse', isPrimary: true, pointerId: 1 }

    const send = (target: Element, type: string, x: number, y: number, extra: Partial<PointerEventInit> = {}) => {
      const Ctor = type.startsWith('pointer') ? PointerEvent : MouseEvent
      const ev = new Ctor(type, { ...init, clientX: x, clientY: y, ...extra })
      Object.defineProperty(ev, '__ghost', { value: true })
      target.dispatchEvent(ev)
    }
    const move = (target: Element | null, x: number, y: number) => {
      if (target !== last) {
        const from = chain(last, host)
        const to = chain(target, host)
        // 나가는 쪽
        if (last) send(last, 'mouseout', x, y, { relatedTarget: target })
        for (const a of from) if (!target || !a.contains(target)) send(a, 'pointerleave', x, y, { bubbles: false, relatedTarget: target })
        if (last && (!target || !last.contains(target))) send(last, 'mouseleave', x, y, { bubbles: false, relatedTarget: target })
        // 들어오는 쪽
        if (target) send(target, 'mouseover', x, y, { relatedTarget: last })
        for (const a of to) if (!last || !a.contains(last)) send(a, 'pointerenter', x, y, { bubbles: false, relatedTarget: last })
        if (target && (!last || !target.contains(last))) send(target, 'mouseenter', x, y, { bubbles: false, relatedTarget: last })
        last = target
      }
      if (target) {
        send(target, 'pointermove', x, y)
        send(target, 'mousemove', x, y)
      }
    }

    const tick = () => {
      t += 0.016 * speed
      const r = host.getBoundingClientRect()
      const px = r.width * (0.5 + 0.4 * Math.sin(t * 0.9))
      const py = r.height * (0.5 + 0.36 * Math.sin(t * 1.37 + 1.1))
      el.style.transform = `translate(${px}px, ${py}px)`
      const x = r.left + px
      const y = r.top + py
      // 화면 밖이면 쉰다
      const onScreen = y > 0 && y < window.innerHeight && x > 0 && x < window.innerWidth
      const target = onScreen ? document.elementFromPoint(x, y) : null
      move(target && host.contains(target) ? target : null, x, y)
      if (click && target && host.contains(target) && t > nextClick) {
        nextClick = t + (clickEvery ?? 2.2 + Math.random() * 2)
        el.classList.add('is-down')
        later(() => el.classList.remove('is-down'), 180)
        send(target, 'pointerdown', x, y)
        send(target, 'mousedown', x, y)
        later(() => {
          send(target, 'pointerup', x, y)
          send(target, 'mouseup', x, y)
        }, 90)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach((id) => window.clearTimeout(id))
      // 떠날 때 마지막 요소에 leave 를 보내 상태를 되돌린다
      const r = host.getBoundingClientRect()
      move(null, r.left - 50, r.top - 50)
    }
  }, [active, click, clickEvery, speed])

  return (
    <div ref={ref} aria-hidden className={cn('ghost-pointer pointer-events-none absolute top-0 left-0 z-20 will-change-transform', !active && 'hidden', className)}>
      <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
        <path d="M5 3l14 8-6.2 1.6L9.5 19z" fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="ghost-pointer__ring" />
    </div>
  )
}
