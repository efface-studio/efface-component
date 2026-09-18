import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bell, Camera, Heart, MessageCircle, Pause, Play, Search, Settings, User } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { AutoplayContext, useAutoplay } from '@/docs/components/autoplay'
import { GhostPointer } from '@/docs/components/GhostPointer'
import { cn } from '@/lib/cn'
import { Aurora, CardDeck, CometTrail, ConfettiButton, Dock, DotWave, GooeyMenu, JellyText, Lava, LiquidButton, Odometer, ParticleText, ScrambleText, ShimmerText, SplitFlap, SpotCard, SpotlightGrid } from '@/components/fx'
import { Checkbox, EmailField, OTPInput, PasswordField, SentMail, SubmitButton, TextField, type OTPStatus, type SubmitStatus } from '@/components/form'
import { LogoScene3D } from '@/components/brand/LogoScene3D'
import { LogoMark } from '@/components/brand/LogoMark'
import { AppIcon3D, APP_ICONS } from '@/components/brand'
import { AppCard, APP_CARDS, Button } from '@/components/ui'
import { LetterReveal, MagneticButton, Marquee, TiltCard } from '@/components/motion'
import { Skeleton } from '@/components/ui/Skeleton'

// APP_ICONS 항목엔 key 가 들어 있어 그대로 spread 하면 React 가 경고한다
const { key: _hinestKey, ...HINEST_ICON } = APP_ICONS[1]
void _hinestKey

/* ───────────────────────── 카드 틀 ─────────────────────────
   자동 재생: 카드에 진짜 포인터가 들어오거나 안의 무언가에 포커스가 가면 멈추고,
   나가면 잠시 뒤 다시 돈다. ghost 면 가짜 커서가 떠다니며 포인터 이벤트를 보낸다. */

function Card({
  title,
  desc,
  to,
  tag,
  ghost,
  click,
  children,
  className,
  bodyClassName,
}: {
  title: string
  desc: string
  to?: string
  tag?: 'new' | 'ours'
  /** 가짜 커서로 자동 재생 */
  ghost?: boolean
  /** 가짜 커서가 가끔 누른다 */
  click?: boolean
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [manual, setManual] = useState(false)
  const playing = !hover && !focus && !manual

  // 진짜 포인터만 — 가짜 커서는 mouseover 만 보내고 pointerenter 는 카드 바깥으로 안 올라온다
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let t = 0
    const enter = () => {
      window.clearTimeout(t)
      setHover(true)
    }
    const leave = () => {
      t = window.setTimeout(() => setHover(false), 1200)
    }
    const fin = () => setFocus(true)
    const fout = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocus(false)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', fin)
    el.addEventListener('focusout', fout)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', fin)
      el.removeEventListener('focusout', fout)
    }
  }, [])

  return (
    <div ref={wrap} className={cn('flex flex-col overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <div className={cn('relative flex min-h-[240px] flex-1 items-center justify-center overflow-hidden bg-bg', playing && ghost && 'is-ghost', bodyClassName)}>
        <AutoplayContext.Provider value={playing}>{children}</AutoplayContext.Provider>
        {ghost && <GhostPointer active={playing} click={click} />}
      </div>
      <div className="flex items-start gap-3 border-t border-line px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
            {tag === 'new' && <span className="rounded-full bg-accent px-1.5 py-px font-mono text-[9.5px] tracking-wider text-white uppercase">new</span>}
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-dim">{desc}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setManual((v) => !v)}
            className={cn('flex h-7 items-center gap-1 rounded-md px-2 font-mono text-[10.5px] transition-colors', playing ? 'text-fg-faint hover:bg-line/40 hover:text-fg' : manual ? 'bg-fg text-bg' : 'text-fg-dim')}
            title={manual ? '자동 재생' : '멈추고 직접 해보기'}
          >
            {playing ? <Play size={11} /> : <Pause size={11} />}
            {playing ? 'auto' : manual ? 'manual' : 'paused'}
          </button>
          {to && (
            <Link to={to} className="flex h-7 w-7 items-center justify-center rounded-md text-fg-faint hover:bg-line/40 hover:text-fg" title="문서로">
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── 스크립트 데모 ───────────────────────── */

/** 자동 재생일 때 주기적으로 리마운트 */
function Replay({ every, children }: { every: number; children: ReactNode }) {
  const [k, setK] = useState(0)
  useAutoplay(async ({ sleep }) => {
    await sleep(every)
    setK((v) => v + 1)
  })
  return (
    <div key={k} className="contents">
      {children}
    </div>
  )
}

function OdometerDemo() {
  const [v, setV] = useState(128_430)
  useAutoplay(async ({ sleep }) => {
    await sleep(2400)
    setV((x) => x + Math.floor(Math.random() * 900) + 40)
  })
  return (
    <div className="flex flex-col items-center gap-5">
      <Odometer value={v} prefix="₩" className="text-5xl" />
      <div className="flex items-center gap-4 text-[13px] text-fg-dim">
        <Odometer value={Math.floor(v / 1000)} suffix="users" className="text-xl" />
        <Odometer value={v % 100} suffix="%" className="text-xl" />
      </div>
      <Button size="sm" variant="secondary" onClick={() => setV(Math.floor(Math.random() * 999_999))}>
        무작위
      </Button>
    </div>
  )
}

function SplitFlapDemo() {
  const LINES = ['ERASE THE NOISE', 'LESS, BUT BETTER', 'EFFACE STUDIO', 'DESIGN SYSTEM']
  const [i, setI] = useState(0)
  useAutoplay(async ({ sleep }) => {
    await sleep(3400)
    setI((v) => (v + 1) % LINES.length)
  })
  return (
    <div className="flex flex-col items-center gap-4">
      <SplitFlap text={LINES[i] ?? ''} length={16} className="text-[22px]" />
      <div className="flex gap-1.5">
        {LINES.map((l, j) => (
          <button key={l} type="button" onClick={() => setI(j)} className={cn('h-1.5 w-6 rounded-full transition-colors', i === j ? 'bg-fg' : 'bg-line hover:bg-line-strong')} aria-label={l} />
        ))}
      </div>
    </div>
  )
}

function ScrambleDemo() {
  return (
    <Replay every={4200}>
      <div className="flex flex-col items-start gap-4 px-8">
        <ScrambleText text="ERASE THE COMPLEXITY" trigger="mount" className="text-2xl font-semibold tracking-tight" />
        <ScrambleText text="hover → decode again" trigger="hover" duration={700} className="cursor-default text-[15px] text-fg-dim" />
      </div>
    </Replay>
  )
}

function OTPAuto() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<OTPStatus>('idle')
  useAutoplay(
    async ({ sleep, type }) => {
      await type(setCode, '482915', 140)
      await sleep(300)
      setStatus('verifying')
      await sleep(1600)
      setStatus('success')
      await sleep(2600)
      setStatus('idle')
      setCode('')
      await sleep(700)
      setCode('000000')
      await sleep(400)
      setStatus('verifying')
      await sleep(1400)
      setStatus('error')
      await sleep(1600)
      setStatus('idle')
      setCode('')
      await sleep(800)
    },
    () => {
      setCode('')
      setStatus('idle')
    },
  )
  const verify = (c: string) => {
    setStatus('verifying')
    window.setTimeout(() => setStatus(c === '123456' ? 'success' : 'error'), 1400)
  }
  return (
    <div className="w-[300px]">
      <OTPInput value={code} onChange={setCode} onComplete={verify} status={status} label="" errorMessage="틀렸어요 — 직접 칠 땐 123456" />
    </div>
  )
}

function SubmitAuto() {
  const [s, setS] = useState<SubmitStatus>('idle')
  useAutoplay(
    async ({ sleep }) => {
      await sleep(900)
      setS('loading')
      await sleep(1600)
      setS('success')
      await sleep(1800)
      setS('idle')
      await sleep(900)
      setS('loading')
      await sleep(1400)
      setS('error')
      await sleep(1500)
      setS('idle')
    },
    () => setS('idle'),
  )
  return (
    <div className="w-[260px]">
      <SubmitButton
        status={s}
        loadingLabel="확인 중"
        successLabel="환영해요"
        errorLabel="다시 시도"
        type="button"
        onClick={() => {
          if (s !== 'idle') return
          setS('loading')
          window.setTimeout(() => {
            setS('success')
            window.setTimeout(() => setS('idle'), 1600)
          }, 1400)
        }}
      >
        로그인
      </SubmitButton>
    </div>
  )
}

function PasswordAuto() {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  useAutoplay(
    async ({ sleep, type }) => {
      await type(setPw, 'Efface!2026', 110)
      await sleep(900)
      setShow(true)
      await sleep(2000)
      setShow(false)
      await sleep(1200)
      setPw('')
      await sleep(700)
    },
    () => {
      setPw('')
      setShow(false)
    },
  )
  return (
    <div className="w-[300px]">
      <PasswordField label="비밀번호" floating value={pw} onChange={setPw} show={show} onShowChange={setShow} strength rules />
    </div>
  )
}

function EmailAuto() {
  const [v, setV] = useState('')
  useAutoplay(
    async ({ sleep, type }) => {
      await type(setV, 'contact@e', 110)
      await sleep(1100)
      setV('contact@efface.dev')
      await sleep(2000)
      setV('')
      await sleep(500)
      await type(setV, 'contact@g', 110)
      await sleep(1100)
      setV('contact@gmail.com')
      await sleep(1600)
      setV('')
      await sleep(600)
    },
    () => setV(''),
  )
  return (
    <div className="w-[300px]">
      <EmailField label="이메일" floating value={v} onChange={setV} hint="you@ 까지 치고 g · n · e 를 눌러 보세요" />
    </div>
  )
}

function FieldsAuto() {
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  useAutoplay(
    async ({ sleep, type }) => {
      await type(setName, 'efface', 110)
      await sleep(700)
      setAgree(true)
      await sleep(2000)
      setAgree(false)
      await sleep(400)
      setName('')
      await sleep(700)
    },
    () => {
      setName('')
      setAgree(false)
    },
  )
  return (
    <div className="flex w-[300px] flex-col gap-5">
      <TextField label="이름" floating leading={<User size={16} />} value={name} onChange={(e) => setName(e.target.value)} valid={name.trim().length >= 2} />
      <Checkbox label="이용약관에 동의해요" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
    </div>
  )
}

function SkeletonAuto() {
  const [loading, setLoading] = useState(true)
  useAutoplay(async ({ sleep }) => {
    await sleep(2200)
    setLoading((v) => !v)
  })
  return (
    <button type="button" onClick={() => setLoading((v) => !v)} className="w-[300px] rounded-lg border border-line bg-surface p-4 text-left">
      <div className="flex items-center gap-3">
        {loading ? <Skeleton className="h-10 w-10 rounded-full" /> : <div className="h-10 w-10 rounded-full bg-accent" />}
        <div className="flex-1 space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </>
          ) : (
            <>
              <p className="text-[14px] font-medium">Jiwan Seo</p>
              <p className="text-[12px] text-fg-dim">Design engineer</p>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {loading ? (
          <>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-fg-dim">복잡함은 지우고, 효과만 남깁니다.</p>
        )}
      </div>
    </button>
  )
}

function GooeyAuto() {
  // 가짜 커서가 누르기엔 버튼이 작아서, 스크립트로 주기적으로 여닫는다
  const [k, setK] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useAutoplay(async ({ sleep }) => {
    await sleep(1400)
    ref.current?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.click()
    await sleep(2600)
    ref.current?.querySelector<HTMLButtonElement>('button[aria-expanded]')?.click()
    await sleep(300)
    setK((v) => v + 1)
  })
  return (
    <div ref={ref} key={k}>
      <GooeyMenu
        items={[
          { id: 'heart', icon: <Heart size={16} />, label: 'Like' },
          { id: 'msg', icon: <MessageCircle size={16} />, label: 'Comment' },
          { id: 'cam', icon: <Camera size={16} />, label: 'Photo' },
          { id: 'bell', icon: <Bell size={16} />, label: 'Notify' },
        ]}
      />
    </div>
  )
}

const DECK = [
  { id: 'hinest', title: 'HiNest', sub: 'Workplace platform', c: 'from-[#2563eb] to-[#14b8b0]' },
  { id: 'efface', title: 'efface', sub: 'Erase the noise', c: 'from-[#141418] to-[#3b62e5]' },
  { id: 'muru', title: 'MURU', sub: 'Recipes, simply', c: 'from-[#f59e0b] to-[#ef6553]' },
  { id: 'qto', title: 'QTO', sub: 'Quotes on time', c: 'from-[#7c3aed] to-[#2563eb]' },
]
function DeckDemo() {
  const [auto, setAuto] = useState(true)
  useAutoplay(
    async ({ sleep }) => {
      setAuto(true)
      await sleep(1e9)
    },
    () => setAuto(true),
  )
  const playing = useAutoplayState()
  return (
    <CardDeck
      auto={playing && auto ? 2600 : 0}
      cards={DECK.map((d) => ({
        id: d.id,
        content: (
          <div className={cn('flex h-full w-full flex-col justify-end rounded-2xl bg-gradient-to-br p-4 text-white', d.c)}>
            <p className="text-lg font-semibold tracking-tight">{d.title}</p>
            <p className="text-[12px] opacity-80">{d.sub}</p>
          </div>
        ),
      }))}
    />
  )
}
function useAutoplayState() {
  return useAutoplay(async ({ sleep }) => {
    await sleep(1e9)
  })
}

/* ───────────────────────── 페이지 ───────────────────────── */

export function ShowcasePage() {
  const [heroPlaying, setHeroPlaying] = useState(true)
  const hero = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = hero.current
    if (!el) return
    let t = 0
    const enter = () => {
      window.clearTimeout(t)
      setHeroPlaying(false)
    }
    const leave = () => {
      t = window.setTimeout(() => setHeroPlaying(true), 1500)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <DocPage eyebrow="motion" title="Showcase" lead="움직임만 모아 봤어요. 전부 스스로 돌아가고 — 가짜 커서가 떠다니거나 글자가 저절로 쳐져요 — 마우스를 올리면 멈추고 직접 해볼 수 있어요. 나가면 잠시 뒤 다시 돌아요.">
      {/* 히어로 — 오로라 위에 입자 로고 */}
      <div ref={hero} className="relative mb-16 h-[380px] overflow-hidden rounded-2xl border border-line bg-bg text-fg md:h-[460px]">
        <Aurora colors={['#7c3aed', '#14b8b0', '#2563eb']} className="opacity-60" />
        <ParticleText src="/logos/efface.svg" gap={5} radius={110} scale={0.78} />
        <GhostPointer active={heroPlaying} click clickEvery={7} speed={0.6} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4 font-mono text-[11px] tracking-wider text-fg-faint uppercase">
          <span>ParticleText · src=/logos/efface.svg + Aurora</span>
          <span>{heroPlaying ? '자동 재생 중 · 마우스를 올려 직접' : '직접 움직여 보고 · 눌러 보세요'}</span>
        </div>
      </div>

      <Section title="새로 만든 것들" desc="이 디자인 시스템을 위해 새로 쓴 것들. canvas(입자 · 점 격자 · 오로라 · 혜성 · 색종이)는 컨테이너의 color 와 --accent 를 읽어서 어느 테마에서든 맞아요. 모두 prefers-reduced-motion 이면 정지 화면만 보여요.">
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="ParticleText" desc="입자가 흩어져 있다가 글자로 모여요. 포인터가 밀어내고, 누르면 폭발했다가 돌아와요. src 를 주면 로고도 돼요." tag="new" ghost click className="md:col-span-2">
            <div className="h-[300px] w-full text-fg">
              <ParticleText text="Erase the noise" gap={4} radius={80} scale={0.6} />
            </div>
          </Card>
          <Card title="SplitFlap" desc="공항 안내판. 칸마다 글자가 탁탁 넘어가다 제자리에서 멈춰요." tag="new">
            <SplitFlapDemo />
          </Card>
          <Card title="Dock" desc="macOS 독. 포인터와의 거리로 아이콘이 커지고 이웃도 따라 커져요." tag="new" ghost>
            <Dock
              items={[
                { id: 'efface', label: 'efface', icon: <img src="/logos/efface.svg" alt="" /> },
                { id: 'hinest', label: 'HiNest', icon: <img src="/logos/hinest.svg" alt="" /> },
                { id: 'muru', label: 'MURU', icon: <img src="/logos/muru.svg" alt="" /> },
                { id: 'qto', label: 'QTO', icon: <img src="/logos/qto.svg" alt="" /> },
                { id: 'goms', label: 'GOMS', icon: <img src="/logos/goms.svg" alt="" /> },
                { id: 'search', label: 'Search', icon: <Search className="text-fg" /> },
                { id: 'settings', label: 'Settings', icon: <Settings className="text-fg" /> },
              ]}
            />
          </Card>
          <Card title="DotWave" desc="점 격자가 포인터 주위로 부풀며 액센트로 물들고, 누르면 파문이 퍼져요." tag="new" ghost click>
            <div className="h-[280px] w-full text-fg">
              <DotWave />
            </div>
          </Card>
          <Card title="GooeyMenu · Lava" desc="SVG 구이 필터. 버튼에서 원들이 액체처럼 늘어져 나오고, 덩이들이 붙었다 떨어져요." tag="new">
            <div className="relative flex h-[280px] w-full items-end justify-center">
              <div className="absolute inset-0 opacity-60">
                <Lava count={5} />
              </div>
              <GooeyAuto />
            </div>
          </Card>
          <Card title="ScrambleText" desc="기호로 끓다가 왼쪽부터 제자리를 찾아요. 마운트 · 뷰 · 호버 트리거." tag="new">
            <ScrambleDemo />
          </Card>
          <Card title="JellyText" desc="가까운 글자가 젤리처럼 밀려 올라가고 커졌다가 스프링으로 돌아와요." tag="new" ghost>
            <JellyText text="Jelly, wobble, bounce." className="text-4xl font-semibold tracking-tight" />
          </Card>
          <Card title="Odometer" desc="숫자가 드럼처럼 굴러요. 오른쪽 자리부터 늦게 따라와 물결처럼." tag="new">
            <OdometerDemo />
          </Card>
          <Card title="CometTrail" desc="포인터 뒤로 액센트 꼬리가 혜성처럼 따라오고, 멈추면 머리로 빨려 들어가요." tag="new" ghost>
            <div className="h-[280px] w-full">
              <CometTrail />
            </div>
          </Card>
          <Card title="SpotlightGrid" desc="포인터 자리에서 각 카드의 테두리와 바탕이 빛나요 (Linear 식). 렌더 없이 CSS 변수만 갱신." tag="new" ghost bodyClassName="p-5">
            <SpotlightGrid className="w-full grid-cols-3">
              {['Design', 'Build', 'Ship', 'Measure', 'Learn', 'Repeat'].map((t, i) => (
                <SpotCard key={t} className="h-[100px]">
                  <p className="font-mono text-[10px] text-fg-faint">0{i + 1}</p>
                  <p className="mt-2 text-[15px] font-semibold tracking-tight">{t}</p>
                </SpotCard>
              ))}
            </SpotlightGrid>
          </Card>
          <Card title="LiquidButton" desc="커서가 들어온 자리에서 잉크가 번지고, 나간 자리로 빠져요." tag="new" ghost>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <LiquidButton>Get started</LiquidButton>
              <LiquidButton>Book a call</LiquidButton>
            </div>
          </Card>
          <Card title="Confetti" desc="누른 자리에서 색종이가 터져요. 색은 앱 카드 토큰." tag="new" ghost click>
            <div className="h-[280px] w-full">
              <ConfettiButton>Celebrate 🎉</ConfettiButton>
            </div>
          </Card>
          <Card title="CardDeck" desc="맨 위 카드를 옆으로 끌어 던지면 날아가고 아래 카드가 올라와요. 끝없이 돌아요." tag="new">
            <DeckDemo />
          </Card>
          <Card title="ShimmerText · Aurora" desc="글자 위로 빛이 훑고, 뒤에선 빛덩이가 흘러요." tag="new" ghost>
            <div className="relative h-[280px] w-full">
              <Aurora attract={0.12} />
              <div className="relative flex h-full items-center justify-center">
                <ShimmerText className="text-4xl font-semibold tracking-tight">Less, but better.</ShimmerText>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="우리 컴포넌트에서 고른 것들" desc="이미 시스템 안에 있는 움직임 중 볼만한 것. 카드 오른쪽 화살표로 그 문서로 갈 수 있어요.">
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="OTP 검증" desc="빛 줄기가 셀을 훑고, 성공하면 셀들이 액센트로 차오른 뒤 가운데로 모여 체크가 돼요. 실패면 빨갛게 흔들리고 숫자가 떨어져요." to="/components/inputs" tag="ours">
            <OTPAuto />
          </Card>
          <Card title="SubmitButton" desc="알약으로 변신 → 빛 스윕 → 체크 / 흔들림. 글자는 블러와 함께 바뀌어요." to="/components/inputs" tag="ours">
            <SubmitAuto />
          </Card>
          <Card title="PasswordField" desc="마지막 글자 잠깐 보임, 눈을 누르면 3D 플립으로 드러남, 강도 미터와 규칙 체크." to="/components/inputs" tag="ours">
            <PasswordAuto />
          </Card>
          <Card title="EmailField" desc="@ 뒤에 유명 도메인이 흐리게 떠오르고 Tab 으로 받아들여요." to="/components/inputs" tag="ours">
            <EmailAuto />
          </Card>
          <Card title="TextField · Checkbox" desc="포커스 빛 줄기 · 밑줄 · 떠오르는 라벨 · 체크 시 입자 폭발." to="/components/inputs" tag="ours">
            <FieldsAuto />
          </Card>
          <Card title="SentMail" desc="봉투가 열리고 편지가 빠져나온 뒤 체크가 맺혀요." to="/recipes/auth" tag="ours">
            <Replay every={4200}>
              <SentMail />
            </Replay>
          </Card>
          <Card title="3D 유리 로고" desc="포인터를 따라 입체적으로 기울어요. 투명 배경." to="/components/brand" tag="ours" ghost bodyClassName="bg-[#0b0c10]">
            <div className="h-[280px] w-full">
              <LogoScene3D transparent centered follow scale={0.6} />
            </div>
          </Card>
          <Card title="TiltCard" desc="커서로 3D 기울기 + 하이라이트 (v2 앱 카드)." to="/components/cards" tag="ours" ghost bodyClassName="py-8">
            <TiltCard tiltX={7} tiltY={11} glare={false}>
              <AppCard title="HiNest" sub="A new start for team ops" gradient={APP_CARDS[0].gradient} sheen={0.16} icon={<AppIcon3D {...HINEST_ICON} size={200} />} />
            </TiltCard>
          </Card>
          <Card title="LetterReveal" desc="글자가 흩어졌다가 자리를 찾아요 (v2 히어로)." to="/motion/text" tag="ours">
            <Replay every={4600}>
              <LetterReveal text="Less, but better." as="h3" className="text-3xl font-semibold tracking-tight" />
            </Replay>
          </Card>
          <Card title="MagneticButton" desc="커서 쪽으로 미세하게 끌려요 (v1 CTA)." to="/components/buttons" tag="ours" ghost>
            <MagneticButton>
              <Button size="lg" pill leading={<LogoMark className="h-4 w-4" />}>
                Start a project
              </Button>
            </MagneticButton>
          </Card>
          <Card title="Marquee" desc="끝없이 흐르는 띠. 양 끝은 마스크로 사라져요." to="/components/chips" tag="ours" bodyClassName="px-0">
            <div className="w-full">
              <Marquee direction="left" duration={26} edge="mask">
                {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Motion', 'Three.js', 'Cloudflare', 'Supabase'].map((t) => (
                  <span key={t} className="mx-6 font-mono text-[13px] text-fg-dim">
                    {t}
                  </span>
                ))}
              </Marquee>
            </div>
          </Card>
          <Card title="Skeleton" desc="빛이 훑는 자리표시자 → 실제 콘텐츠로. 눌러서 바꿔 볼 수도." to="/components/skeleton" tag="ours">
            <SkeletonAuto />
          </Card>
        </div>
        <Note>
          페이지 전환(아래로 이어지는 슬라이드), 사이드바 인디케이터, 헤더 테마 토글 같은 문서 셸의 움직임은 이 페이지 자체에서 보고 있어요. 스크롤 인터랙션은{' '}
          <Link to="/motion/scroll" className="link-underline text-fg">
            Scroll
          </Link>
          , 커서 효과는{' '}
          <Link to="/motion/cursor" className="link-underline text-fg">
            Cursor
          </Link>
          에.
        </Note>
      </Section>
    </DocPage>
  )
}
