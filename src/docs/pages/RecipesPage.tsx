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
  { no: '01', title: '본질만 남기는 설계', desc: '화려함보다 명료함. 정말 필요한 것만 남을 때까지 덜어냅니다.' },
  { no: '02', title: '검증된 기술만', desc: '유행이 아니라 오래 살아남는 도구. 넘겨받아도 막히지 않는 코드를 씁니다.' },
  { no: '03', title: '끝까지 책임지는 완성도', desc: '배포로 끝이 아니라, 실제로 잘 돌아가는 상태까지 책임집니다.' },
  { no: '04', title: '빠른 판단, 정확한 일정', desc: '기획·디자인·개발을 한 흐름으로. 약속한 일정을 지킵니다.' },
]
const SERVICES = [
  { icon: Globe, title: '랜딩 페이지', desc: '신제품 출시, 캠페인, 채용 페이지', period: '1~2주', from: '35만원' },
  { icon: Building2, title: '기업·브랜드 사이트', desc: '회사 소개, 포트폴리오, 채용', period: '2~3주', from: '60만원' },
  { icon: ShoppingBag, title: '쇼핑몰 / 커머스', desc: '결제(PG) · 재고 · 주문 관리 연동', period: '3~5주', from: '70만원' },
]
const STEPS = [
  { icon: MessageSquare, title: '상담·견적', days: '1~2일', desc: '요구사항을 정리하고 범위와 일정을 확정합니다.', out: '견적서 · 범위 정의서' },
  { icon: FileSignature, title: '기획·디자인', days: '3~5일', desc: '와이어프레임에서 시안까지, 승인 후 개발로.', out: '와이어프레임 · 디자인 시안' },
  { icon: Code, title: '개발', days: '5~10일', desc: '스테이징에서 매일 확인하며 진행합니다.', out: '스테이징 URL' },
  { icon: Rocket, title: '배포·인계', days: '1~2일', desc: '도메인 연결과 문서 인계까지.', out: '도메인 연결 · README' },
]
const FAQ = [
  { q: '견적은 어떻게 받나요?', a: '신청 폼에 요구사항을 적어 보내주시면 1영업일 내 회신드립니다.' },
  { q: '수정 요청은 몇 번까지 가능한가요?', a: '단계별 2회. 방향 자체가 바뀌는 변경은 별도로 협의합니다.' },
  { q: '배포 후 유지보수는요?', a: '1개월 무상. 이후는 월 단위 유지보수 플랜을 제안드립니다.' },
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
          <LogoScene3D />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.68)_28%,rgba(10,10,11,0.18)_52%,transparent_74%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />
        <motion.div style={{ y, opacity }} className="relative z-10 flex h-full max-w-page flex-col justify-end px-6 pb-[14%] md:px-10">
          <div className="max-w-2xl">
            <p className="rise-in flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-fg-dim uppercase md:text-sm">
              <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · 웹 · 앱 개발 스튜디오
            </p>
            <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
              <span className="rise-in rise-d1 block">복잡함은 지우고,</span>
              <span className="rise-in rise-d2 block">효과만 남깁니다.</span>
            </h1>
            <p className="rise-in rise-d3 mt-6 max-w-md text-base leading-relaxed text-fg-dim">AI와 웹·앱을 다루는 개발팀입니다. 기술을 깊게 파고, 잘 작동하는 제품으로 만듭니다.</p>
          </div>
        </motion.div>
        <motion.div style={{ opacity: cue }} className="absolute right-10 bottom-8 z-10 hidden items-center gap-3 md:flex">
          <span className="text-xs tracking-[0.2em] text-fg-faint uppercase">scroll</span>
          <span className="scroll-bob inline-block h-8 w-px bg-fg-faint" aria-hidden />
        </motion.div>
      </section>
      <section className="border-t border-line bg-bg-soft px-6 py-20 md:px-10">
        <p className="label">
          <span className="text-accent">//</span> 다음 섹션
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
      lead="라이브러리의 조각을 실제 섹션으로 조립한 예. v2 는 다크, v1 은 라이트로 고정되어 있다 — 원본 사이트 그대로다."
      sources={['v1', 'v2']}
    >
      <Section title="Hero — v2" desc="WebGL 유리 로고를 배경으로, 왼쪽 스크림 위에 rise-in 카피. 스크롤하면 카피가 위로 밀리며 사라지고 스크롤 큐가 먼저 꺼진다. 프리뷰 안을 스크롤한다." sources={['v2']}>
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`<section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-bg">
  <div className="pointer-events-none absolute inset-0 bg-[#0b0c10]"><LogoScene3D still={!!reduce} /></div>
  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.68)_28%,rgba(10,10,11,0.18)_52%,transparent_74%)]" />
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />
  <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-page flex-col justify-end px-6 pb-[12vh] md:px-10">
    <p className="rise-in …"><span className="h-px w-8 bg-accent" /> AI · 웹 · 앱 개발 스튜디오</p>
    <h1><span className="rise-in rise-d1 block">복잡함은 지우고,</span><span className="rise-in rise-d2 block">효과만 남깁니다.</span></h1>
    <p className="rise-in rise-d3 …">…</p>
  </motion.div>
  <motion.div style={{ opacity: cueOpacity }} className="absolute right-10 bottom-8 …">scroll <span className="scroll-bob …" /></motion.div>
</section>`}
        >
          <HeroV2 />
        </Preview>
      </Section>

      <Section title="Hero — v1" desc="커서 글로우 + 점 격자 위에 배지 · 제목 · 불릿 · 자석 CTA, 오른쪽에 터미널 카드. 진입은 CSS rise-in." sources={['v1']}>
        <Preview
          theme="light"
          lockTheme
          bleed
          code={`<CursorGlow dots className="border-b border-line pt-28 pb-16 md:pt-36 md:pb-24">
  <div className="mx-auto grid max-w-page-v1 grid-cols-1 items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16">
    <div>
      <PilotBadge className="rise-in">2026 Q3 신규 프로젝트 모집 중</PilotBadge>
      <h1 className="rise-in rise-d1 …">웹사이트 외주,<br /><span className="text-fg-dim">막막하셨다면.</span></h1>
      <ul className="rise-in rise-d3 …">{bullets}</ul>
      <div className="rise-in rise-d4 …"><MagneticButton><ButtonLink …>무료 견적 받기</ButtonLink></MagneticButton></div>
    </div>
    <TerminalCard className="rise-in rise-d2" …/>
  </div>
</CursorGlow>`}
        >
          <CursorGlow dots className="px-5 py-16 md:px-8 md:py-20">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <PilotBadge className="rise-in">2026 Q3 신규 프로젝트 모집 중</PilotBadge>
                <h2 className="rise-in rise-d1 mt-6 text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  웹사이트 외주,
                  <br />
                  <span className="text-fg-dim">막막하셨다면.</span>
                </h2>
                <p className="rise-in rise-d2 mt-6 max-w-xl text-base leading-relaxed text-fg-dim md:text-lg">기획 · 디자인 · 개발 · 배포까지 한 곳에서. 필요한 것만 남기는 웹 외주 제작 스튜디오.</p>
                <ul className="rise-in rise-d3 mt-7 space-y-2 text-[15px]">
                  {['랜딩 35만원부터', '1~3주 납품', '1개월 무상 유지보수'].map((b) => (
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
                      무료 견적 받기
                    </ButtonLink>
                  </MagneticButton>
                  <MagneticButton strength={8}>
                    <ButtonLink href="#" size="lg" variant="secondary">
                      작업 보기
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
                  <span className="text-fg-dim">// 견적 후 3일 내 착수</span>
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

      <Section title="Approach — v2" desc="좌 5 / 우 7. 왼쪽 라벨·제목·리드, 오른쪽 번호 목록이 스태거로 뜨고, 아래에 스택 마퀴." sources={['v2']}>
        <Preview
          theme="dark"
          lockTheme
          bleed
          code={`<section className="border-t border-line bg-bg-soft py-24 md:py-36">
  <div className="mx-auto max-w-page px-6 md:px-10">
    <div className="grid gap-12 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-5"><Reveal><Label>approach</Label><h2 …>적게, 그러나 정확하게.</h2><p …>…</p></Reveal></div>
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
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">적게, 그러나 정확하게.</h2>
                  <p className="mt-6 max-w-md text-fg-dim">efface는 '지우다'라는 뜻입니다. 우리는 덜어내는 방식으로 문제를 풉니다.</p>
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

      <Section title="About + Contact — v2" desc="About 은 단락 스태거 + 메타 그리드. Contact 는 거대 이메일 링크 하나로 끝난다." sources={['v2']}>
        <Preview theme="dark" lockTheme bleed>
          <section className="px-6 py-16 md:px-10 md:py-24">
            <div className="grid gap-12 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <Reveal>
                  <Label>about</Label>
                  <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">작게 일하고, 깊게 팝니다.</h2>
                  <LogoMark className="mt-10 hidden h-12 w-12 text-fg-faint md:block" />
                </Reveal>
              </div>
              <div className="md:col-span-7">
                <div className="space-y-6">
                  {[
                    'efface는 AI와 웹·앱 프로덕트를 만드는 개발팀입니다. 기획과 설계부터 개발, 배포, 운영까지 한 흐름으로 직접 다룹니다.',
                    '규모를 키우는 대신 깊이를 택했습니다. 새로운 기술은 데모에서 끝내지 않고 실제 제품에 넣어 검증합니다.',
                  ].map((p, i) => (
                    <Reveal key={i} delay={i * 0.06}>
                      <p className="text-base leading-relaxed text-fg-dim md:text-lg">{p}</p>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={0.2}>
                  <MetaGrid className="mt-12" items={[{ label: '대표', value: '서지완' }, { label: '다루는 것', value: 'AI · 웹 · 앱' }, { label: '연락', value: 'contact@efface.dev' }]} />
                </Reveal>
              </div>
            </div>
          </section>
          <section className="border-t border-line px-6 py-20 md:px-10 md:py-28">
            <Reveal>
              <Label>contact</Label>
              <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">함께 만들 준비가 되셨나요?</h2>
              <p className="mt-6 max-w-lg text-fg-dim md:text-lg">새로운 제품, 막연한 아이디어, 혹은 협업 제안. 무엇이든 편하게 보내주세요.</p>
              <a href="mailto:contact@efface.dev" className="group mt-12 inline-flex items-center gap-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-5xl">
                <span className="link-underline">contact@efface.dev</span>
                <ArrowUpRight className="h-7 w-7 text-accent transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:h-10 md:w-10" strokeWidth={1.75} />
              </a>
            </Reveal>
          </section>
        </Preview>
      </Section>

      <Section title="Services + Process — v1" desc="WordReveal 제목, 1px 그리드 카드, 스크롤 선. 카드 아이콘은 호버 시 스프링으로 돈다." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <section className="border-b border-line px-5 py-16 md:px-8 md:py-24">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Reveal>
                  <p className="mb-3 font-mono text-xs text-fg-dim">{'// services'}</p>
                </Reveal>
                <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                  이런 걸 만듭니다.
                </WordReveal>
              </div>
              <Reveal delay={0.1}>
                <p className="max-w-md text-fg-dim">랜딩부터 커머스까지. 기간과 시작가를 먼저 밝힙니다.</p>
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
                        <div className="mb-0.5 text-[11px] text-fg-dim">기간</div>
                        <div className="font-medium tabular-nums">{it.period}</div>
                      </div>
                      <div>
                        <div className="mb-0.5 text-[11px] text-fg-dim">시작가</div>
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
                상담부터 인계까지, 1~3주.
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
                      <div className="mb-1 text-[11px] text-fg-dim">산출물</div>
                      <div className="text-sm leading-snug font-medium">{s.out}</div>
                    </div>
                  </CardCell>
                ))}
              </CardGrid>
            </ScrollLine>
          </section>
        </Preview>
      </Section>

      <Section title="Stats + FAQ — v1" desc="카운터 네 개가 얇은 띠로, FAQ 는 좌 4 / 우 8 아코디언." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <section className="border-b border-line px-5 py-12 md:px-8 md:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
              <Reveal>
                <Stat to={30} suffix="+" label="완료 프로젝트" />
              </Reveal>
              <Reveal delay={0.05}>
                <Stat to={4.9} decimals={1} suffix=" / 5.0" label="평균 만족도" />
              </Reveal>
              <Reveal delay={0.1}>
                <Stat to={62} suffix="%" label="평균 전환율 개선" />
              </Reveal>
              <Reveal delay={0.15}>
                <Stat to={3} suffix="h" label="평균 회신" />
              </Reveal>
            </div>
          </section>
          <section className="grid grid-cols-1 gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <div className="md:col-span-4">
              <Reveal>
                <p className="mb-3 font-mono text-xs text-fg-dim">{'// faq'}</p>
              </Reveal>
              <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                {'자주 묻는\n질문'}
              </WordReveal>
              <Reveal delay={0.3}>
                <p className="mt-5 max-w-sm text-fg-dim">
                  더 궁금한 게 있다면{' '}
                  <LinkUnderline href="mailto:contact@efface.dev" className="text-fg">
                    메일
                  </LinkUnderline>
                  로.
                </p>
              </Reveal>
            </div>
            <div className="md:col-span-8">
              <Accordion items={FAQ} />
            </div>
          </section>
        </Preview>
      </Section>

      <Section title="CTA — v1" desc="스포트라이트 텍스트 위에 WordReveal 제목과 자석 CTA, 오른쪽에 채널 카드." sources={['v1']}>
        <Preview theme="light" lockTheme bleed>
          <SpotlightText lines={['EFFACE', 'BUILT IN SEOUL', 'EFFACE', 'READY TO SHIP', 'EFFACE']} className="px-5 py-20 md:px-8 md:py-28">
            <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <Reveal>
                  <p className="mb-4 font-mono text-xs text-fg-dim">{'// contact'}</p>
                </Reveal>
                <WordReveal as="h2" className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                  프로젝트, 시작해 볼까요?
                </WordReveal>
                <Reveal delay={0.4}>
                  <p className="mt-6 max-w-xl leading-relaxed text-fg-dim">30개+ 프로젝트 완료 · 평균 만족도 4.9 · 평일 24시간 내 응답.</p>
                  <MagneticButton className="mt-9 inline-block">
                    <ButtonLink href="#" size="lg" className="shadow-[0_8px_30px_rgba(37,99,235,0.18)]" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
                      무료 견적 받기
                    </ButtonLink>
                  </MagneticButton>
                </Reveal>
              </div>
              <div className="md:col-span-5">
                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-line bg-surface/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md md:p-7">
                    <div className="mb-4 font-mono text-xs text-fg-dim">채널</div>
                    <ul className="divide-y divide-line text-sm">
                      {[
                        ['비즈니스', 'sales@efface.dev'],
                        ['일반 문의', 'contact@efface.dev'],
                        ['카카오톡', '@efface'],
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
        <Note>포트폴리오(BrowserFrame + 스크린샷), 후기 마퀴(TestimonialCard), 가격(PricingCard)은 Cards 페이지에서 각 카드 단위로 볼 수 있다.</Note>
      </Section>
    </DocPage>
  )
}
