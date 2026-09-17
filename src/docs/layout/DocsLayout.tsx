import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DOC_NAV } from '@/docs/nav'
import { LogoMark } from '@/components/brand/LogoMark'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

type Theme = 'light' | 'dark'
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
  useBodyScrollLock(open)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* 무시 */
    }
  }, [theme])

  // 라우트가 바뀌면 맨 위로. 사이드바는 링크 클릭 시 닫는다.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

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
                      '-ml-px flex items-center justify-between gap-2 border-l py-1.5 pl-3 text-[13.5px] transition-colors',
                      isActive ? 'border-accent text-fg' : 'border-line text-fg-dim hover:border-line-strong hover:text-fg',
                    )
                  }
                >
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
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
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

      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line px-5 py-8 lg:block">{sidebar}</aside>

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
          <Outlet />
          <footer className="mx-auto mt-24 max-w-prose border-t border-line pt-6 text-xs text-fg-faint">
            <p>
              efface design system · efface.dev · v2.efface.dev · mom.efface.dev 에서 추출.{' '}
              <a className="link-underline text-fg-dim" href="https://github.com/efface-studio/efface-component" target="_blank" rel="noreferrer">
                source
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
