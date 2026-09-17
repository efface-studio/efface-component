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
  { src: 'v1' as const, name: 'efface.dev', stack: 'Next.js 16 · Tailwind v4 · motion', theme: '라이트 (paper / ink)', what: '외주 제작 소개 사이트예요. 헤더, 커서를 따라오는 히어로, 단어별로 올라오는 제목, 기술 스택 마퀴, 카드 그리드, 카운터, FAQ, 가격표, 후기, 스포트라이트 CTA, 플로팅 버튼, 푸터를 가져왔어요.' },
  { src: 'v2' as const, name: 'v2.efface.dev', stack: 'Next.js 16 · Tailwind v4 · motion · three', theme: '다크 (#0a0a0b · 로고 블루)', what: '스튜디오 소개 사이트예요. 오버레이 메뉴, 등장 모션, 단어가 하나씩 켜지는 문장, 3D 유리 로고, 서비스 카드, 역량 카드, 번호 목록, 메타 표, 이메일 CTA, 캔버스 워드마크 푸터를 가져왔어요.' },
  { src: 'mom' as const, name: 'mom.efface.dev', stack: 'Vite · React 19 · Tailwind v4', theme: '라이트 + 네이비 푸터', what: '근무 안내 카드를 만드는 에디터예요. 여기서는 상단의 efface 배너와 하단 푸터만 가져왔어요.' },
]

export function OverviewPage() {
  return (
    <DocPage
      eyebrow="overview"
      title="efface design system"
      lead="efface 제품들이 함께 쓰는 색, 글꼴, 간격, 모션을 한곳에 모았어요. 바로 미리 보고, 코드는 복사해서 쓰면 됩니다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="한눈에 보기">
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

      <Section title="어디서 왔나" desc="새로 그린 게 아니라 실제 서비스에서 쓰고 있던 걸 옮겨왔어요. 항목마다 붙은 배지가 출처예요.">
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

      <Section title="지키는 것들" desc="컴포넌트를 새로 만들거나 고칠 때 이 기준을 따라요.">
        <ol className="grid gap-4 md:grid-cols-2">
          {[
            ['덜어내기', '검정 바탕에 흰 글자, 강조색은 하나면 충분해요. 카드, 그라데이션, 그림자는 꼭 필요할 때만.'],
            ['곡선은 하나', '등장과 전환은 전부 ease-out-expo (0.22, 1, 0.36, 1) 하나로 통일해요. 스태거는 0.06~0.07초.'],
            ['첫 화면은 CSS로', '첫 화면에 바로 보여야 하는 건 CSS 키프레임(rise-in)으로 띄워요. JS를 기다리지 않아도 되니까요. motion은 스크롤에 반응할 때만.'],
            ['움직임 줄이기 존중', '시스템에서 애니메이션 줄이기를 켰다면 모든 모션이 바로 끝 상태로 그려져요.'],
            ['모노 라벨', '섹션 제목 위에는 항상 // 로 시작하는 모노 라벨이 있어요. 번호도 모노 + 강조색.'],
            ['1px 선', '카드 사이 간격은 1px 선으로 나눠요. 테두리는 line 토큰, 강조하고 싶을 땐 fg.'],
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

      <Section title="둘러보기">
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
