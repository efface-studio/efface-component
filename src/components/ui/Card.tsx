import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { CAPABILITY_ACCENTS, DOT_COLORS } from './card.constants'

/* ── CardGrid — 1px 선으로 나뉜 셀 그리드 (v1 Services / Process / Manifesto) ── */

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** 열 수 (md 이상). 모바일은 1열. */
  cols?: 2 | 3 | 4
  /** 둥근 모서리 + overflow clip. Manifesto는 각진 형태. */
  rounded?: boolean
}

/**
 * 셀 사이 간격을 `gap-px` + 배경색(line)으로 만드는 그리드.
 * 셀은 `bg-surface`를 직접 칠해야 선이 드러난다.
 */
export function CardGrid({ cols = 3, rounded = true, className, children, ...rest }: CardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-px border border-line bg-line',
        cols === 2 && 'md:grid-cols-2',
        cols === 3 && 'md:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'md:grid-cols-4',
        rounded && 'overflow-hidden rounded-lg',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface CardCellProps {
  children: ReactNode
  /** 호버 시 바닥에 잉크 선이 왼쪽에서 그어진다 (v1 Manifesto). */
  underline?: boolean
  /** 호버 시 배경이 옅어진다 (v1 Services). */
  tint?: boolean
  className?: string
}

/** CardGrid의 셀. `whileHover="hover"`를 걸어 두어 자식 IconTile이 반응한다. */
export function CardCell({ children, underline = false, tint = false, className }: CardCellProps) {
  return (
    <motion.div
      whileHover="hover"
      className={cn(
        'group relative h-full overflow-hidden bg-surface p-6 md:p-7',
        tint && 'transition hover:bg-bg-soft',
        className,
      )}
    >
      {children}
      {underline && (
        <motion.div
          aria-hidden
          variants={{ hover: { scaleX: 1 } }}
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          style={{ transformOrigin: 'left' }}
          className="absolute right-0 bottom-0 left-0 h-px bg-fg"
        />
      )}
    </motion.div>
  )
}

/* ── MetaGrid — dl 기반 사실 표 (v2 About) ─────────────────────── */

export interface MetaItem {
  label: string
  value: ReactNode
}

export function MetaGrid({ items, className }: { items: MetaItem[]; className?: string }) {
  return (
    <dl className={cn('grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3', className)}>
      {items.map((m) => (
        <div key={m.label} className="bg-bg p-6">
          <dt className="label">{m.label}</dt>
          <dd className="mt-2 text-sm text-fg md:text-base">{m.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ── TerminalCard — 창 크롬 + 코드 (v1 Hero) ────────────────────── */

export interface TerminalCardProps {
  title?: string
  children: ReactNode
  status?: ReactNode
  version?: string
  /** 우상단에 붙는 알약 (예: `$ npm run build`) */
  tag?: ReactNode
  className?: string
}

export function TerminalCard({ title = 'project.config.ts', children, status, version, tag, className }: TerminalCardProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_8px_40px_rgba(37,99,235,0.08)]">
        <div className="flex h-9 items-center justify-between border-b border-line bg-bg-soft px-4">
          <TrafficLights />
          <div className="font-mono text-[11px] text-fg-dim">{title}</div>
          <div className="w-12" />
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7] md:p-6">
          <code>{children}</code>
        </pre>
        {(status || version) && (
          <div className="flex items-center justify-between border-t border-line bg-bg-soft px-4 py-3 font-mono text-xs text-fg-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {status}
            </span>
            <span>{version}</span>
          </div>
        )}
      </div>
      {tag && (
        <div className="absolute -top-3 -right-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-fg px-3 text-xs font-medium text-bg shadow-lg md:-right-5">
          {tag}
        </div>
      )}
    </div>
  )
}

export function TrafficLights() {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
    </div>
  )
}

/* ── BrowserFrame — 주소창 크롬 + 뷰포트 (v1 Portfolio) ─────────── */

export interface BrowserFrameProps {
  host: string
  children: ReactNode
  /** 호버 시 뷰포트 뒤에 퍼지는 글로우 색 */
  glow?: string
  className?: string
}

/**
 * 브라우저 창 프레임. `group` 호버로 살짝 떠오르고, 자식(스크린샷)은
 * `whileHover={{ y: '-30%' }}` 같은 패럴럭스를 직접 건다.
 */
export function BrowserFrame({ host, children, glow, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-surface transition-all duration-500 hover:-translate-y-1.5 md:rounded-2xl',
        className,
      )}
      style={{ boxShadow: '0 20px 40px -20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)' }}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 65%)`, filter: 'blur(40px)' }}
        />
      )}
      <div className="flex h-8 items-center gap-2.5 border-b border-line bg-bg-soft px-3 md:h-9 md:px-4">
        <TrafficLights />
        <div className="mx-auto flex h-5 max-w-[60%] min-w-0 flex-1 items-center truncate rounded border border-line bg-surface px-2 font-mono text-[10px] text-fg-dim md:h-6 md:text-[11px]">
          {host}
        </div>
        <div className="w-8 shrink-0" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">{children}</div>
    </div>
  )
}

/* ── PricingCard (v1) ──────────────────────────────────────────── */

export interface PricingCardProps {
  name: string
  desc: string
  price: string
  period: string
  duration: string
  features: string[]
  cta: ReactNode
  featured?: boolean
  popularLabel?: string
  className?: string
}

export function PricingCard({
  name,
  desc,
  price,
  period,
  duration,
  features,
  cta,
  featured = false,
  popularLabel = '가장 많이 선택',
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'h-full rounded-xl border p-7 transition md:p-8',
        featured ? 'border-fg bg-fg text-bg' : 'border-line bg-surface',
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xl font-semibold">{name}</h3>
        {featured && (
          <span className="inline-flex h-6 items-center rounded-full bg-bg/15 px-2 text-[10px] font-medium">{popularLabel}</span>
        )}
      </div>
      <p className={cn('text-sm', featured ? 'text-bg/70' : 'text-fg-dim')}>{desc}</p>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">{price}</span>
        <span className={cn('text-sm', featured ? 'text-bg/60' : 'text-fg-dim')}>{period}</span>
      </div>
      <div className={cn('mt-1 text-xs', featured ? 'text-bg/60' : 'text-fg-dim')}>{duration}</div>
      <ul className="mt-6 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-1 shrink-0">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span className={featured ? 'text-bg/90' : ''}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7">{cta}</div>
    </div>
  )
}

/* ── TestimonialCard (v1) ──────────────────────────────────────── */

export interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  metric?: string
  initials: string
  color: string
  /** 이름/회사를 흐려서 익명화 (v1 기본) */
  blur?: boolean
  className?: string
}

export function TestimonialCard({ quote, author, role, company, metric, initials, color, blur = true, className }: TestimonialCardProps) {
  const b = blur ? 'select-none [filter:blur(3px)]' : ''
  return (
    <figure className={cn('flex w-[280px] shrink-0 flex-col rounded-2xl border border-line bg-surface p-5 md:w-[320px] md:p-6', className)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 shrink-0 text-fg-dim">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
      <blockquote className="line-clamp-3 flex-1 text-[13.5px] leading-relaxed whitespace-normal md:text-sm">{quote}</blockquote>
      {metric && (
        <div className="mt-4 inline-flex h-6 w-fit items-center gap-1.5 rounded-full bg-surface-2 px-2.5 text-[10.5px] font-medium tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {metric}
        </div>
      )}
      <figcaption className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-ink" style={{ backgroundColor: color }} aria-hidden>
          <span className={cn('opacity-80 saturate-0', b)}>{initials}</span>
        </div>
        <div className="min-w-0 text-xs">
          <div className={cn('text-[13px] font-medium', b)} aria-hidden={blur}>
            {author}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-fg-dim">
            <span>{role}</span>
            <span>·</span>
            <span className={b} aria-hidden={blur}>
              {company}
            </span>
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

/* ── CapabilityCard (v2, 정적 버전) ─────────────────────────────── */

export interface CapabilityCardProps {
  no: string
  title: string
  items: string[]
  tools: string[]
  /** 0~3 — 열별 액센트 */
  column?: 0 | 1 | 2 | 3
  className?: string
}

/**
 * 역량 카드 (v2). 번호 + 제목, 대시 행, 점 칩. v2에서는 핀 고정 씬의 rAF가
 * 행·대시·칩을 순서대로 켰지만 여기서는 정적으로 보여준다.
 */
export function CapabilityCard({ no, title, items, tools, column = 0, className }: CapabilityCardProps) {
  const accent = CAPABILITY_ACCENTS[column]
  return (
    <div className={cn('relative border-t border-line pt-8', className)} style={{ '--acc': accent.hex } as CSSProperties}>
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm" style={{ color: accent.hex }}>
          {no}
        </span>
        <h3 className="text-xl font-medium tracking-tight md:text-2xl">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg-dim md:text-[15px]">
            <span aria-hidden className="mt-[0.65em] h-px w-4 shrink-0" style={{ background: `rgba(${accent.rgb},0.6)` }} />
            {item}
          </li>
        ))}
      </ul>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        {tools.map((tool, ti) => (
          <li key={tool} className="cap-chip" style={{ '--dot': DOT_COLORS[ti % DOT_COLORS.length] } as CSSProperties}>
            {tool}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── AppCard (v2, 표면만) ──────────────────────────────────────── */

export interface AppCardProps {
  title: string
  sub: string
  gradient: string
  sheen?: number
  /** 가운데 아이콘 슬롯. v2는 WebGL 3D 타일이었고, 여기서는 아무 노드나 넣는다. */
  icon?: ReactNode
  className?: string
}

/**
 * 서비스 카드 표면 (v2 AppCards). 그라데이션 + 하이라이트 + 엣지 조명은
 * `.app-card` CSS가 맡고, 카드 기울기에 따른 하이라이트 이동은 `--gx/--gy/--spec`을
 * 바깥 rAF 루프가 쓰면 된다.
 */
export function AppCard({ title, sub, gradient, sheen = 0.16, icon, className }: AppCardProps) {
  return (
    <div className={cn('app-card', className)} style={{ background: gradient, '--sheen': String(sheen) } as CSSProperties}>
      <div className="text-[17px] font-medium tracking-[-0.01em] text-white/92">{sub}</div>
      <div className="mt-1.5 text-5xl font-extrabold tracking-[-0.02em] text-white">{title}</div>
      <div className="flex w-full flex-1 items-center justify-center">{icon}</div>
    </div>
  )
}
