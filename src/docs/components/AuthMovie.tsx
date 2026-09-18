import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Battery, Bluetooth, Search, User, Wifi, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { useAutoplay } from '@/docs/components/autoplay'
import { AuthShell, Divider, Item, Stagger } from '@/docs/components/auth/AuthShell'
import { LogoMark } from '@/components/brand/LogoMark'
import { TextField } from '@/components/form/TextField'
import { EmailField } from '@/components/form/EmailField'
import { PasswordField } from '@/components/form/PasswordField'
import { Checkbox } from '@/components/form/Checkbox'
import { OTPInput, type OTPStatus } from '@/components/form/OTPInput'
import { SubmitButton, type SubmitStatus } from '@/components/form/SubmitButton'
import { SocialButton } from '@/components/form/SocialButton'
import { LinkUnderline } from '@/components/ui/LinkUnderline'

/* 무대는 고정 크기로 그리고 컨테이너에 맞춰 통째로 축소한다 — 커서 좌표가 어디서나 같다 */
const W = 1280
const H = 860

type Scene = 'desktop' | 'apps' | 'signup' | 'verify' | 'login' | 'welcome'
type Field = 'name' | 'email' | 'pw' | 'pw2' | 'lemail' | 'lpw' | null

/** 사용자 Mac 의 독 순서 그대로 (아이콘은 .app 번들에서 추출한 public/macos/*.png) */
const DOCK = [
  ['finder', 'Finder'],
  ['apps', '앱'],
  ['messages', '메시지'],
  ['photos', '사진'],
  ['calendar', '캘린더'],
  ['notes', '메모'],
  ['music', '음악'],
  ['system-settings', '시스템 설정'],
  ['google-chrome', 'Google Chrome'],
  ['iterm', 'iTerm'],
  ['xcode', 'Xcode'],
  ['visual-studio-code', 'Visual Studio Code'],
  ['claude', 'Claude'],
  ['iphone-mirroring', 'iPhone 미러링'],
] as const

const APPS_GRID = [
  ['efface', 'efface'],
  ['messages', '메시지'],
  ['photos', '사진'],
  ['calendar', '캘린더'],
  ['notes', '메모'],
  ['music', '음악'],
  ['mail', 'Mail'],
  ['system-settings', '시스템 설정'],
  ['google-chrome', 'Chrome'],
  ['iterm', 'iTerm'],
  ['xcode', 'Xcode'],
  ['visual-studio-code', 'VS Code'],
  ['claude', 'Claude'],
  ['iphone-mirroring', 'iPhone 미러링'],
  ['finder', 'Finder'],
] as const

function AppIcon({ id, size = 56 }: { id: string; size?: number }) {
  if (id === 'efface')
    return (
      <span className="flex items-center justify-center rounded-[22.5%] bg-[linear-gradient(160deg,#20232c,#0b0c10)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_-6px_rgba(0,0,0,0.6)]" style={{ width: size, height: size }}>
        <LogoMark className="text-white" style={{ width: size * 0.56, height: size * 0.56 }} />
      </span>
    )
  return <img src={`/macos/${id}.png`} alt="" width={size} height={size} className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]" draggable={false} />
}

/** 메뉴 막대 드롭다운 — macOS 기본 항목. `-` 는 구분선 */
const MENUS: Record<string, string[]> = {
  apple: ['이 Mac에 관하여', '-', '시스템 설정…', 'App Store…', '-', '최근 사용 항목', '-', '강제 종료…', '-', '잠자기', '재시동…', '시스템 종료…', '-', '화면 잠금', 'jiwan 로그아웃…'],
  efface: ['efface에 관하여', '-', '설정…   ⌘,', '-', '서비스', '-', 'efface 가리기   ⌘H', '기타 가리기   ⌥⌘H', '모두 보기', '-', 'efface 종료   ⌘Q'],
  Finder: ['Finder에 관하여', '-', '설정…   ⌘,', '휴지통 비우기…   ⇧⌘⌫', '-', '서비스', '-', 'Finder 가리기   ⌘H', '기타 가리기   ⌥⌘H', '모두 보기'],
  앱: ['앱에 관하여', '-', '설정…   ⌘,', '-', '앱 가리기   ⌘H', '기타 가리기   ⌥⌘H', '-', '앱 종료   ⌘Q'],
  파일: ['새로운 윈도우   ⌘N', '새로운 탭   ⌘T', '열기…   ⌘O', '-', '닫기   ⌘W', '저장   ⌘S', '-', '프린트…   ⌘P'],
  편집: ['실행 취소   ⌘Z', '실행 복귀   ⇧⌘Z', '-', '오려두기   ⌘X', '복사하기   ⌘C', '붙여넣기   ⌘V', '모두 선택   ⌘A', '-', '받아쓰기 시작…', '이모티콘 및 기호'],
  보기: ['탭 막대 보기', '전체 화면 시작   ⌃⌘F', '-', '실제 크기   ⌘0', '확대   ⌘+', '축소   ⌘−'],
  이동: ['뒤로   ⌘[', '앞으로   ⌘]', '-', '최근 항목   ⇧⌘F', '문서   ⇧⌘O', '데스크탑   ⇧⌘D', '다운로드   ⌥⌘L', '홈   ⇧⌘H', '응용 프로그램   ⇧⌘A'],
  윈도우: ['최소화   ⌘M', '확대/축소', '-', '이전 탭 보기', '다음 탭 보기', '-', '모든 윈도우를 앞으로 가져오기'],
  도움말: ['도움말 검색', '-', 'efface 도움말', '키보드 단축키'],
}
const DOCK_LABEL = Object.fromEntries([...DOCK, ['efface', 'efface']] as [string, string][])

function clock() {
  const d = new Date()
  const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(d) // 9월 18일 (금)
  const time = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d) // 오후 3:20
  return `${date}  ${time}`
}

/**
 * 회원가입 시연 영상 — macOS 26 데스크톱에서 독의 "앱"을 열어 efface 를 실행하고, 커서가 사람처럼
 * 회원가입 → 인증코드 → 로그인을 해낸다. 화면은 Recipes › Auth 의 실제 AuthShell/폼 컴포넌트를 그대로 쓰고
 * 값만 스크립트가 넣는다(사용자 포커스는 건드리지 않는다).
 */
export function AuthMovie({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [scene, setScene] = useState<Scene>('desktop')
  const [cursor, setCursor] = useState({ x: W * 0.55, y: H * 0.5, ms: 0 })
  const cursorRef = useRef({ x: W * 0.55, y: H * 0.5 })
  const [pressed, setPressed] = useState(false)
  const [hoverDock, setHoverDock] = useState<string | null>(null)
  const [active, setActive] = useState<Field>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [agree, setAgree] = useState(false)
  const [submit, setSubmit] = useState<SubmitStatus>('idle')
  const [code, setCode] = useState('')
  const [otp, setOtp] = useState<OTPStatus>('idle')
  const [lemail, setLemail] = useState('')
  const [lpw, setLpw] = useState('')
  const [login, setLogin] = useState<SubmitStatus>('idle')
  const [now, setNow] = useState(clock)
  // 직접 조작 — 메뉴/팝오버 하나, 열린 앱 창들, 독 호버(진짜 포인터)와 바운스
  const [menu, setMenu] = useState<string | null>(null)
  const [windows, setWindows] = useState<string[]>([])
  const [dockHover, setDockHover] = useState<string | null>(null)
  const [bounce, setBounce] = useState<string | null>(null)
  const openApp = (id: string) => {
    setMenu(null)
    setBounce(id)
    window.setTimeout(() => setBounce((b) => (b === id ? null : b)), 700)
    if (id === 'apps') setScene((v) => (v === 'apps' ? 'desktop' : 'apps'))
    else if (id === 'efface') setScene((v) => (v === 'desktop' || v === 'apps' ? 'signup' : v))
    else if (id === 'finder') setWindows((w) => (w.includes('finder') ? w : [...w, 'finder']))
    else setWindows((w) => [...w.filter((x) => x !== id), id])
  }

  useEffect(() => {
    const el = host.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      if (!e) return
      setScale(Math.min(1, e.contentRect.width / W, e.contentRect.height / H))
    })
    ro.observe(el)
    const t = window.setInterval(() => setNow(clock()), 30000)
    return () => {
      ro.disconnect()
      window.clearInterval(t)
    }
  }, [])

  const reset = () => {
    setScene('desktop')
    setMenu(null)
    setWindows([])
    setDockHover(null)
    setBounce(null)
    cursorRef.current = { x: W * 0.55, y: H * 0.5 }
    setCursor({ x: W * 0.55, y: H * 0.5, ms: 0 })
    setPressed(false)
    setHoverDock(null)
    setActive(null)
    setName('')
    setEmail('')
    setPw('')
    setPw2('')
    setAgree(false)
    setSubmit('idle')
    setCode('')
    setOtp('idle')
    setLemail('')
    setLpw('')
    setLogin('idle')
  }

  useAutoplay(async ({ sleep, type }) => {
    const moveTo = async (tour: string, at: 'center' | 'left' = 'center') => {
      const st = stage.current
      const el = st?.querySelector<HTMLElement>(`[data-tour="${tour}"]`)
      if (!st || !el) return
      const r = el.getBoundingClientRect()
      const b = st.getBoundingClientRect()
      const s = b.width / W || 1
      const x = (r.left - b.left) / s + (at === 'left' ? 30 : r.width / s / 2)
      const y = (r.top - b.top) / s + r.height / s / 2
      const dist = Math.hypot(x - cursorRef.current.x, y - cursorRef.current.y)
      const ms = Math.min(1200, Math.max(420, dist * 0.9 + 260))
      cursorRef.current = { x, y }
      setCursor({ x, y, ms })
      await sleep(ms + 80)
    }
    const click = async () => {
      setPressed(true)
      await sleep(130)
      setPressed(false)
      await sleep(140)
    }

    // 1) 데스크톱 → 독의 "앱" → efface
    reset()
    await sleep(1400)
    await moveTo('dock-apps')
    setHoverDock('apps')
    await sleep(350)
    await click()
    setHoverDock(null)
    setScene('apps')
    await sleep(1100)
    await moveTo('app-efface')
    await click()
    setScene('signup')
    await sleep(1300)

    // 2) 회원가입
    await moveTo('name', 'left')
    await click()
    setActive('name')
    await type(setName, 'efface', 110)
    await sleep(300)
    await moveTo('email', 'left')
    await click()
    setActive('email')
    await type(setEmail, 'contact@e', 105)
    await sleep(750)
    setEmail('contact@efface.dev')
    await sleep(500)
    await moveTo('pw', 'left')
    await click()
    setActive('pw')
    await type(setPw, 'Efface!2026', 100)
    await sleep(500)
    await moveTo('pw2', 'left')
    await click()
    setActive('pw2')
    await type(setPw2, 'Efface!2026', 90)
    setActive(null)
    await sleep(300)
    await moveTo('agree')
    await click()
    setAgree(true)
    await sleep(550)
    await moveTo('submit')
    await click()
    setSubmit('loading')
    await sleep(1500)
    setSubmit('success')
    await sleep(1400)

    // 3) 인증코드
    setScene('verify')
    await sleep(1100)
    await moveTo('otp')
    await click()
    await type(setCode, '123456', 150)
    await sleep(300)
    setOtp('verifying')
    await sleep(1500)
    setOtp('success')
    await sleep(2200)

    // 4) 로그인
    setScene('login')
    await sleep(1000)
    await moveTo('lemail', 'left')
    await click()
    setActive('lemail')
    await type(setLemail, 'contact@efface.dev', 60)
    await moveTo('lpw', 'left')
    await click()
    setActive('lpw')
    await type(setLpw, 'Efface!2026', 80)
    setActive(null)
    await moveTo('login')
    await click()
    setLogin('loading')
    await sleep(1400)
    setLogin('success')
    await sleep(1300)

    // 5) 환영 → 잠시 뒤 처음부터
    setScene('welcome')
    await moveTo('welcome')
    await sleep(3600)
  }, reset)

  /** 메뉴 막대 항목 아래 드롭다운/팝오버 — 항목 버튼의 relative 래퍼 안에 그린다 */
  const dropdown = (id: string, side: 'left' | 'right') => (
    <AnimatePresence>
      {menu === id && (
        <motion.div key={id} className={cn('absolute top-full z-[25] mt-1', side === 'right' ? 'right-0' : 'left-0')} initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }} transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}>
          {id in MENUS ? (
                <ul className="liquid-glass min-w-[230px] rounded-xl p-1.5 text-[13px] text-white">
                  {MENUS[id]!.map((item, i) =>
                    item === '-' ? (
                      <li key={i} className="my-1 h-px bg-white/15" />
                    ) : (
                      <li key={i}>
                        <button type="button" onClick={() => setMenu(null)} className="flex w-full items-center justify-between rounded-md px-2.5 py-1 text-left hover:bg-[#2f6df6] hover:text-white">
                          <span>{item.split('   ')[0]}</span>
                          <span className="ml-6 text-white/55">{item.split('   ')[1] ?? ''}</span>
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              ) : id === 'wifi' ? (
                <div className="liquid-glass w-[280px] rounded-2xl p-3 text-[13px] text-white">
                  <div className="flex items-center justify-between px-1 font-semibold">
                    Wi‑Fi <span className="h-5 w-9 rounded-full bg-[#2f6df6] p-0.5"><span className="ml-4 block h-4 w-4 rounded-full bg-white" /></span>
                  </div>
                  <div className="mt-2 rounded-lg bg-white/10 px-2.5 py-2 text-[12.5px]">
                    <div className="text-white/60">알려진 네트워크</div>
                    <div className="mt-1 flex items-center justify-between font-medium">efface-studio <Wifi size={14} /></div>
                  </div>
                  <div className="mt-2 px-1 text-[12px] text-white/60">기타 네트워크 ▸</div>
                </div>
              ) : id === 'battery' ? (
                <div className="liquid-glass w-[240px] rounded-2xl p-3 text-[13px] text-white">
                  <div className="flex items-center justify-between px-1 font-semibold">배터리 <span>100%</span></div>
                  <div className="mt-1 px-1 text-[12px] text-white/60">전원 어댑터: 완전히 충전됨</div>
                  <div className="mt-2 border-t border-white/15 pt-2 text-[12.5px]">
                    <div className="text-white/60">많은 에너지를 사용하는 앱</div>
                    <div className="mt-1 font-medium">Google Chrome</div>
                  </div>
                </div>
              ) : id === 'cc' ? (
                <div className="liquid-glass w-[320px] rounded-2xl p-3 text-[12.5px] text-white">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/10 p-2.5">
                      {[['Wi‑Fi', <Wifi key="w" size={14} />], ['Bluetooth', <Bluetooth key="b" size={14} />], ['AirDrop', <span key="a">◎</span>]].map(([n, ic]) => (
                        <div key={n as string} className="flex items-center gap-2 py-1"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f6df6]">{ic as ReactNode}</span>{n as string}</div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex-1 rounded-xl bg-white/10 p-2.5">집중 모드</div>
                      <div className="flex-1 rounded-xl bg-white/10 p-2.5">화면 미러링</div>
                    </div>
                  </div>
                  {[['디스플레이', 70], ['사운드', 45]].map(([n, v]) => (
                    <div key={n as string} className="mt-2 rounded-xl bg-white/10 p-2.5">
                      <div className="mb-1.5">{n as string}</div>
                      <div className="h-5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white/90" style={{ width: `${v}%` }} /></div>
                    </div>
                  ))}
                </div>
              ) : id === 'np' ? (
                <div className="liquid-glass w-[260px] rounded-2xl p-3 text-[13px] text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-lg">♪</span>
                    <div><div className="font-semibold">재생 중인 항목 없음</div><div className="text-[12px] text-white/60">음악</div></div>
                  </div>
                </div>
              ) : (
                <div className="liquid-glass w-[300px] rounded-2xl p-3 text-[13px] text-white">
                  <div className="px-1 text-[20px] font-semibold">{now.split('  ')[0]}</div>
                  <div className="mt-2 rounded-xl bg-white/10 p-3 text-center text-[12.5px] text-white/60">알림 없음</div>
                </div>
              )}
        </motion.div>
      )}
    </AnimatePresence>
  )
  const windowOpen = scene !== 'desktop' && scene !== 'apps'
  const appName = windowOpen ? 'efface' : scene === 'apps' ? '앱' : 'Finder'
  const menus = windowOpen ? ['파일', '편집', '보기', '윈도우', '도움말'] : ['파일', '편집', '보기', '이동', '윈도우', '도움말']

  return (
    <div ref={host} className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-[#050813]', className)}>
      <div ref={stage} className="relative shrink-0 origin-center overflow-hidden" style={{ width: W, height: H, transform: `scale(${scale})` }} data-theme="dark">
        {/* 배경 화면 — Tahoe 기본 배경 느낌(파랑·청록 유리 결) */}
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_75%_20%,#2f6df6_0%,#1d3ea8_35%,#0b1d5e_65%,#050b2a_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_80%,rgba(65,220,255,0.35)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_60%_75%,rgba(255,255,255,0.10)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.03)_0_2px,transparent_2px_46px)]" />

        {/* 메뉴 막대 — Tahoe: 투명, 글자만. 항목을 누르면 드롭다운, 상태 아이콘은 팝오버 */}
        <div className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between px-4 text-[13.5px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
          <span className="flex items-center gap-1">
            {([['apple', ''], [appName, appName], ...menus.map((m) => [m, m])] as [string, string][]).map(([id, label]) => (
              <span key={id} className="relative">
                <button
                  type="button"
                  onClick={() => setMenu((m) => (m === id ? null : id))}
                  onPointerEnter={(e) => e.isTrusted && menu && menu in MENUS && setMenu(id)}
                  aria-expanded={menu === id}
                  className={cn('rounded-md px-2.5 py-1 transition-colors', id === 'apple' && 'text-[17px] leading-none', id === appName && 'font-bold', menu === id && 'bg-white/25')}
                >
                  {label}
                </button>
                {dropdown(id, 'left')}
              </span>
            ))}
          </span>
          <span className="flex items-center gap-1 text-[13px]">
            {[
              ['np', <span key="np" className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-white/90 text-[9px] font-bold text-[#1d3ea8]">♪</span>],
              ['wifi', <Wifi key="wifi" size={16} strokeWidth={2.2} />],
              ['battery', <span key="bat" className="flex items-center gap-1"><Battery size={20} strokeWidth={2} /> <span className="text-[12px]">100%</span></span>],
              ['cc', <span key="cc" className="inline-flex h-4 w-6 items-center justify-center rounded-[4px] border border-white/80"><span className="h-1.5 w-1.5 rounded-full bg-white" /><span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-white/60" /></span>],
              ['clock', <span key="clock">{now}</span>],
            ].map(([id, node]) => (
              <span key={id as string} className="relative">
                <button type="button" onClick={() => setMenu((m) => (m === id ? null : (id as string)))} aria-expanded={menu === id} className={cn('flex items-center rounded-md px-2 py-1 transition-colors', menu === id && 'bg-white/25')}>
                  {node as ReactNode}
                </button>
                {dropdown(id as string, 'right')}
              </span>
            ))}
          </span>
        </div>
        {/* 바깥 클릭으로 메뉴 닫기 */}
        {menu && <button type="button" aria-label="메뉴 닫기" className="absolute inset-0 z-[15] cursor-default" onClick={() => setMenu(null)} />}

        {/* "앱" 창 (Tahoe 의 Launchpad 후신) */}
        <AnimatePresence>
          {scene === 'apps' && (
            <motion.div
              key="apps"
              className="absolute left-1/2 top-24 flex h-[560px] w-[900px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-white/20 bg-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <aside className="w-[200px] shrink-0 border-r border-white/10 p-4 text-[13px] text-white/85">
                <div className="mb-3 flex h-8 items-center gap-2 rounded-full bg-white/15 px-3 text-white/60">
                  <Search size={13} /> 검색
                </div>
                {['모든 앱', '최근 항목', '생산성', '개발자 도구', '크리에이티브', '유틸리티'].map((c, i) => (
                  <div key={c} className={cn('rounded-lg px-2.5 py-1.5', i === 0 && 'bg-white/20 font-medium text-white')}>
                    {c}
                  </div>
                ))}
              </aside>
              <div className="grid flex-1 grid-cols-5 content-start gap-x-4 gap-y-7 p-8">
                {APPS_GRID.map(([id, label]) => (
                  <button type="button" key={id} data-tour={`app-${id}`} onClick={() => openApp(id)} className="flex flex-col items-center gap-2 rounded-xl p-1 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70">
                    <motion.span animate={(id === 'efface' && pressed) || bounce === id ? { scale: 0.9 } : { scale: 1 }} transition={{ duration: 0.12 }} className="flex">
                      <AppIcon id={id} size={64} />
                    </motion.span>
                    <span className="text-[12px] text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 앱 창 — Recipes › Auth 의 실제 화면 */}
        <AnimatePresence>
          {windowOpen && (
            <motion.div
              key="win"
              className="absolute left-1/2 top-14 flex w-[1120px] -translate-x-1/2 flex-col overflow-hidden rounded-[18px] border border-white/15 bg-bg text-fg shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]"
              style={{ height: H - 56 - 96 }}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.25 } }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-surface px-4">
                <button type="button" aria-label="efface 닫기" onClick={() => setScene('desktop')} className="group/tl flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57]">
                  <X size={8} className="text-black/70 opacity-0 group-hover/tl:opacity-100" />
                </button>
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 font-mono text-[11.5px] text-fg-dim">
                  <LogoMark className="h-3.5 w-3.5 text-fg" /> efface — {scene === 'signup' ? '회원가입' : scene === 'verify' ? '인증코드' : scene === 'login' ? '로그인' : '환영해요'}
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={scene} className="absolute inset-0" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28, transition: { duration: 0.2 } }} transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}>
                    {scene === 'signup' && (
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
                          <div className="mt-7 flex flex-col gap-4">
                            <Item>
                              <div data-tour="name">
                                <TextField label="이름" floating leading={<User size={16} />} value={name} onChange={(e) => setName(e.target.value)} valid={name.trim().length >= 2} active={active === 'name'} />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="email">
                                <EmailField label="이메일" floating value={email} onChange={setEmail} active={active === 'email'} />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="pw">
                                <PasswordField label="비밀번호" floating value={pw} onChange={setPw} strength rules active={active === 'pw'} />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="pw2">
                                <PasswordField label="비밀번호 확인" floating value={pw2} onChange={setPw2} valid={!!pw2 && pw2 === pw} active={active === 'pw2'} />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="agree" className="w-fit">
                                <Checkbox
                                  checked={agree}
                                  onChange={(e) => setAgree(e.target.checked)}
                                  label={
                                    <>
                                      <span className="link-underline text-fg">이용약관</span>과 <span className="link-underline text-fg">개인정보처리방침</span>에 동의해요
                                    </>
                                  }
                                />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="submit">
                                <SubmitButton status={submit} type="button" disabled={!agree} loadingLabel="계정 만드는 중" successLabel="가입 완료">
                                  계정 만들기
                                </SubmitButton>
                              </div>
                            </Item>
                          </div>
                        </Stagger>
                      </AuthShell>
                    )}
                    {scene === 'verify' && (
                      <AuthShell eyebrow="verify" headline="메일로 보낸 6자리 코드를 입력해 주세요.">
                        <Stagger>
                          <Item>
                            <h2 className="text-2xl font-semibold tracking-tight">인증코드 입력</h2>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-dim">
                              <span className="font-medium text-fg">contact@efface.dev</span> 으로 보낸 코드를 입력하세요.
                            </p>
                          </Item>
                          <Item className="mt-8">
                            <div data-tour="otp">
                              <OTPInput value={code} onChange={setCode} status={otp} label="" />
                            </div>
                          </Item>
                          <Item className="mt-6 flex items-center justify-between text-[13px]">
                            <span className="text-fg-dim">코드를 못 받으셨나요?</span>
                            <span className="font-mono text-fg-dim tabular-nums">00:27 후 재전송</span>
                          </Item>
                        </Stagger>
                      </AuthShell>
                    )}
                    {scene === 'login' && (
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
                          <div className="mt-8 flex flex-col gap-5">
                            <Item>
                              <div data-tour="lemail">
                                <EmailField label="이메일" floating value={lemail} onChange={setLemail} active={active === 'lemail'} />
                              </div>
                            </Item>
                            <Item>
                              <div data-tour="lpw">
                                <PasswordField label="비밀번호" floating value={lpw} onChange={setLpw} active={active === 'lpw'} />
                              </div>
                            </Item>
                            <Item className="flex items-center justify-between">
                              <Checkbox label="로그인 상태 유지" defaultChecked />
                              <LinkUnderline href="#" className="text-[13px] text-fg-dim hover:text-fg">
                                비밀번호를 잊으셨나요?
                              </LinkUnderline>
                            </Item>
                            <Item>
                              <div data-tour="login">
                                <SubmitButton status={login} type="button" loadingLabel="확인 중" successLabel="환영해요">
                                  로그인
                                </SubmitButton>
                              </div>
                            </Item>
                          </div>
                          <Item>
                            <Divider>또는</Divider>
                            <div className="grid gap-2.5">
                              <SocialButton provider="google" />
                              <SocialButton provider="apple" />
                              <SocialButton provider="github" />
                            </div>
                          </Item>
                        </Stagger>
                      </AuthShell>
                    )}
                    {scene === 'welcome' && (
                      <AuthShell eyebrow="welcome" headline="환영해요, efface 님.">
                        <div data-tour="welcome" className="flex flex-col items-center gap-5 text-center">
                          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white">
                            <LogoMark className="h-10 w-10" />
                          </motion.div>
                          <h2 className="text-2xl font-semibold tracking-tight">환영해요, efface 님</h2>
                          <p className="max-w-xs text-[13.5px] leading-relaxed text-fg-dim">가입 · 인증 · 로그인까지 한 번에. 실제 폼 컴포넌트가 그대로 움직인 거예요.</p>
                        </div>
                      </AuthShell>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 다른 앱 창 — 누르면 열리고, 빨간 점으로 닫힌다 */}
        <AnimatePresence>
          {windows.map((id, i) => (
            <motion.div
              key={id}
              className="absolute flex w-[520px] flex-col overflow-hidden rounded-[16px] border border-white/15 bg-[#1c1d22] text-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
              style={{ left: 120 + i * 48, top: 90 + i * 40, height: 360, zIndex: 12 + i }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              onPointerDown={() => setWindows((w) => [...w.filter((x) => x !== id), id])}
            >
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 bg-white/5 px-3">
                <button type="button" aria-label={`${DOCK_LABEL[id]} 닫기`} onClick={() => setWindows((w) => w.filter((x) => x !== id))} className="group/tl flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57]">
                  <X size={8} className="opacity-0 group-hover/tl:opacity-100" />
                </button>
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[12.5px] text-white/70">{DOCK_LABEL[id]}</span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <AppIcon id={id} size={72} />
                <div className="text-[15px] font-semibold">{DOCK_LABEL[id]}</div>
                <p className="max-w-xs text-[12.5px] text-white/55">이 데모에서는 efface 만 진짜로 열려요. 창은 눌러서 앞으로 가져오고, 빨간 점으로 닫아요.</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 독 — Tahoe 리퀴드 글래스. 진짜 포인터를 올리면 커지고, 누르면 튀며 열린다 */}
        <div className="absolute inset-x-0 bottom-2.5 z-20 flex justify-center">
          <div className="liquid-glass flex items-end gap-1.5 rounded-[26px] px-3 py-2" onPointerLeave={(e) => e.isTrusted && setDockHover(null)}>
            {[...DOCK, ['efface', 'efface'] as const].map(([id, label], i) => (
              <div key={id} className="flex items-end">
                {id === 'efface' && <span className="mx-1.5 mb-3 h-12 w-px self-center bg-white/25" />}
                <motion.button
                  type="button"
                  data-tour={`dock-${id}`}
                  title={label}
                  aria-label={label}
                  onClick={() => openApp(id)}
                  onPointerEnter={(e) => e.isTrusted && setDockHover(id)}
                  className="relative flex flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{ zIndex: dockHover === id ? 2 : 1 }}
                  animate={
                    bounce === id
                      ? { y: [0, -34, 0, -14, 0], scale: 1.18 }
                      : hoverDock === id || dockHover === id
                        ? { y: -12, scale: 1.35 }
                        : dockHover && Math.abs(i - [...DOCK, ['efface']].findIndex(([d]) => d === dockHover)) === 1
                          ? { y: -6, scale: 1.16 }
                          : { y: 0, scale: 1 }
                  }
                  transition={bounce === id ? { duration: 0.7, ease: 'easeOut' } : { type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <AppIcon id={id} size={54} />
                  {(id === 'finder' || (id === 'apps' && scene === 'apps') || (id === 'efface' && windowOpen) || windows.includes(id)) && <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-white/85" />}
                  {dockHover === id && (
                    <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/15 bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur-md">{label}</span>
                  )}
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* 커서 */}
        <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-30" animate={{ x: cursor.x, y: cursor.y }} transition={{ duration: cursor.ms / 1000, ease: EASE_OUT_EXPO }}>
          <motion.svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" animate={{ scale: pressed ? 0.85 : 1 }} transition={{ duration: 0.1 }}>
            <path d="M5 3l14 8-6.2 1.6L9.5 19z" fill="#fff" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" />
          </motion.svg>
          <AnimatePresence>
            {pressed && <motion.span key="ring" className="absolute left-1 top-0.5 h-4 w-4 rounded-full border-2 border-white" initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
