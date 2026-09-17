import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight, Building2, Check, Code, FileSignature, Globe, MessageSquare, Rocket, ShoppingBag } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { LogoScene3D } from '@/components/brand/LogoScene3D'
import { LogoMark } from '@/components/brand/LogoMark'
import { Reveal } from '@/components/motion/Reveal'
import { WordReveal } from '@/components/motion/WordReveal'
import { Marquee } from '@/components/motion/Marquee'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { CursorGlow } from '@/components/motion/CursorGlow'
import { SpotlightText } from '@/components/motion/SpotlightText'
import { ScrollLine } from '@/components/motion/ScrollLine'
import { Label } from '@/components/ui/Label'
import { ButtonLink } from '@/components/ui/Button'
import { PilotBadge } from '@/components/ui/Badge'
import { NumberedRow } from '@/components/ui/NumberedRow'
import { CardCell, CardGrid, MetaGrid, TerminalCard } from '@/components/ui/Card'
import { IconTile } from '@/components/ui/IconTile'
import { Accordion } from '@/components/ui/Accordion'
import { Stat } from '@/components/ui/Counter'
import { LinkUnderline } from '@/components/ui/LinkUnderline'

const STACK = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Anthropic', 'OpenAI', 'Vercel', 'Supabase', 'PostgreSQL', 'React Native', 'Framer Motion', 'Cloudflare']
const APPROACH = [
  { no: '01', title: 'Keep the essence', desc: 'Clarity over flair. We cut until only what matters is left.' },
  { no: '02', title: 'Proven tools only', desc: 'Tools that last, not tools that trend. Code anyone can inherit.' },
  { no: '03', title: 'Own it to the end', desc: 'Not shipped — working. We stay until it actually runs well.' },
  { no: '04', title: 'Fast calls, exact dates', desc: 'Plan, design and build in one flow. We keep the dates we promise.' },
]
const SERVICES = [
  { icon: Globe, title: 'Landing page', desc: 'Launches, campaigns, hiring pages', period: '1–2 wks', from: '₩350K' },
  { icon: Building2, title: 'Brand site', desc: 'Company, portfolio, careers', period: '2–3 wks', from: '₩600K' },
  { icon: ShoppingBag, title: 'Commerce', desc: 'Payments · inventory · orders', period: '3–5 wks', from: '₩700K' },
]
const STEPS = [
  { icon: MessageSquare, title: 'Call · quote', days: '1–2 days', desc: 'We pin down requirements, scope and dates.', out: 'Quote · scope doc' },
  { icon: FileSignature, title: 'Plan · design', days: '3–5 days', desc: 'Wireframes to mockups, then sign-off and build.', out: 'Wireframes · mockups' },
  { icon: Code, title: 'Build', days: '5–10 days', desc: 'Daily check-ins on a staging URL.', out: 'Staging URL' },
  { icon: Rocket, title: 'Launch · handoff', days: '1–2 days', desc: 'Domain, deploy and documented handoff.', out: 'Domain · README' },
]
const FAQ = [
  { q: 'How do I get a quote?', a: 'Send your requirements through the form and we reply within one business day.' },
  { q: 'How many revision rounds?', a: 'Two per stage. Changes of direction are discussed separately.' },
  { q: 'What about maintenance after launch?', a: 'One month free. After that we propose a monthly plan.' },
]

function HeroV2() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollRef, target: heroRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const cue = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  return (
    <div ref={scrollRef} className="h-[620px] overflow-y-auto">
      <section ref={heroRef} className="relative h-[620px] w-full overflow-hidden bg-[#0b0c10]">
        <div className="pointer-events-none absolute inset-0">
          <LogoScene3D anchor={0.72} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.68)_28%,rgba(10,10,11,0.18)_52%,transparent_74%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />
        <motion.div style={{ y, opacity }} className="relative z-10 flex h-full max-w-page flex-col justify-end px-6 pb-[14%] md:px-10">
          <div className="max-w-2xl">
            <p className="rise-in flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-fg-dim uppercase md:text-sm">
              <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · web · app studio
            </p>
            <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
              <span className="rise-in rise-d1 block">Erase the complexity.</span>
              <span className="rise-in rise-d2 block">Keep the effect.</span>
            </h1>
            <p className="rise-in rise-d3 mt-6 max-w-md text-base leading-relaxed text-fg-dim">A team that builds AI, web and apps. We go deep on the tech and ship products that simply work.</p>
          </div>
        </motion.div>
        <motion.div style={{ opacity: cue }} className="absolute right-10 bottom-8 z-10 hidden items-center gap-3 md:flex">
          <span className="text-xs tracking-[0.2em] text-fg-faint uppercase">scroll</span>
          <span className="scroll-bob inline-block h-8 w-px bg-fg-faint" aria-hidden />
        </motion.div>
      </section>
      <section className="border-t border-line bg-bg-soft px-6 py-20 md:px-10">
        <p className="label">
          <span className="text-accent">//</span> next section
        </p>
      </section>
    </div>
  )
}

export function RecipesPage() {
  return (
    <DocPage
      eyebrow="recipes"
      title="Sections"
      lead="컴포넌트를 실제 섹션으로 조립해 본 예시예요. v2는 다크, v1은 라이트로 고정해 뒀어요. 원본 사이트 모습 그대로예요."
      sources={['v1', 'v2']}
    >
      <Section title="Hero — v2" desc="3D 유리 로고를 배경에 두고 왼쪽에 카피를 올렸어요. 스크롤하면 카피가 위로 밀리며 사라지고, 스크롤 안내가 먼저 꺼져요. 프리뷰 안을 스크롤해 보세요." sources={['v2']}>
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`<section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-bg">
  <div className="pointer-events-none absolute inset-0 bg-[#0b0c10]"><LogoScene3D anchor={0.72} still={!!reduce} /></div>
  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.68)_28%,rgba(10,10,11,0.18)_52%,transparent_74%)]" />
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />
  <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-page flex-col justify-end px-6 pb-[12vh] md:px-10">
    <p className="rise-in …"><span className="h-px w-8 bg-accent" /> AI · web · app studio</p>
    <h1><span className="rise-in rise-d1 block">Erase the complexity.</span><span className="rise-in rise-d2 block">Keep the effect.</span></h1>
    <p className="rise-in rise-d3 …">…</p>
  </motion.div>
  <motion.div style={{ opacity: cueOpacity }} className="absolute right-10 bottom-8 …">scroll <span className="scroll-bob …" /></motion.div>
</section>`}
        >
          <HeroV2 />
        </Preview>
      </Section>

      <Section title="Hero — v1" desc="커서를 따라오는 글로우와 점 격자 위에 배지, 제목, 불릿, 자석 버튼을 놓고 오른쪽에 터미널 카드를 세웠어요. 등장은 CSS rise-in이에요." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`<CursorGlow dots className="border-b border-line pt-28 pb-16 md:pt-36 md:pb-24">
  <div className="mx-auto grid max-w-page-v1 grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
    <div>
      <PilotBadge className="rise-in">Now taking Q3 2026 projects</PilotBadge>
      <h1 className="rise-in rise-d1 …">Website outsourcing,<br /><span className="text-fg-dim">minus the headache.</span></h1>
      <ul className="rise-in rise-d3 …">{bullets}</ul>
      <div className="rise-in rise-d4 …"><MagneticButton><ButtonLink …>Get a free quote</ButtonLink></MagneticButton></div>
    </div>
    <TerminalCard className="rise-in rise-d2" …/>
  </div>
</CursorGlow>`}
        >
          <CursorGlow dots className="px-5 py-16 md:px-8 md:py-20">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <PilotBadge className="rise-in">Now taking Q3 2026 projects</PilotBadge>
                <h2 className="rise-in rise-d1 mt-6 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  Website outsourcing,
                  <br />
                  <span className="text-fg-dim">minus the headache.</span>
                </h2>
                <p className="rise-in rise-d2 mt-6 max-w-xl text-base leading-relaxed text-fg-dim md:text-lg">Planning · design · build · launch, in one place. A web studio that keeps only what matters.</p>
                <ul className="rise-in rise-d3 mt-7 space-y-2 text-[15px]">
                  {['Landing from ₩350K', '1–3 week delivery', '1 month free support'].map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fg text-bg">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="rise-in rise-d4 mt-9 flex flex-wrap gap-3">
                  <MagneticButton>
                    <ButtonLink href="#" size="lg" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                      Get a free quote
                    </ButtonLink>
                  </MagneticButton>
                  <MagneticButton strength={8}>
                    <ButtonLink href="#" size="lg" variant="secondary">
                      See our work
                    </ButtonLink>
                  </MagneticButton>
                </div>
              </div>
              <div className="rise-in rise-d2 pt-4 pr-4">
                <TerminalCard
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
                  <span className="text-pink-600">deploy</span>: <span className="text-emerald-700">"vercel"</span>,{'\n  '}
                  <span className="text-pink-600">timeline</span>: <span className="text-emerald-700">"2 weeks"</span>,{'\n'}
                  {'}'};
                </TerminalCard>
              </div>
            </div>
          </CursorGlow>
        </Preview>
      </Section>

      <Section title="Approach — v2" desc="왼쪽 5칸에 라벨·제목·리드, 오른쪽 7칸에 번호 목록이 차례로 떠오르고, 아래에 기술 스택 마퀴가 흘러요." sources={['v2']}>
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`<section className="border-t border-line bg-bg-soft py-24 md:py-36">
  <div className="mx-auto max-w-page px-6 md:px-10">
    <div className="grid gap-12 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-5"><Reveal><Label>approach</Label><h2 …>Less, but precise.</h2><p …>…</p></Reveal></div>
      <div className="md:col-span-7"><ul className="border-t border-line">{items.map((it, i) => <Reveal key={it.no} delay={i * STAGGER.tight}><NumberedRow {...it} /></Reveal>)}</ul></div>
    </div>
    <div className="mt-20 md:mt-28"><Marquee edge="mask" duration={38} gap="gap-8 md:gap-12">…</Marquee></div>
  </div>
</section>`}
        >
          <section className="bg-bg-soft px-6 py-16 md:px-10 md:py-24">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <Reveal>
                  <Label>approach</Label>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Less, but precise.</h2>
                  <p className="mt-6 max-w-md text-fg-dim">efface means "to erase". We solve problems by taking things away.</p>
                </Reveal>
              </div>
              <div className="md:col-span-7">
                <ul className="border-t border-line">
                  {APPROACH.map((it, i) => (
                    <Reveal key={it.no} delay={i * 0.06}>
                      <NumberedRow {...it} />
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-16">
              <Marquee edge="mask" duration={38} gap="gap-8 md:gap-12">
                {STACK.map((s) => (
                  <span key={s} className="flex shrink-0 items-center gap-8 font-mono text-sm whitespace-nowrap text-fg-faint md:gap-12">
                    {s}
                    <span className="h-1 w-1 rounded-full bg-fg-faint/40" aria-hidden />
                  </span>
                ))}
              </Marquee>
            </div>
          </section>
        </Preview>
      </Section>

      <Section title="About + Contact — v2" desc="About은 문단이 차례로 뜨고 아래에 정보 표. Contact는 큼직한 이메일 링크 하나로 끝나요." sources={['v2']}>
        <Preview theme="dark" lockTheme bleed>
          <section className="px-6 py-16 md:px-10 md:py-24">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <Reveal>
                  <Label>about</Label>
                  <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">Small team, deep work.</h2>
                  <LogoMark className="mt-10 hidden h-12 w-12 text-fg-faint md:block" />
                </Reveal>
              </div>
              <div className="md:col-span-7">
                <div className="space-y-6">
                  {[
                    'efface is a small team building AI, web and app products. Planning, design, build, launch and operations — handled in one flow.',
                    'We chose depth over headcount. New technology is never left at the demo stage; it is proven inside real products.',
                  ].map((p, i) => (
                    <Reveal key={i} delay={i * 0.06}>
                      <p className="text-base leading-relaxed text-fg-dim md:text-lg">{p}</p>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={0.2}>
                  <MetaGrid className="mt-12" items={[{ label: 'CEO', value: 'Jiwan Seo' }, { label: 'Focus', value: 'AI · Web · App' }, { label: 'Contact', value: 'contact@efface.dev' }]} />
                </Reveal>
              </div>
            </div>
          </section>
          <section className="border-t border-line px-6 py-20 md:px-10 md:py-28">
            <Reveal>
              <Label>contact</Label>
              <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">Ready to build together?</h2>
              <p className="mt-6 max-w-lg text-fg-dim md:text-lg">A new product, a vague idea, or a partnership — send anything.</p>
              <a href="mailto:contact@efface.dev" className="group mt-12 inline-flex items-center gap-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-5xl">
                <span className="link-underline">contact@efface.dev</span>
                <ArrowUpRight className="h-7 w-7 text-accent transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:h-10 md:w-10" strokeWidth={1.75} />
              </a>
            </Reveal>
          </section>
        </Preview>
      </Section>

      <Section title="Services + Process — v1" desc="단어별로 올라오는 제목, 1px 선 카드 그리드, 스크롤에 맞춰 그어지는 선. 카드 아이콘은 마우스를 올리면 스프링으로 튀어요." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <section className="border-b border-line px-5 py-16 md:px-8 md:py-24">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Reveal>
                  <p className="mb-3 font-mono text-xs text-fg-dim">{'// services'}</p>
                </Reveal>
                <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                  What we build.
                </WordReveal>
              </div>
              <Reveal delay={0.1}>
                <p className="max-w-md text-fg-dim">From landing pages to commerce. Timelines and prices, stated up front.</p>
              </Reveal>
            </div>
            <CardGrid cols={3}>
              {SERVICES.map((it, i) => (
                <Reveal key={it.title} delay={i * 0.05}>
                  <CardCell tint>
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
                </Reveal>
              ))}
            </CardGrid>
          </section>
          <section className="px-5 py-16 md:px-8 md:py-24">
            <div className="mb-12">
              <Reveal>
                <p className="mb-3 font-mono text-xs text-fg-dim">{'// process'}</p>
              </Reveal>
              <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                From first call to handoff, 1–3 weeks.
              </WordReveal>
            </div>
            <ScrollLine top={60} inset={28}>
              <CardGrid cols={4}>
                {STEPS.map((s, i) => (
                  <CardCell key={s.title}>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="font-mono text-sm text-fg-dim">0{i + 1}</span>
                      <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-fg-dim">{s.days}</span>
                    </div>
                    <IconTile filled size={9} rotate={6} className="mb-4">
                      <s.icon size={16} />
                    </IconTile>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 min-h-[3.5em] text-sm leading-relaxed text-fg-dim">{s.desc}</p>
                    <div className="mt-5 border-t border-line pt-4">
                      <div className="mb-1 text-[11px] text-fg-dim">Deliverable</div>
                      <div className="text-sm leading-snug font-medium">{s.out}</div>
                    </div>
                  </CardCell>
                ))}
              </CardGrid>
            </ScrollLine>
          </section>
        </Preview>
      </Section>

      <Section title="Stats + FAQ — v1" desc="숫자 카운터 네 개가 얇은 띠로 지나가고, FAQ는 왼쪽 4칸 제목 / 오른쪽 8칸 아코디언이에요." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <section className="border-b border-line px-5 py-12 md:px-8 md:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
              <Reveal>
                <Stat to={30} suffix="+" label="Projects shipped" />
              </Reveal>
              <Reveal delay={0.05}>
                <Stat to={4.9} decimals={1} suffix=" / 5.0" label="Avg. satisfaction" />
              </Reveal>
              <Reveal delay={0.1}>
                <Stat to={62} suffix="%" label="Avg. conversion lift" />
              </Reveal>
              <Reveal delay={0.15}>
                <Stat to={3} suffix="h" label="Avg. reply time" />
              </Reveal>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <div className="md:col-span-4">
              <Reveal>
                <p className="mb-3 font-mono text-xs text-fg-dim">{'// faq'}</p>
              </Reveal>
              <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                {'Frequently asked\nquestions'}
              </WordReveal>
              <Reveal delay={0.3}>
                <p className="mt-5 max-w-sm text-fg-dim">
                  Anything else?{' '}
                  <LinkUnderline href="mailto:contact@efface.dev" className="text-fg">
                    Email us
                  </LinkUnderline>
                  .
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-8">
              <Accordion items={FAQ} />
            </div>
          </section>
        </Preview>
      </Section>

      <Section title="CTA — v1" desc="스포트라이트 글자 위에 제목과 자석 버튼, 오른쪽에 연락 채널 카드를 올렸어요." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <SpotlightText lines={['EFFACE', 'BUILT IN SEOUL', 'EFFACE', 'READY TO SHIP', 'EFFACE']} className="px-5 py-20 md:px-8 md:py-28">
            <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <Reveal>
                  <p className="mb-4 font-mono text-xs text-fg-dim">{'// contact'}</p>
                </Reveal>
                <WordReveal as="h2" className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  Ready to start a project?
                </WordReveal>
                <Reveal delay={0.4}>
                  <p className="mt-6 max-w-xl leading-relaxed text-fg-dim">30+ projects shipped · 4.9 avg. satisfaction · replies within 24h on weekdays.</p>
                  <MagneticButton className="mt-9 inline-block">
                    <ButtonLink href="#" size="lg" className="shadow-[0_8px_30px_rgba(37,99,235,0.18)]" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                      Get a free quote
                    </ButtonLink>
                  </MagneticButton>
                </Reveal>
              </div>
              <div className="md:col-span-5">
                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-line bg-surface/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md md:p-7">
                    <div className="mb-4 font-mono text-xs text-fg-dim">channels</div>
                    <ul className="divide-y divide-line text-sm">
                      {[
                        ['Business', 'sales@efface.dev'],
                        ['General', 'contact@efface.dev'],
                        ['KakaoTalk', '@efface'],
                      ].map(([k, v]) => (
                        <li key={v} className="flex items-center justify-between py-3">
                          <span>{k}</span>
                          <span className="font-mono text-fg-dim">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </SpotlightText>
        </Preview>
        <Note>포트폴리오(BrowserFrame), 후기 마퀴(TestimonialCard), 가격표(PricingCard)는 Cards 페이지에서 카드 단위로 볼 수 있어요.</Note>
      </Section>
    </DocPage>
  )
}
