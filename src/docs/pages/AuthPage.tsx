import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { TextField } from '@/components/form/TextField'
import { PasswordField } from '@/components/form/PasswordField'
import { Checkbox } from '@/components/form/Checkbox'
import { OTPInput, type OTPStatus } from '@/components/form/OTPInput'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/brand/LogoMark'
import { Wordmark } from '@/components/brand/Wordmark'
import { Label } from '@/components/ui/Label'
import { LinkUnderline } from '@/components/ui/LinkUnderline'

/** 왼쪽 브랜드 패널 + 오른쪽 폼. md 미만은 폼만. */
function AuthShell({ children, eyebrow, headline }: { children: ReactNode; eyebrow: string; headline: string }) {
  return (
    <div className="grid min-h-[640px] md:grid-cols-[5fr_7fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-bg-soft p-10 md:flex">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,98,229,0.35),transparent_65%)] blur-2xl" />
        <Wordmark />
        <div className="relative">
          <Label>{eyebrow}</Label>
          <p className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight">{headline}</p>
        </div>
        <p className="relative font-mono text-[11px] text-fg-faint">© efface</p>
      </aside>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <LogoMark className="h-6 w-6 text-fg" />
            <span className="font-semibold tracking-tight">efface</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[11px] text-fg-faint">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  return (
    <AuthShell eyebrow="welcome back" headline="복잡함은 지우고, 효과만 남깁니다.">
      <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
      <p className="mt-1.5 text-[13.5px] text-fg-dim">
        계정이 없다면{' '}
        <LinkUnderline href="#" className="text-fg">
          회원가입
        </LinkUnderline>
      </p>
      <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <TextField label="이메일" type="email" placeholder="you@company.com" leading={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <PasswordField label="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
        <div className="flex items-center justify-between">
          <Checkbox label="로그인 상태 유지" />
          <LinkUnderline href="#" className="text-[13px] text-fg-dim hover:text-fg">
            비밀번호를 잊으셨나요?
          </LinkUnderline>
        </div>
        <Button type="submit" size="lg" className="w-full" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
          로그인
        </Button>
      </form>
      <Divider>또는</Divider>
      <div className="grid gap-2.5">
        <Button variant="kakao" size="lg" className="w-full">
          카카오로 계속하기
        </Button>
        <Button variant="secondary" size="lg" className="w-full">
          Google로 계속하기
        </Button>
      </div>
    </AuthShell>
  )
}

function SignupScreen() {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const mismatch = pw2 && pw !== pw2 ? '비밀번호가 서로 달라요.' : undefined
  return (
    <AuthShell eyebrow="get started" headline="작게 일하고, 깊게 팝니다.">
      <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
      <p className="mt-1.5 text-[13.5px] text-fg-dim">
        이미 계정이 있다면{' '}
        <LinkUnderline href="#" className="text-fg">
          로그인
        </LinkUnderline>
      </p>
      <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <TextField label="이름" placeholder="서지완" autoComplete="name" />
        <TextField label="이메일" type="email" placeholder="you@company.com" leading={<Mail size={16} />} autoComplete="email" />
        <PasswordField label="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} strength autoComplete="new-password" placeholder="8자 이상, 대소문자·숫자 섞어서" />
        <PasswordField label="비밀번호 확인" value={pw2} onChange={(e) => setPw2(e.target.value)} error={mismatch} autoComplete="new-password" />
        <Checkbox
          label={
            <>
              <a href="#" className="link-underline text-fg">
                이용약관
              </a>
              과{' '}
              <a href="#" className="link-underline text-fg">
                개인정보처리방침
              </a>
              에 동의해요
            </>
          }
        />
        <Button type="submit" size="lg" className="w-full" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
          계정 만들기
        </Button>
      </form>
    </AuthShell>
  )
}

function VerifyScreen() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<OTPStatus>('idle')
  const [left, setLeft] = useState(30)
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  const verify = (c: string) => {
    setStatus('verifying')
    window.setTimeout(() => {
      setStatus(c === '123456' ? 'success' : 'error')
      if (c !== '123456') window.setTimeout(() => setStatus('idle'), 900)
    }, 1400)
  }
  return (
    <AuthShell eyebrow="verify" headline="메일로 보낸 6자리 코드를 입력해 주세요.">
      <button type="button" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-fg-dim hover:text-fg">
        <ArrowLeft size={14} /> 뒤로
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">인증코드 입력</h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-dim">
        <span className="font-medium text-fg">you@company.com</span> 으로 보낸 코드를 입력하세요. 데모에서는 <span className="font-mono text-fg">123456</span> 이 정답이에요.
      </p>
      <div className="mt-8">
        <OTPInput value={code} onChange={setCode} onComplete={verify} status={status} errorMessage="코드가 맞지 않아요. 다시 확인해 주세요." label="" autoFocus />
      </div>
      <div className="mt-6 flex items-center justify-between text-[13px]">
        <span className="text-fg-dim">코드를 못 받으셨나요?</span>
        {left > 0 ? (
          <span className="font-mono text-fg-faint tabular-nums">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')} 후 재전송</span>
        ) : (
          <button type="button" onClick={() => setLeft(30)} className="link-underline text-fg">
            다시 보내기
          </button>
        )}
      </div>
      {status === 'success' && (
        <Button size="lg" className="mt-8 w-full" trailing={<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}>
          계속하기
        </Button>
      )}
    </AuthShell>
  )
}

function ForgotScreen() {
  const [sent, setSent] = useState(false)
  return (
    <AuthShell eyebrow="reset" headline="비밀번호를 다시 설정할게요.">
      <h1 className="text-2xl font-semibold tracking-tight">비밀번호 찾기</h1>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-dim">가입한 이메일로 재설정 링크를 보내 드려요.</p>
      {sent ? (
        <div className="mt-8 rounded-xl border border-line bg-bg-soft p-5">
          <p className="text-[14px] font-medium">메일을 보냈어요</p>
          <p className="mt-1 text-[13px] text-fg-dim">몇 분 안에 도착해요. 스팸함도 확인해 주세요.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSent(false)}>
            다른 이메일로
          </Button>
        </div>
      ) : (
        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <TextField label="이메일" type="email" placeholder="you@company.com" leading={<Mail size={16} />} autoComplete="email" required />
          <Button type="submit" size="lg" className="w-full">
            재설정 링크 보내기
          </Button>
          <LinkUnderline href="#" className="self-center text-[13px] text-fg-dim hover:text-fg">
            로그인으로 돌아가기
          </LinkUnderline>
        </form>
      )}
    </AuthShell>
  )
}

export function AuthPage() {
  return (
    <DocPage
      eyebrow="recipes"
      title="Auth"
      lead="로그인 · 회원가입 · 인증코드 · 비밀번호 찾기 화면이에요. 왼쪽 5 / 오른쪽 7 분할, 폼 폭은 380px. 모바일에서는 브랜드 패널이 빠지고 폼만 남아요. 테마를 바꿔 가며 보세요."
    >
      <Section title="로그인" desc="이메일 + 비밀번호, 로그인 유지, 비밀번호 찾기 링크. 아래에 카카오·Google 소셜 버튼.">
        <Preview theme="dark" bleed code={`<AuthShell eyebrow="welcome back" headline="복잡함은 지우고, 효과만 남깁니다.">
  <h1>로그인</h1>
  <form className="mt-8 flex flex-col gap-5">
    <TextField label="이메일" type="email" leading={<Mail size={16} />} autoComplete="email" />
    <PasswordField label="비밀번호" />
    <div className="flex items-center justify-between"><Checkbox label="로그인 상태 유지" /><LinkUnderline href="/forgot">비밀번호를 잊으셨나요?</LinkUnderline></div>
    <Button type="submit" size="lg" className="w-full">로그인</Button>
  </form>
  <Divider>또는</Divider>
  <Button variant="kakao" size="lg" className="w-full">카카오로 계속하기</Button>
</AuthShell>`}>
          <LoginScreen />
        </Preview>
      </Section>

      <Section title="회원가입" desc="이름 · 이메일 · 비밀번호(강도 미터) · 확인(불일치 오류) · 약관 동의.">
        <Preview theme="dark" bleed>
          <SignupScreen />
        </Preview>
      </Section>

      <Section title="인증코드" desc="OTPInput 과 재전송 카운트다운. 6자리가 차면 바로 검증하고, 성공하면 계속하기 버튼이 나타나요. 데모 정답은 123456.">
        <Preview theme="dark" bleed>
          <VerifyScreen />
        </Preview>
      </Section>

      <Section title="비밀번호 찾기" desc="이메일 하나만. 보낸 뒤에는 확인 카드로 바뀌어요.">
        <Preview theme="dark" bleed>
          <ForgotScreen />
        </Preview>
        <Note>폼 전송은 데모라 아무 데도 가지 않아요. 실제 연결은 react-hook-form + zod(v1 신청 폼과 같은 조합)를 권해요.</Note>
      </Section>
    </DocPage>
  )
}
