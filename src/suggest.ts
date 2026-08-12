/**
 * Suggest button — offer a fix instead of making one.
 *
 *   <input data-kokey-suggest>          — picked up by observe()
 *   bindSuggest(el)                     — imperative
 *
 * When a field's value looks like wrong-layout gibberish, a small button
 * appears at its right edge and converts the value on click. Nothing is
 * changed until the user clicks.
 *
 * It offers only what `fixMistyped` is confident about — never the
 * "compose this Latin text into Korean" guess that an explicit action like
 * `convert(text, 'ko')` will happily make. An uninvited button has to be
 * right nearly always, and on an ordinary English field that guess is
 * wrong far more often than right. So `dkssudgktpdy` gets a button and a
 * bare `dkssud` does not.
 *
 * Styling is the SITE's job by default: the button carries the class
 * `kokey-suggest` and no colours, so your stylesheet owns it. Sites that
 * would rather not think about it can pass `theme: 'auto'`, which measures
 * the field's own surface and picks a readable kokey palette — that is
 * what the browser extension uses, since it has no stylesheet on the pages
 * it runs in.
 */
import { fixMistyped } from './paste'
import { paletteFor } from './theme'

type Bindable = HTMLInputElement | HTMLTextAreaElement

export interface SuggestOptions {
  /**
   * `'site'` (default) applies no colours — style `.kokey-suggest` yourself.
   * `'auto'` measures the field's surface brightness and applies a readable
   * kokey palette inline.
   */
  theme?: 'site' | 'auto'
  /** Button text. Defaults to "변환" for Korean pages, "Fix" otherwise. */
  label?: string
  /** Milliseconds of quiet typing before the value is re-checked. Default 300. */
  debounce?: number
}

const suggestUnbinders = new WeakMap<Bindable, () => void>()

function defaultLabel(): string {
  const lang =
    (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('lang')) ||
    (typeof navigator !== 'undefined' ? navigator.language : '') ||
    ''
  return lang.toLowerCase().startsWith('ko') ? '변환' : 'Fix'
}

/**
 * Watch one input for wrong-layout values and offer a one-click fix.
 * Returns an unbind function; binding an already-bound element returns the
 * existing unbinder.
 */
export function bindSuggest(el: Bindable, opts?: SuggestOptions): () => void {
  const existing = suggestUnbinders.get(el)
  if (existing) return existing

  const wait = opts?.debounce ?? 300
  const label = opts?.label ?? defaultLabel()
  const themed = opts?.theme === 'auto'

  let button: HTMLButtonElement | null = null
  let fixed: string | null = null
  let composing = false
  let timer = 0

  function ensureButton(): HTMLButtonElement | null {
    if (button || !document.body) return button
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'kokey-suggest'
    button.textContent = label
    button.hidden = true
    // structure and position only — colours belong to the site unless
    // `theme: 'auto'` was asked for
    button.style.cssText =
      'position:absolute;z-index:2147483646;padding:2px 8px;' +
      'border-radius:999px;cursor:pointer;font:11px/1.6 inherit;'
    // a class that sets display: would beat [hidden]; guard it here so the
    // site's own .kokey-suggest rule cannot accidentally un-hide the button
    button.style.setProperty('display', 'none')
    button.addEventListener('mousedown', (e) => e.preventDefault()) // keep the caret
    button.addEventListener('click', apply)
    document.body.appendChild(button)
    return button
  }

  function hide(): void {
    fixed = null
    if (button) {
      button.hidden = true
      button.style.setProperty('display', 'none')
    }
  }

  function place(): void {
    if (!button) return
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return hide() // field is gone
    const bw = button.offsetWidth || 40
    button.style.top = `${window.scrollY + r.top + (r.height - 22) / 2}px`
    button.style.left = `${window.scrollX + r.right - bw - 6}px`
  }

  function apply(): void {
    if (fixed === null) return
    const next = fixed
    el.value = next
    try {
      el.setSelectionRange(next.length, next.length)
    } catch {
      /* some inputs have no selection API */
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
    hide()
    el.focus()
  }

  function evaluate(): void {
    if (composing) return hide()
    const next = fixMistyped(el.value)
    if (next === null) return hide()
    if (!ensureButton() || !button) return
    fixed = next
    if (themed) {
      const palette = paletteFor(el)
      button.style.background = palette.bg
      button.style.color = palette.fg
      button.style.border = `1px solid ${palette.border}`
    }
    button.hidden = false
    button.style.setProperty('display', 'block')
    place()
  }

  const schedule = (): void => {
    clearTimeout(timer)
    timer = setTimeout(evaluate, wait) as unknown as number
  }

  const onInput = (): void => schedule()
  const onFocus = (): void => schedule()
  const onBlur = (): void => hide()
  const onCompositionStart = (): void => {
    composing = true
    hide()
  }
  const onCompositionEnd = (): void => {
    composing = false
    schedule()
  }

  el.addEventListener('input', onInput)
  el.addEventListener('focus', onFocus)
  el.addEventListener('blur', onBlur)
  el.addEventListener('compositionstart', onCompositionStart)
  el.addEventListener('compositionend', onCompositionEnd)
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)

  const unbind = (): void => {
    clearTimeout(timer)
    el.removeEventListener('input', onInput)
    el.removeEventListener('focus', onFocus)
    el.removeEventListener('blur', onBlur)
    el.removeEventListener('compositionstart', onCompositionStart)
    el.removeEventListener('compositionend', onCompositionEnd)
    window.removeEventListener('scroll', place, true)
    window.removeEventListener('resize', place)
    button?.remove()
    button = null
    suggestUnbinders.delete(el)
  }
  suggestUnbinders.set(el, unbind)
  return unbind
}
