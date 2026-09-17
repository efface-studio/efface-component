import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/brand/Logo'
import { StatusDot } from '@/components/ui/Badge'

export interface FooterV1Props {
  tagline: string
  ceo: { label: string; name: string; href: string }
  primary: { label: string; email: string }
  secondary: { label: string; email: string }[]
  sitemap: { label: string; href: string }[]
  channels: { label: string; href: string; icon?: 'kakao' | 'github' }[]
  sectionLabels?: { sitemap: string; channels: string }
  legal: { label: string; href: string }[]
  copyright?: string
  className?: string
}

const KAKAO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.84 5.32 4.62 6.77-.19.7-.69 2.54-.79 2.94-.12.5.18.49.39.36.16-.1 2.6-1.77 3.65-2.49.7.1 1.41.16 2.13.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
  </svg>
)
const GITHUB = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.92 10.92 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
  </svg>
)

/**
 * v1 푸터 (efface.dev) — 라이트. 대표 알약, 주 연락처 카드(호버 시 화살표 45° 회전),
 * 보조 연락처 2열, 사이트맵/채널 열, 저작권 행.
 */
export function FooterV1({
  tagline,
  ceo,
  primary,
  secondary,
  sitemap,
  channels,
  sectionLabels = { sitemap: '사이트맵', channels: '채널' },
  legal,
  copyright = `© ${new Date().getFullYear()} efface. All rights reserved.`,
  className,
}: FooterV1Props) {
  return (
    <footer className={cn('border-t border-line bg-surface', className)}>
      <div className="mx-auto max-w-page-v1 px-5 py-14 md:px-8">
        <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-4">
          <div className="col-span-2">
            <div className="mb-3 flex items-center gap-2 font-semibold tracking-tight">
              <Logo size={24} />
              efface
            </div>
            <p className="max-w-md leading-relaxed text-fg-dim">{tagline}</p>

            <div className="mt-6 border-t border-line pt-6">
              <a
                href={ceo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-5 inline-flex h-7 items-center gap-3 rounded-full border border-line px-3 text-xs transition-colors hover:border-fg hover:bg-bg-soft"
              >
                <span className="tracking-[0.2em] text-fg-dim uppercase">{ceo.label}</span>
                <span className="h-3 w-px bg-line" />
                <span className="font-medium tracking-tight text-fg">{ceo.name}</span>
                <ArrowUpRight size={11} className="text-fg-dim transition-colors group-hover:text-accent" />
              </a>

              <a
                href={`mailto:${primary.email}`}
                className="group relative mb-3 block max-w-md rounded-xl border border-line bg-bg-soft px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-fg hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusDot tone="success" pulse />
                      <span className="font-mono text-[10px] tracking-[0.18em] text-fg-dim uppercase">{primary.label}</span>
                    </div>
                    <div className="truncate font-mono text-[15px] text-fg transition-colors group-hover:text-accent md:text-base">{primary.email}</div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-fg-dim transition-all group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
                    <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
                  </span>
                </div>
              </a>

              <div className="grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                {secondary.map((s) => (
                  <a key={s.email} href={`mailto:${s.email}`} className="group flex flex-col gap-0.5 rounded-lg px-3 py-2 transition-colors hover:bg-bg-soft">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-fg-dim uppercase">{s.label}</span>
                    <span className="truncate font-mono text-[12.5px] text-fg transition-colors group-hover:text-accent">{s.email}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 font-mono text-xs text-fg-dim">{sectionLabels.sitemap}</div>
            <ul className="space-y-1.5">
              {sitemap.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="hover:text-fg-dim">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 font-mono text-xs text-fg-dim">{sectionLabels.channels}</div>
            <ul className="space-y-1.5">
              {channels.map((c) => (
                <li key={c.href}>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-fg-dim">
                    {c.icon === 'kakao' && KAKAO}
                    {c.icon === 'github' && GITHUB}
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-line pt-6 text-xs text-fg-dim md:flex-row">
          <div>{copyright}</div>
          <div className="flex gap-5">
            {legal.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-fg">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
