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
      lead="번호 매긴 원칙 목록(v2 Approach), FAQ 아코디언(v1), 사실 메타 그리드(v2 About), 카운터 스탯(v1 Stats)."
      sources={['v1', 'v2']}
    >
      <Section title="NumberedRow" desc="번호(모노·액센트) + 제목 + 설명. border-t 를 가진 ul 안에 놓는다." sources={['v2']}>
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

      <Section title="Accordion" desc="번호 + 질문, 오른쪽 + 가 45° 돌아 × 가 되고 답은 height 0 → auto." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { Accordion } from '@/components/ui'

<Accordion items={[{ q: 'How do I get a quote?', a: '…' }, …]} defaultOpen={0} />`}
        >
          <Accordion items={FAQ} />
        </Preview>
      </Section>

      <Section title="MetaGrid" desc="dl 기반 사실 표. 셀은 bg-bg, 사이는 line." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { MetaGrid } from '@/components/ui'

<MetaGrid items={[{ label: 'CEO', value: 'Jiwan Seo' }, { label: 'Focus', value: 'AI · Web · App' }, { label: 'Contact', value: 'contact@efface.dev' }]} />`}
        >
          <MetaGrid items={[{ label: 'CEO', value: 'Jiwan Seo' }, { label: 'Focus', value: 'AI · Web · App' }, { label: 'Contact', value: 'contact@efface.dev' }]} />
        </Preview>
      </Section>

      <Section title="Stat · Counter" desc="뷰포트에 들어오면 0 에서 목표까지 1.2초 ease-out-cubic. tabular-nums 라 폭이 흔들리지 않는다." sources={['v1']}>
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
