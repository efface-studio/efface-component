import { useEffect, useState } from 'react'

/**
 * open이 false로 바뀌어도 exit 전환 시간만큼 마운트를 유지한다.
 * - mounted: DOM에 있어야 하는지
 * - visible: enter 상태 클래스를 적용해야 하는지 (마운트 후 한 프레임 뒤 true → 전환 발생)
 */
export function usePresence(open: boolean, durationMs = 250) {
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setExiting(false)
    } else {
      setEntered(false)
      setExiting(true)
    }
  }

  useEffect(() => {
    if (open) {
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    if (!exiting) return
    const timer = window.setTimeout(() => setExiting(false), durationMs)
    return () => window.clearTimeout(timer)
  }, [open, exiting, durationMs])

  return { mounted: open || exiting, visible: open && entered }
}
