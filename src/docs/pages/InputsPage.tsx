import { useState } from 'react'
import { Mail, Search, User } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { TextField } from '@/components/form/TextField'
import { EmailField } from '@/components/form/EmailField'
import { SubmitButton, type SubmitStatus } from '@/components/form/SubmitButton'
import { SocialButton } from '@/components/form/SocialButton'
import { SOCIAL_PROVIDERS } from '@/components/form/social.constants'
import { PasswordField } from '@/components/form/PasswordField'
import { Checkbox } from '@/components/form/Checkbox'
import { OTPInput, type OTPStatus } from '@/components/form/OTPInput'
import { Button } from '@/components/ui/Button'

function OTPDemo() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<OTPStatus>('idle')
  const verify = (c: string) => {
    setStatus('verifying')
    window.setTimeout(() => {
      // 데모: 123456 만 통과
      setStatus(c === '123456' ? 'success' : 'error')
      if (c !== '123456') window.setTimeout(() => setStatus('idle'), 900)
    }, 1400)
  }
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <OTPInput value={code} onChange={setCode} onComplete={verify} status={status} errorMessage="코드가 맞지 않아요. 다시 입력해 주세요." autoFocus />
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => { setCode('123456'); verify('123456') }}>
          123456 붙여넣기 → 성공
        </Button>
        <Button size="sm" variant="secondary" onClick={() => { setCode('000000'); verify('000000') }}>
          000000 → 실패
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setCode(''); setStatus('idle') }}>
          초기화
        </Button>
        <span className="ml-auto font-mono text-[11px] text-fg-faint">{status}</span>
      </div>
    </div>
  )
}

export function InputsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [email2, setEmail2] = useState('')
  const [pw, setPw] = useState('')
  const [submit, setSubmit] = useState<SubmitStatus>('idle')
  const [agree, setAgree] = useState(false)
  // 치는 동안엔 조용히, 포커스가 빠져나간 뒤부터 형식을 본다
  const [emailTouched, setEmailTouched] = useState(false)
  const emailErr = emailTouched && email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '이메일 형식을 확인해 주세요.' : undefined

  return (
    <DocPage
      eyebrow="components"
      title="Inputs"
      lead="로그인·회원가입에 쓰는 입력 요소들이에요. 텍스트 필드, 비밀번호(표시 토글 · 강도 미터), 체크박스, 그리고 인증코드 입력."
    >
      <Section title="TextField" desc="포커스하면 액센트 링과 함께 밑줄이 왼쪽에서 그어지고 빛 줄기가 위 테두리를 한 번 지나가요. 아이콘은 살짝 커지며 색이 들고, floating 이면 라벨이 안에서 위로 떠올라요. valid 면 체크가 그려지며 초록 링이 퍼지고, 오류면 흔들리며 문구가 미끄러져 들어와요.">
        <Preview
          theme="dark"
          code={`import { TextField } from '@/components/form'

<TextField label="Name" floating leading={<User size={16} />} value={name} onChange={(e) => setName(e.target.value)} valid={name.length >= 2} />
<TextField label="Email" type="email" placeholder="you@company.com" leading={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} error={touched ? emailErr : undefined} />
<TextField placeholder="Search" leading={<Search size={16} />} size="lg" />
<TextField label="Disabled" value="read only" disabled />`}
        >
          <div className="grid max-w-[880px] gap-5 md:grid-cols-2">
            <TextField label="Name" floating leading={<User size={16} />} value={name} onChange={(e) => setName(e.target.value)} valid={name.trim().length >= 2} hint="2자 이상이면 체크가 그려져요" />
            <TextField label="Email" type="email" placeholder="you@company.com" leading={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} error={emailErr} hint={emailErr ? undefined : '포커스가 빠져나간 뒤 형식을 봐요'} autoComplete="email" />
            <TextField placeholder="Search" leading={<Search size={16} />} size="lg" />
            <TextField label="Disabled" value="read only" disabled readOnly />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'label', type: 'string', desc: '라벨. floating 이면 입력 안에 있다가 위로 떠오른다' },
            { name: 'floating', type: 'boolean', default: 'false', desc: '플로팅 라벨' },
            { name: 'valid', type: 'boolean', desc: 'true 면 체크가 그려지고 초록 링이 퍼진다' },
            { name: 'hint / error', type: 'string', desc: '아래 문구. error 가 있으면 빨간 선 + role=alert' },
            { name: 'leading / trailing', type: 'ReactNode', desc: '앞·뒤 슬롯' },
            { name: 'size', type: "'md' | 'lg'", default: "'md'", desc: 'h-11 / h-12' },
            { name: '...input', type: 'InputHTMLAttributes', desc: 'type · value · onChange · autoComplete 등 그대로' },
          ]}
        />
      </Section>

      <Section title="EmailField" desc="@ 뒤를 치면 유명 도메인이 커서 뒤에 흐리게 떠올라요 — g 면 gmail.com, n 이면 naver.com, e 면 efface.dev. Tab 이나 → 로 받아들이면 글자가 액센트색으로 한 번 반짝여요. 형식이 맞으면 체크.">
        <Preview theme="dark" code={`import { EmailField, EMAIL_DOMAINS } from '@/components/form'

<EmailField label="이메일" floating value={email} onChange={setEmail} />
{/* 회사 도메인을 맨 앞에 — 앞글자 매칭이라 순서가 우선순위 */}
<EmailField label="이메일" value={email} onChange={setEmail} domains={['company.com', ...EMAIL_DOMAINS]} />`}>
          <div className="max-w-[420px]">
            <EmailField label="이메일" floating value={email2} onChange={setEmail2} hint="you@ 까지 치고 g 를 눌러 보세요" />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'value / onChange', type: 'string / (v: string) => void', desc: '제어 값. onChange 는 문자열을 받는다' },
            { name: 'domains', type: 'string[]', default: 'EMAIL_DOMAINS', desc: '자동완성 후보. gmail · naver · kakao · daum · hanmail · nate · icloud · outlook · hotmail · yahoo · efface.dev · proton · me · live · msn · aol' },
            { name: '…TextFieldProps', type: '', desc: 'label · floating · hint · error · size 등 그대로' },
          ]}
        />
      </Section>

      <Section title="PasswordField" desc="마지막으로 친 글자는 잠깐 보였다가 가려져요(iOS 식). 눈 아이콘을 누르면 글자가 왼쪽부터 3D 플립하며 드러나고, strength 미터와 rules 체크리스트가 실시간으로 켜져요.">
        <Preview
          theme="dark"
          code={`import { PasswordField } from '@/components/form'

<PasswordField label="Password" value={pw} onChange={setPw} strength rules autoComplete="new-password" placeholder="8자 이상" />`}
        >
          <div className="max-w-[420px]">
            <PasswordField label="Password" floating value={pw} onChange={setPw} strength rules autoComplete="new-password" />
          </div>
        </Preview>
      </Section>

      <Section title="Checkbox" desc="18px 상자. 체크 표시는 선이 그려지듯 나타나요.">
        <Preview
          theme="dark"
          code={`import { Checkbox } from '@/components/form'

<Checkbox label="로그인 상태 유지" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
<Checkbox label={<>서비스 이용약관과 개인정보처리방침에 동의해요</>} />
<Checkbox label="비활성" disabled />`}
        >
          <div className="flex flex-col gap-3">
            <Checkbox label="로그인 상태 유지" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <Checkbox
              label={
                <>
                  <a href="#" className="link-underline text-fg">
                    서비스 이용약관
                  </a>
                  과{' '}
                  <a href="#" className="link-underline text-fg">
                    개인정보처리방침
                  </a>
                  에 동의해요
                </>
              }
            />
            <Checkbox label="비활성" disabled />
          </div>
        </Preview>
      </Section>

      <Section title="SubmitButton" desc="누르면 알약으로 둥글어지며 빛이 스윕하고, 성공이면 체크가 그려지고 실패면 흔들려요. 글자는 위아래로 블러와 함께 바뀌어요.">
        <Preview theme="dark" code={`import { SubmitButton, type SubmitStatus } from '@/components/form'

const [status, setStatus] = useState<SubmitStatus>('idle')
<SubmitButton status={status} loadingLabel="확인 중" successLabel="완료" errorLabel="다시 시도">로그인</SubmitButton>`}>
          <div className="flex max-w-[420px] flex-col gap-4">
            <SubmitButton
              status={submit}
              type="button"
              onClick={() => {
                setSubmit('loading')
                window.setTimeout(() => {
                  setSubmit('success')
                  window.setTimeout(() => setSubmit('idle'), 1800)
                }, 1400)
              }}
            >
              로그인 (성공)
            </SubmitButton>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setSubmit('error'); window.setTimeout(() => setSubmit('idle'), 1200) }}>
                실패 보기
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSubmit('idle')}>
                초기화
              </Button>
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="SocialButton" desc="Google · Apple · GitHub · 카카오 · 네이버. 기본 neutral 은 모든 공급자가 같은 선 버튼이고 아이콘만 브랜드색이에요 — Notion · Linear · Vercel 이 쓰는 방식이라 여러 개를 쌓아도 어수선하지 않아요. brand 는 각 회사 가이드의 채움색(카카오 노랑 · 네이버 초록 · 애플 검정/흰 반전 · 구글 흰/다크). 아이콘과 글자는 한 덩어리로 가운데(애플 가이드). compact 면 아이콘만 원형.">
        <Preview theme="dark" code={`import { SocialButton } from '@/components/form'

{/* neutral (기본) — 같은 선 버튼, 아이콘만 브랜드색 */}
<SocialButton provider="google" />
<SocialButton provider="apple" />
<SocialButton provider="github" />

{/* brand — 회사 가이드 채움색 */}
<SocialButton provider="kakao" variant="brand" />
<SocialButton provider="naver" variant="brand" />

{/* 아이콘만 */}
<SocialButton provider="kakao" variant="brand" compact />`}>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-fg-faint">neutral</p>
              {SOCIAL_PROVIDERS.map((p) => (
                <SocialButton key={p} provider={p} />
              ))}
              <div className="mt-2 flex items-center gap-3">
                {SOCIAL_PROVIDERS.map((p) => (
                  <SocialButton key={p} provider={p} compact size="md" />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-fg-faint">brand</p>
              {SOCIAL_PROVIDERS.map((p) => (
                <SocialButton key={p} provider={p} variant="brand" />
              ))}
              <div className="mt-2 flex items-center gap-3">
                {SOCIAL_PROVIDERS.map((p) => (
                  <SocialButton key={p} provider={p} variant="brand" compact size="md" />
                ))}
              </div>
            </div>
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'provider', type: "'google' | 'apple' | 'github' | 'kakao' | 'naver'", desc: '회사. 아이콘·기본 라벨이 정해진다' },
            { name: 'variant', type: "'neutral' | 'brand'", default: "'neutral'", desc: '같은 선 버튼 / 회사 채움색' },
            { name: 'compact', type: 'boolean', default: 'false', desc: '아이콘만 있는 원형' },
            { name: 'size', type: "'md' | 'lg'", default: "'lg'", desc: '44 / 48px' },
            { name: 'children', type: 'string', desc: '라벨 덮어쓰기 (기본 "Google로 계속하기")' },
          ]}
        />
      </Section>

      <Section
        title="OTPInput"
        desc="셀 위에 투명 input 하나를 덮어 붙여넣기·자동완성(one-time-code)·모바일 키패드가 그대로 돼요. 활성 링은 셀 사이를 스프링으로 미끄러지고 숫자는 블러와 함께 튀어 올라요. 다 차면 빛 줄기가 왼쪽에서 오른쪽으로 훑으며 검증하고 — 지나가는 자리가 액센트로 켜져요 — 성공이면 셀들이 차례로 액센트로 차오른 뒤 가운데로 모여 체크 배지가 되고, 실패면 빨갛게 번지며 흔들리고 숫자가 아래로 떨어져요."
      >
        <Preview theme="dark" center minHeight={260} code={`import { OTPInput, type OTPStatus } from '@/components/form'

const [code, setCode] = useState('')
const [status, setStatus] = useState<OTPStatus>('idle')

<OTPInput
  value={code}
  onChange={setCode}
  onComplete={async (c) => {
    setStatus('verifying')
    const ok = await verify(c)
    setStatus(ok ? 'success' : 'error')   // error 면 잠시 흔들린 뒤 스스로 비운다
  }}
  status={status}
  errorMessage="코드가 맞지 않아요."
  autoFocus
/>`}>
          <OTPDemo />
        </Preview>
        <PropsTable
          rows={[
            { name: 'value / onChange', type: 'string / (v) => void', desc: '숫자만 남긴 문자열' },
            { name: 'length', type: 'number', default: '6', desc: '자릿수' },
            { name: 'onComplete', type: '(code) => void', desc: '자리가 다 차는 순간. 여기서 status 를 verifying 으로' },
            { name: 'status', type: "'idle' | 'verifying' | 'success' | 'error'", default: "'idle'", desc: 'verifying/success 는 알약으로 합쳐짐, error 는 흔들림 후 자동 비움' },
            { name: 'errorMessage', type: 'string', desc: 'error 일 때 아래 문구' },
          ]}
        />
        <Note>
          숫자 키패드는 <code className="font-mono">inputMode="numeric"</code>, SMS 자동완성은 <code className="font-mono">autoComplete="one-time-code"</code>. 애니메이션 줄이기를 켜면 숫자는 페이드만 하고 흔들림·파문은 생략해요.
        </Note>
      </Section>
    </DocPage>
  )
}
