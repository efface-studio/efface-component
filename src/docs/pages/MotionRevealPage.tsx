import { useState } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { RevealCSS } from '@/components/motion/RevealCSS'
import { WordReveal } from '@/components/motion/WordReveal'
import { LetterReveal } from '@/components/motion/LetterReveal'

function Replay({ children }: { children: (key: number) => React.ReactNode }) {
  const [key, setKey] = useState(0)
  return (
    <>
      <div className="mb-5">
        <Button size="sm" variant="secondary" onClick={() => setKey((k) => k + 1)}>
          Replay
        </Button>
      </div>
      <div key={key}>{children(key)}</div>
    </>
  )
}

export function MotionRevealPage() {
  return (
    <DocPage
      eyebrow="motion"
      title="Reveal"
      lead="화면에 들어올 때 한 번 떠오르는 등장 효과예요. 블록 단위는 Reveal, 단어 단위는 WordReveal, 글자 단위는 LetterReveal. motion 없이 CSS만 쓰는 RevealCSS도 있어요."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="Reveal" desc="20px 아래에서 0.7초 동안 떠올라요. v1은 24px 아래에서 0.985배로 시작해 아주 살짝 커지면서 들어와요. 한 번만 재생되고, 자식은 그대로 통과시켜요." sources={['v1', 'v2']}>
        <Preview
          theme="dark"
          code={`import { Reveal } from '@/components/motion'
import { STAGGER } from '@/lib/motion'

<Reveal>
  <h2>…</h2>
</Reveal>

{/* 리스트 스태거 */}
{items.map((it, i) => <Reveal key={it} delay={i * STAGGER.tight}>…</Reveal>)}

{/* v1 감각 */}
<Reveal y={24} scale={0.985}>…</Reveal>`}
        >
          <Replay>
            {() => (
              <div className="grid gap-3 sm:grid-cols-3">
                {['Keep the essence', 'Proven tools only', 'Own it to the end'].map((t, i) => (
                  <Reveal key={t} delay={i * 0.06}>
                    <div className="rounded-lg border border-line bg-surface p-5">
                      <span className="font-mono text-xs text-accent">0{i + 1}</span>
                      <p className="mt-2 font-medium">{t}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </Replay>
        </Preview>
        <PropsTable
          rows={[
            { name: 'delay', type: 'number', default: '0', desc: '초. 인덱스 × STAGGER 로 스태거' },
            { name: 'y', type: 'number', default: '20', desc: '떠오르는 거리 px' },
            { name: 'scale', type: 'number', default: '1', desc: '시작 스케일. v1 은 0.985' },
            { name: 'margin', type: 'string', default: "'-80px'", desc: '뷰포트 안쪽 여유' },
          ]}
        />
      </Section>

      <Section title="RevealCSS" desc="IntersectionObserver와 CSS 전환만으로 같은 효과를 내요. motion을 싣고 싶지 않은 곳이나 리스트 항목(as='li')에 써요. delay는 ms 단위예요." sources={['mom']}>
        <Preview
          theme="light"
          code={`import { RevealCSS } from '@/components/motion'

<ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  {templates.map((t, i) => (
    <RevealCSS as="li" key={t.id} delay={(i % 8) * 55}>…</RevealCSS>
  ))}
</ul>`}
        >
          <Replay>
            {() => (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <RevealCSS as="li" key={i} delay={i * 55}>
                    <div className="aspect-[4/5] rounded-lg border border-line bg-surface-2" />
                  </RevealCSS>
                ))}
              </ul>
            )}
          </Replay>
        </Preview>
      </Section>

      <Section title="WordReveal" desc="단어 하나하나가 자기 칸 안에서 밀려 올라와요. \\n을 넣으면 줄이 바뀌어요. g, p, y 같은 글자 꼬리가 잘리지 않게 아래에 여유를 뒀어요." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { WordReveal } from '@/components/motion'

<WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
  {'What we build.\\nOnly what matters, precisely.'}
</WordReveal>`}
        >
          <Replay>
            {() => (
              <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                {'What we build.\nOnly what matters, precisely.'}
              </WordReveal>
            )}
          </Replay>
        </Preview>
        <PropsTable
          rows={[
            { name: 'as', type: "'h1' | 'h2' | 'h3' | 'p' | 'span'", default: "'h2'", desc: '렌더 태그' },
            { name: 'delay', type: 'number', default: '0', desc: '초' },
            { name: 'stagger', type: 'number', default: '0.05', desc: '단어당 초' },
          ]}
        />
      </Section>

      <Section title="LetterReveal · SplitHeadline" desc="글자가 제각각 흩어진 자리에서 날아와 제자리를 찾아요. v2에서는 스크롤에 맞춰 그렸고, 여기서는 화면에 들어올 때 한 번 재생돼요. 흩어지는 위치는 매번 같아요. SplitHeadline은 애니메이션 없이 글자만 쪼개주는 도구예요." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { LetterReveal, SplitHeadline } from '@/components/motion'

<LetterReveal as="h2" text="What, and how deep, we go." className="text-3xl font-semibold tracking-tight md:text-5xl" scatter={40} />

{/* rAF 루프가 [data-l] 을 찾아 직접 움직일 때 */}
<h2><SplitHeadline text="…" letterClassName="inline-block" letterStyle={{ opacity: 0 }} /></h2>`}
        >
          <Replay>
            {() => <LetterReveal as="h2" text="What, and how deep, we go." className="text-3xl font-semibold tracking-tight md:text-5xl" />}
          </Replay>
        </Preview>
      </Section>

      <Section title="rise-in (CSS)" desc="히어로처럼 첫 화면에 바로 보여야 하는 건 motion 대신 CSS 키프레임을 써요. 스타일시트가 읽히는 순간 재생돼서 JS를 기다릴 필요가 없어요.">
        <Preview
          theme="dark"
          code={`<p className="rise-in label">// AI · web · app studio</p>
<h1>
  <span className="rise-in rise-d1 block">Erase the complexity.</span>
  <span className="rise-in rise-d2 block">Keep the effect.</span>
</h1>
<p className="rise-in rise-d3">…</p>
<div className="rise-in rise-d4">CTA</div>`}
        >
          <Replay>
            {() => (
              <div className="max-w-xl">
                <p className="rise-in flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-fg-dim uppercase">
                  <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · web · app studio
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
                  <span className="rise-in rise-d1 block">Erase the complexity.</span>
                  <span className="rise-in rise-d2 block">Keep the effect.</span>
                </h1>
                <p className="rise-in rise-d3 mt-6 max-w-md text-fg-dim">A team that builds AI, web and apps. We go deep on the tech and ship products that simply work.</p>
              </div>
            )}
          </Replay>
        </Preview>
        <Note>둘 다 시스템의 애니메이션 줄이기 설정을 따라요. Reveal 계열은 initial을 건너뛰고, rise-in은 @media에서 animation: none으로 꺼져요.</Note>
      </Section>
    </DocPage>
  )
}
