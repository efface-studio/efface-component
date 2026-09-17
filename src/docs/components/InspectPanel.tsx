import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { InspectDistance, InspectInfo } from '@/lib/inspectBridge'

const PINK = '#ff3d71'
const DIR_GLYPH: Record<InspectDistance['dir'], string> = { top: '⊤', bottom: '⊥', left: '⊣', right: '⊢', v: '↕', h: '↔' }

function useCopy() {
  const [done, setDone] = useState<string | null>(null)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(text)
      window.setTimeout(() => setDone(null), 1200)
    } catch {
      /* 무시 */
    }
  }
  return { done, copy }
}

/** 라벨 왼쪽 · 값 오른쪽. 누르면 복사. */
function Field({ label, value, copyText, children, onCopy, copied }: { label: string; value?: string; copyText?: string; children?: ReactNode; onCopy: (t: string) => void; copied: boolean }) {
  if (!value && !children) return null
  const text = copyText ?? value ?? ''
  return (
    <button type="button" onClick={() => text && onCopy(text)} className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-line/30">
      <span className="shrink-0 text-[11.5px] text-fg-faint">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        {children}
        {value && <span className="truncate font-mono text-[12px] text-fg">{value}</span>}
        <span className={cn('shrink-0 text-fg-faint transition-opacity', copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{copied ? <Check size={11} /> : <Copy size={11} />}</span>
      </span>
    </button>
  )
}

function Heading({ children }: { children: ReactNode }) {
  return <p className="mb-1 px-2 font-mono text-[10px] tracking-[0.18em] text-fg-faint uppercase">{children}</p>
}

/** W · H · X · Y — 피그마 속성 패널처럼 2×2 */
function Metrics({ info, onCopy, copied }: { info: InspectInfo; onCopy: (t: string) => void; copied: string | null }) {
  const cells: [string, number][] = [
    ['W', info.rect.w],
    ['H', info.rect.h],
    ['X', info.rect.x],
    ['Y', info.rect.y],
  ]
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map(([k, v]) => (
        <button key={k} type="button" onClick={() => onCopy(String(v))} className="group flex items-baseline gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-left transition-colors hover:border-line-strong">
          <span className="font-mono text-[10.5px] text-fg-faint">{k}</span>
          <span className="font-mono text-[15px] font-medium tracking-tight text-fg tabular-nums">{v}</span>
          <span className={cn('ml-auto text-fg-faint transition-opacity', copied === String(v) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{copied === String(v) ? <Check size={10} /> : <Copy size={10} />}</span>
        </button>
      ))}
    </div>
  )
}

/** 상·우·하·좌 네 칸. 전부 0이면 흐리게. */
function Sides({ label, values, tone, onCopy }: { label: string; values: [number, number, number, number]; tone: 'padding' | 'margin'; onCopy: (t: string) => void }) {
  const any = values.some(Boolean)
  const color = tone === 'padding' ? 'text-emerald-500' : 'text-amber-500'
  const glyph = ['⊤', '⊣', '⊥', '⊢']
  return (
    <button type="button" onClick={() => onCopy(values.join(' '))} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-line/30', !any && 'opacity-50')}>
      <span className="w-[52px] shrink-0 text-[11.5px] text-fg-faint">{label}</span>
      <span className="grid flex-1 grid-cols-4 gap-1">
        {values.map((v, i) => (
          <span key={i} className="flex items-center justify-center gap-1 rounded-md border border-line bg-bg py-1 font-mono text-[12px] tabular-nums">
            <span className={cn('text-[10px]', v ? color : 'text-fg-faint')}>{glyph[i]}</span>
            {v}
          </span>
        ))}
      </span>
    </button>
  )
}

function Swatch({ value, size = 18 }: { value: string; size?: number }) {
  const transparent = !value || value === 'transparent'
  return (
    <span
      className="inline-block shrink-0 rounded-md"
      style={{
        width: size,
        height: size,
        background: transparent ? 'repeating-conic-gradient(#8884 0 25%, transparent 0 50%) 0 0/8px 8px' : value.split(' ')[0],
        boxShadow: 'inset 0 0 0 1px rgba(127,127,127,0.35)',
      }}
    />
  )
}

export interface InspectPanelProps {
  selected: InspectInfo | null
  hovered: InspectInfo | null
  distances: InspectDistance[] | null
  className?: string
}

/**
 * 검사 결과 패널 — 선택(또는 호버)한 요소의 크기·위치, 여백, 레이아웃, 타이포, 색.
 * 값을 누르면 복사된다. 선택한 채 다른 요소에 올리면 거리가 맨 위에 뜬다.
 */
export function InspectPanel({ selected, hovered, distances, className }: InspectPanelProps) {
  const { done, copy } = useCopy()
  const info = selected ?? hovered
  const isSel = !!selected

  return (
    <aside className={cn('flex flex-col gap-5 text-[13px]', className)} aria-live="polite">
      {!info ? (
        <div className="rounded-xl border border-line bg-bg-soft p-4">
          <p className="text-[13px] font-medium">요소를 가리켜 보세요</p>
          <ol className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-fg-dim">
            <li className="flex gap-2">
              <span className="font-mono text-accent">1</span>마우스를 올리면 크기와 padding · margin 이 보여요.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-accent">2</span>누르면 고정돼요. 값을 누르면 복사.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-accent">3</span>고정한 채 다른 요소에 올리면 둘 사이 거리가 나와요.
            </li>
          </ol>
          <p className="mt-2 text-[11.5px] text-fg-faint">
            <kbd className="rounded border border-line px-1 font-mono text-[10px]">Esc</kbd> 고정 해제 · 한 번 더 누르면 Dev 모드 끄기
          </p>
        </div>
      ) : (
        <>
          {/* 요소 */}
          <div>
            <div className="flex items-center gap-2 px-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: isSel ? PINK : 'var(--accent)' }} />
              <span className="font-mono text-[13px] font-medium text-fg">
                {info.tag}
                {info.id && <span className="text-fg-dim">#{info.id}</span>}
              </span>
              <span className="ml-auto rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-fg-faint uppercase">{isSel ? 'selected' : 'hover'}</span>
            </div>
            {info.classes.length > 0 && (
              <button type="button" onClick={() => copy(info.classes.join(' '))} className="mt-2 block w-full rounded-md px-2 text-left font-mono text-[11px] leading-relaxed break-words text-fg-dim transition-colors hover:bg-line/30 hover:text-fg" title="클래스 복사">
                {info.classes.join(' ')}
              </button>
            )}
            {info.text && <p className="mt-1.5 truncate px-2 text-[12px] text-fg-faint">“{info.text}”</p>}
          </div>

          {/* 거리 */}
          {isSel && hovered && distances && distances.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: `${PINK}14`, boxShadow: `inset 0 0 0 1px ${PINK}55` }}>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: PINK }}>
                distance
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {distances.map((d, i) => (
                  <span key={i} className="flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-[12px] text-fg-dim">{DIR_GLYPH[d.dir]}</span>
                    <span className="text-[24px] leading-none font-semibold tracking-tight text-fg">{d.d}</span>
                    <span className="text-[12px] text-fg-dim">px</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 truncate font-mono text-[11px] text-fg-dim">
                {selected.tag} → {hovered.tag}
                {hovered.classes[0] ? `.${hovered.classes[0]}` : ''}
              </p>
            </div>
          )}

          {/* 크기 · 위치 */}
          <section>
            <Heading>size · position</Heading>
            <Metrics info={info} onCopy={copy} copied={done} />
          </section>

          {/* 여백 */}
          <section>
            <Heading>spacing</Heading>
            <Sides label="Padding" values={info.padding} tone="padding" onCopy={copy} />
            <Sides label="Margin" values={info.margin} tone="margin" onCopy={copy} />
            {info.border.some(Boolean) && <Sides label="Border" values={info.border} tone="margin" onCopy={copy} />}
          </section>

          {/* 레이아웃 */}
          <section>
            <Heading>layout</Heading>
            <Field label="Display" value={info.display + (info.position !== 'static' ? ` · ${info.position}` : '')} onCopy={copy} copied={done === info.display} />
            {info.gap && info.gap !== 'normal' && <Field label="Gap" value={info.gap} onCopy={copy} copied={done === info.gap} />}
            {info.flex && <Field label="Flex" value={info.flex} onCopy={copy} copied={done === info.flex} />}
            {info.grid && info.grid !== 'none' && <Field label="Columns" value={info.grid} onCopy={copy} copied={done === info.grid} />}
            {info.radius !== '0px' && <Field label="Radius" value={info.radius} onCopy={copy} copied={done === info.radius} />}
          </section>

          {/* 타이포 */}
          <section>
            <Heading>type</Heading>
            <div className="mx-2 mb-1.5 rounded-lg border border-line bg-bg px-3 py-2.5">
              <p className="truncate text-[20px] leading-tight text-fg" style={{ fontFamily: `'${info.font.family}', var(--font-sans)`, fontWeight: Number(info.font.weight) || 400, letterSpacing: info.font.letterSpacing }}>
                {info.font.family}
              </p>
              <p className="mt-1 font-mono text-[11px] text-fg-faint">
                {info.font.weight} · {info.font.size} / {info.font.lineHeight}
                {info.font.letterSpacing !== 'normal' ? ` · ${info.font.letterSpacing}` : ''}
              </p>
            </div>
            <Field label="Family" value={info.font.family} onCopy={copy} copied={done === info.font.family} />
            <Field label="Size / Line" value={`${info.font.size} / ${info.font.lineHeight}`} onCopy={copy} copied={done === `${info.font.size} / ${info.font.lineHeight}`} />
            <Field label="Weight" value={info.font.weight} onCopy={copy} copied={done === info.font.weight} />
            {info.font.letterSpacing !== 'normal' && <Field label="Tracking" value={info.font.letterSpacing} onCopy={copy} copied={done === info.font.letterSpacing} />}
          </section>

          {/* 색 */}
          <section>
            <Heading>color</Heading>
            <Field label="Text" value={info.color} onCopy={copy} copied={done === info.color}>
              <Swatch value={info.color} />
            </Field>
            {info.background !== 'transparent' && (
              <Field label="Background" value={info.background} onCopy={copy} copied={done === info.background}>
                <Swatch value={info.background} />
              </Field>
            )}
            {info.borderColor && (
              <Field label="Border" value={info.borderColor} onCopy={copy} copied={done === info.borderColor}>
                <Swatch value={info.borderColor} />
              </Field>
            )}
            {info.shadow && <Field label="Shadow" value={info.shadow} onCopy={copy} copied={done === info.shadow} />}
            {info.opacity !== '1' && <Field label="Opacity" value={info.opacity} onCopy={copy} copied={done === info.opacity} />}
          </section>
        </>
      )}
    </aside>
  )
}
