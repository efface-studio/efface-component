import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Code2, Grid3x3, Maximize2, Minimize2, PanelLeft, PanelRight, RotateCw, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DocPage, Note } from '@/docs/components/Doc'
import { InspectPanel } from '@/docs/components/InspectPanel'
import { LIVE_PROJECTS, VIEWPORTS, type LivePage as LivePageDef, type ViewportId } from '@/docs/live.data'
import { isInspectMessage, sendToFrame, type InspectDistance, type InspectInfo } from '@/lib/inspectBridge'
import { TrafficLights } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function LivePage() {
  const { project } = useParams<{ project: string }>()
  const proj = LIVE_PROJECTS.find((p) => p.id === project)
  const [group, setGroup] = useState(0)
  const [page, setPage] = useState<LivePageDef | null>(proj?.groups[0]?.pages[0] ?? null)
  const [viewport, setViewport] = useState<ViewportId>('fit')
  const [zoom, setZoom] = useState<'fit' | '100'>('fit')
  const [inspect, setInspect] = useState(false)
  const [grid, setGrid] = useState(false)
  const [panel, setPanel] = useState(false)
  const [panelSide, setPanelSide] = useState<'right' | 'left'>('right')
  const [fullscreen, setFullscreen] = useState(false)
  const [selected, setSelected] = useState<InspectInfo | null>(null)
  const [hovered, setHovered] = useState<InspectInfo | null>(null)
  const [distances, setDistances] = useState<InspectDistance[] | null>(null)
  const [route, setRoute] = useState('')
  const [stageW, setStageW] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [seen, setSeen] = useState(proj?.id)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
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
  const responsive = vp.id === 'fit'

  // 스테이지 폭 추적 — 고정 뷰포트를 맞출 때 쓴다
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setStageW(el.clientWidth))
    ro.observe(el)
    setStageW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 전체 화면 상태 동기화
  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // iframe 에서 오는 메시지
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return
      const m = e.data
      if (!isInspectMessage(m)) return
      if (m.type === 'ready') {
        setRoute(m.path)
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
        // 캐시된 옛 스크립트가 숫자만 보내는 경우도 받아준다
        setDistances(m.distances ? m.distances.map((d) => (typeof d === 'number' ? { d, dir: 'v' as const } : d)) : null)
      } else if (m.type === 'select') {
        setSelected(m.info)
        if (m.info) setPanel(true)
      } else if (m.type === 'state') setInspect(m.on)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [inspect, grid])

  const src = useMemo(() => {
    if (!proj || !page) return ''
    return `${proj.liveOrigin}${page.via ?? page.path}`
  }, [proj, page])
  useEffect(() => {
    pendingRef.current = page?.via ? page.path : null
  }, [page, reloadKey])

  const toggleInspect = useCallback(() => {
    const next = !inspect
    setInspect(next)
    sendToFrame(frameRef.current, { cmd: next ? 'enable' : 'disable' })
    if (next) setPanel(true)
    else {
      setSelected(null)
      setHovered(null)
    }
  }, [inspect])
  const toggleGrid = useCallback(() => {
    const next = !grid
    setGrid(next)
    sendToFrame(frameRef.current, { cmd: 'grid', value: next })
  }, [grid])
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrapRef.current?.requestFullscreen?.()
  }, [])

  if (!proj) return <Navigate to="/live/efface" replace />
  const g = proj.groups[group] ?? proj.groups[0]

  // 프레임 크기 — 맞춤이면 스테이지 폭 그대로(100%), 고정이면 fit 축소 또는 100% + 가로 스크롤
  const scale = responsive || zoom === '100' ? 1 : Math.min(1, (stageW || vp.width) / vp.width)
  const frameW = responsive ? '100%' : vp.width
  const frameH = responsive ? '100%' : vp.height
  const stageH = fullscreen ? '100vh' : responsive ? 'min(82vh, 980px)' : `${Math.round(vp.height * scale)}px`

  const toolbar = (
    <div data-ef-ignore className={cn('flex flex-wrap items-center gap-2 border-line bg-bg/92 px-2 py-2 backdrop-blur-md', fullscreen ? 'border-b' : 'sticky top-14 z-30 -mx-1 rounded-lg border')}>
      <div className="flex items-center gap-1 rounded-md border border-line p-0.5">
        {VIEWPORTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setViewport(v.id)}
            className={cn('h-7 rounded px-2.5 font-mono text-[11px] transition-colors', viewport === v.id ? 'bg-fg text-bg' : 'text-fg-dim hover:text-fg')}
          >
            {v.label} {v.width > 0 && <span className="opacity-60">{v.width}</span>}
          </button>
        ))}
      </div>
      {!responsive && (
        <button
          type="button"
          onClick={() => setZoom(zoom === 'fit' ? '100' : 'fit')}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-3 font-mono text-[11px] text-fg-dim hover:border-line-strong hover:text-fg"
          title="축소해서 맞추기 ↔ 100% (가로 스크롤)"
        >
          <ZoomIn size={13} /> {zoom === 'fit' ? `${Math.round(scale * 100)}%` : '100%'}
        </button>
      )}
      <button
        type="button"
        onClick={toggleInspect}
        aria-pressed={inspect}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] font-medium transition-colors', inspect ? 'border-accent bg-accent text-white' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
      >
        <Code2 size={13} /> Dev
      </button>
      <button
        type="button"
        onClick={toggleGrid}
        aria-pressed={grid}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors', grid ? 'border-fg bg-fg text-bg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
      >
        <Grid3x3 size={13} /> 8px
      </button>
      <button
        type="button"
        onClick={() => setPanel((v) => !v)}
        aria-pressed={panel}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors', panel ? 'border-fg bg-fg text-bg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
      >
        {panelSide === 'right' ? <PanelRight size={13} /> : <PanelLeft size={13} />} 패널
      </button>
      {panel && (
        <button
          type="button"
          onClick={() => setPanelSide((v) => (v === 'right' ? 'left' : 'right'))}
          className="inline-flex h-8 items-center rounded-md border border-line px-2 font-mono text-[11px] text-fg-dim hover:border-line-strong hover:text-fg"
          title="패널을 반대쪽에 붙이기"
        >
          {panelSide === 'right' ? '◨ → ◧' : '◧ → ◨'}
        </button>
      )}
      <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-fg-dim hover:border-line-strong hover:text-fg" aria-label="다시 불러오기">
        <RotateCw size={13} />
      </button>
      <span className="ml-auto hidden font-mono text-[11px] text-fg-faint md:inline">
        {proj.host}
        {route}
      </span>
      <a href={`${proj.siteUrl}${page?.path ?? ''}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-md border border-line px-3 text-[12.5px] text-fg-dim hover:border-line-strong hover:text-fg">
        열기 <ArrowUpRight size={12} />
      </a>
      <button
        type="button"
        onClick={toggleFullscreen}
        className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12.5px] transition-colors', fullscreen ? 'border-fg bg-fg text-bg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg')}
      >
        {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />} {fullscreen ? '나가기' : '전체 화면'}
      </button>
    </div>
  )

  const dock = (
    <aside data-ef-ignore className={cn('flex w-[320px] shrink-0 flex-col overflow-y-auto bg-surface p-4', panelSide === 'right' ? 'border-l border-line' : 'border-r border-line')}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">dev mode</span>
        <button type="button" onClick={() => setPanel(false)} className="rounded px-1.5 py-0.5 font-mono text-[10.5px] text-fg-dim hover:bg-line/40 hover:text-fg">
          닫기
        </button>
      </div>
      {!inspect ? (
        <div className="rounded-lg border border-line bg-bg-soft p-4">
          <p className="text-[13px] font-medium">Dev 모드가 꺼져 있어요</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-dim">켜면 프레임 안의 요소에 마우스를 올려 크기·여백을 보고, 눌러서 고정한 뒤 다른 요소까지의 거리를 잴 수 있어요.</p>
          <Button size="sm" className="mt-3" onClick={toggleInspect} leading={<Code2 size={13} />}>
            Dev 켜기
          </Button>
        </div>
      ) : (
        <InspectPanel selected={selected} hovered={hovered} distances={distances} />
      )}
    </aside>
  )

  return (
    <DocPage eyebrow={`live · ${proj.host}`} title={proj.name} lead={proj.tagline} wide>
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

      {!fullscreen && toolbar}

      {/* 스테이지 — 전체 화면이면 이 래퍼가 화면을 채운다 */}
      <div ref={wrapRef} className={cn('relative', fullscreen && 'flex h-screen flex-col bg-bg')}>
        {fullscreen && toolbar}
        <div className={cn('relative overflow-hidden border border-line bg-surface', fullscreen ? 'flex-1 border-0' : 'rounded-xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]')}>
          {!fullscreen && (
            <div className="flex h-9 items-center gap-2.5 border-b border-line bg-bg-soft px-3">
              <TrafficLights />
              <div className="mx-auto flex h-6 max-w-[70%] min-w-0 flex-1 items-center truncate rounded border border-line bg-surface px-2 font-mono text-[11px] text-fg-dim">
                {proj.host}
                {route || page?.path}
              </div>
              <div className="w-8 shrink-0" />
            </div>
          )}
          {/* 프레임과 패널을 나란히 — 패널이 프레임을 덮지 않아 오른쪽 요소도 가리킬 수 있다 */}
          <div className={cn('flex', panelSide === 'left' && 'flex-row-reverse')} style={{ height: stageH }}>
            <div ref={stageRef} className={cn('relative min-w-0 flex-1', !responsive && zoom === '100' && 'overflow-auto', !responsive && zoom === 'fit' && vp.id === 'mobile' && 'flex justify-center bg-bg-soft')}>
              <iframe
                key={`${src}-${reloadKey}`}
                ref={frameRef}
                src={src}
                title={`${proj.name} — ${page?.title ?? ''}`}
                className="block origin-top-left border-0 bg-white"
                style={{ width: frameW, height: frameH, transform: scale !== 1 ? `scale(${scale})` : undefined }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
            {panel && dock}
          </div>
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-fg-faint">
        맞춤은 현재 화면 폭에 100%로 띄워요. 고정 뷰포트는 폭에 맞춰 축소되고, 배율 버튼으로 100%(가로 스크롤)로 볼 수 있어요. Dev 모드가 켜져 있으면 프레임 안 클릭은 선택으로 쓰여요 — 페이지 이동은 위 목록에서. 실제 서비스를 그대로 프록시한 사본이라 폼 전송은 하지 마세요.
      </p>
    </DocPage>
  )
}
