/**
 * DOM layer — enforce an input mode on <input>/<textarea> regardless of the
 * user's IME state.
 *
 *   <input data-hangul="ko">  — QWERTY keystrokes compose into Hangul
 *   <input data-hangul="en">  — Hangul (IME left on) is restored to QWERTY
 *
 * Composition-safe: while the native IME is composing we never touch the
 * value (that would break the composition); conversion runs on
 * `compositionend` and on regular (non-composing) `input` events.
 * The cursor is preserved by converting the text before the caret and using
 * its converted length as the new caret position.
 */
import { enToKo } from './enToKo'
import { koToEn } from './koToEn'

export type HangulMode = 'ko' | 'en'

type Bindable = HTMLInputElement | HTMLTextAreaElement

const SELECTOR = 'input[data-hangul], textarea[data-hangul]'

const unbinders = new WeakMap<Bindable, () => void>()

function resolveMode(el: Bindable, fixed?: HangulMode): HangulMode | null {
  const m = fixed ?? el.getAttribute('data-hangul')
  return m === 'ko' || m === 'en' ? m : null
}

/**
 * `ko` mode normalizes through both directions so progressive typing works:
 * the visible value may already contain composed Hangul from previous
 * keystrokes (`안` + `s` → decompose to `dkss` → recompose to `안ㄴ`).
 */
function convertValue(value: string, mode: HangulMode): string {
  return mode === 'ko' ? enToKo(koToEn(value)) : koToEn(value)
}

/**
 * Bind conversion to a single element. The mode is read from the
 * `data-hangul` attribute at event time unless `mode` is given explicitly.
 * Returns an unbind function. Binding an already-bound element is a no-op
 * that returns the existing unbinder.
 */
export function bind(el: Bindable, mode?: HangulMode): () => void {
  const existing = unbinders.get(el)
  if (existing) return existing

  let composing = false

  const convert = (): void => {
    const m = resolveMode(el, mode)
    if (!m) return
    const value = el.value
    const next = convertValue(value, m)
    if (next === value) return
    const caret = el.selectionStart
    el.value = next
    if (caret !== null) {
      const pos = convertValue(value.slice(0, caret), m).length
      el.setSelectionRange(pos, pos)
    }
  }

  const onCompositionStart = (): void => {
    composing = true
  }
  const onCompositionEnd = (): void => {
    composing = false
    convert()
  }
  const onInput = (): void => {
    if (!composing) convert()
  }

  el.addEventListener('compositionstart', onCompositionStart)
  el.addEventListener('compositionend', onCompositionEnd)
  el.addEventListener('input', onInput)

  const unbind = (): void => {
    el.removeEventListener('compositionstart', onCompositionStart)
    el.removeEventListener('compositionend', onCompositionEnd)
    el.removeEventListener('input', onInput)
    unbinders.delete(el)
  }
  unbinders.set(el, unbind)
  return unbind
}

function isBindable(node: unknown): node is Bindable {
  return (
    typeof HTMLInputElement !== 'undefined' &&
    (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
  )
}

function bindAll(scope: ParentNode): void {
  for (const el of scope.querySelectorAll(SELECTOR)) {
    if (isBindable(el)) bind(el)
  }
}

/**
 * Framework-agnostic ref-callback factory: pass the element to bind, `null`
 * to unbind. This is what the React `useHangul` hook wraps — usable directly
 * with any library that hands you element refs.
 */
export function createRefBinder(
  mode?: HangulMode
): (el: Bindable | null) => void {
  let unbind: (() => void) | null = null
  return (el) => {
    unbind?.()
    unbind = el ? bind(el, mode) : null
  }
}

/**
 * Bind every `[data-hangul]` input under `root` (default: `document`) and
 * keep watching for inputs added later or gaining the attribute.
 * Returns a stop function that disconnects the observer (existing bindings
 * stay; removing the `data-hangul` attribute already disables conversion
 * because the mode is read at event time).
 */
export function observe(root: ParentNode = document): () => void {
  bindAll(root)

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && isBindable(record.target)) {
        if (record.target.hasAttribute('data-hangul')) bind(record.target)
        continue
      }
      for (const node of record.addedNodes) {
        if (isBindable(node) && node.matches(SELECTOR)) bind(node)
        else if (node instanceof Element) bindAll(node)
      }
    }
  })

  observer.observe(root as Node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-hangul']
  })
  return () => observer.disconnect()
}
