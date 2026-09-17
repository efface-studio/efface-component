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
          다시 재생
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
      lead="뷰포트에 들어올 때 한 번 떠오르는 진입. 블록 단위(Reveal), 단어 단위(WordReveal), 글자 단위(LetterReveal). motion 없이 CSS 전환만 쓰는 RevealCSS 도 있다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="Reveal" desc="20px 아래에서 0.7초 ease-out-expo. v1 은 y 24 + scale 0.985 로 미세하게 커지며 들어온다. 한 번만 재생(once). 자식은 그대로 통과한다." sources={['v1', 'v2']}>
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
                {['본질만 남기는 설계', '검증된 기술만', '끝까지 책임지는 완성도'].map((t, i) => (
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

      <Section title="RevealCSS" desc="IntersectionObserver + CSS 전환. motion 을 싣지 않아도 되는 곳, 리스트 셀(as='li')에 쓴다. delay 는 ms." sources={['mom']}>
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

      <Section title="WordReveal" desc="단어를 자기 클립 박스 안에서 밀어 올린다. \\n 은 줄바꿈. 디센더가 잘리지 않게 pb-[0.18em] -mb-[0.18em] 여유." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { WordReveal } from '@/components/motion'

<WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
  {'이런 걸 만듭니다.\\n필요한 것만, 정확하게.'}
</WordReveal>`}
        >
          <Replay>
            {() => (
              <WordReveal as="h2" className="text-3xl font-semibold tracking-tight md:text-5xl">
                {'이런 걸 만듭니다.\n필요한 것만, 정확하게.'}
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

      <Section title="LetterReveal · SplitHeadline" desc="글자가 제각각 흩어진 위치에서 날아와 자리잡는다. v2 Capabilities 제목은 스크롤 진행도로 그렸고, 여기서는 뷰포트 진입 시 한 번. 산포는 결정적(sin·fract)이라 렌더마다 같다. SplitHeadline 은 애니메이션 없이 글자만 쪼갠다." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { LetterReveal, SplitHeadline } from '@/components/motion'

<LetterReveal as="h2" text="무엇을, 얼마나 깊게 다루는가." className="text-3xl font-semibold tracking-tight md:text-5xl" scatter={40} />

{/* rAF 루프가 [data-l] 을 찾아 직접 움직일 때 */}
<h2><SplitHeadline text="…" letterClassName="inline-block" letterStyle={{ opacity: 0 }} /></h2>`}
        >
          <Replay>
            {() => <LetterReveal as="h2" text="무엇을, 얼마나 깊게 다루는가." className="text-3xl font-semibold tracking-tight md:text-5xl" />}
          </Replay>
        </Preview>
      </Section>

      <Section title="rise-in (CSS)" desc="히어로처럼 첫 화면에 바로 보여야 하는 것은 motion 대신 CSS 키프레임. 스타일시트 파싱 즉시 재생돼 hydration 을 기다리지 않는다.">
        <Preview
          theme="dark"
          code={`<p className="rise-in label">// AI · 웹 · 앱 개발 스튜디오</p>
<h1>
  <span className="rise-in rise-d1 block">복잡함은 지우고,</span>
  <span className="rise-in rise-d2 block">효과만 남깁니다.</span>
</h1>
<p className="rise-in rise-d3">…</p>
<div className="rise-in rise-d4">CTA</div>`}
        >
          <Replay>
            {() => (
              <div className="max-w-xl">
                <p className="rise-in flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-fg-dim uppercase">
                  <span className="inline-block h-px w-8 bg-accent" aria-hidden /> AI · 웹 · 앱 개발 스튜디오
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
                  <span className="rise-in rise-d1 block">복잡함은 지우고,</span>
                  <span className="rise-in rise-d2 block">효과만 남깁니다.</span>
                </h1>
                <p className="rise-in rise-d3 mt-6 max-w-md text-fg-dim">AI와 웹·앱을 다루는 개발팀입니다. 기술을 깊게 파고, 잘 작동하는 제품으로 만듭니다.</p>
              </div>
            )}
          </Replay>
        </Preview>
        <Note>둘 다 prefers-reduced-motion 을 존중한다. Reveal 계열은 initial 을 건너뛰고, rise-in 은 @media 에서 animation: none.</Note>
      </Section>
    </DocPage>
  )
}
