/** 문장의 한 단위: 단어, 또는 튀어나오는 구슬. */
export type SentenceToken =
  | { kind: 'word'; text: string; strike: boolean; accent: boolean }
  | { kind: 'orb'; id: string }

/**
 * 문장 카피를 단어와 구슬로 파싱한다 (v2 EffaceIntro).
 * `~word~`는 취소선, `*word*`는 액센트 색, `{orb1}`은 튀어나오는 구슬.
 * 마크업은 HTML로 해석되지 않는다 — 토큰마다 React 요소로 렌더된다.
 */
export function parseSentence(src: string): SentenceToken[] {
  return src
    .split(/\s+/)
    .filter(Boolean)
    .map((raw): SentenceToken => {
      const orb = raw.match(/^\{(orb\d)\}$/)
      if (orb?.[1]) return { kind: 'orb', id: orb[1] }
      const strike = raw.startsWith('~')
      const accent = raw.startsWith('*')
      let text = raw
      if (strike) text = text.replace(/^~/, '').replace(/~(?=[^~]*$)/, '')
      if (accent) text = text.replace(/^\*/, '').replace(/\*/, '')
      return { kind: 'word', text, strike, accent }
    })
}

/** 단어 점등 타임라인: 첫 단어 W0에서 시작, 다음 단어는 STEP 뒤, 각 단어는 WIN 동안 켜진다. */
export const SENTENCE_TIMELINE = { W0: 0, STEP: 0.05, WIN: 0.22 } as const

