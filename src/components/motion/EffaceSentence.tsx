import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { clamp, easeOutCubic } from '@/lib/motion'
import { parseSentence, SENTENCE_TIMELINE } from './parseSentence'

const ORB_STYLES: Record<string, string> = {
  orb1: 'radial-gradient(circle at 32% 28%, #7FA8FF, #2563EB 62%, #1A44C2)',
  orb2: 'radial-gradient(circle at 34% 26%, #FFE1A6, #F59E0B 60%, #C97D06)',
}
const ORB_SHADOW: Record<string, string> = {
  orb1: '0 8px 18px rgba(37,99,235,0.4)',
  orb2: '0 8px 18px rgba(245,158,11,0.35)',
}

const INK = { r: 244, g: 244, b: 246 }
const INK_ACCENT = { r: 91, g: 141, b: 255 }
const INK_DIM = { r: 51, g: 51, b: 59 }
const INK_STRUCK: [number, number, number] = [86, 86, 95]

export interface EffaceSentenceProps {
  /** `~취소~ *강조* {orb1}` 마크업 문장 */
  sentence: string
  /** 0 → 1 진행도. 스크롤, 슬라이더, 타이머 무엇으로든 밀어 넣는다. */
  progress: number
  className?: string
}

/**
 * 단어가 하나씩 켜지는 문장 (v2 EffaceIntro). 취소선 단어는 켜졌다가 회색으로
 * 물러나며 파란 선이 그어지고, 구슬은 회전하며 튀어나온다. 페인트는 DOM에 직접
 * 쓰므로 진행도가 바뀌어도 리렌더가 없다. 다크 배경 전용.
 */
export function EffaceSentence({ sentence, progress, className }: EffaceSentenceProps) {
  const tokens = useMemo(() => parseSentence(sentence), [sentence])
  const wordIndex = useMemo(() => {
    let n = 0
    return tokens.map((tk) => (tk.kind === 'word' ? n++ : n))
  }, [tokens])
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const orbRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const { W0, STEP, WIN } = SENTENCE_TIMELINE
    const p = clamp(progress, 0, 1)
    tokens.forEach((tk, i) => {
      const wi = wordIndex[i] ?? 0
      if (tk.kind === 'word') {
        const el = wordRefs.current[i]
        if (!el) return
        const tt = easeOutCubic(clamp((p - W0 - wi * STEP) / WIN, 0, 1))
        const strikeAt = clamp((p - (W0 + wi * STEP + 0.16)) / 0.12, 0, 1)
        const struck = tk.strike && strikeAt > 0.55
        let r: number, g: number, b: number
        if (struck) {
          ;[r, g, b] = INK_STRUCK
        } else {
          const to = tk.accent ? INK_ACCENT : INK
          r = Math.round(INK_DIM.r + (to.r - INK_DIM.r) * tt)
          g = Math.round(INK_DIM.g + (to.g - INK_DIM.g) * tt)
          b = Math.round(INK_DIM.b + (to.b - INK_DIM.b) * tt)
        }
        el.style.color = `rgb(${r}, ${g}, ${b})`
        const line = lineRefs.current[i]
        if (line) line.style.transform = `scaleX(${easeOutCubic(strikeAt)})`
      } else {
        const el = orbRefs.current[i]
        if (!el) return
        const tt = clamp((p - W0 - wi * STEP) / 0.14, 0, 1)
        const sc = tt === 0 ? 0 : tt * (1 + 0.3 * Math.sin(tt * Math.PI))
        el.style.transform = `scale(${sc}) rotate(${(1 - tt) * 90}deg)`
      }
    })
  }, [progress, tokens, wordIndex])

  return (
    <p
      className={cn('m-0 max-w-[1000px] text-[clamp(22px,3.4vw,44px)] leading-[1.52] font-bold tracking-[-0.02em] text-[#F4F4F6] [text-wrap:pretty]', className)}
    >
      {tokens.map((tk, i) =>
        tk.kind === 'orb' ? (
          <span
            key={i}
            ref={(el) => {
              orbRefs.current[i] = el
            }}
            aria-hidden
            style={
              {
                display: 'inline-block',
                width: '0.8em',
                height: '0.8em',
                borderRadius: '50%',
                background: ORB_STYLES[tk.id],
                boxShadow: ORB_SHADOW[tk.id],
                verticalAlign: '-0.06em',
                margin: '0 0.1em',
                transform: 'scale(0)',
              } as CSSProperties
            }
          />
        ) : (
          <span key={i}>
            <span
              ref={(el) => {
                wordRefs.current[i] = el
              }}
              style={{
                color: '#33333B',
                fontWeight: tk.accent ? 800 : undefined,
                position: tk.strike ? 'relative' : undefined,
                display: tk.strike ? 'inline-block' : undefined,
              }}
            >
              {tk.text}
              {tk.strike && (
                <span
                  ref={(el) => {
                    lineRefs.current[i] = el
                  }}
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '-2%',
                    right: '-2%',
                    top: '52%',
                    height: '0.09em',
                    background: '#3B82F6',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    borderRadius: 2,
                  }}
                />
              )}
            </span>{' '}
          </span>
        ),
      )}
    </p>
  )
}
