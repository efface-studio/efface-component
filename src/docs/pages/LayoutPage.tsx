import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { Preview } from '@/docs/components/Preview'

const CONTAINERS = [
  { name: 'max-w-page', value: '1400px', pad: 'px-6 md:px-10', where: 'v2 전 섹션 · Nav' },
  { name: 'max-w-page-v1', value: '1200px', pad: 'px-5 md:px-8', where: 'v1 전 섹션 · Header · Footer' },
  { name: 'max-w-prose', value: '1080px', pad: '—', where: 'v2 EffaceIntro 본문 · 이 문서' },
  { name: 'max-w-6xl', value: '1152px', pad: 'px-4', where: 'Mom-Work 본문 · SiteFooter' },
  { name: 'max-w-[1600px]', value: '1600px', pad: 'px-4 sm:px-6', where: 'Mom-Work 배너 (본문보다 넓게)' },
]

const RHYTHM = [
  { name: '섹션 세로 여백 (v2)', value: 'py-24 md:py-36', note: 'Contact처럼 강조 섹션은 py-28 md:py-44' },
  { name: '섹션 세로 여백 (v1)', value: 'py-20 md:py-28', note: 'Stats 같은 얇은 띠는 py-16 md:py-20' },
  { name: '섹션 헤더 → 본문', value: 'mb-12', note: '제목 블록과 그리드 사이' },
  { name: '2단 그리드', value: 'grid gap-12 md:grid-cols-12 md:gap-16', note: '좌 col-span-5 (제목) · 우 col-span-7 (본문)' },
  { name: '카드 안 여백', value: 'p-6 md:p-7', note: 'Manifesto처럼 넉넉한 카드는 p-7 md:p-10' },
  { name: '섹션 구분', value: 'border-t border-line', note: '배경 교차는 bg-bg ↔ bg-bg-soft' },
]

export function LayoutPage() {
  return (
    <DocPage
      eyebrow="foundations"
      title="Layout"
      lead="컨테이너 폭, 섹션 리듬, 2단 그리드. 세 사이트 모두 좌 5 / 우 7 의 12열 그리드와 1px 선 구분을 기본으로 한다."
      sources={['v1', 'v2']}
    >
      <Section title="컨테이너">
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-bg-soft font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">
                <th className="px-4 py-2.5 font-medium">class</th>
                <th className="px-4 py-2.5 font-medium">width</th>
                <th className="px-4 py-2.5 font-medium">padding</th>
                <th className="px-4 py-2.5 font-medium">쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {CONTAINERS.map((c) => (
                <tr key={c.name} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 font-mono text-accent">{c.name}</td>
                  <td className="px-4 py-2.5 font-mono text-fg-dim">{c.value}</td>
                  <td className="px-4 py-2.5 font-mono text-fg-dim">{c.pad}</td>
                  <td className="px-4 py-2.5 text-fg-dim">{c.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={`<div className="mx-auto max-w-page px-6 md:px-10">…</div>   {/* v2 */}
<div className="mx-auto max-w-page-v1 px-5 md:px-8">…</div> {/* v1 */}`} />
      </Section>

      <Section title="리듬">
        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {RHYTHM.map((r) => (
            <li key={r.name} className="bg-bg p-4">
              <p className="text-[13px] font-medium">{r.name}</p>
              <p className="mt-1 font-mono text-[12px] text-accent">{r.value}</p>
              <p className="mt-1 text-[12px] text-fg-dim">{r.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="2단 섹션" desc="v2 About / Approach 의 뼈대. 왼쪽에 라벨·제목·리드, 오른쪽에 본문.">
        <Preview
          theme="dark"
          bleed
          code={`<section className="border-t border-line bg-bg py-24 md:py-36">
  <div className="mx-auto max-w-page px-6 md:px-10">
    <div className="grid gap-12 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-5">{/* label · h2 · lead */}</div>
      <div className="md:col-span-7">{/* 본문 */}</div>
    </div>
  </div>
</section>`}
        >
          <section className="border-t border-line py-16">
            <div className="mx-auto max-w-page px-6 md:px-10">
              <div className="grid gap-8 md:grid-cols-12 md:gap-16">
                <div className="rounded-lg border border-dashed border-line-strong p-5 md:col-span-5">
                  <p className="font-mono text-[11px] text-fg-faint">md:col-span-5</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">제목 블록</p>
                  <p className="mt-2 text-sm text-fg-dim">라벨 · 제목 · 리드</p>
                </div>
                <div className="rounded-lg border border-dashed border-line-strong p-5 md:col-span-7">
                  <p className="font-mono text-[11px] text-fg-faint">md:col-span-7</p>
                  <p className="mt-3 text-sm text-fg-dim">본문 · 목록 · 메타 그리드</p>
                </div>
              </div>
            </div>
          </section>
        </Preview>
        <Note>
          모바일(md 미만)에서는 열이 세로로 쌓이고 gap 이 12 로 줄어든다. 핀 고정 스크롤 씬(v2 EffaceIntro · AppCards · Capabilities)은 md 미만에서 정적 스택으로 대체된다 — 씬을 축소하면 타입이 읽히지 않기 때문이다.
        </Note>
      </Section>

      <Section title="1px 선 그리드" desc="카드 사이 간격을 gap-px 와 배경 line 색으로 만든다. 셀은 bg-surface 를 직접 칠한다.">
        <Preview
          theme="light"
          code={`<div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
  <div className="bg-surface p-6">…</div>
  <div className="bg-surface p-6">…</div>
  <div className="bg-surface p-6">…</div>
</div>`}
        >
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {['셀 1', '셀 2', '셀 3'].map((c) => (
              <div key={c} className="bg-surface p-6 text-sm text-fg-dim">
                {c}
              </div>
            ))}
          </div>
        </Preview>
      </Section>
    </DocPage>
  )
}
