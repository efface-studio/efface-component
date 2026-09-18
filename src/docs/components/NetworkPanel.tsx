import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, ArrowRightLeft, ChevronRight, FileCode2, Route, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { NetEntry } from '@/lib/inspectBridge'

type Filter = 'all' | 'api' | 'assets' | 'errors'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'api', label: 'API' },
  { id: 'assets', label: '자산' },
  { id: 'errors', label: '오류' },
]

const isApi = (e: NetEntry) => e.kind === 'fetch' || e.kind === 'xhr'
const isErr = (e: NetEntry) => (e.kind === 'console' && e.level === 'error') || !!e.error || (typeof e.status === 'number' && e.status >= 400)

function statusTone(e: NetEntry) {
  if (e.pending) return 'text-fg-faint'
  if (e.error || e.status === 0) return 'text-danger'
  const s = e.status ?? 0
  if (s >= 500) return 'text-danger'
  if (s >= 400) return 'text-amber-500'
  if (s >= 300) return 'text-sky-500'
  if (s >= 200) return 'text-emerald-500'
  return 'text-fg-faint'
}

function fmtSize(n: number | null | undefined) {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function fmtTime(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function pathOf(url?: string) {
  if (!url) return ''
  try {
    const u = new URL(url)
    return (u.pathname === '/' ? '/' : u.pathname) + u.search
  } catch {
    return url
  }
}
function hostOf(url?: string) {
  try {
    return url ? new URL(url).host : ''
  } catch {
    return ''
  }
}

/**
 * 프레임 안의 활동 — 요청(메서드 · 상태코드 · 시간 · 크기), 라우트 이동, 콘솔 오류.
 * 줄을 누르면 URL · 요청/응답 본문 미리보기가 펼쳐진다.
 */
export function NetworkPanel({ entries, frameHost, onClear }: { entries: NetEntry[]; frameHost: string; onClear: () => void }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<number | null>(null)
  const [follow, setFollow] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (filter === 'api' && !isApi(e)) return false
      if (filter === 'assets' && e.kind !== 'asset' && e.kind !== 'document') return false
      if (filter === 'errors' && !isErr(e)) return false
      if (needle) {
        const hay = `${e.method ?? ''} ${e.url ?? ''} ${e.text ?? ''} ${e.status ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [entries, filter, q])

  const counts = useMemo(() => ({ api: entries.filter(isApi).length, errors: entries.filter(isErr).length }), [entries])

  // 새 항목이 오면 맨 아래로 — 사용자가 위로 올려 보고 있으면 멈춘다
  useEffect(() => {
    if (!follow || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [shown.length, follow])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn('h-7 rounded-md px-2 font-mono text-[11px] transition-colors', filter === f.id ? 'bg-fg text-bg' : 'text-fg-dim hover:bg-line/40 hover:text-fg')}
          >
            {f.label}
            {f.id === 'api' && counts.api > 0 && <span className="ml-1 opacity-60">{counts.api}</span>}
            {f.id === 'errors' && counts.errors > 0 && <span className={cn('ml-1', filter === 'errors' ? 'opacity-60' : 'text-danger')}>{counts.errors}</span>}
          </button>
        ))}
        <button type="button" onClick={onClear} title="비우기" aria-label="활동 비우기" className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-fg-faint hover:bg-line/40 hover:text-fg">
          <Trash2 size={13} />
        </button>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="경로 · 상태코드 검색"
        aria-label="경로 · 상태코드 검색"
        className="mt-2 h-8 w-full rounded-md border border-line bg-bg px-2.5 font-mono text-[11.5px] text-fg outline-none placeholder:text-fg-faint focus:border-accent"
      />
      <div
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setFollow(el.scrollHeight - el.scrollTop - el.clientHeight < 24)
        }}
        className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-md border border-line bg-bg"
      >
        {shown.length === 0 ? (
          <p className="p-4 text-center text-[12px] text-fg-faint">{entries.length === 0 ? '아직 활동이 없어요. 프레임 안에서 움직여 보세요.' : '조건에 맞는 항목이 없어요.'}</p>
        ) : (
          <ul className="divide-y divide-line-soft font-mono text-[11.5px]">
            {shown.map((e) => (
              <Row key={e.id} e={e} frameHost={frameHost} open={open === e.id} onToggle={() => setOpen((v) => (v === e.id ? null : e.id))} />
            ))}
          </ul>
        )}
      </div>
      <p className="mt-2 text-[11px] text-fg-faint">
        {entries.length}건 · fetch/XHR 은 응답 본문을 4KB 까지 미리 봐요 · 상태코드 0 은 네트워크/CORS 오류
      </p>
    </div>
  )
}

function Row({ e, frameHost, open, onToggle }: { e: NetEntry; frameHost: string; open: boolean; onToggle: () => void }) {
  if (e.kind === 'route') {
    return (
      <li className="flex items-center gap-2 bg-bg-soft px-2.5 py-1.5 text-fg-dim">
        <Route size={12} className="shrink-0 text-accent" />
        <span className="truncate">{e.path}</span>
        <span className="ml-auto shrink-0 text-fg-faint">{fmtTime(e.ts)}</span>
      </li>
    )
  }
  if (e.kind === 'console') {
    return (
      <li className={cn('px-2.5 py-1.5', e.level === 'error' ? 'text-danger' : 'text-amber-500')}>
        <button type="button" onClick={onToggle} className="flex w-full items-start gap-2 text-left">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span className={cn('min-w-0 flex-1 break-all', !open && 'line-clamp-2')}>{e.text}</span>
          <span className="shrink-0 text-fg-faint">{fmtTime(e.ts)}</span>
        </button>
      </li>
    )
  }
  const path = pathOf(e.url)
  const host = hostOf(e.url)
  const external = host && host !== frameHost
  return (
    <li>
      <button type="button" onClick={onToggle} className={cn('flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-bg-soft', open && 'bg-bg-soft')}>
        <ChevronRight size={11} className={cn('shrink-0 text-fg-faint transition-transform', open && 'rotate-90')} />
        {isApi(e) ? <ArrowRightLeft size={11} className="shrink-0 text-fg-faint" /> : <FileCode2 size={11} className="shrink-0 text-fg-faint" />}
        <span className={cn('w-[46px] shrink-0 text-fg-dim', e.method === 'GET' && 'text-fg-faint')}>{e.method}</span>
        <span className={cn('w-[30px] shrink-0 font-semibold tabular-nums', statusTone(e))}>
          {e.pending ? (
            <motion.span className="inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>
              …
            </motion.span>
          ) : e.error && !e.status ? (
            'ERR'
          ) : (
            (e.status ?? '—')
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-fg" title={e.url}>
          {external && <span className="text-fg-faint">{host}</span>}
          {path}
        </span>
        <span className="w-[44px] shrink-0 text-right text-fg-faint tabular-nums">{e.ms != null ? `${e.ms}ms` : ''}</span>
        <span className="w-[52px] shrink-0 text-right text-fg-faint tabular-nums">{fmtSize(e.size)}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="d" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="space-y-2 border-t border-line-soft bg-bg-soft px-2.5 py-2.5 text-[11px]">
              <Detail label="URL" value={e.url ?? ''} />
              <Detail label="상태" value={`${e.status ?? 0}${e.statusText ? ` ${e.statusText}` : ''}${e.error ? ` · ${e.error}` : ''}`} tone={statusTone(e)} />
              {e.type && <Detail label="타입" value={e.type} />}
              <Detail label="시각" value={fmtTime(e.ts)} />
              {e.req && <Block label="요청 본문" text={e.req} />}
              {e.res && <Block label="응답 미리보기" text={e.res} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function Detail({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-14 shrink-0 text-fg-faint">{label}</span>
      <span className={cn('min-w-0 flex-1 break-all text-fg', tone)}>{value}</span>
    </div>
  )
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-fg-faint">{label}</p>
      <pre className="max-h-48 overflow-auto rounded border border-line bg-bg p-2 text-[10.5px] leading-relaxed whitespace-pre-wrap text-fg">{text}</pre>
    </div>
  )
}
