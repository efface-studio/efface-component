import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { Aurora } from '@/components/fx/Aurora'
import { ParticleText } from '@/components/fx/ParticleText'
import { GhostPointer } from '@/docs/components/GhostPointer'

const HERO_COLORS = ['#7c3aed', '#14b8b0', '#2563eb']

/**
 * 오로라 위에 입자로 모인 efface 로고. 가짜 커서가 떠다니며 흔들고 가끔 터뜨린다.
 * 진짜 포인터가 들어오면 가짜 커서는 물러나고, 나가면 1.5초 뒤 다시 돈다.
 * 화면 밖으로 나가면 캔버스를 내려 GPU 를 쉬게 하고, 애니메이션 줄이기면 가짜 커서는 안 돈다.
 */
export function LogoParticleHero({ className }: { className?: string }) {
  const [hover, setHover] = useState(false)
  const [near, setNear] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t = 0
    // 가짜 커서가 조상 체인으로 올려 보내는 합성 pointerenter 는 무시 — 진짜 포인터만
    const enter = (e: PointerEvent) => {
      if (!e.isTrusted) return
      window.clearTimeout(t)
      setHover(true)
    }
    const leave = (e: PointerEvent) => {
      if (!e.isTrusted) return
      t = window.setTimeout(() => setHover(false), 1500)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([entry]) => setNear(!!entry?.isIntersecting), { rootMargin: '120px 0px' })
    io.observe(el)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      io.disconnect()
    }
  }, [])
  const playing = near && !hover && !reduce
  return (
    <div ref={ref} className={cn('relative h-[380px] overflow-hidden rounded-2xl border border-line bg-bg text-fg md:h-[460px]', className)} aria-hidden>
      {near && (
        <>
          <Aurora colors={HERO_COLORS} className="opacity-60" />
          <ParticleText src="/logos/efface.svg" gap={5} radius={110} scale={0.78} />
          <GhostPointer active={playing} click clickEvery={7} speed={0.6} />
        </>
      )}
      <p className="pointer-events-none absolute right-5 bottom-4 font-mono text-[11px] tracking-wider text-fg-dim uppercase">{playing ? '마우스를 올려 직접' : '움직여 보고 · 눌러 보세요'}</p>
    </div>
  )
}
