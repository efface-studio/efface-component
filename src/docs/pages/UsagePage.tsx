import { useEffect, useState } from 'react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { REPO_URL, loadSource } from '@/docs/components/source.registry'
import { LinkUnderline } from '@/components/ui/LinkUnderline'

const INSTALL = `npm i react react-dom motion lucide-react clsx tailwind-merge
# 3D 데모(ParticleMorph3D · SolarSystem · LogoScene3D …)만
npm i three`

const STEPS = `# 1) 헬퍼 — 거의 모든 컴포넌트가 쓴다
src/lib/cn.ts        # 클래스 합치기
src/lib/motion.ts    # 공용 이징(EASE_OUT_EXPO …)
src/lib/device.ts    # 터치 기기 판별(무거운 데모의 해상도 조절)

# 2) 토큰 — index.css 의 :root / [data-theme] / @theme 블록
#    bg · surface · fg · fg-dim · line · accent … 을 Tailwind 유틸(bg-surface, text-fg-dim …)로 쓴다

# 3) 컴포넌트 파일 하나
src/components/fx/FluidInk.tsx`

const USE = `import { FluidInk } from '@/components/fx/FluidInk'

export function Hero() {
  return (
    <section className="relative h-[70vh]">
      <FluidInk />
      <h1 className="absolute inset-x-0 bottom-10 text-center text-4xl font-semibold">작게 일하고, 깊게 팝니다.</h1>
    </section>
  )
}`

const FORM = `import { EmailField, PasswordField, SubmitButton } from '@/components/form'

export function Login() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <form className="grid gap-4">
      <EmailField label="이메일" floating value={email} onChange={setEmail} />
      <PasswordField label="비밀번호" floating value={pw} onChange={setPw} strength rules />
      <SubmitButton status="idle">로그인</SubmitButton>
    </form>
  )
}`

/** index.css 에서 토큰 블록만 잘라 보여준다 */
function TokensSource() {
  const [css, setCss] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    loadSource('src/index.css')
      .then((s) => {
        if (!alive) return
        const start = s.indexOf(':root')
        const end = s.indexOf('@layer base')
        setCss(start >= 0 && end > start ? s.slice(start, end).trimEnd() : s.slice(0, 4000))
      })
      .catch(() => alive && setCss(null))
    return () => {
      alive = false
    }
  }, [])
  if (!css) return <p className="font-mono text-[11px] text-fg-faint">토큰 불러오는 중…</p>
  return (
    <div className="max-h-[480px] overflow-auto rounded-lg">
      <CodeBlock code={css} lang="css" />
    </div>
  )
}

export function UsagePage() {
  return (
    <DocPage eyebrow="usage" title="사용하기" lead="이 사이트의 컴포넌트·애니메이션은 전부 MIT 오픈소스예요. 패키지를 설치하는 방식이 아니라, 필요한 파일을 그대로 복사해 프로젝트에 넣고 고쳐 쓰는 방식이에요(shadcn 식). 각 데모의 코드 버튼에서 사용 예시와 실제 소스를 바로 볼 수 있어요.">
      <Section id="how" title="방식" desc="컴포넌트 파일 하나 + 헬퍼 두세 개 + 토큰. 그게 전부예요.">
        <ol className="grid gap-3 text-[14px] leading-relaxed text-fg-dim md:grid-cols-3">
          {[
            ['복사', '원하는 컴포넌트 파일을 그대로 가져와요. 데모 카드의 코드 › 소스에서 복사하거나 GitHub 에서 받아요.'],
            ['헬퍼·토큰', 'src/lib/cn.ts · motion.ts 와 index.css 의 색·간격 토큰을 함께 넣어요. 의존 파일은 코드 패널 위 칩에 나와요.'],
            ['수정', '이제 여러분 코드예요. 이름·색·타이밍을 마음대로 바꾸세요. 업데이트를 따라갈 의무도 없어요.'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl border border-line bg-surface p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-mono text-[11px] text-fg-faint">0{i + 1}</span>
                <span className="text-[14px] font-semibold text-fg">{t}</span>
              </div>
              {d}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="deps" title="준비물" desc="React 19 · Tailwind v4 · motion. 아이콘은 lucide-react, 3D 데모만 three.">
        <CodeBlock code={INSTALL} lang="bash" />
        <Note>
          Tailwind v4 가 아니어도 돼요 — 클래스는 대부분 표준 유틸이고, 토큰은 CSS 변수라 어떤 스택에서든 <code className="font-mono">var(--accent)</code> 처럼 쓸 수 있어요.
        </Note>
      </Section>

      <Section id="steps" title="가져오기" desc="처음 한 번은 이 순서로.">
        <CodeBlock code={STEPS} lang="bash" />
      </Section>

      <Section id="tokens" title="토큰" desc="index.css 의 라이트·다크 토큰과 Tailwind @theme 매핑. 이 블록을 여러분 CSS 에 붙여 넣으면 모든 컴포넌트의 색이 맞아요.">
        <TokensSource />
      </Section>

      <Section id="use" title="쓰기" desc="높이만 주면 되는 데모, 상태만 넘기면 되는 폼.">
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock code={USE} lang="tsx" />
          <CodeBlock code={FORM} lang="tsx" />
        </div>
      </Section>

      <Section id="license" title="라이선스" desc="MIT — 상업적 사용, 수정, 재배포 모두 자유예요. 저작권 표시만 남겨 주세요.">
        <p className="text-[14px] leading-relaxed text-fg-dim">
          소스와 이슈는{' '}
          <LinkUnderline href={REPO_URL} className="text-fg">
            GitHub efface-studio/efface-component
          </LinkUnderline>
          에 있어요. 텍스처·아이콘 같은 제3자 자료는 각자의 라이선스를 따라요(README 의 자료 출처 참고).
        </p>
      </Section>
    </DocPage>
  )
}
