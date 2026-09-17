import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { Preview } from '@/docs/components/Preview'
import { FONT_STACKS, TYPE_SCALE } from '@/tokens/typography'

export function TypographyPage() {
  return (
    <DocPage
      eyebrow="foundations"
      title="Typography"
      lead="본문과 제목은 Pretendard, 라벨·번호·코드는 JetBrains Mono를 써요. 제목은 자간을 살짝 좁히고(tracking-tight), 리드 문단은 행간을 넉넉히(leading-relaxed) 잡습니다."
      sources={['v1', 'v2']}
    >
      <Section title="서체">
        <ul className="grid gap-4 md:grid-cols-2">
          {FONT_STACKS.map((f) => (
            <li key={f.name} className="rounded-lg border border-line p-5">
              <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">font-{f.name}</p>
              <p className="text-3xl tracking-tight" style={{ fontFamily: f.value, fontWeight: f.name === 'black' ? 400 : 600 }}>
                efface Erase Aa 0123
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed break-all text-fg-faint">{f.value}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-fg-dim">{f.note}</p>
            </li>
          ))}
        </ul>
        <CodeBlock
          lang="html"
          code={`<!-- Pretendard: npm 패키지의 dynamic-subset — 필요한 유니코드 범위만 받는다 -->
@import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

<!-- Space Grotesk · Archivo Black: Google Fonts (v2 워드마크·배경 워드) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&display=swap" />`}
        />
        <Note>
          본문에는 <code className="font-mono">font-feature-settings: 'ss01', 'ss02', 'cv01'</code>을 켜두세요. Pretendard의 대체 글리프로 숫자와 영문이 조금 더 단정해져요. 숫자가 바뀔 때 폭이 흔들리면 <code className="font-mono">tabular-nums</code>를 더하면 됩니다.
        </Note>
      </Section>

      <Section title="타입 스케일" desc="실제 섹션에서 쓰는 클래스 조합 그대로예요. 반응형 접두어까지 붙어 있으니 그대로 복사해서 쓰세요.">
        <div className="space-y-px overflow-hidden rounded-xl border border-line bg-line">
          {TYPE_SCALE.map((t) => (
            <div key={t.name} className="grid gap-3 bg-bg p-5 md:grid-cols-[180px_1fr]">
              <div>
                <p className="text-[12.5px] font-medium">{t.name}</p>
                <p className="mt-1 text-[11px] text-fg-faint">{t.where}</p>
              </div>
              <div className="min-w-0">
                <p className={t.classes}>{t.sample}</p>
                <p className="mt-3 font-mono text-[11px] break-all text-fg-faint">{t.classes}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="섹션 헤더" desc="모노 라벨, 제목, 리드 순서예요. v1은 라벨 전체를 흐리게, v2는 슬래시만 강조색으로 칠해요.">
        <Preview
          theme="dark"
          code={`<p className="label"><span className="text-accent">//</span> approach</p>
<h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Less, but precise.</h2>
<p className="mt-6 max-w-md text-fg-dim">efface means "to erase". We solve problems by taking things away.</p>`}
        >
          <p className="label">
            <span className="text-accent">//</span> approach
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Less, but precise.</h2>
          <p className="mt-6 max-w-md text-fg-dim">efface means "to erase". We solve problems by taking things away.</p>
        </Preview>
        <Preview
          theme="light"
          code={`<p className="mb-3 font-mono text-xs text-fg-dim">{"// services"}</p>
<h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
  What we build.<br />
  <span className="text-fg-dim">Only what matters, precisely.</span>
</h2>`}
        >
          <p className="mb-3 font-mono text-xs text-fg-dim">{'// services'}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            What we build.
            <br />
            <span className="text-fg-dim">Only what matters, precisely.</span>
          </h2>
        </Preview>
      </Section>
    </DocPage>
  )
}
