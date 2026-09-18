import { useState } from 'react'
import { DocPage, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { DotChip, FilterChip, TechChip } from '@/components/ui/Chip'
import { DOT_COLORS } from '@/components/ui/card.constants'
import { Badge, PilotBadge, StatusDot } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Marquee } from '@/components/motion/Marquee'

const TOOLS = ['Claude', 'OpenAI', 'Vercel AI SDK', 'pgvector', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS']
const ROW1 = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Radix UI', 'shadcn/ui', 'Storybook', 'Figma', 'React Hook Form', 'Vite']
const ROW2 = ['Vercel', 'Supabase', 'PostgreSQL', 'Prisma', 'Drizzle', 'Cloudflare', 'Stripe', 'Resend', 'Sentry', 'GitHub Actions', 'Anthropic', 'Claude', 'OpenAI']
const CATS = ['All', 'Half-day', 'Leave', 'Field', 'Cover', 'Other']

export function ChipsPage() {
  const [cat, setCat] = useState('All')
  return (
    <DocPage
      eyebrow="components"
      title="Chips & Badges"
      lead="기술 스택 알약, 점이 달린 도구 이름, 선택할 수 있는 필터 칩, 그리고 상태 점과 배지예요. 전부 높이 24~48px 사이의 작은 인라인 요소예요."
      sources={['v1', 'v2']}
    >
      <Section title="TechChip" desc="흰 알약에 회색 아이콘. 마우스를 올리면 살짝 떠오르면서 브랜드 색이 드러나요. 이름만 넘기면 TECH 표에서 simple-icons 아이콘·브랜드 색·링크를 찾아요." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { TechChip } from '@/components/ui'

{/* 이름만 넘기면 TECH 표에서 simple-icons 경로 · 브랜드색 · 링크를 찾는다 */}
<TechChip name="React" />
<TechChip name="TypeScript" />
<TechChip name="Zod" href="https://zod.dev" />   {/* 표에 없으면 첫 글자 타일 */}
{/* 직접 지정 */}
<TechChip name="Custom" iconPath="M12 2 …" color="#F59E0B" />`}
        >
          <div className="flex flex-wrap gap-3">
            <TechChip name="React" />
            <TechChip name="TypeScript" />
            <TechChip name="Claude" />
            <TechChip name="Zod" href="https://zod.dev" />
            <TechChip name="Toss Payments" />
          </div>
        </Preview>
        <Preview
          theme="light"
          bleed
          code={`import { Marquee } from '@/components/motion'

<Marquee direction="left" duration={40}>
  {row1.map((it) => <div key={it.name} className="shrink-0 pr-4"><TechChip {...it} /></div>)}
</Marquee>
<Marquee direction="right" duration={40}>…</Marquee>`}
        >
          <div className="space-y-3 py-6">
            <Marquee direction="left" duration={40} gap="gap-0">
              {ROW1.map((t) => (
                <div key={t} className="shrink-0 pr-4">
                  <TechChip name={t} />
                </div>
              ))}
            </Marquee>
            <Marquee direction="right" duration={44} gap="gap-0">
              {ROW2.map((t) => (
                <div key={t} className="shrink-0 pr-4">
                  <TechChip name={t} />
                </div>
              ))}
            </Marquee>
          </div>
        </Preview>
      </Section>

      <Section title="DotChip" desc="테두리 없이 목록처럼 읽히는 도구 이름이에요. 점 색은 네 가지가 돌아가며 붙어요." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { DotChip, DOT_COLORS } from '@/components/ui'

<div className="flex flex-wrap gap-x-6 gap-y-3">
  {tools.map((t, i) => <DotChip key={t} dot={DOT_COLORS[i % DOT_COLORS.length]}>{t}</DotChip>)}
</div>`}
        >
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {TOOLS.map((t, i) => (
              <DotChip key={t} dot={DOT_COLORS[i % DOT_COLORS.length]}>
                {t}
              </DotChip>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="FilterChip" desc="고를 수 있는 필터 칩이에요. 선택하면 잉크로 채워져요. 가로로 스크롤되는 목록에 넣을 땐 shrink-0을 잊지 마세요.">
        <Preview
          theme="light"
          code={`import { FilterChip } from '@/components/ui'

<nav className="scrollbar-none flex gap-2 overflow-x-auto">
  {cats.map((c) => <FilterChip key={c} selected={c === cat} onClick={() => setCat(c)}>{c}</FilterChip>)}
</nav>`}
        >
          <nav className="scrollbar-none flex gap-2 overflow-x-auto" aria-label="Category">
            {CATS.map((c) => (
              <FilterChip key={c} selected={c === cat} onClick={() => setCat(c)}>
                {c}
              </FilterChip>
            ))}
          </nav>
        </Preview>
      </Section>

      <Section title="StatusDot · Badge" desc="상태 점은 두 가지예요. ping은 바깥으로 퍼지고, pulse는 제자리에서 숨 쉬듯 흐려져요. 배지는 점에 짧은 글자를 붙인 알약이에요." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { StatusDot, Badge, PilotBadge } from '@/components/ui'

<StatusDot tone="success" ping />
<StatusDot tone="accent" pulse />
<Badge ping>Live</Badge>
<Badge tone="warning">Demo</Badge>
<Badge mono tone="warning">privacy</Badge>
<Badge floating ping>Live</Badge>   {/* 스크린샷 위 */}
<PilotBadge>Now taking Q3 2026 projects</PilotBadge>`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-fg-dim">
              <StatusDot tone="success" ping /> ping
            </span>
            <span className="flex items-center gap-2 text-xs text-fg-dim">
              <StatusDot tone="accent" pulse /> pulse
            </span>
            <Badge ping>Live</Badge>
            <Badge tone="warning">Demo</Badge>
            <Badge mono tone="warning">
              privacy
            </Badge>
            <Badge tone="accent">v2</Badge>
            <span className="rounded-md bg-surface-2 p-2">
              <Badge floating ping>Live</Badge>
            </span>
            <PilotBadge>Now taking Q3 2026 projects</PilotBadge>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'tone', type: "'success' | 'warning' | 'accent' | 'neutral'", default: "'success'", desc: '점 색' },
            { name: 'ping', type: 'boolean', default: 'false', desc: '바깥으로 퍼지는 링 (Tailwind animate-ping)' },
            { name: 'pulse', type: 'boolean', default: 'false', desc: '점 자체가 흐려졌다 돌아옴 (efDot)' },
            { name: 'mono / floating', type: 'boolean', default: 'false', desc: 'Badge — 모노 서체 / 흰 반투명 + 블러' },
          ]}
        />
      </Section>

      <Section title="Label" desc="섹션 제목 위에 붙는 모노 라벨이에요. 슬래시 색과 깜빡이는 캐럿을 고를 수 있어요.">
        <Preview
          theme="dark"
          code={`import { Label } from '@/components/ui'

<Label>about</Label>                 {/* // 는 accent */}
<Label slash="muted">services</Label>
<Label caret>efface</Label>
<Label slash={false} as="span">no slash</Label>`}
        >
          <div className="flex flex-col gap-3">
            <Label>about</Label>
            <Label slash="muted">services</Label>
            <Label caret>efface</Label>
            <Label slash={false} as="span">
              no slash
            </Label>
          </div>
        </Preview>
      </Section>
    </DocPage>
  )
}
