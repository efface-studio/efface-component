import { useEffect, useState } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Strike } from '@/components/motion/Strike'
import { TypeWriter } from '@/components/motion/TypeWriter'
import { EffaceSentence } from '@/components/motion/EffaceSentence'

const SENTENCE = 'We erase instead of adding. {orb1} Strip the ~clutter,~ remove the ~friction,~ keep only the {orb2} essence. The less there is, the clearer it gets — the *efface* way.'

function SentenceDemo() {
  const [p, setP] = useState(0)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = (now - last) / 1000
      last = now
      setP((v) => (v >= 1.15 ? 0 : v + dt / 5))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Button size="sm" variant="secondary" onClick={() => setPlaying((v) => !v)}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <label className="flex flex-1 items-center gap-3 font-mono text-xs text-fg-faint">
          progress
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={Math.min(1, p)}
            onChange={(e) => {
              setPlaying(false)
              setP(Number(e.target.value))
            }}
            className="w-full accent-(--accent)"
          />
          {Math.min(1, p).toFixed(2)}
        </label>
      </div>
      <EffaceSentence sentence={SENTENCE} progress={Math.min(1, p)} />
    </div>
  )
}

export function MotionTextPage() {
  const [struck, setStruck] = useState(true)
  return (
    <DocPage
      eyebrow="motion"
      title="Text"
      lead="글자 위에서 벌어지는 일. 파란 취소선(v2 푸터 · Mom-Work 푸터), 타이핑(v2 EffaceIntro 라벨), 그리고 단어가 하나씩 켜지는 문장(v2 EffaceIntro)."
      sources={['v2', 'mom']}
    >
      <Section title="Strike" desc="단어가 흐린 회색으로 물러나고 파란 선이 왼쪽에서 scaleX 로 그어진다. shown 을 true 로 바꾸는 순간 재생 — IntersectionObserver 나 상태에 묶는다." sources={['v2', 'mom']}>
        <Preview
          theme="dark"
          code={`import { Strike } from '@/components/motion'

<p className="text-2xl font-semibold tracking-tight">
  Erase the <Strike shown={shown} delay={500}>complexity</Strike>. Keep the effect.
</p>
<p>Less, but <Strike shown={shown} delay={800}>louder</Strike> — sharper.</p>`}
        >
          <div className="mb-6">
            <Button size="sm" variant="secondary" onClick={() => setStruck((v) => !v)}>
              {struck ? 'Reset' : 'Strike'}
            </Button>
          </div>
          <p className="text-2xl font-semibold tracking-tight md:text-3xl">
            Erase the{' '}
            <Strike shown={struck} delay={100}>
              complexity
            </Strike>
            . Keep the effect.
          </p>
          <p className="mt-3 text-lg font-medium tracking-tight text-fg-dim">
            Less, but{' '}
            <Strike shown={struck} delay={400}>
              louder
            </Strike>
            {' '}— sharper.
          </p>
        </Preview>
        <PropsTable
          rows={[
            { name: 'shown', type: 'boolean', desc: 'true 가 되면 선이 그어진다' },
            { name: 'delay', type: 'number', default: '0', desc: 'ms' },
            { name: 'color', type: 'string', default: "'#3B82F6'", desc: '선 색' },
          ]}
        />
      </Section>

      <Section title="TypeWriter" desc="한 글자씩 타이핑. 전체 텍스트를 투명하게 깔아 높이가 흔들리지 않는다. reduced-motion 이면 전문을 바로 보여준다." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { TypeWriter } from '@/components/motion'

<Label slash>
  <TypeWriter text="EFFACE" speed={60} />
</Label>
<p className="font-mono text-sm leading-[1.9] text-fg-dim">
  <TypeWriter text="ef·face /ɪˈfeɪs/ — verb · 1. to rub out, to erase · 2. to make (a memory, an impression) fade" speed={18} delay={600} caret={false} />
</p>`}
        >
          <Label>
            <TypeWriter text="EFFACE" speed={60} />
          </Label>
          <p className="mt-4 max-w-xl font-mono text-[13.5px] leading-[1.9] text-fg-dim">
            <TypeWriter text="ef·face /ɪˈfeɪs/ — verb · 1. to rub out, to erase · 2. to make (a memory, an impression) fade · 3. efface oneself — to keep out of the spotlight" speed={18} delay={600} caret={false} />
          </p>
        </Preview>
      </Section>

      <Section
        title="EffaceSentence"
        desc="단어가 하나씩 켜지는 문장. ~단어~ 는 켜졌다 회색으로 물러나며 취소선이 그어지고, *단어* 는 액센트 색, {orb1} 은 회전하며 튀어나오는 구슬. 진행도(0→1)는 스크롤·슬라이더·타이머 무엇이든 밀어 넣는다. 페인트는 DOM 에 직접 쓰므로 리렌더가 없다."
        sources={['v2']}
      >
        <Preview
          theme="dark"
          lockTheme
          code={`import { EffaceSentence } from '@/components/motion'

const SENTENCE = 'We erase instead of adding. {orb1} Strip the ~clutter,~ remove the ~friction,~ keep only the {orb2} essence. The less there is, the clearer it gets — the *efface* way.'

<EffaceSentence sentence={SENTENCE} progress={progress} />

// v2 원본은 핀 고정 씬의 스크롤 진행도를 넣었다:
usePinnedSceneMotion(rootRef, (p) => setProgress(p * timelineEnd), !isMobile)`}
        >
          <SentenceDemo />
        </Preview>
        <Note>
          v2 원본 씬에는 이 문장 앞에 잡동사니 이미지가 흩어져 있고, 가운데에서 커지는 원형 마스크가 지우개(EraserPuck)와 함께 그것을 지운다. 이미지 자산이 있는 씬이라 여기서는 문장 타임라인만 옮겼다.
        </Note>
      </Section>
    </DocPage>
  )
}
