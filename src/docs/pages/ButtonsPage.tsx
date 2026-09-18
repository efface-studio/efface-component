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
      lead="v1의 잉크 채움 버튼과 Mom-Work 배너의 파란 알약 버튼, 두 계열을 variant와 pill 옵션으로 합쳤어요. 어딘가로 이동하면 ButtonLink, 무언가를 실행하면 Button을 쓰세요."
      sources={['v1', 'mom']}
    >
      <Section title="Variants">
        <Preview
          theme="light"
          code={`import { Button, ButtonLink } from '@/components/ui'

<Button variant="primary">Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent" pill>Get a quote →</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="kakao">KakaoTalk</Button>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent" pill>
              Get a quote →
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="kakao">KakaoTalk</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Preview>
        <Note>primary는 테마에 따라 뒤집혀요. 라이트에서는 잉크로, 다크에서는 흰색으로 채워져요. 프리뷰 테마를 바꿔서 확인해 보세요.</Note>
      </Section>

      <Section title="Sizes · 아이콘">
        <Preview
          theme="light"
          code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
  Get a free quote
</Button>
<ButtonLink href="mailto:sales@efface.dev" variant="secondary" size="lg" leading={<Mail size={15} />}>
  Email
</ButtonLink>`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
              Get a free quote
            </Button>
            <ButtonLink href="mailto:sales@efface.dev" variant="secondary" size="lg" leading={<Mail size={15} />}>
              Email
            </ButtonLink>
            <Button size="lg" variant="accent" pill trailing={<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}>
              Book a tech call
            </Button>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'variant', type: "'primary' | 'secondary' | 'accent' | 'ghost' | 'kakao'", default: "'primary'", desc: '채움 방식' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", desc: 'h-9 / h-11 / h-12' },
            { name: 'pill', type: 'boolean', default: 'false', desc: 'rounded-full' },
            { name: 'leading / trailing', type: 'ReactNode', desc: '아이콘 슬롯. 버튼은 group 이라 group-hover:* 로 움직여요.' },
          ]}
        />
      </Section>

      <Section title="자석 버튼" desc="가장 중요한 버튼 하나만 MagneticButton으로 감싸세요. 커서 쪽으로 최대 14px 끌려와요." sources={['v1']}>
        <Preview
          theme="light"
          center
          minHeight={200}
          code={`import { MagneticButton } from '@/components/motion'

<MagneticButton>
  <ButtonLink href="/apply" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
    Start a project
  </ButtonLink>
</MagneticButton>
<MagneticButton strength={8}>
  <ButtonLink href="#work" variant="secondary" size="lg">See our work</ButtonLink>
</MagneticButton>`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton>
              <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                Start a project
              </ButtonLink>
            </MagneticButton>
            <MagneticButton strength={8}>
              <ButtonLink href="#" variant="secondary" size="lg">
                See our work
              </ButtonLink>
            </MagneticButton>
          </div>
        </Preview>
      </Section>

      <Section title="텍스트 링크" desc="밑줄이 움직이는 링크예요. grow는 왼쪽에서 자라나고, sweep은 파란 선이 오른쪽으로 빠졌다가 왼쪽에서 다시 들어와요(v2 푸터).">
        <Preview
          theme="dark"
          code={`import { LinkUnderline } from '@/components/ui'

<LinkUnderline href="mailto:contact@efface.dev">contact@efface.dev</LinkUnderline>
<LinkUnderline href="/policies" variant="sweep">Privacy policy</LinkUnderline>

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
                Privacy policy
              </LinkUnderline>
              <LinkUnderline href="#" variant="sweep">
                Terms of service
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
