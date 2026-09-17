import { useEffect, useState } from 'react'

/** 창이 위에서 `threshold`px 이상 스크롤됐는지. */
export function useScrolledPast(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
