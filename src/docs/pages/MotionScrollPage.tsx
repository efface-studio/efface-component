import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { MessageSquare, FileSignature, Code, Rocket } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { ScrollLine } from '@/components/motion/ScrollLine'
import { Marquee } from '@/components/motion/Marquee'
import { IconTile } from '@/components/ui/IconTile'
import { CardCell, CardGrid } from '@/components/ui/Card'

const STEPS = [
  { icon: MessageSquare, title: 'Call · quote', days: '1–2 days', out: 'Quote · scope doc' },
  { icon: FileSignature, title: 'Plan · design', days: '3–5 days', out: 'Wireframes · mockups' },
  { icon: Code, title: 'Build', days: '5–10 days', out: 'Staging URL' },
  { icon: Rocket, title: 'Launch · handoff', days: '1–2 days', out: 'Domain · README' },
]
const STACK = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Anthropic', 'OpenAI', 'Vercel', 'Supabase', 'PostgreSQL', 'React Native', 'Framer Motion', 'Cloudflare']

/** 프리뷰 안에서 스크롤 컨테이너를 기준으로 패럴럭스를 보여준다 */
function ParallaxDemo() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollRef, target: heroRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const cue = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  return (
    <div ref={scrollRef} className="h-[420px] overflow-y-auto rounded-lg border border-line">
      <div ref={heroRef} className="relative flex h-[420px] flex-col justify-end overflow-hidden bg-[radial-gradient(ellipse_at_80%_40%,#1b2340,#0a0a0b_60%)] px-6 pb-12">
        <motion.div style={{ y, opacity }} className="max-w-md">
          <p className="label">
            <span className="text-accent">//</span> hero
          </p>
          <h3 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tight">Scroll — the copy lifts and fades away.</h3>
        </motion.div>
        <motion.div style={{ opacity: cue }} className="absolute right-6 bottom-6 flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] text-fg-faint uppercase">scroll</span>
          <span className="scroll-bob inline-block h-6 w-px bg-fg-faint" />
        </motion.div>
      </div>
      <div className="h-[520px] border-t border-line bg-bg-soft p-6 text-sm text-fg-dim">Next section</div>
    </div>
  )
}

export function MotionScrollPage() {
  return (
    <DocPage
      eyebrow="motion"
      title="Scroll"
      lead="스크롤에 묶인 모션. 상단 프로그레스 바(v1), 히어로 카피 패럴럭스(v2), 프로세스 선 긋기(v1), 그리고 무한 마퀴(공통). 핀 고정 씬의 rAF 게이트도 여기 정리한다."
      sources={['v1', 'v2']}
    >
      <Section title="ScrollProgress" desc="화면 맨 위 2px. 스프링이 걸려 스크롤을 살짝 늦게 따라간다. 이 문서 페이지에 실제로 켜 두었다 — 위를 보면 된다." sources={['v1']}>
        <ScrollProgress />
        <CodeBlock
          code={`import { ScrollProgress } from '@/components/motion'

{/* 레이아웃 최상단에 한 번 */}
<ScrollProgress />
<ScrollProgress gradient="linear-gradient(90deg, #3b62e5, #14b8b0)" />`}
        />
      </Section>

      <Section title="히어로 패럴럭스" desc="useScroll 로 섹션의 진행도를 얻어 카피는 -24% 까지 올리고 0.55 지점에서 완전히 사라진다. 스크롤 큐는 0.15 에서 사라진다. 프리뷰 안을 스크롤한다." sources={['v2']}>
        <Preview theme="dark" bleed lockTheme code={`const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
const y = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
const cue = useTransform(scrollYProgress, [0, 0.15], [1, 0])

<motion.div style={reduce ? undefined : { y, opacity }}>…카피…</motion.div>
<motion.div style={{ opacity: cue }}>scroll ↓</motion.div>`}>
          <div className="p-4">
            <ParallaxDemo />
          </div>
        </Preview>
      </Section>

      <Section title="ScrollLine" desc="회색 기준선 위로 그라데이션 선이 스크롤 진행에 따라 그어진다. v1 Process 의 4단계 위를 지난다. md 이상에서만 보인다." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { ScrollLine } from '@/components/motion'

<ScrollLine top={60} inset={28}>
  <CardGrid cols={4}>{steps.map(…)}</CardGrid>
</ScrollLine>`}
        >
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
                  <div className="mt-5 border-t border-line pt-4">
                    <div className="mb-1 text-[11px] text-fg-dim">Deliverable</div>
                    <div className="text-sm leading-snug font-medium">{s.out}</div>
                  </div>
                </CardCell>
              ))}
            </CardGrid>
          </ScrollLine>
        </Preview>
      </Section>

      <Section title="Marquee" desc="자식을 두 번 이어 붙이고 -50% 까지 옮긴다. edge 는 양 끝 처리 — fade 는 배경색 덮개(v1), mask 는 마스크 이미지(v2). reduced-motion 에서 멈춘다." sources={['v1', 'v2']}>
        <Preview
          theme="dark"
          bleed
          code={`import { Marquee } from '@/components/motion'

{/* v2 스택 마퀴 */}
<Marquee edge="mask" duration={38} gap="gap-8 md:gap-12">
  {stack.map((s) => (
    <span key={s} className="flex shrink-0 items-center gap-8 font-mono text-sm text-fg-faint md:gap-12">
      {s}<span className="h-1 w-1 rounded-full bg-fg-faint/40" />
    </span>
  ))}
</Marquee>`}
        >
          <div className="py-8">
            <Marquee edge="mask" duration={38} gap="gap-8 md:gap-12">
              {STACK.map((s) => (
                <span key={s} className="flex shrink-0 items-center gap-8 font-mono text-sm whitespace-nowrap text-fg-faint md:gap-12">
                  {s}
                  <span className="h-1 w-1 rounded-full bg-fg-faint/40" aria-hidden />
                </span>
              ))}
            </Marquee>
          </div>
        </Preview>
      </Section>

      <Section title="핀 고정 씬의 rAF 게이트" desc="v2 의 EffaceIntro · AppCards · Capabilities 는 sticky 100vh 안에서 스크롤 진행도(0→1)로 그린다. 세 씬이 같은 훅을 공유한다. 여기서는 패턴만 옮긴다." sources={['v2']}>
        <CodeBlock
          code={`/** 섹션이 자기 핀 runway 를 얼마나 지났는지 0→1 로 frame 에 넘긴다.
 *  화면 밖·숨은 탭에서는 렌더를 건너뛰고, reduced-motion 이면 settleAt 을 한 번 그리고 끝. */
export function usePinnedSceneMotion(ref, frame: (p: number) => void, enabled: boolean, settleAt = 1) {
  useEffect(() => {
    const root = ref.current
    if (!root || !enabled) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { frame(settleAt); return }

    let raf = 0, onScreen = true, hidden = document.hidden
    const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting }, { threshold: 0 })
    io.observe(root)
    const onVis = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!onScreen || hidden) return
      const rect = root.getBoundingClientRect()
      const total = Math.max(1, root.offsetHeight - innerHeight)
      frame(clamp(-rect.top / total, 0, 1))
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [ref, frame, enabled, settleAt])
}

// 사용 — 섹션은 height: {sceneVh}vh, 안쪽은 sticky top-0 h-screen
<section ref={rootRef} style={{ height: '440vh' }}>
  <div className="sticky top-0 h-screen overflow-hidden">…</div>
</section>`}
        />
        <Note>
          씬 길이(vh)는 타임라인이 실제로 끝나는 지점에서 계산한다 — 카피가 짧은 로케일에서 빈 스크롤이 남지 않게. md 미만에서는 씬을 축소하지 않고 정적 스택으로 대체한다.
        </Note>
      </Section>
    </DocPage>
  )
}
