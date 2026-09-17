import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Button, ButtonLink } from '@/components/ui/Button'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { LinkUnderline } from '@/components/ui/LinkUnderline'

export function ButtonsPage() {
  return (
    <DocPage
      eyebrow="components"
      title="Buttons"
      lead="v1 의 잉크 채움 CTA(h-12 px-6 rounded-md)와 Mom-Work 배너의 블루 알약(rounded-full) 두 계열을 variant / pill 로 합쳤다. 이동은 ButtonLink, 동작은 Button."
      sources={['v1', 'mom']}
    >
      <Section title="Variants">
        <Preview
          theme="light"
          code={`import { Button, ButtonLink } from '@/components/ui'

<Button variant="primary">무료 견적 받기</Button>
<Button variant="secondary">작업 사례 보기</Button>
<Button variant="accent" pill>무료 견적 받기 →</Button>
<Button variant="ghost">취소</Button>
<Button variant="kakao">카카오톡 상담</Button>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">무료 견적 받기</Button>
            <Button variant="secondary">작업 사례 보기</Button>
            <Button variant="accent" pill>
              무료 견적 받기 →
            </Button>
            <Button variant="ghost">취소</Button>
            <Button variant="kakao">카카오톡 상담</Button>
            <Button variant="primary" disabled>
              비활성
            </Button>
          </div>
        </Preview>
        <Note>primary 는 테마에 따라 반전된다 — 라이트에서 잉크 채움, 다크에서 흰 채움. 프리뷰 테마를 바꿔 확인한다.</Note>
      </Section>

      <Section title="Sizes · 아이콘">
        <Preview
          theme="light"
          code={`<Button size="sm">작게</Button>
<Button size="md">기본</Button>
<Button size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
  무료 견적 받기
</Button>
<ButtonLink href="mailto:sales@efface.dev" variant="secondary" size="lg" leading={<Mail size={15} />}>
  이메일
</ButtonLink>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">작게</Button>
            <Button size="md">기본</Button>
            <Button size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
              무료 견적 받기
            </Button>
            <ButtonLink href="mailto:sales@efface.dev" variant="secondary" size="lg" leading={<Mail size={15} />}>
              이메일
            </ButtonLink>
            <Button size="lg" variant="accent" pill trailing={<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}>
              기술 상담 요청
            </Button>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'variant', type: "'primary' | 'secondary' | 'accent' | 'ghost' | 'kakao'", default: "'primary'", desc: '채움 방식' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'h-9 / h-11 / h-12' },
            { name: 'pill', type: 'boolean', default: 'false', desc: 'rounded-full' },
            { name: 'leading / trailing', type: 'ReactNode', desc: '아이콘 슬롯. 버튼은 group 이라 group-hover:* 로 움직인다.' },
          ]}
        />
      </Section>

      <Section title="자석 CTA" desc="주요 CTA 하나에만 MagneticButton 으로 감싼다. 커서 쪽으로 최대 14px 끌린다." sources={['v1']}>
        <Preview
          theme="light"
          center
          minHeight={200}
          code={`import { MagneticButton } from '@/components/motion'

<MagneticButton>
  <ButtonLink href="/apply" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
    프로젝트 시작하기
  </ButtonLink>
</MagneticButton>
<MagneticButton strength={8}>
  <ButtonLink href="#work" variant="secondary" size="lg">작업 보기</ButtonLink>
</MagneticButton>`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton>
              <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                프로젝트 시작하기
              </ButtonLink>
            </MagneticButton>
            <MagneticButton strength={8}>
              <ButtonLink href="#" variant="secondary" size="lg">
                작업 보기
              </ButtonLink>
            </MagneticButton>
          </div>
        </Preview>
      </Section>

      <Section title="텍스트 링크" desc="밑줄이 움직이는 링크. grow 는 왼쪽에서 자라고(v1·v2 공통), sweep 은 파란 선이 오른쪽으로 빠졌다 왼쪽에서 들어온다(v2 푸터).">
        <Preview
          theme="dark"
          code={`import { LinkUnderline } from '@/components/ui'

<LinkUnderline href="mailto:contact@efface.dev">contact@efface.dev</LinkUnderline>
<LinkUnderline href="/policies" variant="sweep">개인정보 처리방침</LinkUnderline>

{/* v2 Contact — 거대 이메일 링크 */}
<a href="mailto:…" className="group inline-flex items-center gap-3 text-3xl font-semibold tracking-tight md:text-5xl">
  <span className="link-underline">contact@efface.dev</span>
  <ArrowUpRight className="h-8 w-8 text-accent transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
</a>`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-8 text-sm text-fg-dim">
              <LinkUnderline href="#" className="hover:text-fg">
                contact@efface.dev
              </LinkUnderline>
              <LinkUnderline href="#" variant="sweep">
                개인정보 처리방침
              </LinkUnderline>
              <LinkUnderline href="#" variant="sweep">
                서비스 이용약관
              </LinkUnderline>
            </div>
            <a href="#" className="group inline-flex items-center gap-3 text-2xl font-semibold tracking-tight md:text-4xl">
              <span className="link-underline">contact@efface.dev</span>
              <ArrowUpRight className="h-7 w-7 text-accent transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.75} />
            </a>
          </div>
        </Preview>
      </Section>
    </DocPage>
  )
}
