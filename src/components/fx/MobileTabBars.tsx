import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Bell, Compass, Home, Plus, Search, User, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type TabBarStyle = 'glass' | 'dock' | 'fab' | 'gooey' | 'morph'

const TAB_BAR_STYLES: { id: TabBarStyle; name: string; desc: string }[] = [
  { id: 'glass', name: '글래스', desc: '리퀴드 글래스 알약 — 하이라이트가 미끄러지고 활성 탭만 이름이 펼쳐진다' },
  { id: 'dock', name: '독', desc: '활성 아이콘이 솟아오르며 커지고 이웃이 따라 커진다' },
  { id: 'fab', name: 'FAB', desc: '가운데 둥근 홈에 앉은 액션 버튼 — 누르면 ×로 돌며 작은 액션이 펼쳐진다' },
  { id: 'gooey', name: '구이', desc: '물방울 인디케이터가 늘어났다 끊기며 다음 탭으로 옮겨간다' },
  { id: 'morph', name: '모프', desc: '밑줄이 원으로 부풀어 아이콘 뒤에 앉고, 이름이 아래서 올라온다' },
]

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'explore', label: '탐색', icon: Compass },
  { id: 'search', label: '검색', icon: Search },
  { id: 'alerts', label: '알림', icon: Bell },
  { id: 'me', label: '나', icon: User },
]

export interface TabBarProps {
  style: TabBarStyle
  active: number
  onChange: (i: number) => void
  className?: string
}

/** 모바일 하단 탭 바 — 다섯 가지 모션 스타일 */
export function TabBar({ style, active, onChange, className }: TabBarProps) {
  const reduce = useReducedMotion()
  const spring = reduce ? { duration: 0.01 } : ({ type: 'spring', stiffness: 420, damping: 30 } as const)
  const [fabOpen, setFabOpen] = useState(false)
  // 알림 탭에 들어가면 배지가 사라지고, 홈으로 돌아오면 다시 쌓인다(렌더 중 파생)
  const [seen, setSeen] = useState(false)
  if (active === 3 && !seen) setSeen(true)
  if (active === 0 && seen) setSeen(false)
  const badge = seen ? 0 : 3

  if (style === 'glass')
    return (
      <nav className={cn('liquid-glass mx-3 mb-3 flex h-[58px] items-center rounded-full px-2 text-white', className)} aria-label="탭">
        {TABS.map((t, i) => {
          const on = i === active
          return (
            <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex h-[46px] flex-1 items-center justify-center rounded-full outline-none">
              {on && <motion.span layoutId="glass-pill" className="absolute inset-0 rounded-full bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]" transition={spring} />}
              <motion.span className="relative z-10 flex items-center gap-1.5 px-2" animate={{ scale: on ? 1.05 : 1 }} transition={spring}>
                <t.icon size={19} strokeWidth={on ? 2.4 : 1.9} />
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span key="l" className="overflow-hidden text-[12px] font-semibold whitespace-nowrap" initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                      {t.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </button>
          )
        })}
      </nav>
    )

  if (style === 'dock')
    return (
      <nav className={cn('mx-3 mb-3 flex h-[62px] items-end justify-around rounded-[22px] border border-white/10 bg-[#15171d]/90 px-2 pb-2 text-white/70 backdrop-blur-xl', className)} aria-label="탭">
        {TABS.map((t, i) => {
          const d = Math.abs(i - active)
          const on = d === 0
          const s = on ? 1.45 : d === 1 ? 1.12 : 1
          return (
            <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex w-11 flex-col items-center outline-none">
              <motion.span className={cn('flex h-9 w-9 items-center justify-center rounded-[11px]', on ? 'bg-accent text-white shadow-[0_8px_20px_-6px_var(--accent)]' : 'bg-white/8')} animate={{ scale: s, y: on ? -12 : d === 1 ? -4 : 0 }} transition={spring}>
                <t.icon size={18} strokeWidth={2} />
              </motion.span>
              <motion.span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white" animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }} transition={spring} />
            </button>
          )
        })}
      </nav>
    )

  if (style === 'fab') {
    const side = [TABS[0]!, TABS[1]!, TABS[3]!, TABS[4]!]
    const idx = [0, 1, 3, 4]
    return (
      <div className={cn('relative mx-0 mb-0 h-[74px] text-white', className)}>
        {/* 홈이 파인 바 — SVG 로 잘라낸 배경 */}
        <svg className="absolute inset-x-0 bottom-0 h-[62px] w-full" viewBox="0 0 300 62" preserveAspectRatio="none" aria-hidden>
          <path d="M0 14 Q0 0 14 0 H108 C122 0 122 34 150 34 C178 34 178 0 192 0 H286 Q300 0 300 14 V62 H0 Z" fill="#15171d" fillOpacity="0.96" />
        </svg>
        <nav className="absolute inset-x-0 bottom-0 flex h-[62px] items-center justify-between px-5" aria-label="탭">
          {side.map((t, k) => {
            const i = idx[k]!
            const on = i === active
            return (
              <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className={cn('flex w-10 flex-col items-center gap-0.5 outline-none transition-colors', on ? 'text-accent' : 'text-white/55', k === 1 && 'mr-8', k === 2 && 'ml-8')}>
                <motion.span animate={{ y: on ? -2 : 0, scale: on ? 1.1 : 1 }} transition={spring}>
                  <t.icon size={20} strokeWidth={on ? 2.4 : 1.9} />
                </motion.span>
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            )
          })}
        </nav>
        {/* 액션 버튼 — 누르면 × 로 돌며 미니 액션이 펼쳐진다 */}
        <AnimatePresence>
          {fabOpen &&
            [
              [-56, -44, Home],
              [0, -66, Search],
              [56, -44, Bell],
            ].map(([dx, dy, Icon], k) => {
              const I = Icon as LucideIcon
              return (
                <motion.button key={k} type="button" aria-label="액션" onClick={() => setFabOpen(false)} className="absolute left-1/2 top-[6px] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#15171d] shadow-[0_8px_22px_-6px_rgba(0,0,0,0.6)]" initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }} animate={{ x: dx as number, y: dy as number, scale: 1, opacity: 1 }} exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }} transition={{ ...spring, delay: k * 0.04 }}>
                  <I size={16} />
                </motion.button>
              )
            })}
        </AnimatePresence>
        <motion.button type="button" aria-expanded={fabOpen} aria-label="만들기" onClick={() => setFabOpen((v) => !v)} className="absolute left-1/2 top-[4px] flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-[0_10px_26px_-6px_var(--accent)]" whileTap={{ scale: 0.92 }} animate={{ rotate: fabOpen ? 135 : 0 }} transition={spring}>
          {fabOpen ? <X size={22} style={{ transform: 'rotate(-135deg)' }} /> : <Plus size={24} strokeWidth={2.4} />}
        </motion.button>
      </div>
    )
  }

  if (style === 'gooey') {
    const W = 300
    const cell = W / TABS.length
    const cx = cell * active + cell / 2
    return (
      <div className={cn('relative mx-3 mb-3 h-[60px] overflow-visible rounded-[20px] border border-white/10 bg-[#15171d]/92 text-white/60 backdrop-blur-xl', className)}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} 60`} preserveAspectRatio="none" aria-hidden>
          <defs>
            <filter id="tab-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
          </defs>
          <g filter="url(#tab-goo)">
            {/* 앞 방울은 빨리, 뒤 방울은 늦게 — 사이가 늘어났다 끊긴다 */}
            <motion.circle cy="30" r="20" fill="var(--accent)" animate={{ cx }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 300, damping: 22 }} />
            <motion.circle cy="30" r="14" fill="var(--accent)" animate={{ cx }} transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 120, damping: 16 }} />
          </g>
        </svg>
        <nav className="relative flex h-full items-center" aria-label="탭">
          {TABS.map((t, i) => {
            const on = i === active
            return (
              <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="flex h-full flex-1 items-center justify-center outline-none">
                <motion.span animate={{ color: on ? '#ffffff' : 'rgba(255,255,255,0.55)', scale: on ? 1.1 : 1 }} transition={spring} className="flex">
                  <t.icon size={19} strokeWidth={on ? 2.3 : 1.9} />
                </motion.span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // morph — 밑줄 ↔ 원, 배지
  return (
    <nav className={cn('mx-0 mb-0 flex h-[64px] items-center border-t border-white/10 bg-[#0f1116] px-1 text-white/55', className)} aria-label="탭">
      {TABS.map((t, i) => {
        const on = i === active
        return (
          <button key={t.id} type="button" onClick={() => onChange(i)} aria-current={on ? 'page' : undefined} className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 outline-none">
            <span className="relative flex h-8 w-8 items-center justify-center">
              {on && <motion.span layoutId="morph-bg" className="absolute inset-0 bg-accent/22" style={{ borderRadius: 999 }} initial={{ borderRadius: 4, height: 3, top: 'auto', bottom: -6 }} animate={{ borderRadius: 999, height: 32, bottom: 0 }} transition={spring} />}
              <motion.span className={cn('relative', on && 'text-accent')} animate={{ y: on ? 0 : 3, scale: on ? 1.12 : 1 }} transition={spring}>
                <t.icon size={20} strokeWidth={on ? 2.4 : 1.8} />
              </motion.span>
              {i === 3 && badge > 0 && (
                <motion.span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[9.5px] font-bold text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}>
                  {badge}
                </motion.span>
              )}
            </span>
            <AnimatePresence initial={false}>
              {on && (
                <motion.span key="l" className="text-[10px] font-semibold text-white" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}>
                  {t.label}
                </motion.span>
              )}
            </AnimatePresence>
            {!on && <span className="h-[13px]" />}
          </button>
        )
      })}
    </nav>
  )
}

/** 폰 프레임 — 다이내믹 아일랜드, 가짜 피드, 아래 슬롯 */
export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative mx-auto aspect-[9/19.5] w-full max-w-[210px] overflow-hidden rounded-[34px] border-[6px] border-[#1c1d22] bg-[#0b0c10] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <span className="absolute left-1/2 top-2 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
      {/* 피드 — 회색 덩어리 */}
      <div className="absolute inset-x-0 top-9 bottom-[84px] space-y-3 overflow-hidden px-4 pt-3">
        <div className="h-5 w-24 rounded bg-white/12" />
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-3 w-40 rounded bg-white/10" />
        <div className="h-3 w-28 rounded bg-white/8" />
        <div className="h-28 rounded-2xl bg-white/6" />
        <div className="h-3 w-36 rounded bg-white/10" />
      </div>
      <div className="absolute inset-x-0 bottom-0">{children}</div>
      {label && <span className="pointer-events-none absolute inset-x-0 bottom-[86px] text-center font-mono text-[10px] tracking-wider text-white/35">{label}</span>}
    </div>
  )
}

export interface MobileTabBarsProps {
  className?: string
}

/**
 * 모바일 탭 바 다섯 가지 — 폰 프레임 안에서 각자 탭을 번갈아 누르며 돈다(포인터를 올리면 그 폰은 멈추고 직접 눌러볼 수 있다).
 */
export function MobileTabBars({ className }: MobileTabBarsProps) {
  const reduce = useReducedMotion()
  return (
    <div className={cn('grid w-full grid-cols-2 gap-x-3 gap-y-4 px-3 py-4 sm:grid-cols-3 md:grid-cols-5', className)}>
      {TAB_BAR_STYLES.map((s, i) => (
        <Phone key={s.id} style={s.id} name={s.name} offset={i * 380} auto={!reduce} />
      ))}
    </div>
  )
}

function Phone({ style, name, offset, auto }: { style: TabBarStyle; name: string; offset: number; auto: boolean }) {
  const [active, setActive] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(() => {
    if (!auto || hover) return
    let id = 0
    const first = window.setTimeout(() => {
      setActive((a) => (a + 1) % TABS.length)
      id = window.setInterval(() => setActive((a) => (a + 1) % TABS.length), 1700)
    }, offset)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [auto, hover, offset])
  return (
    <div onPointerEnter={(e) => e.isTrusted && setHover(true)} onPointerLeave={(e) => e.isTrusted && setHover(false)}>
      <PhoneFrame label={name}>
        <TabBar style={style} active={active} onChange={setActive} />
      </PhoneFrame>
    </div>
  )
}
