import { cn } from '@/lib/cn'
import { SOURCE_META } from '@/docs/nav'

export type Source = keyof typeof SOURCE_META

export function SourceBadge({ src, className }: { src: Source; className?: string }) {
  const m = SOURCE_META[src]
  return (
    <span
      className={cn('inline-flex h-5 items-center gap-1.5 rounded-full border border-line px-2 font-mono text-[10px] tracking-wider text-fg-dim uppercase', className)}
      title={m.label}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color, outline: src === 'mom' ? '1px solid var(--line-strong)' : undefined }} />
      {m.short}
    </span>
  )
}
