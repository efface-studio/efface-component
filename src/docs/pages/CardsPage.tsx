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
  { icon: Globe, title: '랜딩 페이지', desc: '신제품 출시, 캠페인, 채용 페이지', period: '1~2주', from: '35만원' },
  { icon: Building2, title: '기업·브랜드 사이트', desc: '회사 소개, 포트폴리오, 채용', period: '2~3주', from: '60만원' },
  { icon: ShoppingBag, title: '쇼핑몰 / 커머스', desc: '결제(PG) · 재고 · 주문 관리 연동', period: '3~5주', from: '70만원' },
]

const CAPS = [
  { no: '01', title: 'AI 엔지니어링', items: ['LLM 기능을 설계하고, 만들고, 배포까지', '에이전트 · 툴 호출 · 자동화 파이프라인', '운영 환경에서 버티는 RAG · 벡터 검색'], tools: ['Claude', 'OpenAI', 'Vercel AI SDK', 'pgvector'] },
  { no: '02', title: '웹 엔지니어링', items: ['Next.js App Router 기반 풀스택', '서버 컴포넌트 · 스트리밍 · 캐싱 전략', '다국어 · SEO · 접근성을 기본값으로'], tools: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
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
                    <div className="mb-0.5 text-[11px] text-fg-dim">기간</div>
                    <div className="font-medium tabular-nums">{it.period}</div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[11px] text-fg-dim">시작가</div>
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
    <h3 className="mb-2 text-lg font-semibold md:text-xl">빠르게, 그러나 대충은 아니게</h3>
    <p className="text-[15px] leading-relaxed text-fg-dim">…</p>
  </CardCell>
</CardGrid>`}
        >
          <CardGrid cols={2} rounded={false}>
            {[
              [Zap, '빠르게, 그러나 대충은 아니게', '평균 2~4주. 기획·디자인·개발을 한 흐름으로 묶어 커뮤니케이션 비용을 줄입니다.'],
              [Shield, '넘겨받기 좋은 코드', 'TypeScript · 일관된 컨벤션 · README 와 운영 가이드. 다른 팀이 이어받아도 막히지 않습니다.'],
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
  <span className="text-fg-dim">// 견적 후 3일 내 착수</span>{'\\n'}
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
              <span className="text-fg-dim">// 견적 후 3일 내 착수</span>
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

<PricingCard name="Standard" desc="기업·브랜드 사이트" price="60만원" period="부터" duration="기간 · 2~3주"
  features={['5~8 페이지', '반응형', '1개월 무상 유지보수']} featured
  cta={<ButtonLink href="/apply" className="w-full">시작하기 <ArrowRight size={14} /></ButtonLink>} />`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Basic', desc: '랜딩 페이지', price: '35만원', weeks: '1~2주', feats: ['1~3 페이지', '반응형', '기본 SEO'] },
              { name: 'Standard', desc: '기업·브랜드 사이트', price: '60만원', weeks: '2~3주', feats: ['5~8 페이지', '반응형', 'CMS 연동', '1개월 무상 유지보수'], featured: true },
              { name: 'Commerce', desc: '쇼핑몰 / 커머스', price: '70만원', weeks: '3~5주', feats: ['결제(PG) 연동', '재고·주문 관리', '관리자 페이지'] },
            ].map((t) => (
              <PricingCard
                key={t.name}
                name={t.name}
                desc={t.desc}
                price={t.price}
                period="부터"
                duration={`기간 · ${t.weeks}`}
                features={t.feats}
                featured={t.featured}
                cta={
                  <ButtonLink href="#" className={t.featured ? 'w-full bg-bg text-fg hover:bg-bg/90' : 'w-full'} trailing={<ArrowRight size={14} />}>
                    시작하기
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

<TestimonialCard quote="…" metric="전환율 +62%" author="김OO" role="마케팅 리드" company="OO커머스" initials="K" color="#fde68a" />`}
        >
          <div className="flex flex-wrap gap-5">
            <TestimonialCard quote="견적부터 배포까지 2주. 중간에 방향이 바뀌었는데도 일정이 밀리지 않았어요." metric="전환율 +62%" author="김민수" role="마케팅 리드" company="OO커머스" initials="K" color="#fde68a" />
            <TestimonialCard quote="넘겨받은 코드가 깔끔해서 사내 개발자가 바로 이어받았습니다." author="이서연" role="CTO" company="OO스타트업" initials="L" color="#bfdbfe" blur={false} />
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
  <AppCard title="HiNest" sub="사내 관리의 새로운 시작" gradient={APP_CARDS[0].gradient} sheen={0.16}
    icon={<AppIcon3D {...APP_ICONS[1]} size={260} />} />
</TiltCard>`}
        >
          <div className="flex flex-wrap justify-center gap-8">
            <TiltCard tiltX={7} tiltY={11} glare={false}>
              <AppCard title="HiNest" sub="사내 관리의 새로운 시작" gradient={APP_CARDS[0].gradient} sheen={0.16} icon={<AppIcon3D {...APP_ICONS[1]} size={240} />} />
            </TiltCard>
            <TiltCard tiltX={7} tiltY={11} glare={false} className="hidden lg:block">
              <AppCard title="efface" sub="복잡함은 지우고" gradient={APP_CARDS[2].gradient} sheen={0.1} icon={<LogoMark className="h-40 w-40 text-white" />} />
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
