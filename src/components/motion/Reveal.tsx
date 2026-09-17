import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { fadeUp } from '@/lib/motion'

export interface RevealProps {
  children: ReactNode
  /** 초. 리스트는 인덱스로 스태거한다. */
  delay?: number
  /** 떠오르는 거리(px). v2 = 20, v1 = 24. */
  y?: number
  /** 시작 스케일. v1은 0.985에서 시작해 미세하게 커진다. */
  scale?: number
  /** 뷰포트 안쪽 여유. 음수면 더 들어와야 재생. */
  margin?: string
  className?: string
}

/**
 * 뷰포트에 들어오면 한 번 떠오르며 나타난다 (v1/v2 공통).
 * 자식은 그대로 통과시키므로 섹션 내용은 정적으로 둘 수 있다.
 */
export function Reveal({ children, delay = 0, y = 20, scale = 1, margin = '-80px', className }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={fadeUp(y, delay, scale)}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin }}
    >
      {children}
    </motion.div>
  )
}
