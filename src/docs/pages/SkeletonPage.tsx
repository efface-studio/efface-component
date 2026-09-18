import { useEffect, useState } from 'react'
import { ArrowUpRight, Globe } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Toggle, ToggleGroup } from '@/docs/components/Toggle'
import { Skeleton, SkeletonAvatar, SkeletonCard, SkeletonRow, SkeletonStat, SkeletonSwap, SkeletonText, type SkeletonAnimation } from '@/components/ui/Skeleton'
import { CardCell, CardGrid } from '@/components/ui/Card'
import { IconTile } from '@/components/ui/IconTile'
import { Stat } from '@/components/ui/Counter'
import { Button } from '@/components/ui/Button'

const PEOPLE = [
  ['Alice Lee', 'Design · Lead', 'Available'],
  ['Eve Han', 'Ops · Manager', 'Out'],
  ['Grace Park', 'Engineering · Manager', 'In a meeting'],
  ['Martin Choi', 'Marketing · Manager', 'Available'],
]

function SwapDemo({ animation }: { animation: SkeletonAnimation }) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!loading) return
    const t = window.setTimeout(() => setLoading(false), 2200)
    return () => window.clearTimeout(t)
  }, [loading])
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Button size="sm" variant="secondary" onClick={() => setLoading(true)} disabled={loading}>
          {loading ? 'Loading…' : 'Load again'}
        </Button>
        <span className="font-mono text-[11px] text-fg-faint">{loading ? 'skeleton' : 'content'}</span>
      </div>
      <SkeletonSwap
        loading={loading}
        skeleton={
          <CardGrid cols={3}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface p-6 md:p-7">
                <div className="mb-5 flex items-start justify-between">
                  <Skeleton width={40} height={40} animation={animation} />
                  <Skeleton width={16} height={16} animation={animation} />
                </div>
                <Skeleton height={18} width="60%" animation={animation} />
                <SkeletonText lines={2} animation={animation} className="mt-3 text-[14px]" />
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5">
                  <SkeletonStat animation={animation} className="gap-2 [&>*:first-child]:h-5 [&>*:first-child]:w-14" />
                  <SkeletonStat animation={animation} className="gap-2 [&>*:first-child]:h-5 [&>*:first-child]:w-14" />
                </div>
              </div>
            ))}
          </CardGrid>
        }
      >
        <CardGrid cols={3}>
          {[
            ['Landing page', 'Launches, campaigns, hiring pages', '1–2 wks', '₩350K'],
            ['Brand site', 'Company, portfolio, careers', '2–3 wks', '₩600K'],
            ['Commerce', 'Payments · inventory · orders', '3–5 wks', '₩700K'],
          ].map(([t, d, p, f]) => (
            <CardCell key={t} tint>
              <div className="mb-5 flex items-start justify-between">
                <IconTile>
                  <Globe size={18} />
                </IconTile>
                <ArrowUpRight size={16} className="text-fg-faint" />
              </div>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-dim">{d}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
                <div>
                  <div className="mb-0.5 text-[11px] text-fg-dim">Timeline</div>
                  <div className="font-medium tabular-nums">{p}</div>
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] text-fg-dim">From</div>
                  <div className="font-medium tabular-nums">{f}</div>
                </div>
              </div>
            </CardCell>
          ))}
        </CardGrid>
      </SkeletonSwap>
    </div>
  )
}

export function SkeletonPage() {
  const [animation, setAnimation] = useState<SkeletonAnimation>('shimmer')
  return (
    <DocPage
      eyebrow="components"
      title="Skeleton"
      lead="내용이 오기 전에 자리를 잡아 두는 회색 블록이에요. 실제 콘텐츠와 같은 크기와 둥글기로 두면 로드된 뒤 레이아웃이 튀지 않아요. 기본은 왼쪽에서 오른쪽으로 하이라이트가 지나가는 shimmer, 조용해야 하는 곳엔 pulse."
    >
      <ToggleGroup title="animation">
        <Toggle label="Shimmer" hint="하이라이트가 지나감" checked={animation === 'shimmer'} onChange={(v) => setAnimation(v ? 'shimmer' : 'none')} />
        <Toggle label="Pulse" hint="제자리에서 숨쉬기" checked={animation === 'pulse'} onChange={(v) => setAnimation(v ? 'pulse' : 'none')} />
      </ToggleGroup>

      <Section title="기본 블록" desc="shape 로 모양을 고르고 width / height 로 크기를 줘요. text 는 글줄 높이(1em)로 맞춰지고, circle 은 아바타예요.">
        <Preview
          theme="dark"
          code={`import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components/ui'

<Skeleton width={240} height={20} />
<Skeleton shape="text" className="w-2/3" />
<SkeletonAvatar size={48} />
<Skeleton width={120} height={36} radius="rounded-full" />   {/* 버튼 자리 */}
<SkeletonText lines={3} lastWidth={0.5} />
<Skeleton animation="pulse" width="100%" height={120} />`}
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Skeleton width={240} height={20} animation={animation} />
              <Skeleton shape="text" className="w-2/3" animation={animation} />
              <div className="flex items-center gap-3">
                <SkeletonAvatar size={48} animation={animation} />
                <SkeletonAvatar size={32} animation={animation} />
                <Skeleton width={120} height={36} radius="rounded-full" animation={animation} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <SkeletonText lines={3} lastWidth={0.5} animation={animation} />
              <Skeleton width="100%" height={96} animation={animation} />
            </div>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'shape', type: "'block' | 'text' | 'circle'", default: "'block'", desc: '모양' },
            { name: 'width / height', type: 'number | string', desc: 'px 또는 CSS 값. text 는 높이 1em 고정' },
            { name: 'animation', type: "'shimmer' | 'pulse' | 'none'", default: "'shimmer'", desc: 'reduced-motion 이면 자동으로 정지' },
            { name: 'radius', type: 'string', default: 'rounded-md', desc: 'Tailwind 둥글기 클래스' },
          ]}
        />
      </Section>

      <Section title="조합" desc="자주 쓰는 자리는 미리 묶어 뒀어요. 카드, 목록 한 줄, 큰 숫자.">
        <Preview
          theme="light"
          code={`import { SkeletonCard, SkeletonRow, SkeletonStat } from '@/components/ui'

<div className="grid gap-4 md:grid-cols-3">
  <SkeletonCard />
  <SkeletonCard media="1/1" lines={3} />
  <SkeletonCard media="" />
</div>

<ul className="divide-y divide-line">
  {[0, 1, 2, 3].map((i) => <li key={i}><SkeletonRow /></li>)}
</ul>

<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
  <SkeletonStat /> <SkeletonStat /> <SkeletonStat /> <SkeletonStat />
</div>`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <SkeletonCard animation={animation} />
            <SkeletonCard media="1/1" lines={3} animation={animation} />
            <SkeletonCard media="" animation={animation} />
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">rows · loading</p>
              <ul className="divide-y divide-line rounded-lg border border-line px-4">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i}>
                    <SkeletonRow animation={animation} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">rows · loaded</p>
              <ul className="divide-y divide-line rounded-lg border border-line px-4">
                {PEOPLE.map(([n, r, s]) => (
                  <li key={n} className="flex items-center gap-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent">{n?.[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{n}</span>
                      <span className="block text-[12px] text-fg-dim">{r}</span>
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-fg-dim">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            <SkeletonStat animation={animation} />
            <SkeletonStat animation={animation} />
            <Stat to={30} suffix="+" label="Projects shipped" />
            <Stat to={4.9} decimals={1} suffix=" / 5.0" label="Avg. satisfaction" />
          </div>
        </Preview>
      </Section>

      <Section title="로딩 → 콘텐츠 전환" desc="SkeletonSwap 으로 감싸면 loading 이 끝날 때 스켈레톤과 콘텐츠가 0.5초 동안 교차해요. 두 쪽의 높이를 맞춰 두는 게 핵심이에요 — 카드 하나가 튀면 전체가 튀어요.">
        <Preview
          theme="light"
          code={`import { SkeletonSwap } from '@/components/ui'

<SkeletonSwap loading={isLoading} skeleton={<CardGrid cols={3}>{…SkeletonCard × 3}</CardGrid>}>
  <CardGrid cols={3}>{…실제 카드}</CardGrid>
</SkeletonSwap>`}
        >
          <SwapDemo animation={animation} />
        </Preview>
        <Note>
          스켈레톤은 <code className="font-mono">aria-hidden</code> 이고 감싸는 컨테이너에 <code className="font-mono">aria-busy</code> 가 붙어요. 스크린 리더는 회색 블록을 읽지 않고, 로딩 중이라는 것만 알아요. 3초 넘게 걸리는 요청이면 스켈레톤 대신 진행 상태를 글로 알려주는 편이 나아요.
        </Note>
      </Section>
    </DocPage>
  )
}
