import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { SourceBadge, type Source } from './SourceBadge'
import { Seo } from './Seo'

export interface DocPageProps {
  eyebrow: string
  title: string
  /** 리드 문장 — meta description 으로도 쓰이므로 문자열 */
  lead?: string
  sources?: Source[]
  /** 폭 제한 없이 본문 전체를 쓴다 (라이브 검사처럼 넓어야 하는 페이지) */
  wide?: boolean
  /** 검색에 넣지 않는다 (라이브 프레임 등) */
  noindex?: boolean
  children: ReactNode
}

/** 문서 페이지 프레임 — eyebrow, 제목, 리드, 출처 배지. */
export function DocPage({ eyebrow, title, lead, sources, wide = false, noindex = false, children }: DocPageProps) {
  return (
    <article className={cn('mx-auto w-full', wide ? 'max-w-none' : 'max-w-[1280px]')}>
      <Seo title={title} description={lead} noindex={noindex} />
      <header className="mb-12 border-b border-line pb-8">
        <p className="label">
          <span className="text-accent">//</span> {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg-dim md:text-base">{lead}</p>}
        {sources && sources.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] tracking-wider text-fg-faint uppercase">source</span>
            {sources.map((s) => (
              <SourceBadge key={s} src={s} />
            ))}
          </div>
        )}
      </header>
      <div className="space-y-16">{children}</div>
    </article>
  )
}

export interface SectionProps {
  id?: string
  title: string
  desc?: ReactNode
  sources?: Source[]
  children: ReactNode
  className?: string
}

/** 섹션 앵커 id — 제목에서 만든다 (한글 그대로, 공백은 하이픈) */
function sectionId(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, '-')
}

export function Section({ id, title, desc, sources, children, className }: SectionProps) {
  return (
    <section id={id ?? sectionId(title)} className={cn('scroll-mt-24', className)}>
      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
        {sources?.map((s) => (
          <SourceBadge key={s} src={s} />
        ))}
      </div>
      {desc && <div className="mb-5 max-w-2xl text-sm leading-relaxed text-fg-dim md:text-[15px]">{desc}</div>}
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="mt-2 text-sm font-medium text-fg">{children}</h3>
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-bg-soft px-4 py-3 text-[13px] leading-relaxed text-fg-dim">
      {children}
    </p>
  )
}
