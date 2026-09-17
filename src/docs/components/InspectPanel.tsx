import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { InspectInfo } from '@/lib/inspectBridge'

function Swatch({ value }: { value: string }) {
  const transparent = !value || value === 'transparent'
  return (
    <span
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-[3px]"
      style={{
        background: transparent ? 'repeating-conic-gradient(#8884 0 25%, transparent 0 50%) 0 0/8px 8px' : value.split(' ')[0],
        boxShadow: 'inset 0 0 0 1px var(--line-strong)',
      }}
    />
  )
}

function Row({ k, v, copy, swatch }: { k: string; v: string; copy?: string; swatch?: boolean }) {
  const [done, setDone] = useState(false)
  if (!v) return null
  const text = copy ?? v
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      window.setTimeout(() => setDone(false), 1200)
    } catch {
      /* 무시 */
    }
  }
  return (
    <button type="button" onClick={onCopy} className="group flex w-full items-center gap-3 rounded px-1.5 py-1 text-left hover:bg-line/30" title="복사">
      <span className="w-[68px] shrink-0 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">{k}</span>
      {swatch && <Swatch value={v} />}
      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-fg">{v}</span>
      <span className="text-fg-faint opacity-0 transition-opacity group-hover:opacity-100">{done ? <Check size={11} /> : <Copy size={11} />}</span>
    </button>
  )
}

/** 박스 모델 — margin · padding 숫자를 Figma/DevTools 처럼 겹친 상자로 */
function BoxModel({ info }: { info: InspectInfo }) {
  const cell = (n: number) => <span className="font-mono text-[10px] text-fg-dim">{n}</span>
  return (
    <div className="rounded-md border border-dashed border-amber-500/60 bg-amber-500/8 p-1 text-center">
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[9px] text-amber-600/80 uppercase">margin</span>
        {cell(info.margin[0])}
        <span className="w-8" />
      </div>
      <div className="flex items-center gap-1">
        {cell(info.margin[3])}
        <div className="flex-1 rounded-md border border-dashed border-emerald-500/60 bg-emerald-500/10 p-1">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[9px] text-emerald-600/80 uppercase">padding</span>
            {cell(info.padding[0])}
            <span className="w-8" />
          </div>
          <div className="flex items-center gap-1">
            {cell(info.padding[3])}
            <div className="flex-1 rounded border border-accent/60 bg-accent/10 px-2 py-2 font-mono text-[11px] text-fg">
              {Math.round(info.rect.w - info.padding[1] - info.padding[3] - info.border[1] - info.border[3])} × {Math.round(info.rect.h - info.padding[0] - info.padding[2] - info.border[0] - info.border[2])}
            </div>
            {cell(info.padding[1])}
          </div>
          <div className="pt-0.5">{cell(info.padding[2])}</div>
        </div>
        {cell(info.margin[1])}
      </div>
      <div className="pt-0.5">{cell(info.margin[2])}</div>
    </div>
  )
}

export interface InspectPanelProps {
  selected: InspectInfo | null
  hovered: InspectInfo | null
  distances: number[] | null
  className?: string
}

/**
 * 검사 결과 패널 — 선택한 요소의 크기·박스 모델·타이포·색, 그리고 다른 요소와의 거리.
 * 값을 누르면 복사된다.
 */
export function InspectPanel({ selected, hovered, distances, className }: InspectPanelProps) {
  const info = selected ?? hovered
  return (
    <aside className={cn('flex flex-col gap-4 text-[13px]', className)} aria-live="polite">
      {!info ? (
        <div className="rounded-lg border border-dashed border-line-strong p-5 text-[12.5px] leading-relaxed text-fg-dim">
          요소에 마우스를 올리면 크기와 여백이 보여요. 누르면 고정되고, 그 상태에서 다른 요소에 올리면 둘 사이 거리를 재요. <kbd className="rounded border border-line px-1 font-mono text-[10px]">Esc</kbd> 로 해제.
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className={cn('font-mono text-[12px]', selected ? 'text-[#ff3d71]' : 'text-accent')}>{selected ? '● 선택' : '○ 호버'}</span>
            <span className="min-w-0 truncate font-mono text-[12px] text-fg">
              {info.tag}
              {info.id && <span className="text-fg-dim">#{info.id}</span>}
            </span>
          </div>
          {info.classes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {info.classes.map((c) => (
                <span key={c} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-fg-dim">
                  {c}
                </span>
              ))}
            </div>
          )}

          {selected && hovered && distances && distances.length > 0 && (
            <div className="rounded-lg border border-[#ff3d71]/40 bg-[#ff3d71]/8 p-3">
              <p className="mb-1 font-mono text-[10.5px] tracking-wider text-[#ff3d71] uppercase">distance</p>
              <p className="font-mono text-[18px] font-semibold text-fg">{distances.map((d) => `${d}px`).join(' · ')}</p>
              <p className="mt-1 truncate text-[11.5px] text-fg-dim">
                {selected.tag} ↔ {hovered.tag}
                {hovered.classes[0] ? `.${hovered.classes[0]}` : ''}
              </p>
            </div>
          )}

          <section>
            <p className="mb-1.5 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">box</p>
            <BoxModel info={info} />
            <div className="mt-2">
              <Row k="size" v={`${info.rect.w} × ${info.rect.h}`} />
              <Row k="position" v={`${info.rect.x}, ${info.rect.y}`} />
              <Row k="radius" v={info.radius !== '0px' ? info.radius : ''} />
              <Row k="display" v={info.display + (info.position !== 'static' ? ` · ${info.position}` : '')} />
              <Row k="gap" v={info.gap && info.gap !== 'normal' ? info.gap : ''} />
              <Row k="flex" v={info.flex} />
              <Row k="grid" v={info.grid && info.grid !== 'none' ? info.grid : ''} />
            </div>
          </section>

          <section>
            <p className="mb-1.5 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">type</p>
            <Row k="font" v={info.font.family} />
            <Row k="size" v={`${info.font.size} / ${info.font.lineHeight}`} />
            <Row k="weight" v={info.font.weight} />
            <Row k="tracking" v={info.font.letterSpacing !== 'normal' ? info.font.letterSpacing : ''} />
            {info.text && <p className="mt-1 truncate px-1.5 text-[12px] text-fg-dim">“{info.text}”</p>}
          </section>

          <section>
            <p className="mb-1.5 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">color</p>
            <Row k="text" v={info.color} swatch />
            <Row k="bg" v={info.background !== 'transparent' ? info.background : ''} swatch />
            <Row k="border" v={info.borderColor} swatch />
            <Row k="shadow" v={info.shadow} />
            <Row k="opacity" v={info.opacity !== '1' ? info.opacity : ''} />
          </section>
        </>
      )}
    </aside>
  )
}
