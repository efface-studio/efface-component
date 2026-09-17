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
      { title: '웹사이트 외주,\n막막하셨다면.', sub: '기획 · 디자인 · 개발 · 배포까지 한 곳에서.' },
      { title: 'Erase the complexity.\nKeep the effect.', sub: '필요한 것만 남기는 웹 외주 제작 스튜디오.' },
      { title: '1~3주, 35만원부터\n시작합니다.', sub: '랜딩 · 기업 사이트 · 쇼핑몰 · 사내 관리툴' },
    ],
    cta: '무료 견적 받기',
    href: 'https://efface.dev/',
    metrics: ['랜딩 35만원부터', '1~3주 납품', '1개월 무상 유지보수'],
  },
  {
    id: 'pricing',
    label: '// PRICING · 부가세 별도',
    cuts: [
      { title: '랜딩 페이지\n35만원부터', sub: '1~2주 · 신제품 출시, 캠페인, 채용 페이지' },
      { title: '기업·브랜드 사이트\n60만원부터', sub: '2~3주 · 회사 소개, 포트폴리오, 채용' },
      { title: '쇼핑몰 / 커머스\n70만원부터', sub: '3~5주 · 결제(PG) · 재고 · 주문 관리 연동' },
    ],
    cta: '1분 견적 계산기',
    href: 'https://efface.dev/',
    metrics: ['선금 50% / 잔금 50%', '세금계산서 발행'],
  },
  {
    id: 'speed',
    label: '// PROCESS · 평균 2~4주',
    cuts: [{ title: '상담부터 인계까지,\n1~3주.', sub: '1영업일 내 회신 · 견적 확정 후 평균 3일 내 착수' }],
    cta: '일정 상담하기',
    href: 'https://efface.dev/',
    metrics: ['상담·견적', '디자인·개발', '배포·인계'],
  },
  {
    id: 'ai',
    label: '// CAPABILITIES · AI · WEB · APP · INFRA',
    cuts: [{ title: 'AI까지 다루는\n엔지니어링 팀.', sub: 'LLM 기능부터 웹, 앱, 인프라까지. 실제 제품에 넣어 검증합니다.' }],
    cta: '기술 상담 요청',
    href: 'https://v2.efface.dev/',
    metrics: ['Claude · OpenAI', 'Next.js · React', 'Vercel · AWS'],
  },
  {
    id: 'handoff',
    label: '// HANDOFF · 검증된 기술만',
    cuts: [{ title: '넘겨받기 좋은\n코드로 마무리합니다.', sub: 'TypeScript · 일관된 컨벤션 · README와 운영 가이드 동봉.' }],
    cta: '작업 사례 보기',
    href: 'https://efface.dev/',
    metrics: ['25 tools', '표준 도구만 사용', '자체 운영 가능'],
  },
  {
    id: 'recruit',
    label: '2026 Q3 신규 프로젝트 모집 중',
    live: true,
    cuts: [{ title: '프로젝트,\n시작해 볼까요?', sub: '30개+ 프로젝트 완료 · 평균 만족도 4.9 · 평일 24시간 내 응답' }],
    cta: '무료 견적 받기',
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
    <section aria-roledescription="carousel" aria-label="efface 소개" className="-mx-2" style={vars} onPointerDown={() => setPaused(true)} onFocusCapture={() => setPaused(true)}>
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

      <div className="mt-3 flex items-center justify-center gap-1.5 px-2" role="tablist" aria-label="배너 선택">
        {SLIDES.map((s, i) => (
          <button key={s.id} type="button" role="tab" aria-selected={i === index} aria-label={`${i + 1}번 배너`} onClick={() => goTo(i)} className="flex h-6 items-center px-0.5">
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
