import { cn } from '@/lib/cn'

export interface EffaceLogoProps {
  className?: string
  /** 다크 배경 위 (뒤 사각형·글자가 밝아진다) */
  dark?: boolean
  /** true면 글자가 왼쪽에서 순서대로 등장 */
  animate?: boolean
}

const LETTERS = ['e', 'f', 'f', 'a', 'c', 'e']

/**
 * efface 워드마크 (Mom-Work 푸터) — CSS 사각형 두 개 + 글자별 등장.
 * `animate`가 true로 바뀌는 순간 각 글자가 60ms 간격으로 밀려 들어온다.
 */
export function EffaceLogo({ className, dark = false, animate = false }: EffaceLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span aria-hidden="true" className="relative inline-block h-[22px] w-[22px]">
        <span className="absolute top-0 left-0 h-[14px] w-[14px] rounded-[4px] bg-[#3B82F6]" />
        <span
          className={cn(
            'absolute right-0 bottom-0 h-[10px] w-[10px] rounded-[3px]',
            dark ? 'bg-[#E8E8EC]' : 'bg-ink',
          )}
        />
      </span>
      <span
        aria-label="efface"
        className={cn('inline-flex text-[22px] font-bold tracking-[-0.035em]', dark ? 'text-white' : 'text-ink')}
      >
        {LETTERS.map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'inline-block transition-[opacity,transform] duration-500 ease-out-quart motion-reduce:transition-none',
              animate ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 motion-reduce:translate-x-0 motion-reduce:opacity-100',
            )}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {ch}
          </span>
        ))}
      </span>
    </span>
  )
}
