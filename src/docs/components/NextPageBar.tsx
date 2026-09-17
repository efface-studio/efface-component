import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DOC_NAV } from '@/docs/nav'

const FLAT = DOC_NAV.flatMap((g) => g.links.map((l) => ({ ...l, group: g.title })))
/** 바닥에서 이만큼 더 밀면 다음 페이지로 */
const PULL_PX = 280

/**
 * 페이지 끝의 "다음" 카드. 바닥에 닿은 채로 계속 스크롤(휠·터치)하면 게이지가 차고,
 * 다 차면 다음 페이지로 넘어간다. 클릭해도 된다.
 */
export function NextPageBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const idx = FLAT.findIndex((l) => l.to === pathname)
  const next = idx >= 0 ? FLAT[idx + 1] : undefined
  const [pull, setPull] = useState(0)
  const [seenPath, setSeenPath] = useState(pathname)
  const pullRef = useRef(0)
  const firedRef = useRef(false)
  const touchY = useRef<number | null>(null)

  // 페이지가 바뀌면 게이지를 비운다 (렌더 중 상태 조정). ref 는 아래 effect 가 새 리스너를 달며 초기화한다.
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setPull(0)
  }

  useEffect(() => {
    pullRef.current = 0
    firedRef.current = false
    if (!next) return
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    /** 프리뷰 안의 스크롤 컨테이너를 굴리는 중이면 페이지 넘김으로 치지 않는다 */
    const insideScroller = (target: EventTarget | null) => {
      let el = target instanceof Element ? target : null
      while (el && el !== document.body) {
        const oy = getComputedStyle(el).overflowY
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
          return el.scrollTop + el.clientHeight < el.scrollHeight - 1
        }
        el = el.parentElement
      }
      return false
    }

    // 넘어온 직후에는 잠근다. 이전 페이지에서 세게 민 관성 휠이 계속 들어오는 동안은
    // 절대 다시 차지 않게 — 휠 입력이 QUIET_MS 동안 끊기고, 도착 후 MIN_ARM_MS 가 지나야 푼다.
    const QUIET_MS = 400
    const MIN_ARM_MS = 800
    const arrivedAt = performance.now()
    let armed = false
    let quiet = 0
    let idle = 0
    const scheduleArm = () => {
      window.clearTimeout(quiet)
      quiet = window.setTimeout(() => {
        if (performance.now() - arrivedAt >= MIN_ARM_MS) armed = true
        else scheduleArm()
      }, QUIET_MS)
    }
    scheduleArm()

    const bump = (dy: number, target: EventTarget | null) => {
      if (firedRef.current) return
      if (!armed) {
        scheduleArm() // 관성이 아직 흐르는 중 — 잠금 연장
        return
      }
      if (insideScroller(target)) return
      if (!atBottom() || dy <= 0) {
        if (pullRef.current !== 0) {
          pullRef.current = 0
          setPull(0)
        }
        return
      }
      pullRef.current = Math.min(PULL_PX, pullRef.current + dy)
      setPull(pullRef.current / PULL_PX)
      window.clearTimeout(idle)
      // 잠깐 멈추면 게이지가 스르르 빠진다
      idle = window.setTimeout(() => {
        pullRef.current = 0
        setPull(0)
      }, 900)
      if (pullRef.current >= PULL_PX) {
        firedRef.current = true
        navigate(next.to)
      }
    }
    const onWheel = (e: WheelEvent) => bump(e.deltaY, e.target)
    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY
      if (touchY.current == null || y == null) return
      bump((touchY.current - y) * 1.5, e.target)
      touchY.current = y
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.clearTimeout(idle)
      window.clearTimeout(quiet)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [next, navigate, pathname])

  if (!next) return null

  return (
    <div className="mx-auto mt-24 max-w-[1280px]">
      <Link
        to={next.to}
        className="group relative block overflow-hidden rounded-xl border border-line bg-bg-soft px-6 py-7 transition-colors hover:border-line-strong md:px-8"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 bg-accent/10 transition-[width] duration-100" style={{ width: `${pull * 100}%` }} />
        <span className="relative flex items-center justify-between gap-6">
          <span>
            <span className="label">
              <span className="text-accent">//</span> next · {next.group}
            </span>
            <span className="mt-2 block text-2xl font-semibold tracking-tight md:text-3xl">{next.label}</span>
            <span className="mt-2 block text-[13px] text-fg-faint">Keep scrolling, or click</span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-fg-dim transition-all group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
    </div>
  )
}
