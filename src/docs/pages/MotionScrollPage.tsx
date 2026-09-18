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
      lead="스크롤에 따라 움직이는 것들이에요. 상단 진행 바, 히어로 카피 패럴럭스, 프로세스 선 긋기, 무한 마퀴. 핀 고정 씬을 돌리는 rAF 패턴도 여기 정리해 뒀어요."
      sources={['v1', 'v2']}
    >
      <Section title="ScrollProgress" desc="화면 맨 위에 붙는 2px 진행 바예요. 스프링이 걸려 있어서 스크롤을 살짝 늦게 따라와요. 이 페이지에 실제로 켜 뒀으니 위를 보세요." sources={['v1']}>
        <ScrollProgress />
        <CodeBlock
          code={`import { ScrollProgress } from '@/components/motion'

{/* 레이아웃 최상단에 한 번 */}
<ScrollProgress />
<ScrollProgress gradient="linear-gradient(90deg, #3b62e5, #14b8b0)" />`}
        />
      </Section>

      <Section title="히어로 패럴럭스" desc="섹션이 얼마나 지나갔는지 읽어서, 카피는 위로 24%까지 밀리고 절반쯤에서 완전히 사라져요. 스크롤 안내는 그보다 먼저 꺼져요. 프리뷰 안을 스크롤해 보세요." sources={['v2']}>
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

      <Section title="ScrollLine" desc="회색 기준선 위로 그라데이션 선이 스크롤에 맞춰 그어져요. v1 프로세스 4단계 위를 지나가던 그 선이에요. 데스크톱에서만 보여요." sources={['v1']}>
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

      <Section title="Marquee" desc="내용을 두 번 이어 붙여서 절반만큼 옮기는 무한 마퀴예요. 양 끝은 fade(배경색으로 덮기)나 mask(마스크로 지우기) 중 골라요. 애니메이션 줄이기를 켜면 멈춰요." sources={['v1', 'v2']}>
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

      <Section title="핀 고정 씬의 rAF 패턴" desc="v2의 EffaceIntro, AppCards, Capabilities는 화면에 고정된 채 스크롤 진행도(0→1)로 그려요. 세 씬이 이 훅 하나를 같이 써요. 여기서는 패턴만 옮겨 뒀어요." sources={['v2']}>
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
          씬의 길이(vh)는 타임라인이 실제로 끝나는 지점으로 계산해요. 카피가 짧은 언어에서 빈 스크롤이 남지 않게요. 모바일에서는 씬을 줄이지 않고 정적으로 쌓아서 보여줘요.
        </Note>
      </Section>
    </DocPage>
  )
}
