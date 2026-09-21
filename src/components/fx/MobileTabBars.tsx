import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bell, Compass, Heart, Home, MessageCircle, Plus, Search, Settings, User, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { LogoMark } from '@/components/brand/LogoMark'

export type TabBarStyle = 'glass' | 'classic' | 'fab' | 'gooey' | 'morph'

const STYLES: { id: TabBarStyle; name: string }[] = [
  { id: 'glass', name: 'iOS 26 Liquid Glass' },
  { id: 'classic', name: 'iOS 18 Tab Bar' },
  { id: 'fab', name: 'Center Action' },
  { id: 'gooey', name: 'Gooey' },
  { id: 'morph', name: 'Morph' },
]

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'explore', label: '탐색', icon: Compass },
  { id: 'search', label: '검색', icon: Search },
  { id: 'alerts', label: '알림', icon: Bell },
  { id: 'me', label: '나', icon: User },
]

/* iOS 시스템 색 */
const BLUE = '#007aff'
const GRAY = '#8e8e93'

/* ── 폰 프레임 — 실제 iPhone 16 Pro 목업(SVG) 위에 화면을 얹는다 ───────────
   화면 영역은 목업 좌표 (65,55,1170,2532)/(1300,2642). 목업 본체는 화면이 뚫려 있어 뒤 콘텐츠가 비친다 */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[236px]', className)} style={{ aspectRatio: '1300 / 2642' }}>
      <div className="mac-ui absolute overflow-hidden bg-[#f2f2f7] text-black" style={{ left: '5%', top: '2.082%', width: '90%', height: '95.836%', borderRadius: '14.1% / 6.52%' }}>
        {children}
        <StatusBar />
        <span aria-hidden className="pointer-events-none absolute bottom-[1.6%] left-1/2 z-30 h-[1.1%] w-[36%] -translate-x-1/2 rounded-full bg-black/85" />
      </div>
      <img src="/mockups/iphone16pro.svg" alt="" className="pointer-events-none absolute inset-0 h-full w-full select-none" draggable={false} />
    </div>
  )
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[6.2%] items-center justify-between px-[9%] pt-[1.2%] text-[9px] font-semibold tracking-tight">
      <span>9:41</span>
      <span className="flex items-center gap-[4px]" aria-hidden>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
          <rect x="0" y="5" width="2" height="3" rx=".5" />
          <rect x="3.3" y="3.5" width="2" height="4.5" rx=".5" />
          <rect x="6.6" y="1.8" width="2" height="6.2" rx=".5" />
          <rect x="9.9" y="0" width="2" height="8" rx=".5" />
        </svg>
        <svg width="12" height="9" viewBox="0 0 24 18" fill="currentColor">
          <path d="M12 3.2c4.3 0 8.2 1.6 11.2 4.3l-2 2.1A13.3 13.3 0 0 0 12 6.2c-3.5 0-6.8 1.3-9.2 3.4l-2-2.1A16.2 16.2 0 0 1 12 3.2Zm0 5.6c2.7 0 5.2 1 7.1 2.7l-2 2.1A7.4 7.4 0 0 0 12 11.8c-1.9 0-3.7.7-5.1 1.8l-2-2.1A10.3 10.3 0 0 1 12 8.8Zm0 5.6c1.2 0 2.3.4 3.1 1.2L12 18.8l-3.1-3.2c.8-.8 1.9-1.2 3.1-1.2Z" />
        </svg>
        <svg width="18" height="9" viewBox="0 0 27 13">
          <rect x="0.75" y="0.75" width="22.5" height="11.5" rx="3.25" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
          <rect x="2.5" y="2.5" width="19" height="8" rx="1.8" fill="currentColor" />
          <path d="M25 4.4v4.2c.9-.3 1.4-1.1 1.4-2.1S25.9 4.7 25 4.4Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </span>
    </div>
  )
}

/* ── 화면들 — 탭마다 진짜 앱 화면처럼 ────────────────────────────── */
const TILES = ['linear-gradient(135deg,#3b62e5,#7aa0ff)', 'linear-gradient(135deg,#ff7a59,#ffb199)', 'linear-gradient(135deg,#20232c,#4b5163)', 'linear-gradient(135deg,#34c759,#a8f0b8)', 'linear-gradient(135deg,#af52de,#e0b0ff)', 'linear-gradient(135deg,#ff9f0a,#ffd60a)', 'linear-gradient(135deg,#5ac8fa,#bde9ff)', 'linear-gradient(135deg,#ff2d55,#ff9db1)', 'linear-gradient(135deg,#0b0c10,#3b62e5)']

function LargeTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-[7%] pt-[13%] pb-[3%]">
      <h4 className="text-[17px] font-bold tracking-tight">{title}</h4>
      {action}
    </div>
  )
}

function ScreenHome() {
  return (
    <div>
      <LargeTitle title="홈" action={<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b62e5] text-white"><LogoMark className="h-3.5 w-3.5" /></span>} />
      <div className="space-y-[6%] px-[6%]">
        {[0, 1].map((i) => (
          <div key={i} className="overflow-hidden rounded-[10px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="flex h-[72px] items-center justify-center" style={{ background: TILES[i === 0 ? 0 : 2] }}>
              <LogoMark className="h-6 w-6 text-white" />
            </div>
            <div className="px-3 py-2">
              <div className="text-[10.5px] font-semibold">{i === 0 ? '작게 일하고, 깊게 팝니다.' : '이번 주 새 컴포넌트 12개'}</div>
              <div className="mt-0.5 text-[8.5px] text-[#8e8e93]">{i === 0 ? 'efface · 디자인 시스템' : '쇼케이스 · 3분 전'}</div>
            </div>
          </div>
        ))}
        <div className="flex gap-2 overflow-hidden">
          {[3, 4, 5].map((i) => (
            <div key={i} className="h-[44px] flex-1 rounded-[8px]" style={{ background: TILES[i] }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenExplore() {
  return (
    <div>
      <LargeTitle title="탐색" />
      <div className="grid grid-cols-3 gap-[2px] px-[2px]">
        {TILES.map((t, i) => (
          <div key={i} className="aspect-square" style={{ background: t }} />
        ))}
      </div>
    </div>
  )
}

function ScreenSearch() {
  return (
    <div>
      <LargeTitle title="검색" />
      <div className="mx-[6%] flex h-[30px] items-center gap-1.5 rounded-[9px] bg-[#e5e5ea] px-2.5 text-[10px] text-[#8e8e93]">
        <Search size={11} /> 컴포넌트, 모션, 색…
      </div>
      <div className="mt-[5%] px-[6%] text-[8.5px] font-semibold text-[#8e8e93]">최근 검색</div>
      {['Liquid Glass', 'Splash 로고', '태양계', 'OTP 입력'].map((s) => (
        <div key={s} className="mx-[6%] flex h-[30px] items-center justify-between border-b border-black/6 text-[10px]">
          <span className="flex items-center gap-1.5">
            <Search size={10} className="text-[#8e8e93]" /> {s}
          </span>
          <X size={10} className="text-[#c7c7cc]" />
        </div>
      ))}
    </div>
  )
}

function ScreenAlerts() {
  const rows = [
    ['efface', '새 릴리스 — Splash 로고 여섯 방식', '지금', TILES[0]],
    ['지완', '“태양계 카드 대박이에요”', '4분', TILES[1]],
    ['쇼케이스', '애니메이션 20종이 추가됐어요', '1시간', TILES[4]],
    ['Live', 'live-v2 배포가 끝났어요', '어제', TILES[3]],
  ] as const
  return (
    <div>
      <LargeTitle title="알림" />
      {rows.map(([who, text, when, bg]) => (
        <div key={text} className="mx-[6%] flex items-center gap-2.5 border-b border-black/6 py-[7px]">
          <span className="h-[28px] w-[28px] shrink-0 rounded-full" style={{ background: bg }} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold">{who}</span>
              <span className="text-[8px] text-[#8e8e93]">{when}</span>
            </div>
            <div className="truncate text-[9px] text-[#3c3c43]">{text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ScreenMe() {
  return (
    <div>
      <div className="flex flex-col items-center pt-[14%]">
        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0b0c10] ring-2 ring-white">
          <LogoMark className="h-7 w-7 text-white" />
        </span>
        <div className="mt-2 text-[13px] font-bold">efface</div>
        <div className="text-[9px] text-[#8e8e93]">@efface · 디자인 시스템</div>
        <div className="mt-2.5 flex gap-5 text-center">
          {[
            ['104', '컴포넌트'],
            ['3.2k', '팔로워'],
            ['12', '릴리스'],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-[11px] font-bold">{n}</div>
              <div className="text-[8px] text-[#8e8e93]">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-[6%] mt-[6%] overflow-hidden rounded-[10px] bg-white">
        {[
          ['설정', Settings],
          ['좋아요한 항목', Heart],
          ['메시지', MessageCircle],
        ].map(([l, I], i) => {
          const Icon = I as LucideIcon
          return (
            <div key={l as string} className={cn('flex h-[32px] items-center gap-2.5 px-3 text-[10px]', i > 0 && 'border-t border-black/6')}>
              <Icon size={12} className="text-[#007aff]" /> {l as string}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SCREENS = [ScreenHome, ScreenExplore, ScreenSearch, ScreenAlerts, ScreenMe]

/* ── 탭 바들 ─────────────────────────────────────────────────── */
export interface TabBarProps {
  style: TabBarStyle
  active: number
  onChange: (i: number) => void
}

export function TabBar({ style, active, onChange }: TabBarProps) {
  const reduce = useReducedMotion()
  const spring = reduce ? { duration: 0.01 } : ({ type: 'spring', stiffness: 520, damping: 34 } as const)
  const [fabOpen, setFabOpen] = useState(false)
  // 알림에 들어가면 배지가 지워지고, 홈으로 돌아오면 다시 쌓인다(렌더 중 파생)
  const [seen, setSeen] = useState(false)
  if (active === 3 && !seen) setSeen(true)
  if (active === 0 && seen) setSeen(false)
  const badge = seen ? 0 : 3
  const Badge = ({ n }: { n: number }) =>
    n > 0 ? (
      <motion.span className="absolute -top-1 left-[52%] flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-[#ff3b30] px-[3px] text-[8px] font-bold text-white ring-[1.5px] ring-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
        {n}
      </motion.span>
    ) : null

  // iOS 26 — 떠 있는 리퀴드 글래스 알약 + 따로 떨어진 검색 원. 선택 탭엔 유리 렌즈가 미끄러진다
  if (style === 'glass') {
    const four = [0, 1, 3, 4]
    return (
      <div className="absolute inset-x-0 bottom-[3.6%] z-20 flex items-center gap-[6px] px-[4.5%]">
        <nav aria-label="탭" className="flex h-[46px] flex-1 items-center rounded-full border border-white/70 bg-white/55 px-[4px] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150">
          {four.map((i) => {
            const t = TABS[i]!
            const on = i === active
            return (
              <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex h-[38px] flex-1 flex-col items-center justify-center gap-[1px] rounded-full outline-none">
                {on && <motion.span layoutId="ios26-lens" className="absolute inset-0 rounded-full bg-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(0,0,0,0.18)]" transition={spring} />}
                <motion.span className="relative flex flex-col items-center gap-[1px]" animate={{ color: on ? BLUE : '#3c3c43', scale: on ? 1 : 0.96 }} transition={spring}>
                  <span className="relative">
                    <t.icon size={17} strokeWidth={on ? 2.3 : 1.9} />
                    {i === 3 && <Badge n={badge} />}
                  </span>
                  <span className="text-[8px] font-medium leading-none">{t.label}</span>
                </motion.span>
              </button>
            )
          })}
        </nav>
        <button type="button" aria-label="검색" onClick={() => onChange(2)} className={cn('flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl backdrop-saturate-150 transition-colors', active === 2 ? 'text-[#007aff]' : 'text-[#3c3c43]')}>
          <Search size={18} strokeWidth={2.2} />
        </button>
      </div>
    )
  }

  // iOS 18 — 반투명 표준 탭 바(49pt + 홈 인디케이터 영역). 선택 시 심볼이 한 번 튄다
  if (style === 'classic')
    return (
      <nav aria-label="탭" className="absolute inset-x-0 bottom-0 z-20 flex h-[13.4%] items-start border-t border-black/[0.12] bg-[#f9f9f9]/85 px-1 pt-[6px] backdrop-blur-xl">
        {TABS.map((t, i) => {
          const on = i === active
          return (
            <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex flex-1 flex-col items-center gap-[2px] outline-none" style={{ color: on ? BLUE : GRAY }}>
              <motion.span key={on ? 'on' : 'off'} className="relative" initial={on && !reduce ? { scale: 0.8, y: 2 } : false} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 700, damping: 18 }}>
                <t.icon size={21} strokeWidth={on ? 2.2 : 1.7} fill={on && (t.id === 'home' || t.id === 'alerts') ? BLUE : 'none'} />
                {i === 3 && <Badge n={badge} />}
              </motion.span>
              <span className="text-[8px] font-medium leading-none">{t.label}</span>
            </button>
          )
        })}
      </nav>
    )

  // 가운데 액션 — 둥근 홈에 앉은 버튼, 누르면 × 로 돌며 미니 액션이 펼쳐진다
  if (style === 'fab') {
    const side = [0, 1, 3, 4]
    return (
      <div className="absolute inset-x-0 bottom-0 z-20 h-[15%]">
        <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 300 62" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0H108C122 0 122 30 150 30C178 30 178 0 192 0H300V62H0Z" fill="#f9f9f9" fillOpacity="0.92" />
          <path d="M0 0.5H108C122 0.5 122 30.5 150 30.5C178 30.5 178 0.5 192 0.5H300" fill="none" stroke="rgba(0,0,0,0.12)" />
        </svg>
        <nav aria-label="탭" className="absolute inset-x-0 top-[9px] flex items-start justify-between px-[7%]">
          {side.map((i, k) => {
            const t = TABS[i]!
            const on = i === active
            return (
              <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className={cn('flex w-9 flex-col items-center gap-[2px] outline-none transition-colors', k === 1 && 'mr-7', k === 2 && 'ml-7')} style={{ color: on ? BLUE : GRAY }}>
                <span className="relative">
                  <t.icon size={20} strokeWidth={on ? 2.2 : 1.7} />
                  {i === 3 && <Badge n={badge} />}
                </span>
                <span className="text-[8px] font-medium leading-none">{t.label}</span>
              </button>
            )
          })}
        </nav>
        <AnimatePresence>
          {fabOpen &&
            (
              [
                [-44, -40, Compass],
                [0, -56, Search],
                [44, -40, Bell],
              ] as const
            ).map(([dx, dy, Icon], k) => (
              <motion.button key={k} type="button" aria-label="액션" onClick={() => setFabOpen(false)} className="absolute left-1/2 top-[-4px] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#1c1c1e] shadow-[0_6px_18px_-4px_rgba(0,0,0,0.35)]" initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }} animate={{ x: dx, y: dy, scale: 1, opacity: 1 }} exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }} transition={{ ...spring, delay: k * 0.04 }}>
                <Icon size={14} />
              </motion.button>
            ))}
        </AnimatePresence>
        <motion.button type="button" aria-expanded={fabOpen} aria-label="만들기" onClick={() => setFabOpen((v) => !v)} className="absolute left-1/2 top-[-8px] flex h-[42px] w-[42px] -translate-x-1/2 items-center justify-center rounded-full text-white shadow-[0_8px_20px_-6px_rgba(0,122,255,0.8)]" style={{ background: 'linear-gradient(160deg,#4da3ff,#007aff)' }} whileTap={{ scale: 0.92 }} animate={{ rotate: fabOpen ? 135 : 0 }} transition={spring}>
          {fabOpen ? <X size={18} style={{ transform: 'rotate(-135deg)' }} /> : <Plus size={20} strokeWidth={2.4} />}
        </motion.button>
      </div>
    )
  }

  // 구이 — 파란 물방울이 늘어났다 끊기며 다음 탭으로
  if (style === 'gooey') {
    const W = 193 // 바의 실제 폭(px)에 맞춘 viewBox — 방울이 찌그러지지 않게
    const cell = W / TABS.length
    const cx = cell * active + cell / 2
    return (
      <div className="absolute inset-x-[4.5%] bottom-[3.6%] z-20 h-[50px] rounded-full border border-black/[0.06] bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)]">
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} 50`} preserveAspectRatio="none" aria-hidden>
          <defs>
            <filter id="tab-goo" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
          </defs>
          <g filter="url(#tab-goo)">
            <motion.circle cy="25" r="18" fill={BLUE} animate={{ cx }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 320, damping: 24 }} />
            <motion.circle cy="25" r="12" fill={BLUE} animate={{ cx }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 130, damping: 17 }} />
          </g>
        </svg>
        <nav aria-label="탭" className="relative flex h-full items-center">
          {TABS.map((t, i) => {
            const on = i === active
            return (
              <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="flex h-full flex-1 items-center justify-center outline-none">
                <motion.span className="relative flex" animate={{ color: on ? '#ffffff' : GRAY, scale: on ? 1.08 : 1 }} transition={spring}>
                  <t.icon size={18} strokeWidth={on ? 2.3 : 1.8} />
                  {i === 3 && <Badge n={badge} />}
                </motion.span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // 모프 — 밑줄이 원으로 부풀어 아이콘 뒤에 앉고, 이름이 아래서 올라온다
  return (
    <nav aria-label="탭" className="absolute inset-x-0 bottom-0 z-20 flex h-[13.4%] items-start border-t border-black/[0.08] bg-white px-1 pt-[5px]">
      {TABS.map((t, i) => {
        const on = i === active
        return (
          <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex h-full flex-1 flex-col items-center gap-[1px] outline-none">
            <span className="relative flex h-[30px] w-[30px] items-center justify-center">
              {on && <motion.span layoutId="morph-bg" className="absolute inset-0 rounded-full" style={{ background: 'rgba(0,122,255,0.14)' }} initial={{ borderRadius: 3, height: 3, top: 'auto', bottom: -5 }} animate={{ borderRadius: 999, height: 30, bottom: 0 }} transition={spring} />}
              <motion.span className="relative" animate={{ y: on ? 0 : 2, scale: on ? 1.1 : 1, color: on ? BLUE : GRAY }} transition={spring}>
                <t.icon size={19} strokeWidth={on ? 2.3 : 1.7} />
                {i === 3 && <Badge n={badge} />}
              </motion.span>
            </span>
            <AnimatePresence initial={false}>
              {on && (
                <motion.span key="l" className="text-[8px] font-semibold leading-none text-[#1c1c1e]" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.18 }}>
                  {t.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )
      })}
    </nav>
  )
}

/* ── 데모 ─────────────────────────────────────────────────────── */
export interface MobileTabBarsProps {
  className?: string
}

/**
 * 모바일 탭 바 다섯 가지 — 실제 iPhone 16 Pro 목업 안에서 탭이 실제 화면(홈·탐색·검색·알림·나)을 바꾼다.
 * 폰마다 탭을 번갈아 누르며 돌고, 포인터를 올리면 그 폰은 멈추고 직접 눌러볼 수 있다.
 */
export function MobileTabBars({ className }: MobileTabBarsProps) {
  const reduce = useReducedMotion()
  return (
    <div className={cn('grid w-full grid-cols-2 gap-x-3 gap-y-5 px-3 py-5 sm:grid-cols-3 md:grid-cols-5', className)}>
      {STYLES.map((s, i) => (
        <Phone key={s.id} style={s.id} name={s.name} offset={i * 420} auto={!reduce} />
      ))}
    </div>
  )
}

function Phone({ style, name, offset, auto }: { style: TabBarStyle; name: string; offset: number; auto: boolean }) {
  const [active, setActive] = useState(0)
  const [hover, setHover] = useState(false)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!auto || hover) return
    let id = 0
    const first = window.setTimeout(() => {
      setActive((a) => (a + 1) % TABS.length)
      id = window.setInterval(() => setActive((a) => (a + 1) % TABS.length), 1900)
    }, offset)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [auto, hover, offset])
  const Screen = SCREENS[active] ?? ScreenHome
  return (
    <div className="flex flex-col items-center gap-2.5" onPointerEnter={(e) => e.isTrusted && setHover(true)} onPointerLeave={(e) => e.isTrusted && setHover(false)}>
      <PhoneFrame>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} className="absolute inset-0" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.22 }}>
            <Screen />
          </motion.div>
        </AnimatePresence>
        <TabBar style={style} active={active} onChange={setActive} />
      </PhoneFrame>
      <span className="font-mono text-[10.5px] tracking-wider text-fg-dim">{name}</span>
    </div>
  )
}
