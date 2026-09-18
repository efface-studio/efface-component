import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Aurora, ParticleText } from '@/components/fx'
import { GhostPointer } from '@/docs/components/GhostPointer'

/**
 * 오로라 위에 입자로 모인 efface 로고. 가짜 커서가 떠다니며 흔들고 가끔 터뜨린다.
 * 진짜 포인터가 들어오면 가짜 커서는 물러나고, 나가면 1.5초 뒤 다시 돈다.
 */
export function LogoParticleHero({ className }: { className?: string }) {
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t = 0
    const enter = () => {
      window.clearTimeout(t)
      setPlaying(false)
    }
    const leave = () => {
      t = window.setTimeout(() => setPlaying(true), 1500)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div ref={ref} className={cn('relative h-[380px] overflow-hidden rounded-2xl border border-line bg-bg text-fg md:h-[460px]', className)}>
      <Aurora colors={['#7c3aed', '#14b8b0', '#2563eb']} className="opacity-60" />
      <ParticleText src="/logos/efface.svg" gap={5} radius={110} scale={0.78} />
      <GhostPointer active={playing} click clickEvery={7} speed={0.6} />
      <p className="pointer-events-none absolute right-5 bottom-4 font-mono text-[11px] tracking-wider text-fg-faint uppercase">{playing ? '마우스를 올려 직접' : '움직여 보고 · 눌러 보세요'}</p>
    </div>
  )
}
