import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface NumberedRowProps {
  no: string
  title: ReactNode
  desc?: ReactNode
  className?: string
}

/** 번호 + 제목 + 설명 한 줄 (v2 Approach). `<ul className="border-t border-line">` 안에 놓는다. */
export function NumberedRow({ no, title, desc, className }: NumberedRowProps) {
  return (
    <li className={cn('border-b border-line', className)}>
      <div className="group flex gap-6 py-7 md:gap-8 md:py-8">
        <span className="font-mono text-sm text-accent">{no}</span>
        <div>
          <h3 className="text-xl font-medium tracking-tight md:text-2xl">{title}</h3>
          {desc && <p className="mt-2.5 text-sm leading-relaxed text-fg-dim md:text-base">{desc}</p>}
        </div>
      </div>
    </li>
  )
}
