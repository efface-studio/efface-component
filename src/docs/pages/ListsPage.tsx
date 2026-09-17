import { DocPage, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { Accordion } from '@/components/ui/Accordion'
import { NumberedRow } from '@/components/ui/NumberedRow'
import { MetaGrid } from '@/components/ui/Card'
import { Stat } from '@/components/ui/Counter'
import { Reveal } from '@/components/motion/Reveal'

const FAQ = [
  { q: '견적은 어떻게 받나요?', a: '신청 폼에 요구사항을 적어 보내주시면 1영업일 내 회신드립니다. 범위가 정해지면 3일 내 착수합니다.' },
  { q: '수정 요청은 몇 번까지 가능한가요?', a: '단계별 2회. 방향 자체가 바뀌는 변경은 별도로 협의합니다.' },
  { q: '배포 후 유지보수는요?', a: '1개월 무상. 이후는 월 단위 유지보수 플랜을 제안드립니다.' },
]

const APPROACH = [
  { no: '01', title: '본질만 남기는 설계', desc: '화려함보다 명료함. 정말 필요한 것만 남을 때까지 덜어냅니다.' },
  { no: '02', title: '검증된 기술만', desc: '유행이 아니라 오래 살아남는 도구. 넘겨받아도 막히지 않는 코드를 씁니다.' },
  { no: '03', title: '끝까지 책임지는 완성도', desc: '배포로 끝이 아니라, 실제로 잘 돌아가는 상태까지 책임집니다.' },
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

<Accordion items={[{ q: '견적은 어떻게 받나요?', a: '…' }, …]} defaultOpen={0} />`}
        >
          <Accordion items={FAQ} />
        </Preview>
      </Section>

      <Section title="MetaGrid" desc="dl 기반 사실 표. 셀은 bg-bg, 사이는 line." sources={['v2']}>
        <Preview
          theme="dark"
          code={`import { MetaGrid } from '@/components/ui'

<MetaGrid items={[{ label: '대표', value: '서지완' }, { label: '다루는 것', value: 'AI · 웹 · 앱' }, { label: '연락', value: 'contact@efface.dev' }]} />`}
        >
          <MetaGrid items={[{ label: '대표', value: '서지완' }, { label: '다루는 것', value: 'AI · 웹 · 앱' }, { label: '연락', value: 'contact@efface.dev' }]} />
        </Preview>
      </Section>

      <Section title="Stat · Counter" desc="뷰포트에 들어오면 0 에서 목표까지 1.2초 ease-out-cubic. tabular-nums 라 폭이 흔들리지 않는다." sources={['v1']}>
        <Preview
          theme="light"
          code={`import { Stat, Counter } from '@/components/ui'

<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
  <Stat to={30} suffix="+" label="완료 프로젝트" />
  <Stat to={4.9} decimals={1} suffix=" / 5.0" label="평균 만족도" />
  <Stat to={62} suffix="%" label="평균 전환율 개선" />
  <Stat to={3} suffix="h" label="평균 회신" />
</div>
<p>총 <Counter to={1240} />건</p>`}
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
            <Stat to={30} suffix="+" label="완료 프로젝트" />
            <Stat to={4.9} decimals={1} suffix=" / 5.0" label="평균 만족도" />
            <Stat to={62} suffix="%" label="평균 전환율 개선" />
            <Stat to={3} suffix="h" label="평균 회신" />
          </div>
        </Preview>
      </Section>
    </DocPage>
  )
}
