import { useState } from 'react'
import { Mail } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Nav } from '@/components/layout/Nav'
import { Header } from '@/components/layout/Header'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { LinkUnderline } from '@/components/ui/LinkUnderline'
import { ButtonLink } from '@/components/ui/Button'

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

export function NavigationPage() {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko')
  return (
    <DocPage
      eyebrow="layout"
      title="Navigation"
      lead="v2 는 맨 위에서만 보이는 얇은 바 + 전체 화면 오버레이 메뉴, v1 은 스크롤하면 반투명해지는 고정 헤더. 언어 토글은 제어 컴포넌트다."
      sources={['v1', 'v2']}
    >
      <Section title="Nav (v2)" desc="바는 8px 이상 스크롤하면 사라진다 — 아래 씬의 거대 타이포가 뷰포트 끝까지 흐르는데 고정 바가 그걸 잘랐다. 햄버거는 두 선이 45° 로 교차해 × 가 되고, 메뉴 항목은 자기 클립 박스 안에서 스태거로 올라온다. ESC · 배경 스크롤 잠금." sources={['v2']}>
        <Preview
          theme="dark"
          bleed
          minHeight={480}
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
          <div className="relative h-[480px] overflow-hidden">
            <Nav
              contained
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
            <div className="flex h-full flex-col justify-end px-6 pb-12 md:px-10">
              <p className="label">
                <span className="text-accent">//</span> 햄버거를 눌러 오버레이 메뉴를 연다
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight">복잡함은 지우고,</h2>
            </div>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'items', type: '{ label; href }[]', desc: '오버레이 메뉴 항목. 01, 02… 번호가 자동으로 붙는다' },
            { name: 'aside', type: 'ReactNode', desc: '바 오른쪽 슬롯 (언어 토글)' },
            { name: 'overlayFooter', type: 'ReactNode', desc: '오버레이 하단 슬롯' },
            { name: 'hideAfter', type: 'number', default: '8', desc: '이 px 이상 스크롤하면 바가 숨는다' },
            { name: 'contained', type: 'boolean', default: 'false', desc: 'fixed 대신 absolute — 프리뷰용' },
          ]}
        />
      </Section>

      <Section title="Header (v1)" desc="처음엔 투명, 8px 이상 스크롤하면 흰 반투명 + 블러 + 하단 선. 데스크톱 텍스트 링크, 오른쪽에 아이콘 버튼·언어·CTA." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          bleed
          minHeight={200}
          code={`import { Header } from '@/components/layout'

<Header
  items={[{ label: '서비스', href: '#services' }, …]}
  actions={<>
    <a href="mailto:sales@efface.dev" className="hidden h-9 w-9 items-center justify-center rounded-md text-fg-dim transition hover:bg-line/40 hover:text-fg md:inline-flex"><Mail size={16} /></a>
    <ButtonLink href="/apply" size="sm" className="ml-2">프로젝트 신청</ButtonLink>
  </>}
/>`}
        >
          <div className="relative h-[200px]">
            <Header
              contained
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
            <div className="flex h-full items-end px-5 pb-8 text-sm text-fg-dim md:px-8">실제 페이지에서는 스크롤 시 배경이 생긴다.</div>
          </div>
        </Preview>
      </Section>

      <Section title="LanguageToggle" desc="KO / EN. 제어 컴포넌트 — 라우팅(next-intl 등)은 바깥에서 한다." sources={['v2']}>
        <Preview
          theme="dark"
          code={`<LanguageToggle locales={['ko', 'en']} value={locale} onChange={setLocale} />`}
        >
          <LanguageToggle locales={['ko', 'en'] as const} value={locale} onChange={setLocale} />
        </Preview>
        <Note>v1 은 Globe 아이콘 + 네이티브 select 였다. 커스텀 UI 원칙에 따라 v2 의 텍스트 토글로 통일한다.</Note>
      </Section>
    </DocPage>
  )
}
