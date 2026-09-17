import { useRef } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Footer } from '@/components/layout/Footer'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FooterV1 } from '@/components/layout/FooterV1'

const GROUPS = [
  { label: 'COMPANY', rows: [{ k: '상호', v: 'efface' }, { k: '대표', v: '서지완 ↗', href: 'https://www.linkedin.com/in/xixn2' }, { k: '소재지', v: '서울, 대한민국' }] },
  { label: 'CONTACT', rows: [{ k: '비즈니스', v: 'sales@efface.dev', href: 'mailto:sales@efface.dev' }, { k: '일반 문의', v: 'contact@efface.dev', href: 'mailto:contact@efface.dev' }, { k: '고객 지원', v: 'support@efface.dev', href: 'mailto:support@efface.dev' }] },
  { label: 'CHANNEL', rows: [{ k: '카카오톡', v: '@efface', href: 'https://pf.kakao.com/_zxmWKX/chat' }, { k: 'GitHub', v: 'efface-studio', href: 'https://github.com/efface-studio' }, { k: '응답', v: '평일 24시간 내' }] },
]
const POLICIES = [
  { t: '개인정보 처리방침', href: '#privacy', strong: true },
  { t: '서비스 이용약관', href: '#terms' },
  { t: '오픈소스 라이선스', href: '#oss' },
  { t: '쿠키 정책', href: '#cookies' },
  { t: '이메일무단수집거부', href: '#no-email' },
  { t: '보안 취약점 신고', href: '#security' },
]

export function FooterPage() {
  const v2Scroll = useRef<HTMLDivElement>(null)
  const momScroll = useRef<HTMLDivElement>(null)
  return (
    <DocPage
      eyebrow="layout"
      title="Footer"
      lead="세 사이트 세 푸터. v2 는 캔버스 워드마크와 스크롤 가역 진입 시퀀스, Mom-Work 는 같은 구조를 CSS 전환과 네이비 톤으로, v1 은 라이트 4열에 연락처 카드."
      sources={['v1', 'v2', 'mom']}
    >
      <Section
        title="Footer (v2)"
        desc="대각선 와이프가 블록을 드러내고 → 락업·메타 컬럼이 블러와 함께 스태거로 떠오르고 → 태그라인 취소선 → 워드마크가 왼쪽에서 벗겨지고 → 하단 바. 뷰포트를 떠나면 되감긴다. 워드마크는 캔버스: 흐린 사본 위에 커서 트레일이 지나간 곳만 그라데이션이 드러난다. 프리뷰 안을 아래로 스크롤한다."
        sources={['v2']}
      >
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`import { Footer } from '@/components/layout'

<Footer
  tagline="복잡함은 ~지우고~, 효과만 남깁니다."   {/* ~단어~ 가 취소선 */}
  groups={[{ label: 'COMPANY', rows: [{ k: '상호', v: 'efface' }, …] }, …]}
  policies={[{ t: '개인정보 처리방침', href: '/policies#privacy', strong: true }, …]}
  rights="© 2026 efface. All rights reserved."
  bottomLinks={[{ t: '개인정보처리방침', href: '/policies#privacy' }, …]}
/>`}
        >
          <div ref={v2Scroll} className="h-[560px] overflow-y-auto">
            <div className="flex h-[480px] items-end px-6 pb-8 text-sm text-fg-dim">↓ 아래로 스크롤</div>
            <Footer
              tagline="복잡함은 ~지우고~, 효과만 남깁니다."
              groups={GROUPS}
              policies={POLICIES}
              rights="© 2026 efface. All rights reserved."
              bottomLinks={[
                { t: '개인정보처리방침', href: '#privacy' },
                { t: '이용약관', href: '#terms' },
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
          워드마크는 Space Grotesk 를 캔버스에 텍스트로 그리므로 <code className="font-mono">document.fonts.ready</code> 뒤에 셋업한다. reduced-motion 이면 트레일을 한 번 가득 채워 풀컬러로 읽히고 시퀀스는 즉시 완료 상태.
        </Note>
      </Section>

      <Section
        title="SiteFooter (Mom-Work)"
        desc="v2 구조를 네이비 톤 + CSS 전환으로. 뷰포트에 들어오면 로고 글자 → 취소선(영/한) → 컬럼(왼→오 클립 리빌, 90ms 스태거) → CSS 워드마크 → 하단 바. 기본 컬럼 데이터가 내장되어 있다."
        sources={['mom']}
      >
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { SiteFooter, SITE_FOOTER_COLUMNS } from '@/components/layout'

<SiteFooter />                              {/* 기본 컬럼 */}
<SiteFooter columns={SITE_FOOTER_COLUMNS} taglineKo={{ before: '복잡함은 ', struck: '지우고', after: ', 효과만 남깁니다.' }} />`}
        >
          <div ref={momScroll} className="h-[560px] overflow-y-auto bg-[#f9fafb]">
            <div className="flex h-[420px] items-end px-6 pb-8 text-sm text-fg-dim">↓ 아래로 스크롤</div>
            <SiteFooter onToTop={() => momScroll.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>
        </Preview>
      </Section>

      <Section title="FooterV1 (efface.dev)" desc="라이트 4열. 대표 알약(LinkedIn), 주 연락처 카드는 호버 시 떠오르고 화살표 원이 잉크로 채워지며 45° 돈다. 보조 연락처 2열, 사이트맵·채널, 저작권 행." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`import { FooterV1 } from '@/components/layout'

<FooterV1
  tagline="필요한 것만 남기는 웹 외주 제작 스튜디오."
  ceo={{ label: 'CEO', name: '서지완', href: 'https://www.linkedin.com/in/xixn2' }}
  primary={{ label: 'project · sales', email: 'sales@efface.dev' }}
  secondary={[{ label: 'general', email: 'contact@efface.dev' }, { label: 'support', email: 'support@efface.dev' }]}
  sitemap={[{ label: '서비스', href: '#services' }, …]}
  channels={[{ label: '카카오톡 채널', href: '…', icon: 'kakao' }, { label: 'GitHub', href: '…', icon: 'github' }]}
  legal={[{ label: '개인정보처리방침', href: '/privacy' }, { label: '이용약관', href: '/terms' }]}
/>`}
        >
          <FooterV1
            tagline="필요한 것만 남기는 웹 외주 제작 스튜디오. 기획 · 디자인 · 개발 · 배포까지 한 곳에서."
            ceo={{ label: 'CEO', name: '서지완', href: 'https://www.linkedin.com/in/xixn2' }}
            primary={{ label: 'project · sales', email: 'sales@efface.dev' }}
            secondary={[
              { label: 'general', email: 'contact@efface.dev' },
              { label: 'support', email: 'support@efface.dev' },
            ]}
            sitemap={[
              { label: '서비스', href: '#services' },
              { label: '작업', href: '#work' },
              { label: '가격', href: '#pricing' },
              { label: '프로세스', href: '#process' },
              { label: 'FAQ', href: '#faq' },
            ]}
            channels={[
              { label: '카카오톡 채널', href: 'https://pf.kakao.com/_zxmWKX/chat', icon: 'kakao' },
              { label: 'GitHub', href: 'https://github.com/efface-studio', icon: 'github' },
            ]}
            legal={[
              { label: '개인정보처리방침', href: '#privacy' },
              { label: '이용약관', href: '#terms' },
            ]}
          />
        </Preview>
      </Section>
    </DocPage>
  )
}
