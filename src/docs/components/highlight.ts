/**
 * 문서 스니펫용 경량 하이라이터. 라이브러리 없이 순차 스캔으로 토큰을 나눈다.
 * 완전한 파서가 아니라 짧은 예제가 "코드처럼 읽히게" 하는 것이 목적이다.
 */
export type TokenKind = 'comment' | 'string' | 'keyword' | 'tag' | 'attr' | 'number' | 'punct' | 'prop' | 'selector' | 'plain'

export interface Token {
  kind: TokenKind
  text: string
}

const TS_KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'return', 'function', 'default', 'type', 'interface', 'as',
  'new', 'if', 'else', 'true', 'false', 'null', 'undefined', 'async', 'await', 'extends', 'typeof', 'keyof',
  'readonly', 'satisfies', 'in', 'of', 'for', 'while', 'switch', 'case', 'break', 'continue', 'throw', 'try', 'catch',
])

const isIdentStart = (c: string) => /[A-Za-z_$]/.test(c)
const isIdent = (c: string) => /[A-Za-z0-9_$-]/.test(c)

function readString(src: string, i: number, quote: string): number {
  let j = i + 1
  while (j < src.length) {
    if (src[j] === '\\') {
      j += 2
      continue
    }
    if (src[j] === quote) return j + 1
    if (quote !== '`' && src[j] === '\n') return j
    j++
  }
  return src.length
}

/** TSX / JSX / JS */
export function tokenizeTsx(src: string): Token[] {
  const out: Token[] = []
  let i = 0
  let inTag = false // <Tag ... > 안 — 속성 이름을 attr 로
  const push = (kind: TokenKind, text: string) => {
    if (!text) return
    const last = out[out.length - 1]
    if (last && last.kind === kind && (kind === 'plain' || kind === 'punct')) last.text += text
    else out.push({ kind, text })
  }

  while (i < src.length) {
    const c = src[i] ?? ''
    const next = src[i + 1] ?? ''

    // 주석
    if (c === '/' && next === '/') {
      const e = src.indexOf('\n', i)
      const end = e === -1 ? src.length : e
      push('comment', src.slice(i, end))
      i = end
      continue
    }
    if (c === '/' && next === '*') {
      const e = src.indexOf('*/', i + 2)
      const end = e === -1 ? src.length : e + 2
      push('comment', src.slice(i, end))
      i = end
      continue
    }
    // 문자열
    if (c === "'" || c === '"' || c === '`') {
      const end = readString(src, i, c)
      push('string', src.slice(i, end))
      i = end
      continue
    }
    // JSX 태그 열기/닫기
    if (c === '<' && (isIdentStart(next) || next === '/' || next === '>')) {
      let j = i + 1
      if (src[j] === '/') j++
      while (j < src.length && (isIdent(src[j] ?? '') || src[j] === '.')) j++
      push('punct', src.slice(i, src[i + 1] === '/' ? i + 2 : i + 1))
      push('tag', src.slice(src[i + 1] === '/' ? i + 2 : i + 1, j))
      inTag = src[i + 1] !== '/'
      i = j
      continue
    }
    if (inTag && ((c === '/' && next === '>') || c === '>')) {
      push('punct', c === '/' ? '/>' : '>')
      inTag = false
      i += c === '/' ? 2 : 1
      continue
    }
    // 숫자
    if (/[0-9]/.test(c) && !(out[out.length - 1]?.kind === 'plain' && isIdent(out[out.length - 1]?.text.slice(-1) ?? ''))) {
      let j = i
      while (j < src.length && /[0-9._]/.test(src[j] ?? '')) j++
      push('number', src.slice(i, j))
      i = j
      continue
    }
    // 식별자 / 키워드 / 속성
    if (isIdentStart(c)) {
      let j = i
      while (j < src.length && isIdent(src[j] ?? '')) j++
      const word = src.slice(i, j)
      if (inTag) push('attr', word)
      else if (TS_KEYWORDS.has(word)) push('keyword', word)
      else if (/^[A-Z]/.test(word) && src[j] === '(') push('tag', word)
      else push('plain', word)
      i = j
      continue
    }
    // 구두점
    if (/[{}()[\]=;:,.<>/+\-*!?&|]/.test(c)) {
      push('punct', c)
      i++
      continue
    }
    push('plain', c)
    i++
  }
  return out
}

/** CSS */
export function tokenizeCss(src: string): Token[] {
  const out: Token[] = []
  let i = 0
  let depth = 0
  const push = (kind: TokenKind, text: string) => text && out.push({ kind, text })
  while (i < src.length) {
    const c = src[i] ?? ''
    if (c === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2)
      const end = e === -1 ? src.length : e + 2
      push('comment', src.slice(i, end))
      i = end
      continue
    }
    if (c === "'" || c === '"') {
      const end = readString(src, i, c)
      push('string', src.slice(i, end))
      i = end
      continue
    }
    if (c === '{') {
      depth++
      push('punct', c)
      i++
      continue
    }
    if (c === '}') {
      depth--
      push('punct', c)
      i++
      continue
    }
    if (depth === 0) {
      // 선택자·@규칙 — 다음 { 또는 ; 까지
      let j = i
      while (j < src.length && src[j] !== '{' && src[j] !== ';' && !(src[j] === '/' && src[j + 1] === '*')) j++
      const chunk = src.slice(i, j)
      if (chunk.trim()) push(chunk.trimStart().startsWith('@') ? 'keyword' : 'selector', chunk)
      else push('plain', chunk)
      i = j
      continue
    }
    // 선언: property: value;
    if (/[A-Za-z-]/.test(c) && (src[i - 1] === undefined || /[\s;{]/.test(src[i - 1] ?? ''))) {
      let j = i
      while (j < src.length && /[A-Za-z0-9-]/.test(src[j] ?? '')) j++
      // 중첩 규칙(&) 이나 선택자일 수도 있으니 ':' 이 뒤따를 때만 속성
      let k = j
      while (k < src.length && src[k] === ' ') k++
      if (src[k] === ':' ) {
        push('prop', src.slice(i, j))
        i = j
        continue
      }
      let m = j
      while (m < src.length && src[m] !== '{' && src[m] !== ';' && src[m] !== '}') m++
      if (src[m] === '{') {
        push('selector', src.slice(i, m))
        i = m
        continue
      }
      push('plain', src.slice(i, j))
      i = j
      continue
    }
    if (c === ':' || c === ';' || c === ',' || c === '(' || c === ')') {
      push('punct', c)
      i++
      continue
    }
    if (/[0-9]/.test(c) || (c === '#' && /[0-9a-fA-F]/.test(src[i + 1] ?? ''))) {
      let j = i + 1
      while (j < src.length && /[0-9a-zA-Z.%]/.test(src[j] ?? '')) j++
      push('number', src.slice(i, j))
      i = j
      continue
    }
    push('plain', c)
    i++
  }
  return out
}

/** HTML / SVG */
export function tokenizeHtml(src: string): Token[] {
  const out: Token[] = []
  let i = 0
  let inTag = false
  const push = (kind: TokenKind, text: string) => text && out.push({ kind, text })
  while (i < src.length) {
    const c = src[i] ?? ''
    if (c === '<' && src.startsWith('<!--', i)) {
      const e = src.indexOf('-->', i)
      const end = e === -1 ? src.length : e + 3
      push('comment', src.slice(i, end))
      i = end
      continue
    }
    if (c === '<') {
      let j = i + 1
      if (src[j] === '/' || src[j] === '!') j++
      while (j < src.length && /[A-Za-z0-9:-]/.test(src[j] ?? '')) j++
      push('punct', src.slice(i, src[i + 1] === '/' ? i + 2 : i + 1))
      push('tag', src.slice(src[i + 1] === '/' ? i + 2 : i + 1, j))
      inTag = true
      i = j
      continue
    }
    if (inTag && (c === '>' || (c === '/' && src[i + 1] === '>'))) {
      push('punct', c === '/' ? '/>' : '>')
      inTag = false
      i += c === '/' ? 2 : 1
      continue
    }
    if (inTag && (c === '"' || c === "'")) {
      const end = readString(src, i, c)
      push('string', src.slice(i, end))
      i = end
      continue
    }
    if (inTag && /[A-Za-z]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9:-]/.test(src[j] ?? '')) j++
      push('attr', src.slice(i, j))
      i = j
      continue
    }
    if (inTag && c === '=') {
      push('punct', c)
      i++
      continue
    }
    if (!inTag) {
      let j = i
      while (j < src.length && src[j] !== '<') j++
      push('plain', src.slice(i, j))
      i = j
      continue
    }
    push('plain', c)
    i++
  }
  return out
}

export function tokenize(src: string, lang: string): Token[] {
  if (lang === 'css') return tokenizeCss(src)
  if (lang === 'html' || lang === 'svg' || lang === 'xml') return tokenizeHtml(src)
  return tokenizeTsx(src)
}
