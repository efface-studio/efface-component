import { Fragment, useRef, type CSSProperties } from 'react'
import { motion, useInView } from 'motion/react'
import { EASE_OUT_EXPO, fract } from '@/lib/motion'

export interface SplitHeadlineProps {
  text: string
  /** 단어 사이. 모바일은 더 촘촘히 감싸므로 NBSP를 쓴다. */
  separator?: string
  wordClassName?: string
  wordStyle?: CSSProperties
  letterClassName?: string
  letterStyle?: CSSProperties
}

/**
 * 제목을 단어 → 글자로 쪼갠다 (v2 SplitHeadline). 각 글자에 `data-l`이 붙어
 * rAF 루프가 찾아 쓸 수 있다. 애니메이션은 하지 않는다.
 */
export function SplitHeadline({ text, separator = ' ', wordClassName, wordStyle, letterClassName, letterStyle }: SplitHeadlineProps) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className={wordClassName} style={wordStyle}>
            {Array.from(word).map((ch, ci) => (
              <span key={ci} data-l="" className={letterClassName} style={letterStyle}>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? separator : null}
        </Fragment>
      ))}
    </>
  )
}

export interface LetterRevealProps {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  /** 글자가 날아오는 최대 산포(px) */
  scatter?: number
  stagger?: number
}

/**
 * 글자가 제각각의 흩어진 위치에서 날아와 자리잡는다 (v2 Capabilities 제목).
 * v2에서는 스크롤 진행도로 그렸고, 여기서는 뷰포트 진입 시 한 번 재생한다.
 * 산포는 `sin`·`fract`로 결정적이라 렌더마다 같은 자리에서 출발한다.
 */
export function LetterReveal({ text, className, as: As = 'h2', scatter = 40, stagger = 0.02 }: LetterRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const words = text.split(' ')
  let idx = 0

  return (
    <As ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block align-top whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const i = idx++
              const dx = (fract(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * 2 * scatter
              const dy = (fract(Math.sin(i * 78.233) * 43758.5453) - 0.5) * 2 * scatter
              return (
                <motion.span
                  key={ci}
                  aria-hidden
                  className="inline-block"
                  initial={{ opacity: 0, x: dx, y: dy, filter: 'blur(6px)' }}
                  animate={inView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: 0.7, delay: i * stagger, ease: EASE_OUT_EXPO }}
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </As>
  )
}
