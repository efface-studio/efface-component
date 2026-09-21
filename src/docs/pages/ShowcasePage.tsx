import { Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { ArrowUpRight, Bell, Camera, Heart, Maximize2, MessageCircle, Pause, Play, Search, Settings, User, X } from 'lucide-react'
import { DocPage, Note, Section } from '@/docs/components/Doc'
import { AutoplayContext, useAutoplay } from '@/docs/components/autoplay'
import { GhostPointer } from '@/docs/components/GhostPointer'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { LogoParticleHero } from '@/docs/components/LogoParticleHero'
import { cn } from '@/lib/cn'
import {
  Aurora, BorderBeam, CardDeck, CirclePacking, Clock, CometTrail, ConfettiButton, Constellation, DepthScene, Dock, DotWave, ElasticTabs, Equalizer, Fireflies, FlipCard, FlowField, FluidInk, FractalTree, Glitch, GooeyMenu, Halftone, Harmonograph, HexPulse, Interference, JellyCard, JellyText, Kaleidoscope, KineticText, Lava, Lens, Life, Lightning, LiquidButton, LiquidGauge, LiveCode, LogoTilt3D, MagneticField, Mandelbrot, MatrixRain, Metaballs, Meteors, MorphCursor, MorphText, Neon, NotificationStack, Odometer, Orbit, ParticleMorph3D, ParticleText, Pendulum, Physarum, PhysicsBalls, Plasma, PressureText, PrismCard, ReactionDiffusion, RippleImage, Rope, RubberBand, SDFScene, Sand, ScrambleText, Shatter, ShimmerText, Silk, SplitFlap, SpotCard, SpotlightGrid, Swarm, Tentacle, Terrain, ThemeReveal, TileFlip, Topography, Tunnel, Voronoi, Warp, WaterRipple, WaveText, WipeText,
  AuthMovie, SolarSystem, SplashLogo,
} from './showcase.lazy'
import { Checkbox, EmailField, OTPInput, PasswordField, SentMail, SubmitButton, TextField, type OTPStatus, type SubmitStatus } from '@/components/form'
import { LogoScene3D } from '@/components/brand/LogoScene3D'
import { LogoMark } from '@/components/brand/LogoMark'
import { SPLASH_VARIANTS } from '@/components/brand/splash.constants'
import { Button } from '@/components/ui'
import { LetterReveal, MagneticButton, Marquee } from '@/components/motion'
import { Skeleton } from '@/components/ui/Skeleton'

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
  dark,
  pauseOn = 'hover',
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
  /** 항상 다크로 — 검은 바탕이 필요한 데모. 글자 토큰도 같이 뒤집혀 라이트 테마에서 사라지지 않는다 */
  dark?: boolean
  /** 자동 재생을 멈추는 조건 — hover: 포인터가 들어오면 · interact: 누르거나 휠·키를 써야(마우스만 올려선 계속 돈다) */
  pauseOn?: 'hover' | 'interact'
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [manual, setManual] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // 화면 근처에 있을 때만 데모를 마운트한다 — 수십 개의 canvas 가 동시에 돌지 않게. 높이는 기억해 둬서 흔들리지 않는다
  const [near, setNear] = useState(false)
  const [keepH, setKeepH] = useState<number>()
  const reduce = useReducedMotion()
  const playing = !hover && !focus && !manual && near && !reduce && !expanded

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        if (e.isIntersecting) setNear(true)
        else {
          if (body.current) setKeepH(body.current.offsetHeight)
          setNear(false)
        }
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
    const interact = pauseOn === 'interact'
    if (interact) {
      el.addEventListener('pointerdown', enter)
      el.addEventListener('wheel', enter, { passive: true })
      el.addEventListener('keydown', enter)
    } else el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('focusin', fin)
    el.addEventListener('focusout', fout)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('pointerdown', enter)
      el.removeEventListener('wheel', enter)
      el.removeEventListener('keydown', enter)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('focusin', fin)
      el.removeEventListener('focusout', fout)
    }
  }, [pauseOn])

  return (
    <div ref={wrap} className={cn('flex flex-col overflow-hidden rounded-xl border border-line bg-surface', className)}>
      <div
        ref={body}
        data-theme={dark ? 'dark' : undefined}
        className={cn('relative flex min-h-[240px] flex-1 items-center justify-center overflow-hidden bg-bg text-fg', playing && ghost && 'is-ghost', bodyClassName)}
        style={keepH ? { minHeight: keepH } : undefined}
      >
        {/* 크게 보는 동안엔 카드 안 데모를 내린다 — 같은 시뮬레이션을 둘 돌리지 않게 */}
        {near && !expanded && (
          <AutoplayContext.Provider value={playing}>
            <Suspense fallback={null}>{children}</Suspense>
          </AutoplayContext.Provider>
        )}
        {ghost && near && !expanded && <GhostPointer active={playing} click={click} />}
      </div>
      <div className="flex items-start gap-3 border-t border-line px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
            {tag === 'new' && <span className="rounded-full bg-accent px-1.5 py-px font-mono text-[9.5px] tracking-wider text-white uppercase">new</span>}
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-dim">{desc}</p>
        </div>
        <div className="-my-0.5 flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setManual((v) => !v)}
            aria-pressed={manual}
            className={cn('flex h-8 items-center gap-1 rounded-md px-2 font-mono text-[10.5px] transition-colors', playing ? 'text-fg-faint hover:bg-line/40 hover:text-fg' : manual ? 'bg-fg text-bg' : 'text-fg-dim')}
            title={manual ? '자동 재생' : '멈추고 직접 해보기'}
          >
            {playing ? <Play size={11} /> : <Pause size={11} />}
            {playing ? 'auto' : manual ? 'manual' : 'paused'}
          </button>
          <button type="button" onClick={() => setExpanded(true)} aria-label={`${title} 크게 보기`} title="크게 보기" className="flex h-8 w-8 items-center justify-center rounded-md text-fg-faint hover:bg-line/40 hover:text-fg">
            <Maximize2 size={14} />
          </button>
          {to && (
            <Link to={to} aria-label={`${title} 문서로`} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-faint hover:bg-line/40 hover:text-fg" title="문서로">
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
      {expanded && (
        <Lightbox title={title} ghost={ghost} click={click} dark={dark} onClose={() => setExpanded(false)}>
          {children}
        </Lightbox>
      )}
    </div>
  )
}

/**
 * 크게 보기 — 화면을 거의 채우는 대화상자에 같은 데모를 다시 그린다.
 * 고정 높이 래퍼(h-[…px])는 CSS(.showcase-lightbox)가 꽉 채우고, 나머지는 가운데 원래 크기.
 * Esc·바깥 클릭으로 닫히고, 닫히면 포커스가 열었던 버튼으로 돌아간다.
 */
function Lightbox({ title, ghost, click, dark, onClose, children }: { title: string; ghost?: boolean; click?: boolean; dark?: boolean; onClose: () => void; children: ReactNode }) {
  const [hover, setHover] = useState(false)
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  useBodyScrollLock(true)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onClose])
  const playing = !hover && !reduce
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-theme={dark ? 'dark' : undefined}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[min(90dvh,1100px)] w-[min(98vw,1700px)] flex-col overflow-hidden rounded-2xl border border-line bg-bg text-fg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
          <h3 className="text-[14px] font-semibold tracking-tight">{title}</h3>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="-mr-1 flex h-9 w-9 items-center justify-center rounded-md text-fg-dim hover:bg-line/40 hover:text-fg">
            <X size={16} />
          </button>
        </div>
        <div
          className={cn('showcase-lightbox relative flex min-h-0 flex-1 items-center justify-center overflow-hidden', playing && ghost && 'is-ghost')}
          onPointerEnter={(e) => e.isTrusted && setHover(true)}
          onPointerLeave={(e) => e.isTrusted && setHover(false)}
        >
          <AutoplayContext.Provider value={playing}>
            <Suspense fallback={null}>{children}</Suspense>
          </AutoplayContext.Provider>
          {ghost && <GhostPointer active={playing} click={click} />}
        </div>
      </div>
    </div>,
    document.body,
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
  const [replay, setReplay] = useState(0)
  useAutoplay(async ({ sleep }) => {
    await sleep(3400)
    setI((v) => (v + 1) % LINES.length)
  })
  return (
    <div className="flex flex-col items-center gap-4" onPointerEnter={() => setReplay((v) => v + 1)}>
      <SplitFlap key={replay} text={LINES[i] ?? ''} length={16} className="text-[22px]" />
      <div className="flex gap-1.5">
        {LINES.map((l, j) => (
          <button key={l} type="button" onClick={() => setI(j)} aria-label={l} aria-pressed={i === j} className="group/dot flex h-8 items-center px-0.5">
            <span className={cn('h-1.5 w-6 rounded-full transition-colors', i === j ? 'bg-fg' : 'bg-line group-hover/dot:bg-line-strong')} />
          </button>
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
              <span className="block text-[14px] font-medium">Jiwan Seo</span>
              <span className="block text-[12px] text-fg-dim">Design engineer</span>
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
          <span className="block text-[13px] leading-relaxed text-fg-dim">복잡함은 지우고, 효과만 남깁니다.</span>
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

function GaugeDemo() {
  const [v, setV] = useState(62)
  useAutoplay(async ({ sleep }) => {
    await sleep(2600)
    setV(Math.floor(15 + Math.random() * 80))
  })
  return (
    <div className="flex flex-col items-center gap-4">
      <LiquidGauge value={v} />
      <input type="range" min={0} max={100} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-40 accent-(--accent)" aria-label="value" />
    </div>
  )
}

function TabsDemo() {
  const TABS = ['Overview', 'Components', 'Motion', 'Live']
  const [i, setI] = useState(0)
  useAutoplay(async ({ sleep }) => {
    await sleep(1600)
    setI((v) => (v + 1) % TABS.length)
  })
  return <ElasticTabs tabs={TABS} value={i} onChange={setI} />
}

function ShatterDemo() {
  const ref = useRef<HTMLDivElement>(null)
  useAutoplay(async ({ sleep }) => {
    await sleep(2400)
    const host = ref.current?.firstElementChild as HTMLElement | null
    if (host) {
      const r = host.getBoundingClientRect()
      host.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left + r.width * (0.35 + Math.random() * 0.3), clientY: r.top + r.height * (0.35 + Math.random() * 0.3) }))
    }
    await sleep(2400)
  })
  return (
    <div ref={ref} className="h-[300px] w-full">
      <Shatter src="/logos/efface.svg" />
    </div>
  )
}

function NotifDemo() {
  return (
    <NotificationStack
      items={[
        { id: 'a', title: 'HiNest', body: '새 근무표가 올라왔어요', time: '지금' },
        { id: 'b', title: 'efface', body: '견적서가 승인됐어요', time: '2분' },
        { id: 'c', title: 'MURU', body: '오늘의 레시피: 김치볶음밥', time: '9분' },
        { id: 'd', title: 'QTO', body: '결제가 완료됐어요', time: '1시간' },
      ]}
    />
  )
}

/** 스플래시 — 여섯 방식이 나란히 각자 반복된다. 머무는 시간을 조금씩 다르게 해 서로 어긋나며 돈다 */
function SplashDemo() {
  return (
    <div className="grid w-full grid-cols-3 gap-px bg-line md:grid-cols-6">
      {SPLASH_VARIANTS.map((x, i) => (
        <figure key={x.id} className="relative m-0 h-[230px] md:h-[300px]">
          <SplashLogo variant={x.id} size={92} loop hold={1200 + i * 180} />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-2.5 text-center font-mono text-[10.5px] tracking-wider text-white/50">{x.name}</figcaption>
        </figure>
      ))}
    </div>
  )
}

function SolarSystemDemo() {
  const playing = useContext(AutoplayContext)
  return (
    <div className="h-[420px] w-full md:h-[520px]">
      <SolarSystem auto={playing} />
    </div>
  )
}

function MandelbrotDemo() {
  const playing = useContext(AutoplayContext)
  return (
    <div className="h-[420px] w-full">
      <Mandelbrot auto={playing} />
    </div>
  )
}

/* ───────────────────────── 페이지 ───────────────────────── */

export function ShowcasePage() {
  return (
    <DocPage eyebrow="showcase" title="Showcase" lead="전부 스스로 돌아가요 — 가짜 커서가 떠다니거나 글자가 저절로 쳐져요. 마우스를 올리면 멈추고 직접 해볼 수 있고, 나가면 잠시 뒤 다시 돌아요.">
      <LogoParticleHero className="mb-16" />

      <Section title="Video">
        <Card title="Sign-up 시연" desc="macOS 26 데스크톱에서 독의 앱 → efface 를 열고, 커서가 사람처럼 회원가입 → 인증코드 → 로그인을 해내요. Recipes › Auth 의 실제 화면과 폼 컴포넌트가 그대로 움직여요(값만 스크립트가 넣고, 사용자 포커스는 안 뺏어요). 메뉴 막대·상태 아이콘·독·앱 창은 직접 눌러 볼 수 있어요 — 마우스만 올려선 시연이 계속 돌고, 누르거나 휠·키를 쓰면 멈췄다가 나가면 다시 돌아요. 오른쪽 위 버튼으로 크게 볼 수 있어요." pauseOn="interact" tag="new" className="mb-16">
          <div className="h-[460px] w-full md:h-[860px]">
            <AuthMovie />
          </div>
        </Card>
      </Section>

      <div className="grid gap-5 md:grid-cols-2">
          {/* ── 소름 ── */}
          <Card title="Splash" desc="앱을 켤 때 — efface 마크가 만들어지는 여섯 가지 방식이 나란히 각자 반복돼요. 조각이 사방에서 날아와 맞물리고(조립), 방울이 끈적하게 합쳐져 굳고(액체), 먼지가 소용돌이치며 응축되고(입자), 선이 그려지며 색이 차오르고(드로잉), 종이처럼 펼쳐져 내려앉고(접기), 블루 안에서 빠져나와 흰 판 속으로 들어가요(포털). 시연 영상에서 efface 를 열 때는 매번 다른 방식이 나와요." tag="new" dark className="md:col-span-2">
            <SplashDemo />
          </Card>
          <Card title="FluidInk" desc="GPU 유체 시뮬레이션. 끌면 잉크가 소용돌이치며 번지고, 누르면 사방으로 터져요." tag="new" ghost click className="md:col-span-2">
            <div className="h-[380px] w-full">
              <FluidInk />
            </div>
          </Card>
          <Card title="ReactionDiffusion" desc="반응·확산(그레이-스콧). 두 화학물질이 퍼지고 반응하며 산호·지문 같은 튜링 무늬가 스스로 자라나요. 포인터가 지나간 자리에서 시작되고, 누르면 무늬 종류가 바뀌어요." tag="new" ghost click>
            <div className="h-[320px] w-full">
              <ReactionDiffusion />
            </div>
          </Card>
          <Card title="Physarum" desc="점균. 수천 마리가 페로몬 자국을 따라 돌기만 해도 혈관 같은 그물이 스스로 짜여요. 포인터는 먹이, 누르면 흩어져요." tag="new" ghost click>
            <div className="h-[320px] w-full">
              <Physarum />
            </div>
          </Card>
          <Card title="SDFScene" desc="레이마칭. 삼각형 하나 없이 거리 함수로 3D 를 그려요 — efface 마크 판 두 장과 구들이 액체처럼 녹아 붙고, 정반사·프레넬·안개. 포인터가 카메라를 돌려요." tag="new" ghost>
            <div className="h-[320px] w-full">
              <SDFScene />
            </div>
          </Card>
          <Card title="WaterRipple" desc="물결. 파동 방정식을 풀어 아래 로고를 굴절시켜요. 스치면 물방울, 누르면 큰 파문, 가만히 두면 빗방울." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <WaterRipple src="/logos/efface.svg" />
            </div>
          </Card>
          <Card title="태양계" desc="진짜 우주 — 태양은 대류 세포와 흑점이 흐르는 절차적 표면이라 아무리 확대해도 뭉개지지 않고, 여덟 행성·달·위성들이 실제 자전축·자전 방향·공전 순서로 돌아요. 지구는 낮 지도 위에 국경과 나라 이름, 밤의 도시 불빛, 흘러가는 구름, 바다 반사, 대기 산란. 토성은 고리 그림자가 행성에, 행성 그림자가 고리에 져요. 끌어서 돌리고, 휠·핀치로 다가가고, 행성을 누르거나 위 칩으로 날아가요. 텍스처: NASA · Solar System Scope(CC BY 4.0) · Natural Earth." tag="new" dark className="md:col-span-2">
            <SolarSystemDemo />
          </Card>
          <Card title="Mandelbrot 우주" desc="어디든 갈 수 있어요 — 끌어서 이동, 휠·핀치·더블클릭으로 확대, 화살표·+/- 키. 위 칩의 행성(해마 골짜기 · 코끼리 골짜기 · 미니 만델브로트 …)으로 비행하고, 섭동 렌더링이라 float 한계를 넘어 10¹³× 까지 들어가요. 가만히 두면 행성들을 차례로 돌아요." tag="new" className="md:col-span-2">
            <MandelbrotDemo />
          </Card>
          <Card title="Lightning" desc="번개. 가지를 치며 포인터 자리로 내려꽂히고 섬광이 화면을 밝힌 뒤 잔광이 남아요. 누르면 바로 떨어져요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Lightning />
            </div>
          </Card>
          <Card title="FlowField" desc="흐름장. 수천 개 입자가 노이즈 벡터장을 따라 흐르며 실 궤적을 남겨요. 포인터는 소용돌이." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <FlowField />
            </div>
          </Card>
          <Card title="Pendulum" desc="이중 진자. 카오스로 흔들리며 끝점이 색 궤적을 남겨요 — 매번 달라요. 첫 마디를 잡아 들었다 놓아 보세요." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[320px] w-full">
              <Pendulum />
            </div>
          </Card>
          <Card title="Tunnel" desc="극좌표로 접은 격자가 끝없이 안으로 빨려 들어가요. 포인터가 소실점을, 누르면 가속." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Tunnel />
            </div>
          </Card>
          <Card title="Interference" desc="두 파원의 동심원이 겹쳐 보강·상쇄 무늬를 만들어요. 한 파원은 포인터, 누르면 파원 추가." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Interference />
            </div>
          </Card>
          <Card title="Voronoi" desc="보로노이 세포. 씨앗들이 떠다니며 가장 가까운 씨앗의 영역으로 화면이 갈라져요. 포인터도 씨앗." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Voronoi />
            </div>
          </Card>
          <Card title="Life" desc="생명 게임(콘웨이). 규칙 넷으로 태어나고 죽어요. 포인터로 셀을 그리고, 누르면 글라이더 총." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Life />
            </div>
          </Card>
          <Card title="Topography" desc="등고선. 노이즈 지형을 마칭 스퀘어로 잘라 선을 긋고, 땅이 융기·침강하며 선이 흘러요. 포인터 자리가 봉우리." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Topography />
            </div>
          </Card>
          <Card title="MagneticField" desc="쇠가루가 자석 방향으로 돌아서요. 자석 둘이 떠다니고 포인터가 셋째, 누르면 극이 뒤집혀요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <MagneticField />
            </div>
          </Card>
          <Card title="Kaleidoscope" desc="만화경. 포인터 획이 열 개의 거울에 비쳐 대칭 문양이 돼요. 가만히 두면 스스로 그려요." tag="new" ghost>
            <div className="h-[300px] w-full">
              <Kaleidoscope />
            </div>
          </Card>
          <Card title="Harmonograph" desc="감쇠 진자 넷의 합이 펜을 끌고 한 획으로 문양을 그려요. 포인터가 진동수를, 누르면 새로." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Harmonograph />
            </div>
          </Card>
          <Card title="FractalTree" desc="가지가 재귀로 자라고 바람(포인터)에 끝가지일수록 크게 휘어요. 누르면 새 나무." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[320px] w-full">
              <FractalTree />
            </div>
          </Card>
          <Card title="Plasma" desc="데모신 플라스마. 사인파 여러 겹이 색을 흘려보내요. 포인터가 중심을, 누르면 팔레트." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Plasma />
            </div>
          </Card>
          <Card title="CirclePacking" desc="빈 자리에 원이 태어나 이웃에 닿을 때까지 자라요. 포인터가 지나가면 길이 트여요." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <CirclePacking />
            </div>
          </Card>
          <Card title="Rope" desc="양 끝이 고정된 밧줄. 잡아 끌면 무겁게 따라오다 놓으면 출렁이며 가라앉아요." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[280px] w-full">
              <Rope />
            </div>
          </Card>
          <Card title="Swarm" desc="새떼(보이드). 정렬·결집·분리 세 규칙으로 떼가 살아 움직여요. 포인터는 포식자, 누르면 몰려들어요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Swarm />
            </div>
          </Card>
          <Card title="Tentacle" desc="촉수. 마디들이 사슬처럼 이어져 머리가 포인터를 쫓고 몸통이 뒤따라요(역기구학)." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Tentacle />
            </div>
          </Card>
          <Card title="Sand" desc="떨어지는 모래(셀 자동자). 포인터 자리에서 쏟아져 쌓이고 비탈을 타고 흘러요. 누르면 색이 바뀌어요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Sand />
            </div>
          </Card>
          <Card title="PressureText" desc="가변 글꼴의 굵기 축을 포인터가 눌러요 — 가까운 글자는 두꺼워지고 멀면 가늘어져요." tag="new" ghost>
            <PressureText text="Pressure" className="text-5xl tracking-tight md:text-6xl" />
          </Card>
          <Card title="Constellation" desc="별들이 떠다니며 가까운 별끼리 실처럼 이어져요. 포인터는 큰 별, 누르면 밀려나요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Constellation />
            </div>
          </Card>
          <Card title="Halftone" desc="로고를 하프톤 점으로. 포인터가 빛이 되어 가까운 점은 커지고 액센트로 물들어요." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Halftone src="/logos/efface.svg" />
            </div>
          </Card>
          <Card title="Orbit" desc="중력. 행성들이 별을 돌며 꼬리를 남겨요. 포인터도 별이라 궤도가 휘고, 누르면 새 행성이 태어나요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Orbit />
            </div>
          </Card>
          <Card title="Fireflies" desc="반딧불이. 숨 쉬듯 밝아졌다 어두워지고, 포인터 가까이로 몰려와요. 누르면 흩어져요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Fireflies />
            </div>
          </Card>
          <Card title="Silk" desc="비단 천(클로스 시뮬레이션). 핀에 걸린 천이 바람에 흔들리고, 포인터가 스치면 밀려나며 주름이 잡혀요. 접힌 데는 빛으로 어두워져요." tag="new" ghost>
            <div className="h-[320px] w-full">
              <Silk />
            </div>
          </Card>
          <Card title="Lens" desc="돋보기. 포인터 자리를 둥근 렌즈가 확대하고 가장자리가 굴절처럼 휘어요." tag="new" ghost bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <Lens />
            </div>
          </Card>
          <Card title="Metaballs" desc="진짜 메타볼 — 픽셀마다 장을 더해 문턱값으로 잘라요. 덩이들이 가까워지면 목이 생기며 합쳐지고, 포인터도 덩이예요. 누르면 흩어져요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Metaballs />
            </div>
          </Card>
          <Card title="HexPulse" desc="육각 벌집. 포인터 주변이 부풀며 켜지고, 누르면 파문이 벌집을 타고 퍼져요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full">
              <HexPulse />
            </div>
          </Card>
          <Card title="Terrain" desc="지형 비행. 절차적 산맥 위를 끝없이 날아요 — 높이로 눈·바위·풀, 멀수록 안개. 포인터가 기수와 고도를, 누르면 가속." tag="new" ghost click>
            <div className="h-[320px] w-full">
              <Terrain />
            </div>
          </Card>
          <Card title="MatrixRain" desc="디지털 비. 포인터 주변 줄기가 빨라지고 액센트로 밝아져요." tag="new" ghost>
            <div className="h-[300px] w-full">
              <MatrixRain />
            </div>
          </Card>
          <Card title="Equalizer" desc="이퀄라이저. 봉우리가 천천히 떨어지고, 포인터가 지나는 자리가 솟구쳐요. 누르면 전부 튀어요." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[300px] w-full px-4 pt-6">
              <Equalizer />
            </div>
          </Card>
          <Card title="RubberBand" desc="고무줄. 잡아당겼다 놓으면 튕기며 진동하다 잦아들어요. 스쳐도 살짝 흔들려요." tag="new" ghost>
            <div className="h-[220px] w-full">
              <RubberBand />
            </div>
          </Card>
          <Card title="DepthScene" desc="깊이가 다른 층들이 서로 다른 속도로 움직여요(패럴랙스). 먼 층은 느리고 흐릿해요." tag="new" ghost>
            <div className="h-[300px] w-full">
              <DepthScene />
            </div>
          </Card>
          <Card title="TileFlip" desc="모자이크 타일이 왼쪽 위부터 물결처럼 뒤집히며 다른 면을 드러내요." tag="new">
            <div className="h-[220px] w-full p-4">
              <TileFlip front="EFFACE" back="STUDIO" />
            </div>
          </Card>
          <Card title="ThemeReveal" desc="포인터 주위 원 안으로 반대 테마가 들여다보여요 — 다크 위를 라이트 손전등으로." tag="new" ghost>
            <div className="h-[300px] w-full">
              <ThemeReveal>
                <div className="flex h-full flex-col justify-center px-10">
                  <p className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">// theme</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">Same component,<br />two themes.</p>
                  <div className="mt-5 flex gap-2">
                    <span className="rounded-md bg-fg px-3 py-1.5 text-[13px] font-medium text-bg">Primary</span>
                    <span className="rounded-md border border-line px-3 py-1.5 text-[13px] font-medium">Secondary</span>
                  </div>
                </div>
              </ThemeReveal>
            </div>
          </Card>
          <Card title="LiveCode" desc="코드가 스스로 쳐져요 — 구문 색이 실시간으로 입혀지고 캐럿이 깜빡여요." tag="new" bodyClassName="items-stretch p-4">
            <LiveCode
              className="w-full"
              code={`import { EmailField, SubmitButton } from '@/components/form'

export function Login() {
  const [email, setEmail] = useState('')
  return (
    <form onSubmit={login}>
      <EmailField label="이메일" floating value={email} onChange={setEmail} />
      <SubmitButton status={status}>로그인</SubmitButton>
    </form>
  )
}`}
            />
          </Card>
          <Card title="Glitch" desc="채널이 어긋나고 가로 조각이 튀어요. 호버하면 더 심해져요." tag="new" ghost>
            <Glitch text="EFFACE" className="text-5xl md:text-6xl" />
          </Card>
          <Card title="Neon" desc="네온 사인. 켜질 때 깜빡이다 안정되고, 이따금 한 글자가 툭 꺼졌다 켜져요." tag="new" dark>
            <Replay every={6000}>
              <Neon text="OPEN 24H" className="text-5xl" />
            </Replay>
          </Card>
          <Card title="Meteors · BorderBeam" desc="유성우가 떨어지고, 카드 테두리를 빛줄기가 돌아요." tag="new" dark>
            <div className="relative flex h-[300px] w-full items-center justify-center">
              <Meteors />
              <BorderBeam>
                <div className="w-[260px] p-5">
                  <p className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">// efface</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight">Border beam</p>
                  <p className="mt-1 text-[13px] text-fg-dim">conic-gradient 가 돌아요.</p>
                </div>
              </BorderBeam>
            </div>
          </Card>
          <Card title="ElasticTabs" desc="인디케이터가 고무처럼 늘어났다 줄어들며 옮겨가요." tag="new">
            <TabsDemo />
          </Card>
          <Card title="NotificationStack" desc="iOS 알림 뭉치. 올리면 펼쳐지며 각자 자리로 흩어져요." tag="new" ghost>
            <NotifDemo />
          </Card>
          <Card title="LiquidGauge" desc="원 안의 물이 출렁이고, 값이 바뀌면 수면이 스프링처럼 오르내려요." tag="new">
            <GaugeDemo />
          </Card>
          <Card title="FlipCard" desc="호버하면 Y 축으로 돌아 뒷면이 나와요 — 살짝 들리고 그림자가 길어져요." tag="new" ghost>
            <FlipCard
              front={
                <div className="flex h-full flex-col justify-between">
                  <p className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">// front</p>
                  <p className="text-2xl font-semibold tracking-tight">efface studio</p>
                </div>
              }
              back={
                <div className="flex h-full flex-col justify-between">
                  <p className="font-mono text-[10.5px] tracking-wider opacity-60 uppercase">// back</p>
                  <p className="text-[14px] leading-relaxed">복잡함은 지우고,<br />효과만 남깁니다.</p>
                </div>
              }
            />
          </Card>
          <Card title="JellyCard" desc="커서 쪽으로 눌리며 찌그러지고, 나가면 출렁이며 돌아와요. 누르면 더 깊게." tag="new" ghost click>
            <JellyCard>
              <p className="font-mono text-[10.5px] tracking-wider uppercase opacity-70">// jelly</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">Squish me</p>
              <p className="mt-1 text-[13px] opacity-80">stiffness 260 · damping 9</p>
            </JellyCard>
          </Card>
          <Card title="WipeText" desc="액센트 막대가 훑고 지나가면 글자가 남고, 돌아오며 지워요." tag="new">
            <WipeText text="Less, but better." className="text-4xl md:text-5xl" />
          </Card>
          <Card title="Clock" desc="초침이 미끄러지듯 흐르고, 바늘 그림자가 빛(포인터) 방향에 따라 떨어져요." tag="new" ghost bodyClassName="text-fg">
            <Clock />
          </Card>
          <Card title="Shatter" desc="로고가 누른 자리에서 유리처럼 산산조각 났다가 조각들이 되돌아와 다시 붙어요." tag="new">
            <ShatterDemo />
          </Card>
          <Card title="ParticleMorph3D" desc="6,000개의 점이 구 → efface 마크 → 토러스 → 은하로 형태를 바꿔요. 포인터를 따라 돌고, 누르면 다음 모양." tag="new" ghost click bodyClassName="text-fg">
            <div className="h-[320px] w-full">
              <ParticleMorph3D />
            </div>
          </Card>
          <Card title="LogoTilt3D" desc="CSS 3D 로 두껍게 쌓은 efface 마크. 두 판이 다른 높이에 떠서 기울고, 빛과 그림자가 따라 움직여요." tag="new" ghost dark>
            <div className="h-[320px] w-full">
              <LogoTilt3D size={200} />
            </div>
          </Card>
          <Card title="MorphCursor" desc="원형 커서가 버튼 위에선 그 모양으로 늘어나 감싸요 (Linear 식). 벗어나면 다시 원으로." tag="new" ghost>
            <MorphCursor>
              <div className="flex h-[280px] w-full flex-wrap items-center justify-center gap-4 px-8">
                {['Products', 'Studio', 'Journal', 'Contact'].map((t) => (
                  <button key={t} type="button" data-cursor className="rounded-full border border-line px-5 py-2.5 text-[14px] font-medium text-fg-dim transition-colors hover:text-fg">
                    {t}
                  </button>
                ))}
                <button type="button" data-cursor className="rounded-md bg-fg px-5 py-2.5 text-[14px] font-medium text-bg">
                  Start a project
                </button>
              </div>
            </MorphCursor>
          </Card>
          <Card title="MorphText" desc="단어가 다음 단어로 녹아내리듯 바뀌어요 — 획이 액체처럼 이어졌다 갈라져요." tag="new">
            <MorphText words={['Erase', 'Design', 'Build', 'Ship', 'efface']} className="text-5xl font-bold tracking-tight md:text-6xl" />
          </Card>
          <Card title="KineticText" desc="같은 글자 줄이 여러 겹 쌓여 3D 로 물결쳐요. 포인터 쪽으로 기울어요." tag="new" ghost>
            <div className="h-[320px] w-full">
              <KineticText text="EFFACE" rows={6} />
            </div>
          </Card>
          <Card title="RippleImage" desc="셰이더 굴절. 포인터가 지나가면 로고에 물결이 일고 색이 살짝 갈라져요(색수차)." tag="new" ghost>
            <div className="h-[300px] w-full">
              <RippleImage src="/logos/efface.svg" />
            </div>
          </Card>
          <Card title="Warp" desc="워프 터널. 포인터가 소실점을 끌고, 누르고 있으면 속도가 붙어요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <Warp />
            </div>
          </Card>
          <Card title="PhysicsBalls" desc="태그들이 공이 되어 떨어지고 부딪히며 쌓여요. 잡아서 던지고, 빈 곳을 누르면 전부 튀어요." tag="new" ghost click>
            <div className="h-[300px] w-full">
              <PhysicsBalls labels={['Next.js', 'React', 'TypeScript', 'Tailwind', 'Motion', 'Three.js', 'Cloudflare', 'Supabase', 'Vite', 'Figma', 'Swift', 'Kotlin']} />
            </div>
          </Card>
          <Card title="WaveText" desc="글자가 출렁이는 물결을 따라 흘러가요. 포인터가 물결을 높여요." tag="new" ghost>
            <div className="h-[220px] w-full px-4">
              <WaveText text="Erase the complexity" />
            </div>
          </Card>
          <Card title="PrismCard" desc="프리즘 유리 카드. 기울면 무지개 굴절광이 흐르고 테두리는 빛 쪽만 밝아져요." tag="new" ghost>
            <div className="relative flex h-[320px] w-full items-center justify-center">
              <Aurora colors={['#2563eb', '#7c3aed', '#14b8b0']} className="opacity-70" />
              <PrismCard>
                <p className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">// efface</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">Less, but better.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-dim">One language shared by every efface product.</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="font-mono text-[11px] text-fg-dim">v1.0 · 2026</span>
                </div>
              </PrismCard>
            </div>
          </Card>

          <Card title="ParticleText" desc="입자가 흩어져 있다가 글자로 모여요. 포인터가 밀어내고, 누르면 폭발했다가 돌아와요. src 를 주면 로고도 돼요." tag="new" ghost click className="md:col-span-2">
            <div className="h-[300px] w-full text-fg">
              <ParticleText text="Erase the noise" gap={4} radius={80} scale={0.6} />
            </div>
          </Card>
          <Card title="SplitFlap" desc="공항 안내판. 칸마다 글자가 탁탁 넘어가다 제자리에서 멈춰요." tag="new">
            <SplitFlapDemo />
          </Card>
          <Card title="Dock" desc="리퀴드 글래스 독. 뒤가 비쳐 흐려지고 위 모서리에 빛이 맺혀요. 포인터와의 거리로 아이콘이 커지고, 누르면 튀어요." tag="new" ghost click>
            <div className="relative flex h-[300px] w-full items-end justify-center pb-6">
              <Aurora colors={['#ff7a59', '#7c3aed', '#14b8b0', '#2563eb']} attract={0.1} className="opacity-90" />
              <Dock
                items={[
                  { id: 'efface', label: 'efface', icon: <img src="/logos/efface.svg" alt="" />, tile: 'linear-gradient(160deg, #2a2d36, #0f1014)', running: true },
                  { id: 'hinest', label: 'HiNest', icon: <img src="/logos/hinest.svg" alt="" />, tile: 'linear-gradient(160deg, #6f8cff, #2b4fe0)', running: true },
                  { id: 'muru', label: 'MURU', icon: <img src="/logos/muru.svg" alt="" />, tile: 'linear-gradient(160deg, #fff4dc, #ffd28a)' },
                  { id: 'qto', label: 'QTO', icon: <img src="/logos/qto.svg" alt="" />, tile: 'linear-gradient(160deg, #ff8a78, #e8503c)' },
                  { id: 'goms', label: 'GOMS', icon: <img src="/logos/goms.svg" alt="" />, tile: 'linear-gradient(160deg, #ffc266, #ff9500)' },
                  { id: 'search', label: 'Search', icon: <Search className="text-white" />, tile: 'linear-gradient(160deg, #8e8e93, #48484a)' },
                  { id: 'settings', label: 'Settings', icon: <Settings className="text-white" />, tile: 'linear-gradient(160deg, #a0a0a6, #5c5c61)', running: true },
                ]}
              />
            </div>
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
            <JellyText text="Jelly, wobble, bounce." className="text-3xl font-semibold tracking-tight md:text-4xl" />
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
            <SpotlightGrid className="w-full grid-cols-2 sm:grid-cols-3">
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
          <Card title="3D 유리 로고" desc="포인터를 따라 입체적으로 기울어요. 투명 배경." to="/components/brand" tag="ours" ghost dark>
            <div className="h-[280px] w-full">
              <LogoScene3D transparent centered follow scale={0.6} />
            </div>
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
      <div className="mt-8">
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
      </div>
    </DocPage>
  )
}
