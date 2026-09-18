import { useRef, type Ref } from 'react'
import { motion, useInView } from 'motion/react'
import { EASE_OUT_EXPO, STAGGER } from '@/lib/motion'

export interface WordRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  stagger?: number
}

/**
 * 텍스트를 단어로 쪼개 스태거로 밀어 올린다 (v1 섹션 제목).
 * `\n`은 줄바꿈으로 유지된다. 각 줄이 자기 클립 박스 안에서 올라오며,
 * `pb-[0.18em] -mb-[0.18em]`은 디센더(g, p, y)가 잘리지 않게 한 여유다.
 */
export function WordReveal({ children, className, as: As = 'h2', delay = 0, stagger = STAGGER.word }: WordRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const lines = children.split('\n')

  return (
    <As ref={ref as Ref<HTMLHeadingElement>} className={className}>
      {lines.map((line, lineIdx) => {
        const words = line.split(' ')
        const offset = lines.slice(0, lineIdx).reduce((s, l) => s + l.split(' ').length, 0)
        return (
          <span key={lineIdx} className="-mb-[0.18em] block overflow-hidden pb-[0.18em]">
            <span className="inline-block">
              {words.map((word, wIdx) => (
                <motion.span
                  key={wIdx}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={inView ? { y: '0%', opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: delay + (offset + wIdx) * stagger, ease: EASE_OUT_EXPO }}
                  className="inline-block whitespace-pre"
                >
                  {word}
                  {wIdx < words.length - 1 ? ' ' : ''}
                </motion.span>
              ))}
            </span>
          </span>
        )
      })}
    </As>
  )
}
