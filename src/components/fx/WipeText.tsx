import { cn } from '@/lib/cn'

export interface WipeTextProps {
  text: string
  className?: string
}

/**
 * 글자가 액센트 막대에 밀려 드러났다가 지워진다 — 막대가 왼쪽에서 오른쪽으로 훑고 지나가면
 * 뒤에 글자가 남고, 되돌아오며 지운다. CSS 키프레임.
 */
export function WipeText({ text, className }: WipeTextProps) {
  return (
    <span className={cn('wipe-text relative inline-block overflow-hidden font-display font-bold tracking-tight', className)} aria-label={text}>
      <span className="wipe-text__t inline-block" aria-hidden>
        {text}
      </span>
      <span className="wipe-text__bar absolute inset-y-0 left-0 w-full bg-accent" aria-hidden />
    </span>
  )
}
