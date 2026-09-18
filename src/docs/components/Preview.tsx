import { useState, type ReactNode } from 'react'
import { Code2, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CodeBlock } from './CodeBlock'
import { useDocsTheme } from '@/docs/theme'

export type PreviewTheme = 'light' | 'dark'

export interface PreviewProps {
  children: ReactNode
  /** lockTheme 일 때 고정할 테마. 그 외에는 문서 전체 테마를 따른다. */
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
 * 컴포넌트 프리뷰 박스. 기본은 문서 전체 테마를 따르고, 자기 토글을 누르면 그 프리뷰만
 * 반대 테마로 바뀐다. 전체 테마가 다시 바뀌면 오버라이드는 풀리고 모두 함께 따라간다.
 * `data-theme`를 자기 범위에만 걸어 안쪽만 바뀐다.
 */
export function Preview({ children, theme = 'dark', lockTheme = false, code, bleed = false, center = false, minHeight, scroll = false, className, bodyClassName }: PreviewProps) {
  const { theme: global } = useDocsTheme()
  const [override, setOverride] = useState<PreviewTheme | null>(null)
  const [seenGlobal, setSeenGlobal] = useState(global)
  // 전체 테마가 바뀌면 이 프리뷰의 오버라이드를 풀어 함께 따라간다 (렌더 중 상태 조정)
  if (seenGlobal !== global) {
    setSeenGlobal(global)
    setOverride(null)
  }
  const t: PreviewTheme = lockTheme ? theme : (override ?? global)
  const [showCode, setShowCode] = useState(false)

  return (
    <div className={cn('overflow-hidden rounded-xl border border-line', className)}>
      <div className="flex h-9 items-center justify-between border-b border-line bg-bg-soft px-3">
        <span className="font-mono text-[10px] tracking-wider text-fg-faint uppercase">{t}</span>
        <div className="flex items-center gap-1">
          {!lockTheme && (
            <button
              type="button"
              onClick={() => setOverride(t === 'dark' ? 'light' : 'dark')}
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
