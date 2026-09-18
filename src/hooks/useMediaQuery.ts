import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

/** CSS 미디어쿼리 매칭 여부. SSR 없음 전제. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => window.matchMedia(query).matches,
  )
}

/** Tailwind `md` 미만 — 핀 고정 스크롤 씬은 여기서 스택 레이아웃으로 대체된다. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useReducedMotionPref(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
