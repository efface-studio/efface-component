/* efface inspect — Figma Dev Mode 같은 요소 검사 오버레이.
 * 프록시된 라이브 페이지(iframe)에 주입되거나, 문서 페이지 자체에 로드된다.
 * 마우스를 올리면 박스(content · padding · margin)와 크기, 누르면 고정(선택),
 * 선택된 상태에서 다른 요소에 올리면 둘 사이 거리를 빨간 선으로 잰다.
 * 부모(iframe 밖)와는 postMessage 로, 같은 창에서는 CustomEvent 로 이야기한다.
 */
;(() => {
  if (window.__efInspect) return
  const IN_FRAME = window.parent && window.parent !== window
  /* 우리를 임베드할 수 있는 문서 호스트 — worker/index.ts 의 DOCS_ORIGINS 와 같아야 한다.
     메시지는 이 출처의 부모 창에서 온 것만 듣고, 이 출처로만 보낸다(그 밖은 브라우저가 조용히 버린다). */
  const PARENT_ORIGINS = ['https://ds.efface.dev', 'http://localhost:5190', 'http://127.0.0.1:5190']

  /* ── 터치 기기 에뮬레이션 ──────────────────────────────────────
     앱들이 폭이 아니라 입력 장치(hover/pointer)로 모바일 셸을 고르는 경우가 있다(HiNest 등).
     부모가 Mobile/Tablet 뷰포트로 띄울 때 URL 에 `__ef=touch` 를 붙이면, 앱 스크립트보다 먼저
     matchMedia 를 손봐 터치 기기처럼 보이게 한다. 세션에 남겨 앱 안에서 페이지를 옮겨도 유지. */
  try {
    const ef = new URLSearchParams(location.search).get('__ef')
    if (ef === 'touch') sessionStorage.setItem('ef:touch', '1')
    else if (ef === 'mouse') sessionStorage.removeItem('ef:touch')
    if (sessionStorage.getItem('ef:touch') === '1') {
      const orig = window.matchMedia.bind(window)
      const forcedFor = (q) => {
        if (/hover:\s*hover|pointer:\s*fine|any-hover:\s*hover|any-pointer:\s*fine/.test(q)) return false
        if (/hover:\s*none|pointer:\s*coarse|any-pointer:\s*coarse/.test(q)) return true
        return null
      }
      window.matchMedia = (q) => {
        const s = String(q)
        const forced = forcedFor(s)
        if (forced === null) return orig(q)
        return {
          media: s, matches: forced, onchange: null,
          addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false },
        }
      }
      try { Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true }) } catch {}
    }
  } catch {}
  const DPR = () => Math.min(2, window.devicePixelRatio || 1)

  /* ── 오버레이 ───────────────────────────────────────────── */
  const root = document.createElement('div')
  root.id = '__ef-inspect'
  root.setAttribute('data-ef-ignore', '')
  Object.assign(root.style, { position: 'fixed', inset: '0', zIndex: '2147483646', pointerEvents: 'none', display: 'none' })
  const canvas = document.createElement('canvas')
  canvas.setAttribute('data-ef-ignore', '')
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' })
  root.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  const state = { on: false, grid: false, hover: null, pinned: null, mouse: { x: -1, y: -1 } }

  function mount() {
    if (!root.isConnected) document.documentElement.appendChild(root)
  }
  function resize() {
    const d = DPR()
    canvas.width = Math.round(window.innerWidth * d)
    canvas.height = Math.round(window.innerHeight * d)
    ctx.setTransform(d, 0, 0, d, 0, 0)
    draw()
  }

  /* ── 요소 정보 ───────────────────────────────────────────── */
  const px = (v) => Math.round(parseFloat(v) || 0)
  const r1 = (n) => Math.round(n * 10) / 10

  function rgbToHex(c) {
    const m = c && c.match(/rgba?\(([^)]+)\)/)
    if (!m) return c || ''
    const [r, g, b, a] = m[1].split(',').map((s) => parseFloat(s))
    if (a === 0) return 'transparent'
    const hex = '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
    return a !== undefined && a < 1 ? `${hex} ${Math.round(a * 100)}%` : hex
  }

  /* ── 상태별 CSS (:hover/:focus/:active/:disabled …) — 스타일시트를 훑어 이 요소에 걸리는 규칙만 ── */
  const STATE_RE = /:(hover|focus-visible|focus-within|focus|active|disabled|checked|open)\b/
  const STATE_STRIP = /:(hover|focus-visible|focus-within|focus|active|disabled|checked|open)\b/g
  function stateRules(el) {
    const out = []
    const seen = new Set()
    const visit = (rules) => {
      for (const r of rules) {
        if (r.cssRules && !(r instanceof CSSStyleRule)) {
          try { visit(r.cssRules) } catch {}
          continue
        }
        if (!(r instanceof CSSStyleRule)) continue
        const sel = r.selectorText || ''
        if (!STATE_RE.test(sel)) continue
        for (const part of sel.split(',')) {
          const m = part.match(STATE_RE)
          if (!m) continue
          const base = part.replace(STATE_STRIP, '').replace(/:not\(\)/g, '').trim()
          let hit = false
          try { hit = !!base && el.matches(base) } catch {}
          if (!hit) continue
          const css = r.style.cssText.trim()
          const key = m[1] + '|' + css
          if (!css || seen.has(key)) continue
          seen.add(key)
          // group-hover 처럼 조상 상태에 걸리는 규칙은 표시
          const viaAncestor = !/^\s*\.[^\s>+~]*$/.test(part.trim()) && part.trim().indexOf(' ') > 0
          out.push({ state: m[1], css, selector: part.trim(), group: viaAncestor })
          if (out.length >= 40) return
        }
      }
    }
    for (const sheet of document.styleSheets) {
      try { visit(sheet.cssRules) } catch {}
      if (out.length >= 40) break
    }
    return out
  }

  /* ── 복사용 CSS 스니펫 — 기본값이 아닌 것만 ── */
  function cssSnippet(el) {
    const cs = getComputedStyle(el)
    const lines = []
    const add = (prop, val, skip) => { if (val && val !== skip) lines.push(`${prop}: ${val};`) }
    add('display', cs.display, 'inline')
    if (cs.display.includes('flex')) { add('flex-direction', cs.flexDirection, 'row'); add('align-items', cs.alignItems, 'normal'); add('justify-content', cs.justifyContent, 'normal') }
    if (cs.display.includes('grid')) add('grid-template-columns', cs.gridTemplateColumns, 'none')
    if (cs.display.includes('flex') || cs.display.includes('grid')) add('gap', cs.gap, 'normal')
    add('width', r1(el.getBoundingClientRect().width) + 'px')
    add('height', r1(el.getBoundingClientRect().height) + 'px')
    add('padding', cs.padding, '0px')
    add('margin', cs.margin, '0px')
    add('border', cs.borderTopWidth !== '0px' ? `${cs.borderTopWidth} ${cs.borderTopStyle} ${rgbToHex(cs.borderTopColor)}` : '', '')
    add('border-radius', cs.borderRadius, '0px')
    add('background', cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? rgbToHex(cs.backgroundColor) : '', '')
    add('color', rgbToHex(cs.color))
    add('font', `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]}`)
    add('letter-spacing', cs.letterSpacing, 'normal')
    add('box-shadow', cs.boxShadow, 'none')
    add('opacity', cs.opacity, '1')
    add('transition', cs.transitionProperty !== 'all' || cs.transitionDuration !== '0s' ? `${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}` : '', '')
    return lines.join('\n')
  }

  function info(el, deep) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const text = (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) ? el.textContent.trim().slice(0, 60) : ''
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean) : [],
      rect: { x: r1(r.left + window.scrollX), y: r1(r.top + window.scrollY), w: r1(r.width), h: r1(r.height) },
      margin: [px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)],
      padding: [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)],
      border: [px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth)],
      radius: cs.borderRadius,
      display: cs.display,
      position: cs.position,
      gap: cs.display.includes('flex') || cs.display.includes('grid') ? cs.gap : '',
      flex: cs.display.includes('flex') ? `${cs.flexDirection} · ${cs.justifyContent} / ${cs.alignItems}` : '',
      grid: cs.display.includes('grid') ? cs.gridTemplateColumns : '',
      font: { family: cs.fontFamily.split(',')[0].replace(/["']/g, ''), size: cs.fontSize, weight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing },
      color: rgbToHex(cs.color),
      background: rgbToHex(cs.backgroundColor),
      borderColor: px(cs.borderTopWidth) ? rgbToHex(cs.borderTopColor) : '',
      shadow: cs.boxShadow !== 'none' ? cs.boxShadow : '',
      opacity: cs.opacity,
      text,
      // 선택(클릭)했을 때만 — 스타일시트 전체를 훑으므로 호버마다 하지 않는다
      states: deep ? stateRules(el) : [],
      css: deep ? cssSnippet(el) : '',
    }
  }

  function boxes(el) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const m = [px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)]
    const p = [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)]
    const b = [px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth)]
    const border = { x: r.left, y: r.top, w: r.width, h: r.height }
    const padding = { x: border.x + b[3], y: border.y + b[0], w: border.w - b[1] - b[3], h: border.h - b[0] - b[2] }
    const content = { x: padding.x + p[3], y: padding.y + p[0], w: padding.w - p[1] - p[3], h: padding.h - p[0] - p[2] }
    const margin = { x: border.x - m[3], y: border.y - m[0], w: border.w + m[1] + m[3], h: border.h + m[0] + m[2] }
    return { margin, border, padding, content, m, p, b }
  }

  /* ── 그리기 ─────────────────────────────────────────────── */
  const C = {
    content: 'rgba(59,98,229,0.18)', padding: 'rgba(16,185,129,0.22)', margin: 'rgba(245,158,11,0.22)',
    outline: '#3b62e5', pinned: '#ff3d71', measure: '#ff3d71', label: '#0a0a0b', labelText: '#ffffff', grid: 'rgba(59,98,229,0.12)',
  }

  function fillRing(outer, inner, color) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.rect(outer.x, outer.y, outer.w, outer.h)
    ctx.rect(inner.x, inner.y, inner.w, inner.h)
    ctx.fill('evenodd')
  }

  function label(text, x, y, opts = {}) {
    ctx.font = `600 11px ui-monospace, SFMono-Regular, Menlo, monospace`
    const padX = 6
    const w = ctx.measureText(text).width + padX * 2
    const h = 18
    let lx = x
    let ly = y
    if (opts.anchor === 'center') lx = x - w / 2
    if (opts.anchor === 'right') lx = x - w
    lx = Math.max(4, Math.min(window.innerWidth - w - 4, lx))
    ly = Math.max(4, Math.min(window.innerHeight - h - 4, ly))
    ctx.fillStyle = opts.bg || C.label
    ctx.beginPath()
    ctx.roundRect(lx, ly, w, h, 4)
    ctx.fill()
    ctx.fillStyle = opts.fg || C.labelText
    ctx.textBaseline = 'middle'
    ctx.fillText(text, lx + padX, ly + h / 2 + 0.5)
  }

  function drawBoxes(el, pinned) {
    const { margin, border, padding, content, m, p } = boxes(el)
    if (m.some(Boolean)) fillRing(margin, border, C.margin)
    if (p.some(Boolean)) fillRing(padding, content, C.padding)
    ctx.fillStyle = C.content
    ctx.fillRect(content.x, content.y, content.w, content.h)
    ctx.strokeStyle = pinned ? C.pinned : C.outline
    ctx.lineWidth = pinned ? 1.5 : 1
    ctx.setLineDash(pinned ? [] : [4, 3])
    ctx.strokeRect(border.x + 0.5, border.y + 0.5, border.w - 1, border.h - 1)
    ctx.setLineDash([])
    // 크기 라벨
    label(`${r1(border.w)} × ${r1(border.h)}`, border.x + border.w / 2, border.y - 22, { anchor: 'center', bg: pinned ? C.pinned : C.outline })
    // padding / margin 수치
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    const small = (t, x, y) => label(t, x, y, { anchor: 'center', bg: 'rgba(16,185,129,0.95)' })
    if (p[0] > 3) small(p[0], padding.x + padding.w / 2, padding.y + p[0] / 2 - 9)
    if (p[2] > 3) small(p[2], padding.x + padding.w / 2, padding.y + padding.h - p[2] / 2 - 9)
    if (p[3] > 3) small(p[3], padding.x + p[3] / 2, padding.y + padding.h / 2 - 9)
    if (p[1] > 3) small(p[1], padding.x + padding.w - p[1] / 2, padding.y + padding.h / 2 - 9)
    const mm = (t, x, y) => label(t, x, y, { anchor: 'center', bg: 'rgba(245,158,11,0.95)' })
    if (m[0] > 3) mm(m[0], margin.x + margin.w / 2, margin.y + m[0] / 2 - 9)
    if (m[2] > 3) mm(m[2], margin.x + margin.w / 2, margin.y + margin.h - m[2] / 2 - 9)
    if (m[3] > 3) mm(m[3], margin.x + m[3] / 2, margin.y + margin.h / 2 - 9)
    if (m[1] > 3) mm(m[1], margin.x + margin.w - m[1] / 2, margin.y + margin.h / 2 - 9)
  }

  /** 두 사각형 사이 거리 — 겹치지 않으면 가장 가까운 변 사이, 한쪽이 다른 쪽을 품으면 안쪽에서 바깥 네 변까지 */
  function measure(a, b) {
    const lines = []
    const contains = (o, i) => i.x >= o.x - 0.5 && i.y >= o.y - 0.5 && i.x + i.w <= o.x + o.w + 0.5 && i.y + i.h <= o.y + o.h + 0.5
    const line = (x1, y1, x2, y2, dir) => lines.push({ x1, y1, x2, y2, dir, d: r1(Math.hypot(x2 - x1, y2 - y1)) })
    if (contains(a, b) || contains(b, a)) {
      const o = contains(a, b) ? a : b
      const i = contains(a, b) ? b : a
      const cx = i.x + i.w / 2
      const cy = i.y + i.h / 2
      if (i.y - o.y > 0.5) line(cx, o.y, cx, i.y, 'top')
      if (o.y + o.h - (i.y + i.h) > 0.5) line(cx, i.y + i.h, cx, o.y + o.h, 'bottom')
      if (i.x - o.x > 0.5) line(o.x, cy, i.x, cy, 'left')
      if (o.x + o.w - (i.x + i.w) > 0.5) line(i.x + i.w, cy, o.x + o.w, cy, 'right')
      return lines
    }
    const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h
    // 세로 간격
    if (a.y >= by2 || b.y >= ay2) {
      const top = a.y >= by2 ? b : a
      const bot = top === a ? b : a
      const ox1 = Math.max(a.x, b.x), ox2 = Math.min(ax2, bx2)
      const x = ox2 > ox1 ? (ox1 + ox2) / 2 : (top.x + top.w / 2 + bot.x + bot.w / 2) / 2
      line(x, top.y + top.h, x, bot.y, 'v')
    }
    // 가로 간격
    if (a.x >= bx2 || b.x >= ax2) {
      const left = a.x >= bx2 ? b : a
      const right = left === a ? b : a
      const oy1 = Math.max(a.y, b.y), oy2 = Math.min(ay2, by2)
      const y = oy2 > oy1 ? (oy1 + oy2) / 2 : (left.y + left.h / 2 + right.y + right.h / 2) / 2
      line(left.x + left.w, y, right.x, y, 'h')
    }
    return lines
  }

  const toBox = (r) => ({ x: r.left, y: r.top, w: r.width, h: r.height })
  function drawMeasure(ra, rb) {
    const a = toBox(ra)
    const b = toBox(rb)
    const lines = measure(a, b)
    ctx.strokeStyle = C.measure
    ctx.lineWidth = 1
    for (const l of lines) {
      ctx.beginPath()
      ctx.moveTo(l.x1, l.y1)
      ctx.lineTo(l.x2, l.y2)
      ctx.stroke()
      // 끝 표시
      const vertical = Math.abs(l.x1 - l.x2) < 0.5
      for (const [x, y] of [[l.x1, l.y1], [l.x2, l.y2]]) {
        ctx.beginPath()
        if (vertical) { ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y) } else { ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4) }
        ctx.stroke()
      }
      label(`${l.d}`, (l.x1 + l.x2) / 2 + (vertical ? 8 : 0), (l.y1 + l.y2) / 2 - (vertical ? 9 : 22), { anchor: vertical ? 'left' : 'center', bg: C.measure })
    }
    return lines.map((l) => ({ d: l.d, dir: l.dir }))
  }

  function drawGrid() {
    ctx.strokeStyle = C.grid
    ctx.lineWidth = 1
    for (let x = 0; x < window.innerWidth; x += 8) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, window.innerHeight); ctx.stroke() }
    for (let y = 0; y < window.innerHeight; y += 8) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(window.innerWidth, y + 0.5); ctx.stroke() }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    if (!state.on) return
    if (state.grid) drawGrid()
    if (state.pinned && !state.pinned.isConnected) state.pinned = null
    if (state.hover && !state.hover.isConnected) state.hover = null
    let distances = null
    if (state.pinned) drawBoxes(state.pinned, true)
    if (state.hover && state.hover !== state.pinned) {
      drawBoxes(state.hover, false)
      if (state.pinned) distances = drawMeasure(state.pinned.getBoundingClientRect(), state.hover.getBoundingClientRect())
    }
    return distances
  }

  /* ── 메시지 ─────────────────────────────────────────────── */
  function emit(type, detail) {
    const msg = { source: 'ef-inspect', type, ...detail }
    if (IN_FRAME) for (const o of PARENT_ORIGINS) window.parent.postMessage(msg, o)
    window.dispatchEvent(new CustomEvent('ef-inspect', { detail: msg }))
  }

  /* ── 입력 ───────────────────────────────────────────────── */
  function pick(x, y) {
    const els = document.elementsFromPoint(x, y)
    for (const el of els) {
      if (el === root || el === canvas || el.closest('[data-ef-ignore]')) continue
      if (el === document.documentElement || el === document.body) return null
      return el
    }
    return null
  }
  function onMove(e) {
    if (!state.on) return
    if (e.target instanceof Element && e.target.closest('[data-ef-ignore]')) {
      if (state.hover) { state.hover = null; draw(); emit('hover', { info: null, distances: null }) }
      return
    }
    state.mouse = { x: e.clientX, y: e.clientY }
    const el = pick(e.clientX, e.clientY)
    if (el !== state.hover) {
      state.hover = el
      const distances = draw()
      emit('hover', { info: el ? info(el) : null, distances })
    }
  }
  function onClick(e) {
    if (!state.on) return
    // 문서 크롬(검사 토글·패널)은 그대로 동작해야 한다
    if (e.target instanceof Element && e.target.closest('[data-ef-ignore]')) return
    e.preventDefault()
    e.stopPropagation()
    const el = pick(e.clientX, e.clientY)
    state.pinned = el === state.pinned ? null : el
    draw()
    emit('select', { info: state.pinned ? info(state.pinned, true) : null })
  }
  function onKey(e) {
    if (!state.on) return
    if (e.key === 'Escape') {
      if (state.pinned) { state.pinned = null; draw(); emit('select', { info: null }) } else setOn(false)
    }
  }
  const redraw = () => { if (state.on) draw() }

  function setOn(on) {
    state.on = on
    mount()
    root.style.display = on ? 'block' : 'none'
    document.documentElement.style.cursor = on ? 'crosshair' : ''
    if (!on) { state.hover = null; state.pinned = null }
    resize()
    emit('state', { on, grid: state.grid })
  }
  function setGrid(g) { state.grid = g; draw(); emit('state', { on: state.on, grid: g }) }

  document.addEventListener('mousemove', onMove, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKey, true)
  window.addEventListener('scroll', redraw, true)
  window.addEventListener('resize', resize)


  /* ── 네트워크 · 활동 기록 ───────────────────────────────────
     fetch / XHR 을 감싸 메서드·상태코드·소요시간·크기·응답 미리보기를 남기고,
     정적 자산은 PerformanceObserver(resource) 로, 라우트 이동과 console.error/warn 도 함께 보낸다.
     부모 패널이 나중에 붙어도 볼 수 있게 최근 300건을 버퍼에 들고 있다가 `net:replay` 로 다시 보낸다. */
  const NET_MAX = 300
  const net = { buf: [], seq: 0 }
  const PREVIEW_MAX = 4096
  function netPush(entry) {
    entry.id = ++net.seq
    entry.ts = entry.ts || Date.now()
    net.buf.push(entry)
    if (net.buf.length > NET_MAX) net.buf.shift()
    emit('net', { entry })
    return entry
  }
  function netUpdate(entry, patch) {
    Object.assign(entry, patch)
    emit('net', { entry })
  }
  const absUrl = (u) => { try { return new URL(String(u), location.href).toString() } catch { return String(u) } }
  /* 미리보기에서 가릴 키 — 토큰·비밀번호·세션류는 패널에 보일 이유가 없다 */
  const SENSITIVE = /(authorization|cookie|token|secret|password|passwd|session|api[-_]?key|otp|card|ssn|주민)/i
  const redact = (v) => Array.isArray(v) ? v.map(redact) : (v && typeof v === 'object') ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SENSITIVE.test(k) ? '[redacted]' : redact(x)])) : v
  const previewOf = (text, type) => {
    if (typeof text !== 'string') return null
    const t = text.length > PREVIEW_MAX ? text.slice(0, PREVIEW_MAX) + '\n…' : text
    if (/json/i.test(type || '')) { try { return JSON.stringify(redact(JSON.parse(text)), null, 2).slice(0, PREVIEW_MAX) } catch {} }
    return t
  }
  const bodyPreview = (body) => {
    if (body == null) return null
    if (typeof body === 'string') { try { return JSON.stringify(redact(JSON.parse(body)), null, 2).slice(0, PREVIEW_MAX) } catch { return body.slice(0, PREVIEW_MAX) } }
    if (body instanceof URLSearchParams) { const o = {}; body.forEach((v, k) => { o[k] = v }); return JSON.stringify(redact(o), null, 2).slice(0, PREVIEW_MAX) }
    if (body instanceof FormData) { const o = {}; body.forEach((v, k) => { o[k] = typeof v === 'string' ? v : `[file ${v.name || ''}]` }); return JSON.stringify(redact(o), null, 2).slice(0, PREVIEW_MAX) }
    if (body instanceof Blob) return `[blob ${body.size}B ${body.type}]`
    if (body instanceof ArrayBuffer) return `[buffer ${body.byteLength}B]`
    return null
  }
  const isTextual = (type) => /json|text|xml|javascript|x-www-form-urlencoded/i.test(type || '')

  /* fetch */
  const _fetch = window.fetch
  if (typeof _fetch === 'function') {
    window.fetch = function (input, init) {
      const req = input instanceof Request ? input : null
      const url = absUrl(req ? req.url : input)
      const method = String((init && init.method) || (req && req.method) || 'GET').toUpperCase()
      const t0 = performance.now()
      const entry = netPush({ kind: 'fetch', method, url, status: 0, ok: null, ms: null, size: null, type: null, req: bodyPreview(init && init.body), res: null, pending: true })
      return _fetch.call(this, input, init).then((r) => {
        const type = r.headers.get('content-type') || ''
        const len = r.headers.get('content-length')
        netUpdate(entry, { status: r.status, statusText: r.statusText, ok: r.ok, ms: Math.round(performance.now() - t0), type, size: len ? +len : null, pending: false })
        if (isTextual(type)) {
          try {
            r.clone().text().then((text) => netUpdate(entry, { res: previewOf(text, type), size: entry.size ?? text.length })).catch(() => {})
          } catch {}
        }
        return r
      }, (err) => {
        netUpdate(entry, { status: 0, ok: false, ms: Math.round(performance.now() - t0), error: String(err && err.message || err), pending: false })
        throw err
      })
    }
  }

  /* XHR */
  const XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__ef = { method: String(method || 'GET').toUpperCase(), url: absUrl(url) }
    return XO.call(this, method, url, ...rest)
  }
  XMLHttpRequest.prototype.send = function (body) {
    const meta = this.__ef
    if (meta) {
      const t0 = performance.now()
      const entry = netPush({ kind: 'xhr', method: meta.method, url: meta.url, status: 0, ok: null, ms: null, size: null, type: null, req: bodyPreview(body), res: null, pending: true })
      this.addEventListener('loadend', () => {
        const type = this.getResponseHeader ? (this.getResponseHeader('content-type') || '') : ''
        let res = null
        try { if (this.responseType === '' || this.responseType === 'text') res = previewOf(this.responseText, type) } catch {}
        netUpdate(entry, { status: this.status, statusText: this.statusText, ok: this.status >= 200 && this.status < 400, ms: Math.round(performance.now() - t0), type, size: res ? res.length : null, res, error: this.status === 0 ? 'network error' : undefined, pending: false })
      })
    }
    return XS.call(this, body)
  }

  /* 정적 자산 · 문서 */
  try {
    const seen = new Set()
    const onEntries = (list) => {
      for (const e of list) {
        if (e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest' || e.initiatorType === 'beacon') continue
        if (seen.has(e.name + e.startTime)) continue
        seen.add(e.name + e.startTime)
        const st = typeof e.responseStatus === 'number' && e.responseStatus > 0 ? e.responseStatus : null // 교차 출처(Timing-Allow-Origin 없음)는 0 → 모름
        netPush({ kind: e.entryType === 'navigation' ? 'document' : 'asset', method: 'GET', url: e.name, status: st, ok: st == null ? null : st < 400, ms: e.duration ? Math.round(e.duration) : null, size: e.transferSize || e.encodedBodySize || null, type: e.initiatorType || e.entryType, ts: Date.now() - Math.max(0, performance.now() - e.startTime) })
      }
    }
    onEntries(performance.getEntriesByType('navigation'))
    onEntries(performance.getEntriesByType('resource'))
    const po = new PerformanceObserver((l) => onEntries(l.getEntries()))
    po.observe({ entryTypes: ['resource', 'navigation'] })
  } catch {}

  /* 콘솔 오류 · 경고 · 예외 */
  for (const level of ['error', 'warn']) {
    const orig = console[level]
    console[level] = function (...args) {
      try { netPush({ kind: 'console', level, text: args.map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.stack || a.message : (() => { try { return JSON.stringify(a) } catch { return String(a) } })())).join(' ').slice(0, PREVIEW_MAX) }) } catch {}
      return orig.apply(this, args)
    }
  }
  window.addEventListener('error', (e) => netPush({ kind: 'console', level: 'error', text: `${e.message} (${e.filename}:${e.lineno})` }))
  window.addEventListener('unhandledrejection', (e) => netPush({ kind: 'console', level: 'error', text: `Unhandled rejection: ${String(e.reason && e.reason.message || e.reason)}` }))

  /* ── 라우트 알림 (SPA) ───────────────────────────────────── */
  const notifyRoute = () => {
    emit('route', { path: location.pathname + location.search, title: document.title })
    netPush({ kind: 'route', url: location.href, path: location.pathname + location.search })
  }
  const _push = history.pushState.bind(history)
  history.pushState = function (...a) { _push(...a); setTimeout(notifyRoute, 0) }
  const _replace = history.replaceState.bind(history)
  history.replaceState = function (...a) { _replace(...a); setTimeout(notifyRoute, 0) }
  window.addEventListener('popstate', notifyRoute)

  /* ── 외부 명령 ───────────────────────────────────────────── */
  function command(msg) {
    if (!msg || msg.source !== 'ef-inspect-cmd') return
    switch (msg.cmd) {
      case 'enable': setOn(true); break
      case 'disable': setOn(false); break
      case 'toggle': setOn(!state.on); break
      case 'grid': setGrid(!!msg.value); break
      case 'goto': {
        // 같은 출처의 경로만 — javascript:/data:/절대 URL 은 세션 쿠키가 있는 이 출처에서 코드 실행으로 이어진다
        if (typeof msg.path !== 'string' || msg.path[0] !== '/' || msg.path[1] === '/' || msg.path[1] === '\\') break
        let u
        try { u = new URL(msg.path, location.origin) } catch { break }
        if (u.origin !== location.origin) break
        location.assign(u.pathname + u.search + u.hash)
        break
      }
      case 'clear': state.pinned = null; draw(); emit('select', { info: null }); break
      case 'ping': emit('ready', { path: location.pathname + location.search, title: document.title, inspect: state.on }); break
      case 'net:replay': emit('net:batch', { entries: net.buf.slice() }); break
      case 'net:clear': net.buf.length = 0; break
    }
  }
  // 프레임 안에서, 부모 창에서, 허용된 출처에서 온 것만. 같은 창(문서 페이지)은 __efInspect.command 를 직접 쓴다.
  if (IN_FRAME) window.addEventListener('message', (e) => {
    if (e.source !== window.parent || !PARENT_ORIGINS.includes(e.origin)) return
    command(e.data)
  })

  window.__efInspect = {
    enable: () => setOn(true), disable: () => setOn(false), toggle: () => setOn(!state.on),
    grid: (v) => setGrid(v), isOn: () => state.on, command,
  }
  emit('ready', { path: location.pathname + location.search, title: document.title, inspect: false })
})()
