import { cn } from '@/lib/cn'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import { EffaceLogo } from '@/components/brand/EffaceLogo'
import { Strike } from '@/components/motion/Strike'
import { FooterWordmark } from './FooterWordmark'
import { SITE_FOOTER_COLUMNS } from './siteFooter.data'

export interface SiteFooterRow {
  label: string
  value: string
  href?: string
}
export interface SiteFooterColumn {
  title: string
  rows: SiteFooterRow[]
}

export interface SiteFooterProps {
  columns?: readonly SiteFooterColumn[]
  /** 태그라인 — 취소선 단어 앞/뒤 */
  tagline?: { before: string; struck: string; after: string }
  /** 아래 작은 줄 */
  subline?: { before: string; struck: string; after: string }
  rights?: string
  toTopLabel?: string
  onToTop?: () => void
  className?: string
}

/**
 * 사이트 푸터 (Mom-Work) — v2 푸터 구조를 CSS 전환만으로 재현한 네이비 톤.
 * 뷰포트에 들어오면 로고 글자 → 태그라인 취소선 → 컬럼(왼→오 클립 리빌) → 워드마크 순으로 뜬다.
 */
export function SiteFooter({
  columns = SITE_FOOTER_COLUMNS,
  tagline = { before: 'Erase the ', struck: 'complexity', after: '. Keep the effect.' },
  subline = { before: 'Less, but ', struck: 'louder', after: ' — sharper.' },
  rights = `© ${new Date().getFullYear()} efface. All rights reserved.`,
  toTopLabel = 'Back to top ↑',
  onToTop,
  className,
}: SiteFooterProps) {
  const [ref, shown] = useInViewOnce<HTMLElement>({ threshold: 0.15 })

  /** 왼쪽에서 오른쪽으로 쓸리며(clip-path) 살짝 밀려 들어오는 리빌 */
  const reveal = (delayMs: number) =>
    cn(
      'transition-[opacity,transform,clip-path] duration-700 ease-out-quart motion-reduce:transition-none',
      shown
        ? 'translate-x-0 opacity-100 [clip-path:inset(0_0_0_0)]'
        : '-translate-x-4 opacity-0 [clip-path:inset(0_100%_0_0)] motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:[clip-path:none]',
    ) + ` [transition-delay:${delayMs}ms]`

  const toTop = () => {
    if (onToTop) return onToTop()
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <footer ref={ref} className={cn('bg-[#0B1220] text-[#E5E9F0]', className)}>
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8">
        <div className={cn('flex flex-col items-start gap-5', reveal(0))}>
          <EffaceLogo animate={shown} dark />
          <div className="flex flex-col gap-1.5">
            <p lang="en" className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {tagline.before}
              <Strike shown={shown} delay={500} className="text-[#6E7A90]">
                {tagline.struck}
              </Strike>
              {tagline.after}
            </p>
            <p className="text-[15px] font-medium tracking-tight text-[#A9B1C2] sm:text-base">
              {subline.before}
              <Strike shown={shown} delay={800} className="text-[#6E7A90]">
                {subline.struck}
              </Strike>
              {subline.after}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {columns.map((col, i) => (
            <section key={col.title} className={cn('flex flex-col gap-3', reveal(120 + i * 90))}>
              <h4 className="font-mono text-[11px] font-semibold tracking-[0.12em] text-[#6E7A90]">{col.title}</h4>
              <dl className="flex flex-col gap-2 text-[13.5px]">
                {col.rows.map((row) => (
                  <div key={row.label} className="flex gap-3">
                    <dt className="w-16 shrink-0 text-[#6E7A90]">{row.label}</dt>
                    <dd className="min-w-0 font-medium text-[#E5E9F0]">
                      {row.href ? (
                        <a
                          href={row.href}
                          target={row.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel="noreferrer"
                          className="rounded-sm underline-offset-4 transition-colors hover:text-white hover:underline"
                        >
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div
          className={cn(
            'mt-20 [container-type:inline-size] transition-[opacity,transform,clip-path] duration-[1100ms] ease-out-quart [transition-delay:900ms] motion-reduce:transition-none',
            shown
              ? 'translate-x-0 opacity-100 [clip-path:inset(0_0_0_0)]'
              : '-translate-x-4 opacity-0 [clip-path:inset(0_100%_0_0)] motion-reduce:translate-x-0 motion-reduce:opacity-100 motion-reduce:[clip-path:none]',
          )}
        >
          <FooterWordmark active={shown} />
        </div>

        <div className={cn('mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#6E7A90]', reveal(520))}>
          <p>{rights}</p>
          <button type="button" onClick={toTop} className="rounded-sm text-[#A9B1C2] transition-colors hover:text-white">
            {toTopLabel}
          </button>
        </div>
      </div>
    </footer>
  )
}
