import { cn } from '@/lib/cn'

export interface ToggleProps {
  label: string
  /** 켜면 무엇이 달라지는지 */
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
}

/** 프리뷰 옵션 스위치 — 켜짐/꺼짐이 한눈에 보이고, 라벨 옆에 짧은 설명이 붙는다. */
export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
        checked ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
      )}
    >
      <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')} aria-hidden>
        <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-fg">{label}</span>
        {hint && <span className="block text-[11.5px] text-fg-dim">{hint}</span>}
      </span>
    </button>
  )
}

export function ToggleGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {title && <span className="mr-1 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">{title}</span>}
      {children}
    </div>
  )
}
