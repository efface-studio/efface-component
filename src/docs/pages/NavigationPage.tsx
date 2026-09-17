import { useRef, useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Nav } from '@/components/layout/Nav'
import { Header } from '@/components/layout/Header'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { LinkUnderline } from '@/components/ui/LinkUnderline'
import { Button, ButtonLink } from '@/components/ui/Button'
import { PilotBadge } from '@/components/ui/Badge'
import { NumberedRow } from '@/components/ui/NumberedRow'
import { CursorGlow } from '@/components/motion/CursorGlow'

const V2_ITEMS = [
  { label: '만든 앱', href: '#apps' },
  { label: '기술 역량', href: '#capabilities' },
  { label: '소개', href: '#about' },
  { label: '연락처', href: '#contact' },
]
const V1_ITEMS = [
  { label: '서비스', href: '#services' },
  { label: '작업', href: '#work' },
  { label: '가격', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]
const ROWS = [
  { no: '01', title: '본질만 남기는 설계', desc: '화려함보다 명료함. 정말 필요한 것만 남을 때까지 덜어냅니다.' },
  { no: '02', title: '검증된 기술만', desc: '유행이 아니라 오래 살아남는 도구.' },
  { no: '03', title: '끝까지 책임지는 완성도', desc: '배포로 끝이 아니라, 실제로 잘 돌아가는 상태까지.' },
]

export function NavigationPage() {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko')
  const [menuOpen, setMenuOpen] = useState(false)
  const v2Scroll = useRef<HTMLDivElement>(null)
  const v1Scroll = useRef<HTMLDivElement>(null)

  return (
    <DocPage
      eyebrow="layout"
      title="Navigation"
      lead="v2 는 맨 위에서만 보이는 얇은 바 + 전체 화면 오버레이 메뉴, v1 은 스크롤하면 반투명해지는 고정 헤더. 프리뷰 안을 스크롤하거나 메뉴를 열어 동작을 본다."
      sources={['v1', 'v2']}
    >
      <Section
        title="Nav (v2)"
        desc="바는 8px 이상 스크롤하면 위로 빠진다 — 아래 씬의 거대 타이포가 뷰포트 끝까지 흐르는데 고정 바가 그걸 잘랐다. 햄버거는 두 선이 45° 로 교차해 × 가 되고, 메뉴 항목은 자기 클립 박스 안에서 스태거로 올라온다. ESC · 배경 스크롤 잠금."
        sources={['v2']}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => v2Scroll.current?.scrollTo({ top: v2Scroll.current.scrollTop > 0 ? 0 : 320, behavior: 'smooth' })}>
            스크롤 토글
          </Button>
        </div>
        <Preview
          theme="dark"
          bleed
          code={`import { Nav, LanguageToggle } from '@/components/layout'

<Nav
  items={[{ label: '만든 앱', href: '#apps' }, …]}
  homeHref="/"
  aside={<LanguageToggle locales={['ko', 'en']} value={locale} onChange={setLocale} />}
  overlayFooter={<>
    <LinkUnderline href="mailto:contact@efface.dev" className="text-sm text-fg-dim hover:text-fg">contact@efface.dev</LinkUnderline>
    <LanguageToggle … />
  </>}
/>`}
        >
          <div ref={v2Scroll} className="relative h-[520px] overflow-y-auto">
            <Nav
              contained
              scrollTarget={v2Scroll}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              items={V2_ITEMS}
              aside={<LanguageToggle locales={['ko', 'en'] as const} value={locale} onChange={setLocale} />}
              overlayFooter={
                <>
                  <LinkUnderline href="mailto:contact@efface.dev" className="text-sm text-fg-dim hover:text-fg">
                    contact@efface.dev
                  </LinkUnderline>
                  <LanguageToggle locales={['ko', 'en'] as const} value={locale} onChange={setLocale} />
                </>
              }
            />
            <div className="flex h-[520px] flex-col justify-end bg-[radial-gradient(ellipse_at_85%_35%,#1b2340,transparent_55%)] px-6 pb-14 md:px-10">
              <p className="rise-in flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-fg-dim uppercase">
                <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · 웹 · 앱 개발 스튜디오
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl">
                <span className="rise-in rise-d1 block">복잡함은 지우고,</span>
                <span className="rise-in rise-d2 block">효과만 남깁니다.</span>
              </h2>
              <p className="rise-in rise-d3 mt-6 max-w-md text-fg-dim">아래로 스크롤하면 바가 사라지고, 맨 위로 오면 다시 나타난다.</p>
            </div>
            <div className="border-t border-line px-6 py-16 md:px-10">
              <p className="label">
                <span className="text-accent">//</span> approach
              </p>
              <ul className="mt-8 border-t border-line">
                {ROWS.map((r) => (
                  <NumberedRow key={r.no} {...r} />
                ))}
              </ul>
            </div>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'items', type: '{ label; href }[]', desc: '오버레이 메뉴 항목. 01, 02… 번호가 자동으로 붙는다' },
            { name: 'aside', type: 'ReactNode', desc: '바 오른쪽 슬롯 (언어 토글)' },
            { name: 'overlayFooter', type: 'ReactNode', desc: '오버레이 하단 슬롯' },
            { name: 'hideAfter', type: 'number', default: '8', desc: '이 px 이상 스크롤하면 바가 숨는다' },
            { name: 'open / onOpenChange', type: 'boolean / (v) => void', desc: '제어 모드' },
            { name: 'contained / scrollTarget', type: 'boolean / RefObject', desc: 'fixed 대신 absolute · 창 대신 이 컨테이너의 스크롤을 본다' },
          ]}
        />
      </Section>

      <Section title="Header (v1)" desc="처음엔 투명, 8px 이상 스크롤하면 흰 반투명 + 블러 + 하단 선이 생긴다. 아래 히어로에는 커서 글로우와 점 격자가 깔려 있다 — 마우스를 움직여 본다." sources={['v1']}>
        <Button size="sm" variant="secondary" onClick={() => v1Scroll.current?.scrollTo({ top: v1Scroll.current.scrollTop > 0 ? 0 : 300, behavior: 'smooth' })}>
          스크롤 토글
        </Button>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { Header } from '@/components/layout'
import { CursorGlow } from '@/components/motion'

<Header
  items={[{ label: '서비스', href: '#services' }, …]}
  actions={<>
    <a href="mailto:sales@efface.dev" className="hidden h-9 w-9 items-center justify-center rounded-md text-fg-dim transition hover:bg-line/40 hover:text-fg md:inline-flex"><Mail size={16} /></a>
    <ButtonLink href="/apply" size="sm" className="ml-2">프로젝트 신청</ButtonLink>
  </>}
/>
<CursorGlow dots className="pt-36 pb-24">…히어로…</CursorGlow>`}
        >
          <div ref={v1Scroll} className="relative h-[520px] overflow-y-auto">
            <Header
              contained
              scrollTarget={v1Scroll}
              items={V1_ITEMS}
              actions={
                <>
                  <a href="mailto:sales@efface.dev" aria-label="Email" className="hidden h-9 w-9 items-center justify-center rounded-md text-fg-dim transition hover:bg-line/40 hover:text-fg md:inline-flex">
                    <Mail size={16} />
                  </a>
                  <ButtonLink href="#" size="sm" className="ml-2">
                    프로젝트 신청
                  </ButtonLink>
                </>
              }
            />
            <CursorGlow dots className="border-b border-line px-5 pt-32 pb-20 md:px-8">
              <div className="max-w-xl">
                <PilotBadge>2026 Q3 신규 프로젝트 모집 중</PilotBadge>
                <h2 className="rise-in rise-d1 mt-6 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  웹사이트 외주,
                  <br />
                  <span className="text-fg-dim">막막하셨다면.</span>
                </h2>
                <p className="rise-in rise-d2 mt-6 max-w-lg text-fg-dim">기획 · 디자인 · 개발 · 배포까지 한 곳에서. 1~3주, 35만원부터.</p>
                <div className="rise-in rise-d3 mt-8 flex gap-3">
                  <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                    무료 견적 받기
                  </ButtonLink>
                  <ButtonLink href="#" size="lg" variant="secondary">
                    작업 보기
                  </ButtonLink>
                </div>
              </div>
            </CursorGlow>
            <div className="px-5 py-16 text-sm text-fg-dim md:px-8">스크롤하면 헤더에 반투명 배경과 블러가 생긴다.</div>
          </div>
        </Preview>
      </Section>

      <Section title="LanguageToggle" desc="KO / EN. 제어 컴포넌트 — 라우팅(next-intl 등)은 바깥에서 한다." sources={['v2']}>
        <Preview theme="dark" code={`<LanguageToggle locales={['ko', 'en']} value={locale} onChange={setLocale} />`}>
          <LanguageToggle locales={['ko', 'en'] as const} value={locale} onChange={setLocale} />
        </Preview>
        <Note>v1 은 Globe 아이콘 + 네이티브 select 였다. 커스텀 UI 원칙에 따라 v2 의 텍스트 토글로 통일한다.</Note>
      </Section>
    </DocPage>
  )
}
