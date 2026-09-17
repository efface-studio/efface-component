import { useEffect, useState, type RefObject } from 'react'

/**
 * 창(또는 `target` 스크롤 컨테이너)이 위에서 `threshold`px 이상 스크롤됐는지.
 */
export function useScrolledPast(threshold: number, target?: RefObject<HTMLElement | null>): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = target?.current
    const read = () => (el ? el.scrollTop : window.scrollY)
    const onScroll = () => setScrolled(read() > threshold)
    onScroll()
    const host: HTMLElement | Window = el ?? window
    host.addEventListener('scroll', onScroll, { passive: true })
    return () => host.removeEventListener('scroll', onScroll)
  }, [threshold, target])

  return scrolled
}
