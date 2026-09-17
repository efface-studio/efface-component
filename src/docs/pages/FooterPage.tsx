import { useRef } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Footer } from '@/components/layout/Footer'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FooterV1 } from '@/components/layout/FooterV1'

const GROUPS = [
  { label: 'COMPANY', rows: [{ k: 'Company', v: 'efface' }, { k: 'CEO', v: 'Jiwan Seo ↗', href: 'https://www.linkedin.com/in/xixn2' }, { k: 'Based in', v: 'Seoul, Korea' }] },
  { label: 'CONTACT', rows: [{ k: 'Business', v: 'sales@efface.dev', href: 'mailto:sales@efface.dev' }, { k: 'General', v: 'contact@efface.dev', href: 'mailto:contact@efface.dev' }, { k: 'Support', v: 'support@efface.dev', href: 'mailto:support@efface.dev' }] },
  { label: 'CHANNEL', rows: [{ k: 'KakaoTalk', v: '@efface', href: 'https://pf.kakao.com/_zxmWKX/chat' }, { k: 'GitHub', v: 'efface-studio', href: 'https://github.com/efface-studio' }, { k: 'Response', v: 'Within 24h, weekdays' }] },
]
const POLICIES = [
  { t: 'Privacy policy', href: '#privacy', strong: true },
  { t: 'Terms of service', href: '#terms' },
  { t: 'Open source licenses', href: '#oss' },
  { t: 'Cookie policy', href: '#cookies' },
  { t: 'No unsolicited email', href: '#no-email' },
  { t: 'Report a vulnerability', href: '#security' },
]

export function FooterPage() {
  const v2Scroll = useRef<HTMLDivElement>(null)
  const momScroll = useRef<HTMLDivElement>(null)
  return (
    <DocPage
      eyebrow="layout"
      title="Footer"
      lead="사이트마다 푸터가 하나씩, 셋이에요. v2는 캔버스에 그린 워드마크와 스크롤에 따라 되감기는 등장 시퀀스, Mom-Work는 같은 구조를 CSS와 네이비 톤으로, v1은 밝은 4열에 연락처 카드예요."
      sources={['v1', 'v2', 'mom']}
    >
      <Section
        title="Footer (v2)"
        desc="대각선으로 쓸리며 나타나고, 로고와 정보 열이 흐릿한 채로 차례로 떠오르고, 태그라인에 취소선이 그어지고, 워드마크가 왼쪽부터 벗겨지고, 마지막에 하단 줄. 화면 밖으로 나가면 거꾸로 되감겨요. 워드마크는 캔버스라서 마우스가 지나간 자리만 색이 드러나요. 프리뷰 안을 아래로 스크롤해 보세요."
        sources={['v2']}
      >
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`import { Footer } from '@/components/layout'

<Footer
  tagline="Erase the ~complexity~, keep the effect."   {/* ~word~ gets the strike */}
  groups={[{ label: 'COMPANY', rows: [{ k: 'Company', v: 'efface' }, …] }, …]}
  policies={[{ t: 'Privacy policy', href: '/policies#privacy', strong: true }, …]}
  rights="© 2026 efface. All rights reserved."
  bottomLinks={[{ t: 'Privacy', href: '/policies#privacy' }, …]}
/>`}
        >
          <div ref={v2Scroll} className="h-[560px] overflow-y-auto">
            <div className="flex h-[480px] items-end px-6 pb-8 text-sm text-fg-dim">↓ Scroll down</div>
            <Footer
              tagline="Erase the ~complexity~, keep the effect."
              groups={GROUPS}
              policies={POLICIES}
              rights="© 2026 efface. All rights reserved."
              bottomLinks={[
                { t: 'Privacy', href: '#privacy' },
                { t: 'Terms', href: '#terms' },
              ]}
              onToTop={() => v2Scroll.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'tagline', type: 'string', desc: '~단어~ 로 취소선 단어 표시' },
            { name: 'groups', type: 'FooterGroup[]', desc: '메타 컬럼. 직계 자식 순서로 스태거' },
            { name: 'policies', type: 'FooterPolicy[]', desc: '정책 컬럼. strong 은 굵게' },
            { name: 'bottomLinks / rights / toTopLabel', type: '…', desc: '하단 바' },
            { name: 'onToTop', type: '() => void', desc: '맨 위로 — 기본은 window.scrollTo' },
          ]}
        />
        <Note>
          워드마크는 Space Grotesk를 캔버스에 글자로 그리기 때문에 <code className="font-mono">document.fonts.ready</code>를 기다린 뒤에 준비해요. 애니메이션 줄이기를 켜면 처음부터 전체 색으로 보이고 시퀀스도 완료 상태로 시작해요.
        </Note>
      </Section>

      <Section
        title="SiteFooter (Mom-Work)"
        desc="v2 구조를 네이비 톤과 CSS 전환으로 다시 만든 푸터예요. 화면에 들어오면 로고 글자가 한 자씩, 태그라인 취소선, 정보 열이 왼쪽부터 차례로, 그다음 워드마크와 하단 줄이 나타나요. 기본 정보는 컴포넌트 안에 들어 있어요."
        sources={['mom']}
      >
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { SiteFooter, SITE_FOOTER_COLUMNS } from '@/components/layout'

<SiteFooter />                              {/* 기본 컬럼 */}
<SiteFooter columns={SITE_FOOTER_COLUMNS} subline={{ before: 'Less, but ', struck: 'louder', after: ' — sharper.' }} />`}
        >
          <div ref={momScroll} className="h-[560px] overflow-y-auto bg-[#f9fafb]">
            <div className="flex h-[420px] items-end px-6 pb-8 text-sm text-fg-dim">↓ Scroll down</div>
            <SiteFooter onToTop={() => momScroll.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>
        </Preview>
      </Section>

      <Section title="FooterV1 (efface.dev)" desc="밝은 배경의 4열 푸터예요. 대표 이름 알약, 마우스를 올리면 떠오르면서 화살표가 45° 도는 연락처 카드, 그 아래 보조 연락처, 사이트맵과 채널, 저작권 줄로 되어 있어요." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { FooterV1 } from '@/components/layout'

<FooterV1
  tagline="A web studio that keeps only what matters."
  ceo={{ label: 'CEO', name: 'Jiwan Seo', href: 'https://www.linkedin.com/in/xixn2' }}
  primary={{ label: 'project · sales', email: 'sales@efface.dev' }}
  secondary={[{ label: 'general', email: 'contact@efface.dev' }, { label: 'support', email: 'support@efface.dev' }]}
  sitemap={[{ label: 'Services', href: '#services' }, …]}
  channels={[{ label: 'KakaoTalk channel', href: '…', icon: 'kakao' }, { label: 'GitHub', href: '…', icon: 'github' }]}
  legal={[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }]}
/>`}
        >
          <FooterV1
            tagline="A web studio that keeps only what matters. Planning · design · build · launch, in one place."
            ceo={{ label: 'CEO', name: 'Jiwan Seo', href: 'https://www.linkedin.com/in/xixn2' }}
            primary={{ label: 'project · sales', email: 'sales@efface.dev' }}
            secondary={[
              { label: 'general', email: 'contact@efface.dev' },
              { label: 'support', email: 'support@efface.dev' },
            ]}
            sitemap={[
              { label: 'Services', href: '#services' },
              { label: 'Work', href: '#work' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Process', href: '#process' },
              { label: 'FAQ', href: '#faq' },
            ]}
            channels={[
              { label: 'KakaoTalk channel', href: 'https://pf.kakao.com/_zxmWKX/chat', icon: 'kakao' },
              { label: 'GitHub', href: 'https://github.com/efface-studio', icon: 'github' },
            ]}
            legal={[
              { label: 'Privacy', href: '#privacy' },
              { label: 'Terms', href: '#terms' },
            ]}
          />
        </Preview>
      </Section>
    </DocPage>
  )
}
