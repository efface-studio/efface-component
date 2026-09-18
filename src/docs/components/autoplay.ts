import { createContext, useContext, useEffect, useRef } from 'react'

/** 카드가 자동 재생 중인지 — 사용자가 마우스를 올리거나 포커스하면 false */
export const AutoplayContext = createContext(true)

export interface AutoplayControls {
  /** 멈추면 거부(reject)되는 sleep — 스크립트가 자연스럽게 중단된다 */
  sleep: (ms: number) => Promise<void>
  /** 글자를 한 자씩 친다 */
  type: (set: (v: string) => void, text: string, per?: number) => Promise<void>
}

/**
 * 자동 재생 스크립트를 돌린다. 카드가 재생 중이면 script 를 끝없이 반복하고,
 * 사용자가 끼어들면(호버·포커스) 바로 멈춘다. 다시 재생될 때 reset 을 먼저 부른다.
 */
export function useAutoplay(script: (ctl: AutoplayControls) => Promise<void>, reset?: () => void) {
  const playing = useContext(AutoplayContext)
  const scriptRef = useRef(script)
  const resetRef = useRef(reset)
  useEffect(() => {
    scriptRef.current = script
    resetRef.current = reset
  })

  useEffect(() => {
    if (!playing) return
    let alive = true
    const timers = new Set<number>()
    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const t = window.setTimeout(() => {
          timers.delete(t)
          if (alive) resolve()
          else reject(new Error('autoplay stopped'))
        }, ms)
        timers.add(t)
      })
    const type = async (set: (v: string) => void, text: string, per = 85) => {
      for (let i = 1; i <= text.length; i++) {
        set(text.slice(0, i))
        await sleep(per + Math.random() * 40)
      }
    }
    const run = async () => {
      resetRef.current?.()
      await sleep(600)
      while (alive) {
        try {
          await scriptRef.current({ sleep, type })
        } catch {
          return
        }
      }
    }
    void run()
    return () => {
      alive = false
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [playing])

  return playing
}
