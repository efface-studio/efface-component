import { DocPage, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { Accordion } from '@/components/ui/Accordion'
import { NumberedRow } from '@/components/ui/NumberedRow'
import { MetaGrid } from '@/components/ui/Card'
import { Stat } from '@/components/ui/Counter'
import { Reveal } from '@/components/motion/Reveal'

const FAQ = [
  { q: 'How do I get a quote?', a: 'Send your requirements through the form and we reply within one business day. Once scope is set, we start within three days.' },
  { q: 'How many revision rounds?', a: 'Two per stage. Changes of direction are discussed separately.' },
  { q: 'What about maintenance after launch?', a: 'One month free. After that we propose a monthly plan.' },
]

const APPROACH = [
  { no: '01', title: 'Keep the essence', desc: 'Clarity over flair. We cut until only what matters is left.' },
  { no: '02', title: 'Proven tools only', desc: 'Tools that last, not tools that trend. Code anyone can inherit.' },
  { no: '03', title: 'Own it to the end', desc: 'Not shipped — working. We stay until it actually runs well.' },
]

export function ListsPage() {
  return (
    <DocPage
      eyebrow="components"
      title="Lists & Data"
      lead="번호를 매긴 원칙 목록, FAQ 아코디언, 회사 정보 같은 메타 표, 숫자가 올라가는 카운터를 모았어요."
      sources={['v1', 'v2']}
    >
      <Section title="NumberedRow" desc="강조색 번호에 제목과 설명이 붙은 한 줄이에요. 위쪽 선이 있는 ul 안에 넣어 쓰세요." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { NumberedRow } from '@/components/ui'

<ul className="border-t border-line">
  {items.map((it, i) => (
    <Reveal key={it.no} delay={i * STAGGER.tight}>
      <NumberedRow no={it.no} title={it.title} desc={it.desc} />
    </Reveal>
  ))}
</ul>`}
        >
          <ul className="border-t border-line">
            {APPROACH.map((it, i) => (
              <Reveal key={it.no} delay={i * 0.06}>
                <NumberedRow no={it.no} title={it.title} desc={it.desc} />
              </Reveal>
            ))}
          </ul>
        </Preview>
      </Section>

      <Section title="Accordion" desc="번호와 질문이 한 줄에 있고, 오른쪽 +가 45° 돌아 ×가 되면서 답이 펼쳐져요." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { Accordion } from '@/components/ui'

<Accordion items={[{ q: 'How do I get a quote?', a: '…' }, …]} defaultOpen={0} />`}
        >
          <Accordion items={FAQ} />
        </Preview>
      </Section>

      <Section title="MetaGrid" desc="dl로 만든 정보 표예요. 셀 사이는 1px 선으로 나뉘어요." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { MetaGrid } from '@/components/ui'

<MetaGrid items={[{ label: 'CEO', value: 'Jiwan Seo' }, { label: 'Focus', value: 'AI · Web · App' }, { label: 'Contact', value: 'contact@efface.dev' }]} />`}
        >
          <MetaGrid items={[{ label: 'CEO', value: 'Jiwan Seo' }, { label: 'Focus', value: 'AI · Web · App' }, { label: 'Contact', value: 'contact@efface.dev' }]} />
        </Preview>
      </Section>

      <Section title="Stat · Counter" desc="화면에 들어오면 0부터 목표 숫자까지 1.2초 동안 올라가요. 고정폭 숫자라 자릿수가 바뀌어도 흔들리지 않아요." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { Stat, Counter } from '@/components/ui'

<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
  <Stat to={30} suffix="+" label="Projects shipped" />
  <Stat to={4.9} decimals={1} suffix=" / 5.0" label="Avg. satisfaction" />
  <Stat to={62} suffix="%" label="Avg. conversion lift" />
  <Stat to={3} suffix="h" label="Avg. reply time" />
</div>
<p><Counter to={1240} /> requests</p>`}
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
            <Stat to={30} suffix="+" label="Projects shipped" />
            <Stat to={4.9} decimals={1} suffix=" / 5.0" label="Avg. satisfaction" />
            <Stat to={62} suffix="%" label="Avg. conversion lift" />
            <Stat to={3} suffix="h" label="Avg. reply time" />
          </div>
        </Preview>
      </Section>
    </DocPage>
  )
}
