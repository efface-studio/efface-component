import { useState, type ReactNode } from 'react'
import { Code2, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CodeBlock } from './CodeBlock'

export type PreviewTheme = 'light' | 'dark'

export interface PreviewProps {
  children: ReactNode
  /** 초기 테마. 원본 사이트의 테마로 시작한다. */
  theme?: PreviewTheme
  /** 테마 토글 숨김 — 한 테마 전용 컴포넌트 */
  lockTheme?: boolean
  code?: string
  /** 안쪽 여백 제거 — 풀블리드 섹션·배너 */
  bleed?: boolean
  /** 세로 가운데 정렬 + 최소 높이 */
  center?: boolean
  minHeight?: number
  /** 프리뷰를 스크롤 컨테이너로 만든다 (Nav·Footer처럼 스크롤 의존 컴포넌트) */
  scroll?: boolean
  className?: string
  bodyClassName?: string
}

/**
 * 컴포넌트 프리뷰 박스. `data-theme`를 자기 범위에만 걸어 문서 크롬과 무관하게
 * 라이트/다크를 오간다. 코드 토글은 아래에 스니펫을 펼친다.
 */
export function Preview({ children, theme = 'dark', lockTheme = false, code, bleed = false, center = false, minHeight, scroll = false, className, bodyClassName }: PreviewProps) {
  const [t, setT] = useState<PreviewTheme>(theme)
  const [showCode, setShowCode] = useState(false)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line', className)}>
      <div className="flex h-9 items-center justify-between border-b border-line bg-bg-soft px-3">
        <span className="font-mono text-[10px] tracking-wider text-fg-faint uppercase">{t}</span>
        <div className="flex items-center gap-1">
          {!lockTheme && (
            <button
              type="button"
              onClick={() => setT(t === 'dark' ? 'light' : 'dark')}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-fg-dim transition-colors hover:bg-line/40 hover:text-fg"
              aria-label="테마 전환"
            >
              {t === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          )}
          {code && (
            <button
              type="button"
              onClick={() => setShowCode((v) => !v)}
              aria-pressed={showCode}
              className={cn('inline-flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-line/40', showCode ? 'text-fg' : 'text-fg-dim hover:text-fg')}
              aria-label="코드 보기"
            >
              <Code2 size={12} />
            </button>
          )}
        </div>
      </div>
      <div
        data-theme={t}
        className={cn(
          'relative bg-bg text-fg',
          !bleed && 'p-6 md:p-8',
          center && 'flex flex-col items-center justify-center',
          scroll && 'overflow-y-auto',
          bodyClassName,
        )}
        style={{ minHeight, maxHeight: scroll ? minHeight : undefined }}
      >
        {children}
      </div>
      {code && showCode && <CodeBlock code={code} className="rounded-none border-0 border-t" />}
    </div>
  )
}
