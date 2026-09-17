import { cn } from '@/lib/cn'
import { LogoMark } from './LogoMark'

export interface WordmarkProps {
  className?: string
  href?: string
  /** 마크 크기(px). 글자는 비례해서 따라간다. */
  size?: number
}

/**
 * 마크 + "efface" 소문자 락업 (v2 Nav). 링크로 감싸면 호버 시 마크가 살짝 기운다.
 */
export function Wordmark({ className, href, size = 24 }: WordmarkProps) {
  const inner = (
    <>
      <LogoMark
        className="text-fg transition-transform duration-500 group-hover:rotate-[-8deg]"
        style={{ width: size, height: size }}
      />
      <span className="font-semibold lowercase tracking-tight text-fg" style={{ fontSize: size * 0.75 }}>
        efface
      </span>
    </>
  )
  const base = cn('group inline-flex items-center gap-2.5', className)
  if (href) {
    return (
      <a href={href} className={base} aria-label="efface home">
        {inner}
      </a>
    )
  }
  return <span className={base}>{inner}</span>
}
