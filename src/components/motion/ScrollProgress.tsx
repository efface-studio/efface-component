import { motion, useScroll, useSpring } from 'motion/react'
import { SPRING } from '@/lib/motion'
import { cn } from '@/lib/cn'

export interface ScrollProgressProps {
  /** 그라데이션. v1 기본은 블루 → 핑크. */
  gradient?: string
  className?: string
}

/** 화면 맨 위 2px 프로그레스 바 (v1). 스프링이 걸려 스크롤을 부드럽게 따라간다. */
export function ScrollProgress({ gradient = 'linear-gradient(90deg, #2563eb 0%, #ec4899 100%)', className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, SPRING.progress)
  return (
    <motion.div style={{ scaleX, transformOrigin: '0% 50%' }} className={cn('fixed top-0 right-0 left-0 z-[60] h-[2px] origin-left', className)}>
      <div className="h-full" style={{ background: gradient }} />
    </motion.div>
  )
}
