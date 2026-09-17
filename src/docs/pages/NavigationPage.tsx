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
  { label: 'Apps', href: '#apps' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]
const V1_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]
const ROWS = [
  { no: '01', title: 'Keep the essence', desc: 'Clarity over flair. We cut until only what matters is left.' },
  { no: '02', title: 'Proven tools only', desc: 'Tools that last, not tools that trend.' },
  { no: '03', title: 'Own it to the end', desc: 'Not shipped — working.' },
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
      lead="v2는 맨 위에서만 보이는 얇은 바와 전체 화면 메뉴, v1은 스크롤하면 반투명해지는 고정 헤더예요. 프리뷰 안을 스크롤하거나 메뉴를 열어서 직접 확인해 보세요."
      sources={['v1', 'v2']}
    >
      <Section
        title="Nav (v2)"
        desc="조금만 스크롤해도 바가 위로 사라져요. 아래 씬의 큰 글자가 화면 끝까지 흐르는데 고정 바가 그걸 가렸거든요. 햄버거 두 줄은 45°로 교차해 ×가 되고, 메뉴 항목은 각자의 칸 안에서 차례로 올라와요. ESC로 닫히고, 열려 있는 동안 뒤는 스크롤되지 않아요."
        sources={['v2']}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? 'Close menu' : 'Open menu'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => v2Scroll.current?.scrollTo({ top: v2Scroll.current.scrollTop > 0 ? 0 : 320, behavior: 'smooth' })}>
            Toggle scroll
          </Button>
        </div>
        <Preview
          theme="dark"
          bleed
          code={`import { Nav, LanguageToggle } from '@/components/layout'

<Nav
  items={[{ label: 'Apps', href: '#apps' }, …]}
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
                <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · web · app studio
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl">
                <span className="rise-in rise-d1 block">Erase the complexity.</span>
                <span className="rise-in rise-d2 block">Keep the effect.</span>
              </h2>
              <p className="rise-in rise-d3 mt-6 max-w-md text-fg-dim">Scroll down and the bar retracts; back at the top it returns.</p>
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
            { name: 'items', type: '{ label; href }[]', desc: '오버레이 메뉴 항목. 01, 02… 번호가 자동으로 붙어요' },
            { name: 'aside', type: 'ReactNode', desc: '바 오른쪽 슬롯 (언어 토글)' },
            { name: 'overlayFooter', type: 'ReactNode', desc: '오버레이 하단 슬롯' },
            { name: 'hideAfter', type: 'number', default: '8', desc: '이 px 이상 스크롤하면 바가 숨어요' },
            { name: 'open / onOpenChange', type: 'boolean / (v) => void', desc: '제어 모드' },
            { name: 'contained / scrollTarget', type: 'boolean / RefObject', desc: 'fixed 대신 absolute · 창 대신 이 컨테이너의 스크롤을 봐요' },
          ]}
        />
      </Section>

      <Section title="Header (v1)" desc="처음엔 투명하다가 스크롤하면 흰 반투명 배경과 블러, 아래 선이 생겨요. 아래 히어로에는 커서를 따라오는 글로우와 점 격자가 깔려 있으니 마우스를 움직여 보세요." sources={['v1']}>
        <Button size="sm" variant="secondary" onClick={() => v1Scroll.current?.scrollTo({ top: v1Scroll.current.scrollTop > 0 ? 0 : 300, behavior: 'smooth' })}>
          Toggle scroll
        </Button>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { Header } from '@/components/layout'
import { CursorGlow } from '@/components/motion'

<Header
  items={[{ label: 'Services', href: '#services' }, …]}
  actions={<>
    <a href="mailto:sales@efface.dev" className="hidden h-9 w-9 items-center justify-center rounded-md text-fg-dim transition hover:bg-line/40 hover:text-fg md:inline-flex"><Mail size={16} /></a>
    <ButtonLink href="/apply" size="sm" className="ml-2">Start a project</ButtonLink>
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
                    Start a project
                  </ButtonLink>
                </>
              }
            />
            <CursorGlow dots className="border-b border-line px-5 pt-32 pb-20 md:px-8">
              <div className="max-w-xl">
                <PilotBadge>Now taking Q3 2026 projects</PilotBadge>
                <h2 className="rise-in rise-d1 mt-6 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  Website outsourcing,
                  <br />
                  <span className="text-fg-dim">minus the headache.</span>
                </h2>
                <p className="rise-in rise-d2 mt-6 max-w-lg text-fg-dim">Planning · design · build · launch, in one place. 1–3 weeks, from ₩350K.</p>
                <div className="rise-in rise-d3 mt-8 flex gap-3">
                  <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                    Get a free quote
                  </ButtonLink>
                  <ButtonLink href="#" size="lg" variant="secondary">
                    See our work
                  </ButtonLink>
                </div>
              </div>
            </CursorGlow>
            <div className="px-5 py-16 text-sm text-fg-dim md:px-8">Scroll — the header picks up a translucent, blurred backdrop.</div>
          </div>
        </Preview>
      </Section>

      <Section title="LanguageToggle" desc="KO / EN 전환이에요. 값과 onChange를 받는 제어 컴포넌트라 실제 라우팅은 바깥에서 처리해요." sources={['v2']}>
        <Preview theme="dark" code={`<LanguageToggle locales={['ko', 'en']} value={locale} onChange={setLocale} />`}>
          <LanguageToggle locales={['ko', 'en'] as const} value={locale} onChange={setLocale} />
        </Preview>
        <Note>v1은 지구본 아이콘에 브라우저 기본 select였어요. 커스텀 UI 원칙에 맞춰 v2의 텍스트 토글로 통일했어요.</Note>
      </Section>
    </DocPage>
  )
}
