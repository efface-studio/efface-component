import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Crosshair, Grid3x3, RotateCw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DocPage, Note } from '@/docs/components/Doc'
import { InspectPanel } from '@/docs/components/InspectPanel'
import { LIVE_PROJECTS, VIEWPORTS, type LivePage as LivePageDef, type ViewportId } from '@/docs/live.data'
import { isInspectMessage, sendToFrame, type InspectInfo } from '@/lib/inspectBridge'
import { TrafficLights } from '@/components/ui/Card'

export function LivePage() {
  const { project } = useParams<{ project: string }>()
  const proj = LIVE_PROJECTS.find((p) => p.id === project)
  const [group, setGroup] = useState(0)
  const [page, setPage] = useState<LivePageDef | null>(proj?.groups[0]?.pages[0] ?? null)
  const [viewport, setViewport] = useState<ViewportId>('desktop')
  const [inspect, setInspect] = useState(false)
  const [grid, setGrid] = useState(false)
  const [selected, setSelected] = useState<InspectInfo | null>(null)
  const [hovered, setHovered] = useState<InspectInfo | null>(null)
  const [distances, setDistances] = useState<number[] | null>(null)
  const [route, setRoute] = useState('')
  const [scale, setScale] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [seen, setSeen] = useState(proj?.id)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef<string | null>(null)

  if (proj && seen !== proj.id) {
    setSeen(proj.id)
    setGroup(0)
    setPage(proj.groups[0]?.pages[0] ?? null)
    setSelected(null)
    setHovered(null)
    setInspect(false)
  }

  const vp = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0]

  // 스테이지 폭에 맞춰 iframe 을 축소한다
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / vp.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [vp.width])

  // iframe 에서 오는 메시지
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return
      const m = e.data
      if (!isInspectMessage(m)) return
      if (m.type === 'ready') {
        setRoute(m.path)
        // via(부트스트랩) 경로를 거친 뒤 목적지로
        if (pendingRef.current && m.path.split('?')[0] !== pendingRef.current) {
          const to = pendingRef.current
          pendingRef.current = null
          window.setTimeout(() => sendToFrame(frameRef.current, { cmd: 'goto', path: to }), 300)
          return
        }
        pendingRef.current = null
        if (inspect) sendToFrame(frameRef.current, { cmd: 'enable' })
        if (grid) sendToFrame(frameRef.current, { cmd: 'grid', value: true })
      } else if (m.type === 'route') setRoute(m.path)
      else if (m.type === 'hover') {
        setHovered(m.info)
        setDistances(m.distances)
      } else if (m.type === 'select') setSelected(m.info)
      else if (m.type === 'state') setInspect(m.on)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [inspect, grid])

  const src = useMemo(() => {
    if (!proj || !page) return ''
    return `${proj.liveOrigin}${page.via ?? page.path}`
  }, [proj, page])
  // via(부트스트랩) 경로를 거치는 페이지는 ready 가 오면 목적지로 보낸다
  useEffect(() => {
    pendingRef.current = page?.via ? page.path : null
  }, [page, reloadKey])

  const toggleInspect = useCallback(() => {
    const next = !inspect
    setInspect(next)
    sendToFrame(frameRef.current, { cmd: next ? 'enable' : 'disable' })
    if (!next) {
      setSelected(null)
      setHovered(null)
    }
  }, [inspect])
  const toggleGrid = useCallback(() => {
    const next = !grid
    setGrid(next)
    sendToFrame(frameRef.current, { cmd: 'grid', value: next })
  }, [grid])

  if (!proj) return <Navigate to="/live/efface" replace />
  const g = proj.groups[group] ?? proj.groups[0]

  return (
    <DocPage eyebrow={`live · ${proj.host}`} title={proj.name} lead={proj.tagline}>
      <div className="-mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-fg-dim">
        <span className="font-mono text-[12px]">{proj.stack}</span>
        <a href={proj.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
          {proj.host} <ArrowUpRight size={13} />
        </a>
      </div>

      {/* 페이지 선택 */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="화면 종류">
          {proj.groups.map((gr, i) => (
            <button
              key={gr.title}
              type="button"
              role="tab"
              aria-selected={group === i}
              onClick={() => {
                setGroup(i)
                const first = gr.pages[0]
                if (first) setPage(first)
              }}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors',
                group === i ? 'border-fg bg-fg text-bg' : 'border-line bg-surface text-fg-dim hover:border-line-strong hover:text-fg',
              )}
            >
              {gr.title}
              <span className={cn('font-mono text-[10.5px]', group === i ? 'text-bg/60' : 'text-fg-faint')}>{gr.pages.length}</span>
            </button>
          ))}
        </div>
        {g?.note && <Note>{g.note}</Note>}
        <div className="flex flex-wrap gap-1.5">
          {g?.pages.map((p) => (
            <button
              key={p.path + (p.via ?? '')}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-[12.5px] transition-colors',
                page === p ? 'border-accent bg-accent-soft text-fg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg',
              )}
            >
              {p.title}
              <span className="ml-1.5 font-mono text-[10px] text-fg-faint">{p.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 툴바 */}
      <div className="sticky top-14 z-30 -mx-1 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-bg/90 px-2 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1 rounded-md border border-line p-0.5">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setViewport(v.id)}
              className={cn('h-7 rounded px-2.5 font-mono text-[11px] transition-colors', viewport === v.id ? 'bg-fg text-bg' : 'text-fg-dim hover:text-fg')}
            >
              {v.label} <span className="opacity-60">{v.width}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleInspect}
          aria-pressed={inspect}
          className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] font-medium transition-colors', inspect ? 'border-accent bg-accent text-white' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
        >
          <Crosshair size={13} /> 검사
        </button>
        <button
          type="button"
          onClick={toggleGrid}
          aria-pressed={grid}
          className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors', grid ? 'border-fg bg-fg text-bg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
        >
          <Grid3x3 size={13} /> 8px 그리드
        </button>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-[12.5px] text-fg-dim hover:border-line-strong hover:text-fg" aria-label="다시 불러오기">
          <RotateCw size={13} />
        </button>
        <span className="ml-auto hidden font-mono text-[11px] text-fg-faint md:inline">
          {Math.round(scale * 100)}% · {proj.host}
          {route}
        </span>
        <a href={`${proj.siteUrl}${page?.path ?? ''}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-3 text-[12.5px] text-fg-dim hover:border-line-strong hover:text-fg">
          열기 <ArrowUpRight size={12} />
        </a>
      </div>

      {/* 스테이지 + 패널 */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div ref={stageRef} className="min-w-0">
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
            <div className="flex h-9 items-center gap-2.5 border-b border-line bg-bg-soft px-3">
              <TrafficLights />
              <div className="mx-auto flex h-6 max-w-[70%] min-w-0 flex-1 items-center truncate rounded border border-line bg-surface px-2 font-mono text-[11px] text-fg-dim">
                {proj.host}
                {route || page?.path}
              </div>
              <div className="w-8 shrink-0" />
            </div>
            <div className={cn('relative', vp.id === 'mobile' && 'flex justify-center bg-bg-soft')} style={{ height: vp.height * scale }}>
              <iframe
                key={`${src}-${reloadKey}`}
                ref={frameRef}
                src={src}
                title={`${proj.name} — ${page?.title ?? ''}`}
                width={vp.width}
                height={vp.height}
                className="block origin-top-left border-0 bg-white"
                style={{ width: vp.width, height: vp.height, transform: `scale(${scale})`, marginLeft: vp.id === 'mobile' ? undefined : 0 }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          </div>
          <p className="mt-2 text-[12px] text-fg-faint">
            검사를 켜면 프레임 안에서 링크 클릭이 막혀요. 페이지를 옮기려면 위 목록에서 고르거나 검사를 끄세요. 실제 서비스를 그대로 프록시한 사본이라 폼 전송은 하지 마세요.
          </p>
        </div>
        <div className="xl:sticky xl:top-[7.5rem] xl:self-start">
          <InspectPanel selected={selected} hovered={hovered} distances={distances} className="rounded-xl border border-line bg-surface p-4" />
        </div>
      </div>
    </DocPage>
  )
}
