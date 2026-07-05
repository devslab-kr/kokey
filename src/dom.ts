/**
 * DOM layer — enforce an input mode on <input>/<textarea> regardless of the
 * user's IME/layout state.
 *
 *   <input data-kokey="ko">   — QWERTY keystrokes compose into Hangul
 *   <input data-kokey="ru">   — QWERTY keystrokes become Russian (register(ru) first)
 *   <input data-kokey="en">   — any registered script is restored to QWERTY
 *   <input data-hangul="ko">  — legacy alias, still supported
 *
 * Composition-safe: while the native IME is composing we never touch the
 * value (that would break the composition); conversion runs on
 * `compositionend` and on regular (non-composing) `input` events.
 * The cursor is preserved by converting the text before the caret and using
 * its converted length as the new caret position.
 */
import { getLayout, toEn } from './registry'

/** Legacy mode union kept for compatibility — `KokeyMode` supersedes it. */
export type HangulMode = 'ko' | 'en'
/** 'en' to restore QWERTY, or the id of a registered layout to enforce it. */
export type KokeyMode = 'en' | (string & {})

type Bindable = HTMLInputElement | HTMLTextAreaElement

const SELECTOR =
  'input[data-kokey], textarea[data-kokey], input[data-hangul], textarea[data-hangul]'

const unbinders = new WeakMap<Bindable, () => void>()

function resolveMode(el: Bindable, fixed?: KokeyMode): KokeyMode | null {
  const m =
    fixed ?? el.getAttribute('data-kokey') ?? el.getAttribute('data-hangul')
  return m ? m : null
}

/**
 * Convert a value the way the DOM layer would for the given mode.
 *
 * Layout modes normalize through both directions so progressive typing works:
 * the visible value may already contain composed text from previous
 * keystrokes (`안` + `s` → decompose to `dkss` → recompose to `안ㄴ`).
 */
export function convert(value: string, mode: KokeyMode): string {
  if (mode === 'en') return toEn(value)
  const layout = getLayout(mode)
  return layout ? layout.fromLatin(layout.toLatin(value)) : value
}

/**
 * Convert an input's value in place, preserving the caret (the text before
 * the caret is converted separately and its length becomes the new caret
 * position). Returns whether the value changed — the building block the
 * bind/observe layer and the framework components share.
 */
export function applyToInput(el: Bindable, mode: KokeyMode): boolean {
  const value = el.value
  const next = convert(value, mode)
  if (next === value) return false
  const caret = el.selectionStart
  el.value = next
  if (caret !== null) {
    const pos = convert(value.slice(0, caret), mode).length
    el.setSelectionRange(pos, pos)
  }
  return true
}

/**
 * Bind conversion to a single element. The mode is read from the
 * `data-kokey` (or legacy `data-hangul`) attribute at event time unless
 * `mode` is given explicitly. Returns an unbind function. Binding an
 * already-bound element is a no-op that returns the existing unbinder.
 */
export function bind(el: Bindable, mode?: KokeyMode): () => void {
  const existing = unbinders.get(el)
  if (existing) return existing

  let composing = false

  const run = (): void => {
    const m = resolveMode(el, mode)
    if (m) applyToInput(el, m)
  }

  const onCompositionStart = (): void => {
    composing = true
  }
  const onCompositionEnd = (): void => {
    composing = false
    run()
  }
  const onInput = (): void => {
    if (!composing) run()
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
 * to unbind. This is what the React `useKokey` hook wraps — usable directly
 * with any library that hands you element refs.
 */
export function createRefBinder(
  mode?: KokeyMode
): (el: Bindable | null) => void {
  let unbind: (() => void) | null = null
  return (el) => {
    unbind?.()
    unbind = el ? bind(el, mode) : null
  }
}

/**
 * Bind every `[data-kokey]` / `[data-hangul]` input under `root` (default:
 * `document`) and keep watching for inputs added later or gaining the
 * attribute. Returns a stop function that disconnects the observer (existing
 * bindings stay; removing the attribute already disables conversion because
 * the mode is read at event time).
 */
export function observe(root: ParentNode = document): () => void {
  bindAll(root)

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && isBindable(record.target)) {
        if (
          record.target.hasAttribute('data-kokey') ||
          record.target.hasAttribute('data-hangul')
        ) {
          bind(record.target)
        }
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
    attributeFilter: ['data-kokey', 'data-hangul']
  })
  return () => observer.disconnect()
}
