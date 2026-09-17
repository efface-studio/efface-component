import { useState } from 'react'
import { DocPage, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { DotChip, FilterChip, TechChip } from '@/components/ui/Chip'
import { DOT_COLORS } from '@/components/ui/card.constants'
import { Badge, PilotBadge, StatusDot } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Marquee } from '@/components/motion/Marquee'

// simple-icons 경로 (v1 lib/icon-paths.ts 에서 발췌)
const ICONS: Record<string, string> = {
  react: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z',
  typescript: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
}

const TOOLS = ['Claude', 'OpenAI', 'Vercel AI SDK', 'pgvector', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS']
const CATS = ['전체', '반차', '연차', '외근', '대직', '기타']

export function ChipsPage() {
  const [cat, setCat] = useState('전체')
  return (
    <DocPage
      eyebrow="components"
      title="Chips & Badges"
      lead="기술 스택 알약(v1), 점 하나 달린 도구 이름(v2), 선택형 필터 칩, 그리고 상태 점과 배지. 모두 h-6 ~ h-12 사이의 작은 인라인 요소다."
      sources={['v1', 'v2']}
    >
      <Section title="TechChip" desc="흰 알약 + 회색 아이콘. 호버하면 살짝 떠오르며 브랜드 컬러가 드러난다. 아이콘은 simple-icons 경로." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { TechChip } from '@/components/ui'

<TechChip name="React" href="https://react.dev" iconPath={ICON_PATHS.react} color="#61DAFB" />
<TechChip name="TypeScript" iconPath={ICON_PATHS.typescript} color="#3178C6" />
<TechChip name="Zod" href="https://zod.dev" />   {/* 아이콘 없으면 첫 글자 타일 */}`}
        >
          <div className="flex flex-wrap gap-3">
            <TechChip name="React" href="https://react.dev" iconPath={ICONS.react} color="#61DAFB" />
            <TechChip name="TypeScript" href="https://www.typescriptlang.org" iconPath={ICONS.typescript} color="#3178C6" />
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
            <Marquee direction="left" duration={30} gap="gap-0">
              {[...TOOLS, ...TOOLS.slice(0, 2)].map((t, i) => (
                <div key={`${t}-${i}`} className="shrink-0 pr-4">
                  <TechChip name={t} iconPath={t === 'React' ? ICONS.react : t === 'TypeScript' ? ICONS.typescript : undefined} color={t === 'React' ? '#61DAFB' : '#3178C6'} />
                </div>
              ))}
            </Marquee>
            <Marquee direction="right" duration={36} gap="gap-0">
              {[...TOOLS].reverse().map((t, i) => (
                <div key={`${t}-${i}`} className="shrink-0 pr-4">
                  <TechChip name={t} />
                </div>
              ))}
            </Marquee>
          </div>
        </Preview>
      </Section>

      <Section title="DotChip" desc="크롬 없이 목록처럼 읽히는 도구 이름. 점 색은 4색 순환. 부모의 --acc 가 없으면 accent." sources={['v2']}>
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

      <Section title="FilterChip" desc="선택 가능한 필터. 선택 시 잉크 채움. 가로 스크롤 목록에서는 shrink-0.">
        <Preview
          theme="light"
          code={`import { FilterChip } from '@/components/ui'

<nav className="scrollbar-none flex gap-2 overflow-x-auto">
  {cats.map((c) => <FilterChip key={c} selected={c === cat} onClick={() => setCat(c)}>{c}</FilterChip>)}
</nav>`}
        >
          <nav className="scrollbar-none flex gap-2 overflow-x-auto" aria-label="카테고리">
            {CATS.map((c) => (
              <FilterChip key={c} selected={c === cat} onClick={() => setCat(c)}>
                {c}
              </FilterChip>
            ))}
          </nav>
        </Preview>
      </Section>

      <Section title="StatusDot · Badge" desc="상태 점은 ping(바깥 확산)과 pulse(자체 숨쉬기) 두 가지. 배지는 점 + 짧은 텍스트 알약." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { StatusDot, Badge, PilotBadge } from '@/components/ui'

<StatusDot tone="success" ping />
<StatusDot tone="accent" pulse />
<Badge ping>Live</Badge>
<Badge tone="warning">Demo</Badge>
<Badge mono tone="warning">privacy</Badge>
<Badge floating ping>Live</Badge>   {/* 스크린샷 위 */}
<PilotBadge>2026 Q3 신규 프로젝트 모집 중</PilotBadge>`}
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
            <PilotBadge>2026 Q3 신규 프로젝트 모집 중</PilotBadge>
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

      <Section title="Label" desc="섹션 제목 위의 모노 eyebrow. 슬래시 색과 캐럿을 고른다.">
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
