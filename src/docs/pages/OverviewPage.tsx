import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { DocPage, Section } from '@/docs/components/Doc'
import { SourceBadge } from '@/docs/components/SourceBadge'
import { Preview } from '@/docs/components/Preview'
import { DOC_NAV } from '@/docs/nav'
import { LogoMark } from '@/components/brand/LogoMark'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { LinkUnderline } from '@/components/ui/LinkUnderline'
import { Reveal } from '@/components/motion/Reveal'

const SOURCES = [
  { src: 'v1' as const, name: 'efface.dev', stack: 'Next.js 16 · Tailwind v4 · motion', theme: '라이트 (paper / ink)', what: '외주 제작 소개. Header, Hero(커서 글로우), WordReveal, Marquee 칩, Services/Process/Manifesto 카드, Stats 카운터, FAQ, Pricing, Testimonials, CTA 스포트라이트, FloatingCTA, Footer.' },
  { src: 'v2' as const, name: 'v2.efface.dev', stack: 'Next.js 16 · Tailwind v4 · motion · three', theme: '다크 (#0a0a0b · 로고 블루)', what: '스튜디오 소개. Nav + 오버레이 메뉴, Reveal, EffaceIntro(단어 점등·취소선·구슬), AppCards 표면, Capabilities 카드, Approach 목록, About 메타, Contact CTA, 캔버스 워드마크 Footer.' },
  { src: 'mom' as const, name: 'mom.efface.dev', stack: 'Vite · React 19 · Tailwind v4', theme: '라이트 + 네이비 푸터', what: '근무 안내 카드 에디터. 여기서는 상단 efface 배너(1600×500 캐러셀 · 모바일 세로형)와 하단 SiteFooter(CSS 워드마크)만 가져왔다.' },
]

export function OverviewPage() {
  return (
    <DocPage
      eyebrow="overview"
      title="efface design system"
      lead="덜어낼수록 선명해진다. efface 가 만드는 모든 화면이 공유하는 색과 서체, 여백과 움직임을 한 벌의 토큰과 컴포넌트로 묶었다. 살아 있는 프리뷰로 보고, 코드 그대로 가져다 쓴다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="한눈에">
        <Preview theme="dark" center minHeight={360} code={`import { LogoMark, Label, Button, ButtonLink, Badge, LinkUnderline, Reveal } from '@/components'`}>
          <Reveal>
            <div className="flex max-w-xl flex-col items-start gap-6">
              <Label caret>efface</Label>
              <div className="flex items-center gap-4">
                <LogoMark className="h-12 w-12 text-fg" />
                <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  Erase the complexity.
                  <br />
                  Keep the effect.
                </h2>
              </div>
              <p className="max-w-md text-fg-dim">Less, but sharper — one language shared by every efface product.</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" trailing={<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}>
                  Get started
                </Button>
                <ButtonLink href="#" variant="secondary" size="lg">
                  Browse
                </ButtonLink>
                <Badge ping>Live</Badge>
              </div>
              <LinkUnderline href="mailto:contact@efface.dev" className="text-sm text-fg-dim hover:text-fg">
                contact@efface.dev
              </LinkUnderline>
            </div>
          </Reveal>
        </Preview>
      </Section>

      <Section title="출처" desc="세 사이트의 소스 코드에서 직접 추출했다. 각 문서 항목의 배지가 어디서 왔는지 알려준다.">
        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {SOURCES.map((s) => (
            <li key={s.src} className="flex flex-col gap-3 bg-bg p-5">
              <div className="flex items-center justify-between">
                <SourceBadge src={s.src} />
                <a href={`https://${s.name}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-fg-dim hover:text-fg">
                  {s.name} ↗
                </a>
              </div>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-fg-faint">스택</dt>
                  <dd className="text-fg-dim">{s.stack}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-fg-faint">테마</dt>
                  <dd className="text-fg-dim">{s.theme}</dd>
                </div>
              </dl>
              <p className="text-[13px] leading-relaxed text-fg-dim">{s.what}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="원칙" desc="세 사이트가 공유하는 디자인 태도. 컴포넌트를 더하거나 고칠 때 기준이 된다.">
        <ol className="grid gap-4 md:grid-cols-2">
          {[
            ['절제', '검정 캔버스 위 흰 잉크, 액센트는 하나. 카드·그라데이션·그림자를 남발하지 않는다.'],
            ['한 곡선', '모든 진입과 전환은 ease-out-expo (0.22, 1, 0.36, 1) 하나로. 스태거는 0.06–0.07s.'],
            ['CSS 먼저', 'above-the-fold 진입은 CSS 키프레임(rise-in)으로 — hydration을 기다리지 않는다. motion은 뷰포트 진입·스크롤 연동에만.'],
            ['reduced-motion', '모든 모션은 prefers-reduced-motion 을 존중한다. 최종 상태를 즉시 그린다.'],
            ['모노 라벨', '섹션 제목 위에는 항상 `// label` 모노 eyebrow. 번호는 모노 + 액센트.'],
            ['1px 선', '카드 사이는 gap-px + 배경 line 색. 테두리는 line 토큰, 강조는 fg.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-lg border border-line p-4">
              <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-[15px] font-medium">{t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-fg-dim">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="목차">
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_NAV.filter((g) => g.title !== 'Overview').map((g) => (
            <li key={g.title}>
              <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">{g.title}</p>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="link-underline text-sm text-fg-dim hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>
    </DocPage>
  )
}
