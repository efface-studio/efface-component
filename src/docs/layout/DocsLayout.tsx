import { Suspense, useEffect, useState } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Crosshair, Menu, Moon, Sun, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DOC_NAV } from '@/docs/nav'
import { LogoMark } from '@/components/brand/LogoMark'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { DocsThemeContext, type DocsTheme } from '@/docs/theme'
import { NextPageBar } from '@/docs/components/NextPageBar'
import { EASE_OUT_EXPO } from '@/lib/motion'
import { InspectPanel } from '@/docs/components/InspectPanel'
import { isInspectMessage, loadInspectScript, type InspectInfo } from '@/lib/inspectBridge'

type Theme = DocsTheme
const STORAGE_KEY = 'efface-ds-theme'

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* 저장소 접근 불가 */
  }
  return 'dark'
}

/**
 * 문서 셸 — 좌측 사이드바 + 본문. 테마는 `<html data-theme>`에 걸어 문서 크롬 전체가
 * 따라가고, 각 Preview는 자기 범위의 `data-theme`로 따로 논다.
 */
export function DocsLayout() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()
  useBodyScrollLock(open)

  // 페이지 안 검사 모드 — 문서의 모든 프리뷰를 Figma 처럼 잰다
  const [inspect, setInspect] = useState(false)
  const [selected, setSelected] = useState<InspectInfo | null>(null)
  const [hovered, setHovered] = useState<InspectInfo | null>(null)
  const [distances, setDistances] = useState<number[] | null>(null)
  useEffect(() => {
    const onEv = (e: Event) => {
      const m = (e as CustomEvent).detail
      if (!isInspectMessage(m)) return
      if (m.type === 'state') {
        setInspect(m.on)
        if (!m.on) {
          setSelected(null)
          setHovered(null)
        }
      } else if (m.type === 'hover') {
        setHovered(m.info)
        setDistances(m.distances)
      } else if (m.type === 'select') setSelected(m.info)
    }
    window.addEventListener('ef-inspect', onEv)
    return () => window.removeEventListener('ef-inspect', onEv)
  }, [])
  const toggleInspect = async () => {
    await loadInspectScript()
    window.__efInspect?.toggle()
  }
  // 라이브 페이지는 자체 검사 UI 가 있으니 문서 검사는 끈다
  useEffect(() => {
    if (pathname.startsWith('/live') && window.__efInspect?.isOn()) window.__efInspect.disable()
  }, [pathname])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* 무시 */
    }
  }, [theme])


  const sidebar = (
    <nav aria-label="문서" className="flex flex-col gap-7">
      {DOC_NAV.map((g) => (
        <div key={g.title}>
          <p className="mb-2 font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">{g.title}</p>
          <ul className="flex flex-col">
            {g.links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'relative -ml-px flex items-center justify-between gap-2 border-l border-line py-1.5 pl-3 text-[13.5px] transition-colors',
                      isActive ? 'text-fg' : 'text-fg-dim hover:border-line-strong hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="docs-nav-active"
                          aria-hidden
                          className="absolute top-0 bottom-0 -left-px w-px bg-accent"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span>{l.label}</span>
                      {l.src && (
                        <span className="flex gap-0.5" aria-hidden>
                          {l.src.map((s) => (
                            <span
                              key={s}
                              className="h-1 w-1 rounded-full"
                              style={{ background: s === 'v1' ? '#2563eb' : s === 'v2' ? '#3b62e5' : 'var(--fg-faint)' }}
                            />
                          ))}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <DocsThemeContext.Provider value={{ theme, setTheme }}>
    <div className="min-h-dvh bg-bg text-fg">
      <header data-ef-ignore className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        {/* 본문과 같은 컨테이너·여백 — 로고는 사이드바 글자와, 컨트롤은 본문 오른쪽 여백과 나란히 */}
        <div className="mx-auto flex h-14 w-full max-w-[1720px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-fg-dim hover:bg-line/40 hover:text-fg lg:hidden" aria-label="메뉴 열기">
              <Menu size={18} />
            </button>
            <NavLink to="/" className="group flex items-center gap-2.5">
              <LogoMark className="h-5 w-5 text-fg transition-transform duration-500 group-hover:rotate-[-8deg]" />
              <span className="text-[15px] font-semibold lowercase tracking-tight">efface</span>
              <span className="hidden font-mono text-[10.5px] tracking-[0.18em] text-fg-faint uppercase sm:inline">design system</span>
            </NavLink>
          </div>
          <div className="flex items-center gap-1">
            <a href="https://github.com/efface-studio/efface-component" target="_blank" rel="noreferrer" className="hidden h-9 items-center px-3 font-mono text-xs text-fg-dim transition-colors hover:text-fg md:inline-flex">
              github ↗
            </a>
            {!pathname.startsWith('/live') && (
              <button
                type="button"
                onClick={toggleInspect}
                aria-pressed={inspect}
                className={cn('inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors', inspect ? 'bg-accent text-white' : 'text-fg-dim hover:bg-line/40 hover:text-fg')}
                title="요소에 마우스를 올리면 크기·여백, 누르면 고정, 다른 요소에 올리면 거리"
              >
                <Crosshair size={14} /> 검사
              </button>
            )}
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-md text-fg-dim transition-colors hover:bg-line/40 hover:text-fg"
              aria-label="문서 테마 전환"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1720px]">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-line py-8 pr-6 pl-5 md:pl-10 lg:block">{sidebar}</aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" aria-label="닫기" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-line bg-bg px-5 py-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[10.5px] tracking-[0.2em] text-fg-faint uppercase">contents</span>
                <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-dim hover:bg-line/40" aria-label="닫기">
                  <X size={16} />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 py-10 md:px-10 md:py-14">
          {/* 나가는 페이지는 움직이지 않고 제자리에서 흐려지고, 새 페이지만 아래에서 올라온다 —
              옛 페이지까지 움직이면 위로 튀었다 내려오는 것처럼 읽힌다.
              스크롤 리셋은 exit 가 끝난 뒤(이미 안 보일 때). */}
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0 })}>
            <motion.div
              key={pathname}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <Suspense fallback={null}>{outlet}</Suspense>
              <NextPageBar />
            </motion.div>
          </AnimatePresence>
          {inspect && (
            <div data-ef-ignore className="fixed right-4 bottom-4 z-[60] w-[300px] max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface/95 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10.5px] tracking-wider text-fg-faint uppercase">inspect</span>
                <button type="button" onClick={() => window.__efInspect?.disable()} className="flex h-6 w-6 items-center justify-center rounded text-fg-dim hover:bg-line/40 hover:text-fg" aria-label="검사 끄기">
                  <X size={13} />
                </button>
              </div>
              <InspectPanel selected={selected} hovered={hovered} distances={distances} />
            </div>
          )}
          <footer className="mx-auto mt-24 max-w-[1280px] border-t border-line pt-6 text-xs text-fg-faint">
            <p>
              efface design system · efface.dev · v2.efface.dev · mom.efface.dev{' '}
              <a className="link-underline text-fg-dim" href="https://github.com/efface-studio/efface-component" target="_blank" rel="noreferrer">
                source
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
    </DocsThemeContext.Provider>
  )
}
