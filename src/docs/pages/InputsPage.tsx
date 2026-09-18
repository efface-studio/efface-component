import { useState } from 'react'
import { Mail, Search, User } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { Preview } from '@/docs/components/Preview'
import { PropsTable } from '@/docs/components/PropsTable'
import { TextField } from '@/components/form/TextField'
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
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [agree, setAgree] = useState(false)
  const emailErr = email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '이메일 형식을 확인해 주세요.' : undefined

  return (
    <DocPage
      eyebrow="components"
      title="Inputs"
      lead="로그인·회원가입에 쓰는 입력 요소들이에요. 텍스트 필드, 비밀번호(표시 토글 · 강도 미터), 체크박스, 그리고 인증코드 입력."
    >
      <Section title="TextField" desc="라벨은 위에, 입력은 44px(lg 48px). 포커스하면 액센트 링, 오류면 빨간 선과 문구. 앞뒤 슬롯에 아이콘이나 버튼을 넣어요.">
        <Preview
          theme="dark"
          code={`import { TextField } from '@/components/form'

<TextField label="Email" type="email" placeholder="you@company.com" leading={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} error={emailErr} />
<TextField label="Name" placeholder="Jiwan Seo" leading={<User size={16} />} hint="실명을 적어 주세요" />
<TextField placeholder="Search" leading={<Search size={16} />} size="lg" />
<TextField label="Disabled" value="read only" disabled />`}
        >
          <div className="grid max-w-[880px] gap-5 md:grid-cols-2">
            <TextField label="Email" type="email" placeholder="you@company.com" leading={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} error={emailErr} autoComplete="email" />
            <TextField label="Name" placeholder="Jiwan Seo" leading={<User size={16} />} hint="실명을 적어 주세요" />
            <TextField placeholder="Search" leading={<Search size={16} />} size="lg" />
            <TextField label="Disabled" value="read only" disabled readOnly />
          </div>
        </Preview>
        <PropsTable
          rows={[
            { name: 'label', type: 'string', desc: '위 라벨' },
            { name: 'hint / error', type: 'string', desc: '아래 문구. error 가 있으면 빨간 선 + role=alert' },
            { name: 'leading / trailing', type: 'ReactNode', desc: '앞·뒤 슬롯' },
            { name: 'size', type: "'md' | 'lg'", default: "'md'", desc: 'h-11 / h-12' },
            { name: '...input', type: 'InputHTMLAttributes', desc: 'type · value · onChange · autoComplete 등 그대로' },
          ]}
        />
      </Section>

      <Section title="PasswordField" desc="눈 아이콘으로 표시/숨김. strength 를 켜면 네 칸 미터가 길이·대소문자·숫자·기호 기준으로 차올라요.">
        <Preview
          theme="dark"
          code={`import { PasswordField } from '@/components/form'

<PasswordField label="Password" value={pw} onChange={(e) => setPw(e.target.value)} strength autoComplete="new-password" placeholder="8자 이상" />`}
        >
          <div className="max-w-[420px]">
            <PasswordField label="Password" value={pw} onChange={(e) => setPw(e.target.value)} strength autoComplete="new-password" placeholder="8자 이상" />
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

      <Section
        title="OTPInput"
        desc="인증코드 6자리. 셀 위에 투명 input 하나를 덮어서 붙여넣기·SMS 자동완성·모바일 숫자 키패드가 그대로 돼요. 활성 링은 셀 사이를 스프링으로 미끄러지고, 숫자는 블러와 함께 아래서 튀어 오르며 잉크 파문이 퍼져요. 붙여넣으면 도미노처럼 차례로 들어오고, 다 차면 셀들이 하나의 알약으로 합쳐져 검증한 뒤 성공이면 체크가 그려지고 실패면 흔들리며 비워져요."
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
