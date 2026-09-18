import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * 요소가 한 번이라도 뷰포트에 들어왔는지. IntersectionObserver 기반이라
 * motion 의존 없이 CSS 전환만으로 등장 효과를 만들 때 쓴다.
 */
export function useInViewOnce<T extends HTMLElement>(
  options: IntersectionObserverInit = { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setShown(true)
        io.disconnect()
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // options 객체는 호출마다 새로 만들어지므로 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  return [ref, shown]
}
