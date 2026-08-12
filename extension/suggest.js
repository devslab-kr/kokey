/**
 * In-field suggest button — when a text field's value looks like
 * wrong-layout gibberish, float a small button at its right edge that
 * converts it on click.
 *
 * Opt-out via the options page (`suggestButton`). Deliberately narrow:
 *
 *  - Only the conservative `fixMistyped` heuristic decides (`suggestFix`),
 *    not the explicit-action `decide` — an unsolicited button must not
 *    guess. Latin text is never "fixed" into Korean here, because on a
 *    normal English field that would be wrong far more often than right.
 *  - Password fields are skipped. Alt+K still works there; an uninvited
 *    control hovering over a password box is not something a user asked
 *    for. contenteditable is out of scope, as elsewhere.
 *  - Nothing runs mid-IME-composition, and input is debounced.
 *
 * The button is positioned in page coordinates and re-measured on scroll
 * and resize; it never touches the host page's layout or focus (mousedown
 * is prevented so the caret stays where the user left it).
 */
;(() => {
  const { suggestFix } = globalThis.kokeyExt

  const ko = (navigator.language || '').toLowerCase().startsWith('ko')
  const LABEL = ko ? '변환' : 'Fix'
  const TITLE = ko
    ? 'kokey: 자판 착오로 보입니다 — 눌러서 변환'
    : 'kokey: looks mistyped — click to convert'

  const DEBOUNCE_MS = 300
  const OVERLAY_TYPES = ['text', 'search', 'url', 'tel', '']

  let button = null
  let target = null // the field the button currently belongs to
  let fixed = null // the conversion we would apply
  let composing = false
  let timer = 0
  let enabled = true
  let theme = 'auto'

  function canSuggest(el) {
    if (!el) return false
    if (el instanceof HTMLTextAreaElement) return true
    if (!(el instanceof HTMLInputElement)) return false
    return OVERLAY_TYPES.includes(el.type) // note: password excluded
  }

  function ensureButton() {
    if (button || !document.body) return button
    button = document.createElement('button')
    button.type = 'button'
    button.textContent = LABEL
    button.title = TITLE
    button.setAttribute('aria-label', TITLE)
    button.style.cssText =
      'position:absolute;z-index:2147483646;display:none;' +
      'padding:2px 8px;border-radius:999px;border:1px solid transparent;' +
      'cursor:pointer;font:11px/1.6 system-ui,sans-serif;' +
      'box-shadow:0 1px 4px rgba(0,0,0,.2)'
    // keep focus (and the caret) in the field
    button.addEventListener('mousedown', (e) => e.preventDefault())
    button.addEventListener('click', apply)
    document.body.appendChild(button)
    return button
  }

  function hide() {
    target = null
    fixed = null
    if (button) button.style.display = 'none'
  }

  function place() {
    if (!button || !target) return
    const r = target.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return hide() // field went away
    const bw = button.offsetWidth || 40
    button.style.top = `${window.scrollY + r.top + (r.height - 22) / 2}px`
    button.style.left = `${window.scrollX + r.right - bw - 6}px`
  }

  function apply() {
    if (!target || fixed === null) return
    const el = target
    el.value = fixed
    try {
      el.setSelectionRange(fixed.length, fixed.length)
    } catch {
      /* some fields have no selection API */
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
    hide()
    el.focus()
  }

  function evaluate(el) {
    if (!enabled || composing || !canSuggest(el)) return hide()
    const next = suggestFix(el.value)
    if (next === null) return hide()
    if (!ensureButton()) return
    target = el
    fixed = next
    // re-themed per field: the same page can hold light and dark surfaces
    const palette = globalThis.kokeyTheme.paletteFor(el, theme)
    button.style.background = palette.bg
    button.style.color = palette.fg
    button.style.borderColor = palette.border
    button.style.display = 'block'
    place()
  }

  function schedule(el) {
    clearTimeout(timer)
    timer = setTimeout(() => evaluate(el), DEBOUNCE_MS)
  }

  document.addEventListener(
    'input',
    (e) => {
      if (canSuggest(e.target)) schedule(e.target)
    },
    true
  )
  document.addEventListener(
    'focusin',
    (e) => {
      if (canSuggest(e.target)) schedule(e.target)
      else hide()
    },
    true
  )
  document.addEventListener(
    'focusout',
    (e) => {
      if (e.target === target) hide()
    },
    true
  )
  document.addEventListener('compositionstart', () => {
    composing = true
    hide()
  }, true)
  document.addEventListener(
    'compositionend',
    (e) => {
      composing = false
      if (canSuggest(e.target)) schedule(e.target)
    },
    true
  )
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)

  globalThis.kokeySuggest = {
    setEnabled(on) {
      enabled = on
      if (!on) hide()
    },
    setTheme(next) {
      theme = next
    },
    // test seams
    _evaluate: evaluate,
    _button: () => button
  }

  globalThis.kokeySettings.load().then((s) => {
    enabled = s.suggestButton
    theme = s.buttonTheme
  })
  globalThis.kokeySettings.subscribe((s) => {
    theme = s.buttonTheme
    globalThis.kokeySuggest.setEnabled(s.suggestButton)
  })
})()
