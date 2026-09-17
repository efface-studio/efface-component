import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

interface Cut {
  title: string
  sub: string
}

interface Slide {
  id: string
  label: string
  live?: boolean
  cuts: Cut[]
  cta: string
  href: string
  metrics?: string[]
}

const ACCENT = '#3b62e5'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const INTERVAL_MS = 8000

/** 핸드오프 배너 6종의 카피를 모바일 세로형으로 재배치 */
const SLIDES: readonly Slide[] = [
  {
    id: 'brand',
    label: 'WEB · COMMERCE · ADMIN · AI',
    cuts: [
      { title: 'Website outsourcing,\nminus the headache.', sub: 'Planning · design · build · launch, in one place.' },
      { title: 'Erase the complexity.\nKeep the effect.', sub: 'A web studio that keeps only what matters.' },
      { title: '1–3 weeks,\nfrom ₩350K.', sub: 'Landing · brand site · commerce · internal tools' },
    ],
    cta: 'Get a free quote',
    href: 'https://efface.dev/',
    metrics: ['Landing from ₩350K', '1–3 week delivery', '1 month free support'],
  },
  {
    id: 'pricing',
    label: '// PRICING · VAT excluded',
    cuts: [
      { title: 'Landing page\nfrom ₩350K', sub: '1–2 wks · launches, campaigns, hiring pages' },
      { title: 'Brand site\nfrom ₩600K', sub: '2–3 wks · company, portfolio, careers' },
      { title: 'Commerce\nfrom ₩700K', sub: '3–5 wks · payments · inventory · orders' },
    ],
    cta: '1-minute estimate',
    href: 'https://efface.dev/',
    metrics: ['50% upfront / 50% on delivery', 'Tax invoice issued'],
  },
  {
    id: 'speed',
    label: '// PROCESS · avg. 2–4 weeks',
    cuts: [{ title: 'From first call to handoff,\n1–3 weeks.', sub: 'Reply within 1 business day · kickoff ~3 days after the quote' }],
    cta: 'Talk timeline',
    href: 'https://efface.dev/',
    metrics: ['Call · quote', 'Design · build', 'Launch · handoff'],
  },
  {
    id: 'ai',
    label: '// CAPABILITIES · AI · WEB · APP · INFRA',
    cuts: [{ title: 'An engineering team\nthat ships AI too.', sub: 'From LLM features to web, apps and infra — proven inside real products.' }],
    cta: 'Book a tech call',
    href: 'https://v2.efface.dev/',
    metrics: ['Claude · OpenAI', 'Next.js · React', 'Vercel · AWS'],
  },
  {
    id: 'handoff',
    label: '// HANDOFF · proven tools only',
    cuts: [{ title: 'Code that is\neasy to inherit.', sub: 'TypeScript · consistent conventions · README and ops guide included.' }],
    cta: 'See our work',
    href: 'https://efface.dev/',
    metrics: ['25 tools', 'Standard tooling only', 'Self-operable'],
  },
  {
    id: 'recruit',
    label: 'Now taking Q3 2026 projects',
    live: true,
    cuts: [{ title: "Let's start\na project.", sub: '30+ projects shipped · 4.9 avg. satisfaction · replies within 24h on weekdays' }],
    cta: 'Get a free quote',
    href: 'https://efface.dev/',
  },
]

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="efmGradLight" x1="4" y1="4" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#eeeef1" />
          <stop offset="1" stopColor="#b9b9c4" />
        </linearGradient>
        <linearGradient id="efmGradAccent" x1="12" y1="12" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8aa2ff" />
          <stop offset="0.45" stopColor={ACCENT} />
          <stop offset="1" stopColor="#1a2a72" />
        </linearGradient>
      </defs>
      <rect x="6.7" y="6.7" width="13" height="13" rx="3.6" fill="#7c7c86" />
      <rect x="6.1" y="6.1" width="13" height="13" rx="3.6" fill="#a8a8b3" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill="url(#efmGradLight)" />
      <rect x="14.7" y="14.7" width="13" height="13" rx="3.6" fill="#101a4a" />
      <rect x="14.1" y="14.1" width="13" height="13" rx="3.6" fill="#1d2e71" />
      <rect x="13.5" y="13.5" width="13" height="13" rx="3.6" fill="url(#efmGradAccent)" />
    </svg>
  )
}

/** 컷 순환: 첫 컷은 0%에서 보이는 A 변형, 나머지는 delay로 배분 (핸드오프 규칙) */
function cutStyle(index: number, count: number, dur: number): CSSProperties {
  if (count === 1) return {}
  const base = `${dur}s`
  return index === 0
    ? { animation: `efCut3A ${base} linear infinite both`, animationPlayState: 'var(--play)' as CSSProperties['animationPlayState'] }
    : {
        animation: `efCut3 ${base} linear infinite both`,
        animationDelay: `${(dur * index) / count}s`,
        animationPlayState: 'var(--play)' as CSSProperties['animationPlayState'],
      }
}

function riseStyle(index: number, count: number, dur: number, kind: 'rise' | 'pop'): CSSProperties {
  if (count === 1) return {}
  const name = kind === 'rise' ? (index === 0 ? 'efRiseA' : 'efRise') : index === 0 ? 'efPopA' : 'efPop'
  return {
    animation: `${name} ${dur}s cubic-bezier(0.16,1,0.3,1) infinite both`,
    animationDelay: index === 0 ? undefined : `${(dur * index) / count + (kind === 'pop' ? 0.24 : 0)}s`,
    animationPlayState: 'var(--play)' as CSSProperties['animationPlayState'],
  }
}

export function EffaceBannerMobile({ animate = true, cycleSeconds = 12 }: { animate?: boolean; cycleSeconds?: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const next = (i + SLIDES.length) % SLIDES.length
    track.scrollTo({ left: next * track.clientWidth, behavior: animate ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    if (paused || !animate) return
    const timer = window.setInterval(() => {
      const track = trackRef.current
      if (!track) return
      const cur = Math.round(track.scrollLeft / track.clientWidth)
      track.scrollTo({ left: ((cur + 1) % SLIDES.length) * track.clientWidth, behavior: 'smooth' })
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [paused, animate])

  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    if (i !== index) setIndex(i)
  }

  const vars = { '--dur': `${cycleSeconds}s`, '--play': animate ? 'running' : 'paused' } as CSSProperties

  return (
    <section aria-roledescription="carousel" aria-label="About efface" className="-mx-2" style={vars} onPointerDown={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
      <div ref={trackRef} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-2xl">
        {SLIDES.map((s, si) => (
          <article
            key={s.id}
            aria-roledescription="slide"
            aria-label={`${si + 1} / ${SLIDES.length}`}
            className="relative flex h-[470px] w-full shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0b] p-6 text-[#f6f6f7]"
          >
            {/* 장식: 격자, 글로우, 시트 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-10 h-72 w-72 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(59,98,229,0.45), transparent 62%)',
                filter: 'blur(18px)',
                animation: 'efGlow calc(var(--dur) / 3) ease-in-out infinite',
                animationPlayState: 'var(--play)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-40"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.06) 60%, transparent)',
                mixBlendMode: 'screen',
                animation: 'efSheen calc(var(--dur) / 3) cubic-bezier(0.5,0,0.4,1) infinite',
                animationPlayState: 'var(--play)',
              }}
            />

            {/* 헤더 */}
            <header className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LogoMark size={28} />
                <span className="text-[19px] font-semibold tracking-[-0.035em]">efface</span>
              </div>
              <span
                className={cn('truncate text-[10px] tracking-[0.12em] text-[#9b9ba4] uppercase', s.live && 'flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 normal-case tracking-[0.04em]')}
                style={{ fontFamily: MONO }}
              >
                {s.live && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: ACCENT, animation: 'efDot 2.2s ease-in-out infinite', animationPlayState: 'var(--play)' }}
                  />
                )}
                {s.label}
              </span>
            </header>

            {/* 본문: 컷 순환 */}
            <div className="relative my-4 flex-1">
              {s.cuts.map((c, ci) => (
                <div key={ci} className="absolute inset-0 flex flex-col justify-center gap-3" style={cutStyle(ci, s.cuts.length, cycleSeconds)}>
                  <div className="overflow-hidden pb-1">
                    <h3
                      className="text-[34px] leading-[1.15] font-bold tracking-[-0.035em] whitespace-pre-line"
                      style={riseStyle(ci, s.cuts.length, cycleSeconds, 'rise')}
                    >
                      {c.title}
                    </h3>
                  </div>
                  <p className="text-[16px] leading-relaxed text-[#9b9ba4]" style={riseStyle(ci, s.cuts.length, cycleSeconds, 'pop')}>
                    {c.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* 푸터 */}
            <footer className="relative flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-[12px] text-[#c9c9d1]" style={{ fontFamily: MONO }}>
                {(s.metrics ?? ['efface.dev']).map((m, i) => (
                  <span key={m} className="flex items-center gap-2">
                    {i > 0 && <span className="text-[#45454e]">/</span>}
                    {m}
                  </span>
                ))}
              </div>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold text-white"
                style={{ background: ACCENT }}
              >
                {s.cta}
                <span style={{ animation: 'efNudge var(--dur) ease-in-out infinite', animationPlayState: 'var(--play)' }}>→</span>
              </a>
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 px-2" role="tablist" aria-label="Select banner">
        {SLIDES.map((s, i) => (
          <button key={s.id} type="button" role="tab" aria-selected={i === index} aria-label={`Banner ${i + 1}`} onClick={() => goTo(i)} className="flex h-6 items-center px-0.5">
            <span
              className="block h-1.5 rounded-full transition-[width,background-color] duration-300"
              style={{ width: i === index ? 22 : 6, background: i === index ? ACCENT : 'rgba(0,0,0,0.18)' }}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
