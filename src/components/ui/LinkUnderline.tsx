import type { AnchorHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface LinkUnderlineProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `sweep`: v2 푸터 — 파란 선이 오른쪽으로 빠지고 왼쪽에서 들어옴. `grow`: 왼쪽에서 자라남. */
  variant?: 'grow' | 'sweep'
}

/**
 * 밑줄이 움직이는 텍스트 링크. 둘 다 CSS 전용(`index.css`).
 */
export function LinkUnderline({ variant = 'grow', className, children, ...rest }: LinkUnderlineProps) {
  if (variant === 'sweep') {
    return (
      <a className={cn('footer-link', className)} {...rest}>
        {children}
        <span className="footer-hl" aria-hidden />
      </a>
    )
  }
  return (
    <a className={cn('link-underline', className)} {...rest}>
      {children}
    </a>
  )
}
