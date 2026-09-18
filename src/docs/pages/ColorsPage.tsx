import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { SpecTable } from '@/docs/components/SpecTable'
import { APP_GRADIENTS, BRAND_COLORS, NAVY, SEMANTIC_COLORS, SPECTRUM } from '@/tokens/colors'

function Swatch({ value, label, sub, ring }: { value: string; label: string; sub?: string; ring?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-8 w-8 shrink-0 rounded-md" style={{ background: value, boxShadow: ring ? 'inset 0 0 0 1px var(--line-strong)' : undefined }} />
      <div className="min-w-0">
        <div className="truncate font-mono text-[12px] text-fg">{label}</div>
        {sub && <div className="truncate font-mono text-[11px] text-fg-faint">{sub}</div>}
      </div>
    </div>
  )
}

export function ColorsPage() {
  return (
    <DocPage
      eyebrow="foundations"
      title="Colors"
      lead="라이트와 다크, 두 테마를 토큰 한 벌로 씁니다. 라이트는 efface.dev의 종이 위 잉크, 다크는 v2의 검정 바탕이에요. 클래스는 bg-bg, text-fg, border-line처럼 토큰 이름을 그대로 붙이면 됩니다."
      sources={['v1', 'v2', 'mom']}
    >
      <Section title="시맨틱 토큰" desc="data-theme 속성이 걸린 범위 안에서만 값이 바뀌어요. 그래서 이 문서의 프리뷰처럼 페이지 안에 다른 테마를 섞어 넣을 수 있어요.">
        <SpecTable
          columns={[
            { key: 'token', label: 'token', width: '140px', mono: true },
            { key: 'light', label: 'light', width: 'minmax(0,1fr)' },
            { key: 'dark', label: 'dark', width: 'minmax(0,1fr)' },
            { key: 'role', label: '역할', width: 'minmax(0,1.6fr)' },
          ]}
          rows={SEMANTIC_COLORS.map((c) => ({
            token: c.utility,
            light: <Swatch value={c.light} label={c.light} ring />,
            dark: <Swatch value={c.dark} label={c.dark} ring />,
            role: c.role,
          }))}
        />
        <Note>
          accent는 테마마다 달라요. 라이트는 Tailwind blue-600(#2563EB), 다크는 로고에서 따온 #3B62E5. 테마와 상관없이 로고 블루가 필요하면 <code className="font-mono">brand</code>를 쓰세요.
        </Note>
        <CodeBlock
          lang="css"
          code={`/* index.css — 값은 :root / [data-theme] 에, 유틸리티는 @theme inline 으로 */
:root, [data-theme='light'] { --bg: #ffffff; --fg: #0a0a0a; --accent: #2563eb; /* … */ }
[data-theme='dark']         { --bg: #0a0a0b; --fg: #f6f6f7; --accent: #3b62e5; /* … */ }

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-accent: var(--accent);
}`}
        />
        <CodeBlock
          code={`<section className="bg-bg text-fg border-t border-line">
  <p className="label"><span className="text-accent">//</span> about</p>
  <p className="text-fg-dim">Secondary text</p>
</section>

{/* 부분 테마 — 이 안에서만 다크 */}
<div data-theme="dark" className="bg-bg text-fg">…</div>`}
        />
      </Section>

      <Section title="브랜드 고정 컬러" desc="테마가 바뀌어도 그대로인 색이에요.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BRAND_COLORS.map((c) => (
            <li key={c.name} className="rounded-lg border border-line p-4">
              <Swatch value={c.value} label={c.utility} sub={c.value} ring />
              <p className="mt-3 text-[12.5px] leading-relaxed text-fg-dim">{c.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="스펙트럼" desc="v2 역량 카드 네 열의 강조색이자, 푸터 워드마크 그라데이션의 정지점이기도 해요. 카드에 --acc로 내려보내면 칩과 대시가 알아서 섞어 써요." sources={['v2']}>
        <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${SPECTRUM.map((s) => s.value).join(', ')})` }} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPECTRUM.map((c) => (
            <li key={c.name} className="rounded-lg border border-line p-4">
              <Swatch value={c.value} label={c.name} sub={c.value} />
              <p className="mt-3 text-[12.5px] text-fg-dim">{c.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="서비스 카드 그라데이션" desc="v2 서비스 카드 네 장의 바탕이에요. 160° 방향에 정지점 세 개, 하이라이트 세기(--sheen)는 카드마다 조금씩 달라요." sources={['v2']}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APP_GRADIENTS.map((g) => (
            <li key={g.name} className="overflow-hidden rounded-xl border border-line">
              <div className="h-24" style={{ background: g.value }} />
              <div className="p-3">
                <div className="text-sm font-medium">{g.name}</div>
                <div className="mt-1 font-mono text-[10.5px] leading-relaxed break-all text-fg-faint">{g.value}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="네이비 (SiteFooter)" desc="Mom-Work 푸터는 순검정 대신 살짝 푸른 네이비예요. 밝은 페이지 아래 붙여도 무겁지 않아요." sources={['mom']}>
        <div className="rounded-xl p-5" style={{ background: '#0B1220' }}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {NAVY.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="h-8 w-8 shrink-0 rounded-md" style={{ background: c.value, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }} />
                <div>
                  <div className="font-mono text-[11px] text-[#E5E9F0]">{c.value}</div>
                  <div className="text-[11px] text-[#6E7A90]">{c.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </DocPage>
  )
}
