import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'
import { KIND_CLASS, tokenize } from './highlight'

export interface CodeBlockProps {
  code: string
  lang?: 'tsx' | 'ts' | 'css' | 'html' | 'svg' | 'bash'
  className?: string
}


/** 복사 버튼이 달린 코드 블록. 경량 토크나이저로 하이라이트한다. */
export function CodeBlock({ code, lang = 'tsx', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const src = code.trim()
  const tokens = useMemo(() => (lang === 'bash' ? [{ kind: 'plain' as const, text: src }] : tokenize(src, lang)), [src, lang])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard 권한 없음 — 조용히 무시 */
    }
  }

  return (
    <div className={cn('group relative overflow-hidden rounded-lg border border-line bg-(--code-bg)', className)}>
      <div className="flex h-8 items-center justify-between border-b border-line px-3">
        <span className="font-mono text-[10px] tracking-wider text-fg-faint uppercase">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-6 items-center gap-1 rounded px-1.5 font-mono text-[10px] text-fg-dim transition-colors hover:bg-line/40 hover:text-fg"
          aria-label="코드 복사"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7] text-(--code-fg)">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={KIND_CLASS[t.kind]}>
              {t.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
