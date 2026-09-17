import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Building2, Globe, Shield, ShoppingBag, Zap } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { AppCard, BrowserFrame, CapabilityCard, CardCell, CardGrid, PricingCard, TerminalCard, TestimonialCard } from '@/components/ui/Card'
import { APP_CARDS } from '@/components/ui/card.constants'
import { IconTile } from '@/components/ui/IconTile'
import { ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TiltCard } from '@/components/motion/TiltCard'
import { LogoMark } from '@/components/brand/LogoMark'
import { AppIcon3D } from '@/components/brand/AppIcon3D'
import { APP_ICONS } from '@/components/brand/appIcons'

const SERVICES = [
  { icon: Globe, title: 'Landing page', desc: 'Launches, campaigns, hiring pages', period: '1–2 wks', from: '₩350K' },
  { icon: Building2, title: 'Brand site', desc: 'Company, portfolio, careers', period: '2–3 wks', from: '₩600K' },
  { icon: ShoppingBag, title: 'Commerce', desc: 'Payments · inventory · orders', period: '3–5 wks', from: '₩700K' },
]

const CAPS = [
  { no: '01', title: 'AI engineering', items: ['Design, build and ship LLM features', 'Agents · tool calling · automation pipelines', 'RAG and vector search that hold up in production'], tools: ['Claude', 'OpenAI', 'Vercel AI SDK', 'pgvector'] },
  { no: '02', title: 'Web engineering', items: ['Full-stack on Next.js App Router', 'Server components · streaming · caching', 'i18n · SEO · accessibility by default'], tools: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
]

export function CardsPage() {
  return (
    <DocPage
      eyebrow="components"
      title="Cards"
      lead="1px 선 그리드 셀(v1), 창 크롬이 달린 터미널·브라우저 프레임(v1), 가격·후기 카드(v1), 역량 카드(v2), 그리고 조명이 들어간 서비스 카드 표면(v2)."
      sources={['v1', 'v2']}
    >
      <Section title="CardGrid · CardCell" desc="셀 사이를 gap-px + 배경 line 색으로 나눈다. CardCell 은 whileHover=hover 를 걸어 두어 자식 IconTile 이 스프링으로 반응한다. tint 는 배경 옅어짐, underline 은 바닥 선." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { CardGrid, CardCell, IconTile } from '@/components/ui'

<CardGrid cols={3}>
  {items.map((it) => (
    <CardCell key={it.title} tint>
      <div className="mb-5 flex items-start justify-between">
        <IconTile rotate={-8}><Globe size={18} /></IconTile>
        <ArrowUpRight size={16} className="text-fg-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
      <h3 className="text-lg font-semibold">{it.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-dim">{it.desc}</p>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">…</div>
    </CardCell>
  ))}
</CardGrid>`}
        >
          <CardGrid cols={3}>
            {SERVICES.map((it) => (
              <CardCell key={it.title} tint>
                <div className="mb-5 flex items-start justify-between">
                  <IconTile rotate={-8}>
                    <it.icon size={18} />
                  </IconTile>
                  <ArrowUpRight size={16} className="text-fg-faint transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
                </div>
                <h3 className="text-lg font-semibold">{it.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-dim">{it.desc}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
                  <div>
                    <div className="mb-0.5 text-[11px] text-fg-dim">Timeline</div>
                    <div className="font-medium tabular-nums">{it.period}</div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[11px] text-fg-dim">From</div>
                    <div className="font-medium tabular-nums">{it.from}</div>
                  </div>
                </div>
              </CardCell>
            ))}
          </CardGrid>
        </Preview>
        <Preview
          theme="light"
          code={`{/* Manifesto — 각진 2열, 호버 시 바닥 선 + 아이콘 타일 잉크 반전 */}
<CardGrid cols={2} rounded={false}>
  <CardCell underline className="p-7 md:p-10">
    <IconTile rotate={-4} className="mb-5 transition-colors duration-300 group-hover:bg-fg group-hover:text-bg"><Zap size={18} /></IconTile>
    <h3 className="mb-2 text-lg font-semibold md:text-xl">Fast, never sloppy</h3>
    <p className="text-[15px] leading-relaxed text-fg-dim">…</p>
  </CardCell>
</CardGrid>`}
        >
          <CardGrid cols={2} rounded={false}>
            {[
              [Zap, 'Fast, never sloppy', '2–4 weeks on average. Planning, design and build in one flow to cut communication overhead.'],
              [Shield, 'Code that is easy to inherit', 'TypeScript · consistent conventions · README and ops guide. Any team can pick it up.'],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof Zap
              return (
                <CardCell key={t as string} underline className="p-7 md:p-10">
                  <IconTile rotate={-4} className="mb-5 transition-colors duration-300 group-hover:bg-fg group-hover:text-bg">
                    <I size={18} />
                  </IconTile>
                  <h3 className="mb-2 text-lg font-semibold md:text-xl">{t as string}</h3>
                  <p className="text-[15px] leading-relaxed text-fg-dim">{d as string}</p>
                </CardCell>
              )
            })}
          </CardGrid>
        </Preview>
        <PropsTable
          rows={[
            { name: 'cols', type: '2 | 3 | 4', default: '3', desc: 'md 이상 열 수' },
            { name: 'rounded', type: 'boolean', default: 'true', desc: '둥근 모서리 + clip' },
            { name: 'CardCell.tint', type: 'boolean', default: 'false', desc: '호버 시 bg-bg-soft' },
            { name: 'CardCell.underline', type: 'boolean', default: 'false', desc: '호버 시 바닥에 잉크 선이 왼쪽에서 그어짐' },
          ]}
        />
      </Section>

      <Section title="TerminalCard" desc="창 크롬(신호등 + 파일명) + 코드 + 상태 바. v1 히어로 오른쪽." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { TerminalCard } from '@/components/ui'

<TerminalCard title="project.config.ts" status="ready to ship" version="v0.0.1" tag={<><span className="font-mono">$</span> npm run build</>}>
  <span className="text-fg-dim">// kickoff within 3 days of the quote</span>{'\\n'}
  <span className="text-accent">const</span> project = {'{'}{'\\n  '}
  <span className="text-pink-600">type</span>: <span className="text-emerald-700">"landing"</span>,{'\\n'}
  {'}'};
</TerminalCard>`}
        >
          <div className="mx-auto max-w-md pt-4 pr-4">
            <TerminalCard
              title="project.config.ts"
              status="ready to ship"
              version="v0.0.1"
              tag={
                <>
                  <span className="font-mono">$</span> npm run build
                </>
              }
            >
              <span className="text-fg-dim">// kickoff within 3 days of the quote</span>
              {'\n'}
              <span className="text-accent">const</span> project = {'{'}
              {'\n  '}
              <span className="text-pink-600">type</span>: <span className="text-emerald-700">"landing"</span>,{'\n  '}
              <span className="text-pink-600">design</span>: <span className="text-emerald-700">"custom"</span>,{'\n  '}
              <span className="text-pink-600">timeline</span>: <span className="text-emerald-700">"2 weeks"</span>,{'\n'}
              {'}'};
            </TerminalCard>
          </div>
        </Preview>
      </Section>

      <Section title="BrowserFrame" desc="주소창 크롬 + 16:10 뷰포트. 호버 시 프레임이 떠오르고 글로우가 퍼진다. 스크린샷에 whileHover y:-30% 를 걸어 페이지가 내려가는 패럴럭스." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { BrowserFrame, Badge } from '@/components/ui'

<BrowserFrame host="clinic.efface.dev" glow="rgba(37,99,235,0.25)">
  <motion.div className="absolute inset-x-0 top-0" initial={false} whileHover={{ y: '-30%' }} transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}>
    <img src="/portfolio/clinic.png" alt="" className="block w-full" />
  </motion.div>
  <div className="absolute top-3 left-3"><Badge floating ping>Live</Badge></div>
</BrowserFrame>`}
        >
          <div className="mx-auto max-w-md">
            <BrowserFrame host="clinic.efface.dev" glow="rgba(37,99,235,0.25)">
              <motion.div className="absolute inset-x-0 top-0" initial={false} whileHover={{ y: '-30%' }} transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}>
                <div className="h-[520px] w-full bg-[linear-gradient(180deg,#f5f5f5_0%,#e5e5e5_100%)] p-6">
                  <div className="h-6 w-1/3 rounded bg-white" />
                  <div className="mt-6 h-24 w-3/4 rounded bg-white" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 rounded bg-white" />
                    ))}
                  </div>
                </div>
              </motion.div>
              <div className="absolute top-3 left-3">
                <Badge floating ping>
                  Live
                </Badge>
              </div>
            </BrowserFrame>
          </div>
        </Preview>
      </Section>

      <Section title="PricingCard" desc="featured 는 잉크 반전. 세 장을 gap-4 그리드에 놓는다." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { PricingCard, ButtonLink } from '@/components/ui'

<PricingCard name="Standard" desc="Brand site" price="₩600K" period="from" duration="Timeline · 2–3 weeks"
  features={['5–8 pages', 'Responsive', '1 month free support']} featured
  cta={<ButtonLink href="/apply" className="w-full">Get started <ArrowRight size={14} /></ButtonLink>} />`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Basic', desc: 'Landing page', price: '₩350K', weeks: '1–2 weeks', feats: ['1–3 pages', 'Responsive', 'Basic SEO'] },
              { name: 'Standard', desc: 'Brand site', price: '₩600K', weeks: '2–3 weeks', feats: ['5–8 pages', 'Responsive', 'CMS integration', '1 month free support'], featured: true },
              { name: 'Commerce', desc: 'Commerce', price: '₩700K', weeks: '3–5 weeks', feats: ['Payment gateway', 'Inventory & orders', 'Admin dashboard'] },
            ].map((t) => (
              <PricingCard
                key={t.name}
                name={t.name}
                desc={t.desc}
                price={t.price}
                period="from"
                duration={`Timeline · ${t.weeks}`}
                features={t.feats}
                featured={t.featured}
                cta={
                  <ButtonLink href="#" className={t.featured ? 'w-full bg-bg text-fg hover:bg-bg/90' : 'w-full'} trailing={<ArrowRight size={14} />}>
                    Get started
                  </ButtonLink>
                }
              />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="TestimonialCard" desc="인용 아이콘, 세 줄 클램프, 지표 배지, 흐려진 이름. 마퀴에 넣어 흘린다." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { TestimonialCard } from '@/components/ui'

<TestimonialCard quote="…" metric="+62% conversion" author="Minsu Kim" role="Marketing lead" company="Acme Commerce" initials="K" color="#fde68a" />`}
        >
          <div className="flex flex-wrap gap-5">
            <TestimonialCard quote="Two weeks from quote to launch. The direction changed midway and the schedule still held." metric="+62% conversion" author="Minsu Kim" role="Marketing lead" company="Acme Commerce" initials="K" color="#fde68a" />
            <TestimonialCard quote="The handoff was so clean our in-house developer picked it up the same day." author="Seoyeon Lee" role="CTO" company="Nimbus" initials="L" color="#bfdbfe" blur={false} />
          </div>
        </Preview>
      </Section>

      <Section title="CapabilityCard" desc="번호 + 제목, 대시 행, 점 칩. 열마다 스펙트럼 액센트. v2 에서는 핀 고정 씬의 rAF 가 행·대시·칩을 순서대로 켰고 여기서는 정적 표시." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { CapabilityCard } from '@/components/ui'

<div className="grid gap-10 md:grid-cols-2">
  {groups.map((g, i) => <CapabilityCard key={g.no} {...g} column={i as 0 | 1 | 2 | 3} />)}
</div>`}
        >
          <div className="grid gap-10 md:grid-cols-2">
            {CAPS.map((g, i) => (
              <CapabilityCard key={g.no} {...g} column={i as 0 | 1} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="AppCard" desc="360×560 타일을 하나의 표면으로 조명한다: 기울기를 따라가는 하이라이트, 두께를 읽게 하는 상하 엣지, 뒤로 물러난 그림자. TiltCard 로 감싸면 커서에 기운다. 아이콘 슬롯에는 AppIcon3D 를 넣는다." sources={['v2']}>
        <Preview
          theme="dark"
          center
          minHeight={640}
          code={`import { AppCard, APP_CARDS } from '@/components/ui'
import { AppIcon3D, APP_ICONS } from '@/components/brand'
import { TiltCard } from '@/components/motion'

<TiltCard tiltX={7} tiltY={11}>
  <AppCard title="HiNest" sub="A new start for team ops" gradient={APP_CARDS[0].gradient} sheen={0.16}
    icon={<AppIcon3D {...APP_ICONS[1]} size={260} />} />
</TiltCard>`}
        >
          <div className="flex flex-wrap justify-center gap-8">
            <TiltCard tiltX={7} tiltY={11} glare={false}>
              <AppCard title="HiNest" sub="A new start for team ops" gradient={APP_CARDS[0].gradient} sheen={0.16} icon={<AppIcon3D {...APP_ICONS[1]} size={240} />} />
            </TiltCard>
            <TiltCard tiltX={7} tiltY={11} glare={false} className="hidden lg:block">
              <AppCard title="efface" sub="Erase the complexity" gradient={APP_CARDS[2].gradient} sheen={0.1} icon={<LogoMark className="h-40 w-40 text-white" />} />
            </TiltCard>
          </div>
        </Preview>
        <Note>
          카드 표면의 하이라이트 위치는 CSS 변수 <code className="font-mono">--gx --gy --spec --shadow-o</code> 로 프레임마다 쓸 수 있다. v2 의 <code className="font-mono">useAppCardsScene</code> 은 Blinn-Phong 항을 계산해 넣었다 — 정적 문서에서는 기본값(정지 상태)이 보인다.
        </Note>
      </Section>
    </DocPage>
  )
}
