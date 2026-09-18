import { useState } from 'react'
import { motion } from 'motion/react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { Preview } from '@/docs/components/Preview'
import { Button } from '@/components/ui/Button'
import { DURATIONS, EASINGS, KEYFRAMES, SPRINGS, STAGGERS } from '@/tokens/motion'

function EasingCurve({ value }: { value: string }) {
  const m = value.match(/cubic-bezier\(([^)]+)\)/)
  const [x1, y1, x2, y2] = (m?.[1] ?? '0,0,1,1').split(',').map((n) => Number(n.trim()))
  const W = 120
  const H = 80
  const px = (x: number) => x * W
  const py = (y: number) => H - y * H
  const d = `M ${px(0)} ${py(0)} C ${px(x1 ?? 0)} ${py(y1 ?? 0)}, ${px(x2 ?? 1)} ${py(y2 ?? 1)}, ${px(1)} ${py(1)}`
  return (
    <svg aria-hidden viewBox={`-6 -12 ${W + 12} ${H + 24}`} className="h-20 w-32 shrink-0">
      <line x1={0} y1={py(0)} x2={W} y2={py(1)} stroke="var(--line-strong)" strokeDasharray="3 3" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} />
      <circle cx={px(x1 ?? 0)} cy={py(y1 ?? 0)} r={2.5} fill="var(--fg-faint)" />
      <circle cx={px(x2 ?? 1)} cy={py(y2 ?? 1)} r={2.5} fill="var(--fg-faint)" />
    </svg>
  )
}

export function MotionTokensPage() {
  const [key, setKey] = useState(0)
  return (
    <DocPage
      eyebrow="foundations"
      title="Motion tokens"
      lead="등장과 전환은 곡선 하나(ease-out-expo)로 통일해요. 길이는 세 단계, 스태거는 0.06~0.07초. CSS 변수와 lib/motion.ts 상수가 같은 값을 갖고 있어요."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="이징">
        <ul className="grid gap-4 md:grid-cols-2">
          {EASINGS.map((e) => (
            <li key={e.name} className="flex items-center gap-4 rounded-lg border border-line p-4">
              <EasingCurve value={e.value} />
              <div className="min-w-0">
                <p className="font-mono text-[12.5px] text-accent">--ease-{e.name.replace('ease-', '')}</p>
                <p className="mt-1 font-mono text-[11px] text-fg-faint">{e.value}</p>
                <p className="mt-1.5 text-[12.5px] text-fg-dim">{e.where}</p>
              </div>
            </li>
          ))}
        </ul>
        <CodeBlock
          code={`// lib/motion.ts
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const
export const DURATION = { fast: 0.4, base: 0.6, slow: 0.7 } as const
export const STAGGER = { tight: 0.06, base: 0.07, word: 0.05 } as const

// Tailwind — 같은 값이 CSS 변수로도 있다
<div className="transition-transform duration-600 ease-out-expo" />
<div className="transition-opacity duration-(--duration-slow) ease-(--ease-out-quart)" />`}
        />
      </Section>

      <Section title="길이 · 스태거">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="border-b border-line bg-bg-soft px-4 py-2 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">duration</div>
            {DURATIONS.map((d) => (
              <div key={d.name} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
                <span className="w-12 font-mono text-[12.5px] text-accent">{d.name}</span>
                <span className="w-12 font-mono text-[12px] text-fg">{d.value}</span>
                <span className="text-[12.5px] text-fg-dim">{d.where}</span>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="border-b border-line bg-bg-soft px-4 py-2 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">stagger</div>
            {STAGGERS.map((d) => (
              <div key={d.name} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
                <span className="w-12 font-mono text-[12.5px] text-accent">{d.name}</span>
                <span className="w-12 font-mono text-[12px] text-fg">{d.value}</span>
                <span className="text-[12.5px] text-fg-dim">{d.where}</span>
              </div>
            ))}
          </div>
        </div>
        <Preview
          theme="dark"
          code={`{items.map((item, i) => (
  <Reveal key={item} delay={i * STAGGER.tight}>…</Reveal>
))}`}
        >
          <div className="mb-4">
            <Button size="sm" variant="secondary" onClick={() => setKey((k) => k + 1)}>
              Replay
            </Button>
          </div>
          <div key={key} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Keep the essence', 'Clarity over flair.'],
              ['Proven tools only', 'Tools that last, not tools that trend.'],
              ['Own it to the end', 'Not shipped — working.'],
              ['Fast calls, exact dates', 'Plan, design and build in one flow.'],
            ].map(([t, d], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-lg border border-line bg-surface p-5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <span className="font-mono text-[10px] text-fg-faint">+{(i * 0.06).toFixed(2)}s</span>
                </div>
                <p className="mt-3 font-medium">{t}</p>
                <p className="mt-1 text-[13px] text-fg-dim">{d}</p>
              </motion.div>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="스프링" desc="커서를 따라가거나 스크롤을 따라가는 것처럼 입력이 계속 들어오는 곳은 베지어 대신 스프링을 써요. motion의 useSpring에 그대로 넣는 값이에요.">
        <div className="overflow-hidden rounded-lg border border-line">
          {SPRINGS.map((s) => (
            <div key={s.name} className="grid gap-2 border-b border-line px-4 py-3 last:border-0 md:grid-cols-[100px_1fr_1fr]">
              <span className="font-mono text-[12.5px] text-accent">{s.name}</span>
              <span className="font-mono text-[12px] text-fg">{s.value}</span>
              <span className="text-[12.5px] text-fg-dim">{s.where}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="CSS 키프레임" desc="index.css에 들어 있는 전역 애니메이션이에요. 첫 화면에 바로 보여야 해서 JS를 기다릴 수 없는 곳에 써요.">
        <div className="overflow-hidden rounded-lg border border-line">
          {KEYFRAMES.map((k) => (
            <div key={k.name} className="grid gap-2 border-b border-line px-4 py-3 last:border-0 md:grid-cols-[120px_180px_1fr]">
              <span className="font-mono text-[12.5px] text-accent">{k.name}</span>
              <span className="font-mono text-[11.5px] text-fg-dim">{k.classes}</span>
              <span className="text-[12.5px] text-fg-dim">{k.desc}</span>
            </div>
          ))}
        </div>
        <Preview
          theme="dark"
          code={`<h1>
  <span className="rise-in rise-d1 block">Erase the complexity.</span>
  <span className="rise-in rise-d2 block">Keep the effect.</span>
</h1>
<p className="rise-in rise-d3">…</p>

<span className="scroll-bob inline-block h-8 w-px bg-fg-faint" />
<span className="caret-blink inline-block h-4 w-2 bg-accent" />`}
        >
          <div key={`kf-${key}`} className="flex flex-col gap-6">
            <h3 className="text-3xl font-semibold tracking-tight">
              <span className="rise-in rise-d1 block">Erase the complexity.</span>
              <span className="rise-in rise-d2 block">Keep the effect.</span>
            </h3>
            <p className="rise-in rise-d3 max-w-md text-fg-dim">CSS keyframes play the moment the stylesheet parses.</p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-3 text-xs tracking-[0.2em] text-fg-faint uppercase">
                scroll <span className="scroll-bob inline-block h-8 w-px bg-fg-faint" />
              </span>
              <span className="flex items-center gap-2 font-mono text-xs text-fg-faint">
                typing <span className="caret-blink inline-block h-4 w-2 bg-accent" />
              </span>
              <span className="animate-bob inline-block h-6 w-6 rounded-md bg-accent" />
            </div>
          </div>
        </Preview>
        <Note>
          시스템에서 애니메이션 줄이기를 켜면 키프레임은 전부 꺼지고 끝 상태로 바로 그려져요. motion 컴포넌트는 <code className="font-mono">useReducedMotion()</code>으로 <code className="font-mono">initial</code>을 건너뜁니다.
        </Note>
      </Section>
    </DocPage>
  )
}
