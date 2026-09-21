import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CodeBlock } from './CodeBlock'
import { REPO_URL, defaultUsage, loadSource, type SourceInfo } from './source.registry'

/** 소스에서 의존을 뽑는다 — 패키지 / 같이 복사할 파일 */
function depsOf(src: string) {
  const pkgs = new Set<string>()
  const files = new Set<string>()
  for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
    const spec = m[1]!
    if (spec.startsWith('@/')) files.add(spec)
    else if (spec.startsWith('.')) files.add(spec)
    else pkgs.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]!)
  }
  // 동적 import('three') 같은 것
  for (const m of src.matchAll(/import\('([^']+)'\)/g)) pkgs.add(m[1]!)
  return { pkgs: [...pkgs].filter((p) => p !== 'react'), files: [...files] }
}

/**
 * 컴포넌트 코드 패널 — 사용 예시 · 실제 소스 · 같이 복사할 파일 · GitHub 링크.
 * 이 리포는 MIT 라 파일을 그대로 가져다 써도 된다(복사해서 쓰는 방식, 패키지 설치 없음).
 */
export function SourcePanel({ name, file, usage, className }: SourceInfo & { className?: string }) {
  const [tab, setTab] = useState<'usage' | 'source'>('usage')
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    loadSource(file)
      .then((s) => alive && setSrc(s))
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  }, [file])
  const importPath = '@/' + file.replace(/^src\//, '').replace(/\.tsx?$/, '')
  const deps = useMemo(() => (src ? depsOf(src) : null), [src])
  const usageCode = usage ?? defaultUsage(name, importPath)

  return (
    <div data-source-panel className={cn('border-t border-line bg-bg-soft', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <div className="flex items-center gap-1" role="tablist" aria-label="코드">
          {(
            [
              ['usage', '사용'],
              ['source', '소스'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('h-7 rounded-md px-2.5 font-mono text-[11px] transition-colors', tab === id ? 'bg-fg text-bg' : 'text-fg-dim hover:bg-line/40 hover:text-fg')}>
              {label}
            </button>
          ))}
          <span className="ml-2 hidden font-mono text-[10.5px] text-fg-faint sm:inline">{file}</span>
        </div>
        <a href={`${REPO_URL}/blob/main/${file}`} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1 rounded-md px-2 font-mono text-[11px] text-fg-dim transition-colors hover:bg-line/40 hover:text-fg">
          GitHub <ExternalLink size={11} />
        </a>
      </div>
      {deps && (deps.pkgs.length > 0 || deps.files.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pt-2 font-mono text-[10.5px]">
          {deps.pkgs.map((p) => (
            <span key={p} className="rounded-full border border-line px-2 py-px text-fg-dim">
              {p}
            </span>
          ))}
          {deps.files.map((f) => (
            <span key={f} className="rounded-full bg-line/40 px-2 py-px text-fg-faint" title="같이 복사할 파일">
              {f}
            </span>
          ))}
        </div>
      )}
      <div className="p-4">
        {tab === 'usage' ? (
          <CodeBlock code={usageCode} lang="tsx" />
        ) : src ? (
          <div className="max-h-[520px] overflow-auto rounded-lg">
            <CodeBlock code={src} lang={file.endsWith('.css') ? 'css' : file.endsWith('.ts') ? 'ts' : 'tsx'} />
          </div>
        ) : (
          <p className="font-mono text-[11px] text-fg-faint">소스 불러오는 중…</p>
        )}
      </div>
    </div>
  )
}
