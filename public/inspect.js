/* efface inspect — Figma Dev Mode 같은 요소 검사 오버레이.
 * 프록시된 라이브 페이지(iframe)에 주입되거나, 문서 페이지 자체에 로드된다.
 * 마우스를 올리면 박스(content · padding · margin)와 크기, 누르면 고정(선택),
 * 선택된 상태에서 다른 요소에 올리면 둘 사이 거리를 빨간 선으로 잰다.
 * 부모(iframe 밖)와는 postMessage 로, 같은 창에서는 CustomEvent 로 이야기한다.
 */
;(() => {
  if (window.__efInspect) return
  const IN_FRAME = window.parent && window.parent !== window
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

  function info(el) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const text = (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) ? el.textContent.trim().slice(0, 60) : ''
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean).slice(0, 12) : [],
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
    const line = (x1, y1, x2, y2) => lines.push({ x1, y1, x2, y2, d: r1(Math.hypot(x2 - x1, y2 - y1)) })
    if (contains(a, b) || contains(b, a)) {
      const o = contains(a, b) ? a : b
      const i = contains(a, b) ? b : a
      const cx = i.x + i.w / 2
      const cy = i.y + i.h / 2
      if (i.y - o.y > 0.5) line(cx, o.y, cx, i.y)
      if (o.y + o.h - (i.y + i.h) > 0.5) line(cx, i.y + i.h, cx, o.y + o.h)
      if (i.x - o.x > 0.5) line(o.x, cy, i.x, cy)
      if (o.x + o.w - (i.x + i.w) > 0.5) line(i.x + i.w, cy, o.x + o.w, cy)
      return lines
    }
    const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h
    // 세로 간격
    if (a.y >= by2 || b.y >= ay2) {
      const top = a.y >= by2 ? b : a
      const bot = top === a ? b : a
      const ox1 = Math.max(a.x, b.x), ox2 = Math.min(ax2, bx2)
      const x = ox2 > ox1 ? (ox1 + ox2) / 2 : (top.x + top.w / 2 + bot.x + bot.w / 2) / 2
      line(x, top.y + top.h, x, bot.y)
    }
    // 가로 간격
    if (a.x >= bx2 || b.x >= ax2) {
      const left = a.x >= bx2 ? b : a
      const right = left === a ? b : a
      const oy1 = Math.max(a.y, b.y), oy2 = Math.min(ay2, by2)
      const y = oy2 > oy1 ? (oy1 + oy2) / 2 : (left.y + left.h / 2 + right.y + right.h / 2) / 2
      line(left.x + left.w, y, right.x, y)
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
    return lines.map((l) => l.d)
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
    if (IN_FRAME) window.parent.postMessage(msg, '*')
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
    emit('select', { info: state.pinned ? info(state.pinned) : null })
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

  /* ── 라우트 알림 (SPA) ───────────────────────────────────── */
  const notifyRoute = () => emit('route', { path: location.pathname + location.search, title: document.title })
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
      case 'goto': if (typeof msg.path === 'string') location.assign(msg.path); break
      case 'clear': state.pinned = null; draw(); emit('select', { info: null }); break
      case 'ping': emit('ready', { path: location.pathname + location.search, title: document.title, inspect: state.on }); break
    }
  }
  window.addEventListener('message', (e) => command(e.data))

  window.__efInspect = {
    enable: () => setOn(true), disable: () => setOn(false), toggle: () => setOn(!state.on),
    grid: (v) => setGrid(v), isOn: () => state.on, command,
  }
  emit('ready', { path: location.pathname + location.search, title: document.title, inspect: false })
})()
