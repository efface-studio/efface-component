import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface SpecColumn {
  key: string
  label: string
  /** md 이상에서의 열 폭 (grid-template-columns 한 칸) */
  width?: string
  mono?: boolean
}

export interface SpecTableProps {
  columns: SpecColumn[]
  rows: Record<string, ReactNode>[]
  className?: string
}

/**
 * 가로 스크롤 없는 스펙 표. md 이상은 열 그리드, 그 아래는 행마다 라벨이 붙은 블록으로 접힌다.
 */
export function SpecTable({ columns, rows, className }: SpecTableProps) {
  const template = columns.map((c) => c.width ?? 'minmax(0,1fr)').join(' ')
  return (
    <div className={cn('overflow-hidden rounded-lg border border-line', className)}>
      <div className="hidden border-b border-line bg-bg-soft px-4 py-2.5 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase md:grid md:gap-4" style={{ gridTemplateColumns: template }}>
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex flex-col gap-1.5 border-b border-line px-4 py-3 text-[13px] last:border-0 md:grid md:items-center md:gap-4 md:py-2.5"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c, ci) => (
            <div key={c.key} className={cn('flex min-w-0 items-baseline gap-2 md:block', c.mono && 'font-mono', ci === 0 ? 'text-accent' : 'text-fg-dim')}>
              <span className="w-14 shrink-0 font-mono text-[10px] tracking-wider text-fg-faint uppercase md:hidden">{c.label}</span>
              <span className="min-w-0 break-words">{r[c.key] ?? '—'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
