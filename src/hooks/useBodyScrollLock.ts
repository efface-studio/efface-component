import { useEffect } from 'react'

let lockCount = 0
let savedOverflow = ''

/** 시트/모달/오버레이가 열려 있는 동안 배경 스크롤을 막는다. 중첩 시 카운트로 관리. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    lockCount += 1
    return () => {
      lockCount -= 1
      if (lockCount === 0) document.body.style.overflow = savedOverflow
    }
  }, [active])
}
