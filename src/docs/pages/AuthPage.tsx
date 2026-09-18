import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, User } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { CodeBlock } from '@/docs/components/CodeBlock'
import { TextField } from '@/components/form/TextField'
import { EmailField } from '@/components/form/EmailField'
import { PasswordField } from '@/components/form/PasswordField'
import { Checkbox } from '@/components/form/Checkbox'
import { OTPInput, type OTPStatus } from '@/components/form/OTPInput'
import { SubmitButton, type SubmitStatus } from '@/components/form/SubmitButton'
import { SocialButton } from '@/components/form/SocialButton'
import { SentMail } from '@/components/form/SentMail'
import { PASSWORD_RULES } from '@/components/form/passwordScore'
import { EMAIL_RE } from '@/components/form/emailDomains'
import { Button } from '@/components/ui/Button'
import { LinkUnderline } from '@/components/ui/LinkUnderline'
import { AuthShell, Divider, Item, Stagger } from '@/docs/components/auth/AuthShell'

/** 데모용 가짜 요청 — 1.4초 뒤 성공(또는 실패) */
function useFakeSubmit(fail = false, onDone?: () => void) {
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const submit = () => {
    if (status !== 'idle') return
    setStatus('loading')
    window.setTimeout(() => {
      setStatus(fail ? 'error' : 'success')
      window.setTimeout(() => {
        setStatus('idle')
        if (!fail) onDone?.()
      }, fail ? 1200 : 1600)
    }, 1400)
  }
  return { status, submit }
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const { status, submit } = useFakeSubmit()
  return (
    <AuthShell eyebrow="welcome back" headline="복잡함은 지우고, 효과만 남깁니다.">
      <Stagger>
        <Item>
          <h2 className="text-2xl font-semibold tracking-tight">로그인</h2>
          <p className="mt-1.5 text-[13.5px] text-fg-dim">
            계정이 없다면{' '}
            <LinkUnderline href="#" className="text-fg">
              회원가입
            </LinkUnderline>
          </p>
        </Item>
        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Item>
            <EmailField label="이메일" floating value={email} onChange={setEmail} />
          </Item>
          <Item>
            <PasswordField label="비밀번호" floating value={pw} onChange={setPw} />
          </Item>
          <Item className="flex items-center justify-between">
            <Checkbox label="로그인 상태 유지" defaultChecked />
            <LinkUnderline href="#" className="text-[13px] text-fg-dim hover:text-fg">
              비밀번호를 잊으셨나요?
            </LinkUnderline>
          </Item>
          <Item>
            <SubmitButton status={status} loadingLabel="확인 중" successLabel="환영해요">
              로그인
            </SubmitButton>
          </Item>
        </form>
        <Item>
          <Divider>또는</Divider>
          <div className="grid gap-2.5">
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
            <SocialButton provider="github" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <SocialButton provider="naver" variant="brand" compact size="md" />
            <SocialButton provider="kakao" variant="brand" compact size="md" />
          </div>
        </Item>
      </Stagger>
    </AuthShell>
  )
}

function SignupScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [agree, setAgree] = useState(false)
  const { status, submit } = useFakeSubmit()
  // 치는 도중부터 빨개지지 않게 — 원래 비밀번호 길이만큼 쳤을 때부터 비교
  const mismatch = pw2 && pw2.length >= pw.length && pw !== pw2 ? '비밀번호가 서로 달라요.' : undefined
  // 이름 · 이메일 · 비밀번호 규칙 전부 · 확인 일치 · 약관 — 다 맞아야 열린다
  const ready = name.trim().length >= 2 && EMAIL_RE.test(email) && PASSWORD_RULES.every((r) => r.test(pw)) && pw2 === pw && agree
  return (
    <AuthShell eyebrow="get started" headline="작게 일하고, 깊게 팝니다.">
      <Stagger>
        <Item>
          <h2 className="text-2xl font-semibold tracking-tight">회원가입</h2>
          <p className="mt-1.5 text-[13.5px] text-fg-dim">
            이미 계정이 있다면{' '}
            <LinkUnderline href="#" className="text-fg">
              로그인
            </LinkUnderline>
          </p>
        </Item>
        <Item className="mt-7">
          <div className="flex items-center justify-between gap-2">
            <SocialButton provider="google" compact size="md" />
            <SocialButton provider="apple" compact size="md" />
            <SocialButton provider="github" compact size="md" />
            <SocialButton provider="kakao" variant="brand" compact size="md" />
            <SocialButton provider="naver" variant="brand" compact size="md" />
          </div>
          <Divider>또는 이메일로</Divider>
        </Item>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Item>
            <TextField label="이름" floating leading={<User size={16} />} value={name} onChange={(e) => setName(e.target.value)} valid={name.trim().length >= 2} autoComplete="name" />
          </Item>
          <Item>
            <EmailField label="이메일" floating value={email} onChange={setEmail} />
          </Item>
          <Item>
            <PasswordField label="비밀번호" floating value={pw} onChange={setPw} strength rules autoComplete="new-password" />
          </Item>
          <Item>
            <PasswordField label="비밀번호 확인" floating value={pw2} onChange={setPw2} error={mismatch} valid={!!pw2 && pw2 === pw} autoComplete="new-password" />
          </Item>
          <Item>
            <Checkbox
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
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
          </Item>
          <Item>
            <SubmitButton status={status} disabled={!ready} loadingLabel="계정 만드는 중" successLabel="가입 완료">
              계정 만들기
            </SubmitButton>
          </Item>
        </form>
      </Stagger>
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
      <Stagger>
        <Item>
          <button type="button" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-fg-dim hover:text-fg">
            <ArrowLeft size={14} /> 뒤로
          </button>
          <h2 className="text-2xl font-semibold tracking-tight">인증코드 입력</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-dim">
            <span className="font-medium text-fg">you@company.com</span> 으로 보낸 코드를 입력하세요. 데모에서는 <span className="font-mono text-fg">123456</span> 이 정답이에요.
          </p>
        </Item>
        <Item className="mt-8">
          <OTPInput value={code} onChange={setCode} onComplete={verify} status={status} errorMessage="코드가 맞지 않아요. 다시 확인해 주세요." label="" autoFocus />
        </Item>
        <Item className="mt-6 flex items-center justify-between text-[13px]">
          <span className="text-fg-dim">코드를 못 받으셨나요?</span>
          {left > 0 ? (
            <span className="font-mono text-fg-faint tabular-nums">
              {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')} 후 재전송
            </span>
          ) : (
            <button type="button" onClick={() => setLeft(30)} className="link-underline text-fg">
              다시 보내기
            </button>
          )}
        </Item>
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            <SubmitButton status="idle" type="button">
              계속하기
            </SubmitButton>
          </motion.div>
        )}
      </Stagger>
    </AuthShell>
  )
}

function ForgotScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [left, setLeft] = useState(30)
  const { status, submit } = useFakeSubmit(false, () => {
    setSent(true)
    setLeft(30)
  })
  useEffect(() => {
    if (!sent || left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [sent, left])
  return (
    <AuthShell eyebrow="reset" headline="비밀번호를 다시 설정할게요.">
      {sent ? (
        <Stagger>
          <Item className="flex justify-center">
            <SentMail />
          </Item>
          <Item className="mt-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">메일을 보냈어요</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-dim">
              <span className="font-medium text-fg">{email || 'you@company.com'}</span> 으로 재설정 링크를 보냈어요.
              <br />
              몇 분 안에 도착해요. 안 보이면 스팸함도 확인해 주세요.
            </p>
          </Item>
          <Item className="mt-8">
            <Button variant="primary" size="lg" className="group w-full" trailing={<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}>
              메일 앱 열기
            </Button>
          </Item>
          <Item className="mt-5 flex items-center justify-between text-[13px]">
            <button type="button" onClick={() => setSent(false)} className="link-underline text-fg-dim hover:text-fg">
              다른 이메일로
            </button>
            {left > 0 ? (
              <span className="font-mono text-fg-faint tabular-nums">
                {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')} 후 재전송
              </span>
            ) : (
              <button type="button" onClick={() => setLeft(30)} className="link-underline text-fg">
                다시 보내기
              </button>
            )}
          </Item>
        </Stagger>
      ) : (
        <Stagger>
          <Item>
            <h2 className="text-2xl font-semibold tracking-tight">비밀번호 찾기</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-dim">가입한 이메일로 재설정 링크를 보내 드려요.</p>
          </Item>
          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <Item>
              <EmailField label="이메일" floating value={email} onChange={setEmail} />
            </Item>
            <Item>
              <SubmitButton status={status} loadingLabel="보내는 중" successLabel="보냈어요">
                재설정 링크 보내기
              </SubmitButton>
            </Item>
            <Item className="self-center">
              <LinkUnderline href="#" className="text-[13px] text-fg-dim hover:text-fg">
                로그인으로 돌아가기
              </LinkUnderline>
            </Item>
          </form>
        </Stagger>
      )}
    </AuthShell>
  )
}

export function AuthPage() {
  return (
    <DocPage
      eyebrow="recipes"
      title="Auth"
      lead="로그인 · 회원가입 · 인증코드 · 비밀번호 찾기 화면이에요. 왼쪽엔 포인터를 따라 기우는 3D 유리 로고, 오른쪽엔 380px 폼. 필드는 차례로 떠오르고, 하나에 포커스하면 나머지는 살짝 물러나요. 모바일에서는 브랜드 패널이 빠지고 폼만 남아요."
    >
      <Section title="로그인" desc="이메일(도메인 제안 칩 · 형식이 맞으면 체크) + 비밀번호(마지막 글자 잠깐 보임 · 눈 아이콘으로 플립 공개), 로그인 유지, 소셜 버튼(Google · Apple · 카카오 · 네이버 · GitHub). 제출하면 버튼이 알약으로 변신해 확인한 뒤 체크가 그려져요.">
        <Preview theme="dark" bleed>
          <LoginScreen />
        </Preview>
        <CodeBlock
          code={`import { EmailField, PasswordField, Checkbox, SubmitButton } from '@/components/form'
import { LogoScene3D } from '@/components/brand'

{/* 왼쪽 패널 — 투명 3D 로고가 포인터를 따라 기운다 */}
<LogoScene3D transparent centered follow />

<form onSubmit={…} className="flex flex-col gap-5">
  <EmailField label="이메일" floating value={email} onChange={setEmail} />
  <PasswordField label="비밀번호" floating value={pw} onChange={setPw} />
  <Checkbox label="로그인 상태 유지" defaultChecked />
  <SubmitButton status={status} loadingLabel="확인 중" successLabel="환영해요">로그인</SubmitButton>
</form>

{/* 소셜 — 기본(neutral)은 같은 선 버튼에 아이콘만 브랜드색. brand 는 회사 채움색 */}
<SocialButton provider="google" />
<SocialButton provider="apple" />
<SocialButton provider="github" />
<SocialButton provider="naver" variant="brand" compact />
<SocialButton provider="kakao" variant="brand" compact />`}
        />
      </Section>

      <Section title="회원가입" desc="소셜 다섯 개는 원형 아이콘으로 한 줄에. 이름(2자 이상이면 체크) · 이메일 · 비밀번호(강도 미터 + 규칙 체크리스트가 실시간으로 켜짐) · 확인(같으면 체크, 다르면 흔들리며 오류) · 약관 동의(체크 시 입자 폭발). 동의해야 버튼이 열려요.">
        <Preview theme="dark" bleed>
          <SignupScreen />
        </Preview>
      </Section>

      <Section title="인증코드" desc="OTPInput 과 재전송 카운트다운. 6자리가 차면 빛 줄기가 셀을 훑으며 검증하고, 성공하면 셀들이 액센트로 차오른 뒤 가운데로 모여 체크 배지가 돼요. 데모 정답은 123456, 다른 숫자는 실패.">
        <Preview theme="dark" bleed>
          <VerifyScreen />
        </Preview>
      </Section>

      <Section title="비밀번호 찾기" desc="이메일 하나만. 보내면 봉투가 열리며 편지가 빠져나오는 확인 화면으로 바뀌고, 재전송 카운트다운이 돌아요.">
        <Preview theme="dark" bleed>
          <ForgotScreen />
        </Preview>
        <Note>폼 전송은 데모라 1.4초 뒤 성공으로 처리돼요. 실제 연결은 react-hook-form + zod(v1 신청 폼과 같은 조합)를 권해요.</Note>
      </Section>
    </DocPage>
  )
}
