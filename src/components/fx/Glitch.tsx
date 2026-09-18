import { cn } from '@/lib/cn'
import { useDisplayFonts } from '@/hooks/useDisplayFonts'

export interface GlitchProps {
  text: string
  className?: string
}

/**
 * 글리치. 같은 글자 세 겹 — 빨강·파랑 채널이 어긋나고, 가로 조각이 랜덤하게 잘려 튄다.
 * CSS 키프레임만으로 돈다. 호버하면 더 심해진다.
 */
export function Glitch({ text, className }: GlitchProps) {
  useDisplayFonts()
  return (
    <span className={cn('glitch relative inline-block font-display font-bold tracking-tight', className)} data-text={text}>
      {text}
    </span>
  )
}
