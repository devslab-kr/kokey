/**
 * Paste auto-correction — detect wrong-layout gibberish in pasted text and
 * fix it, without forcing a mode on the input.
 *
 *   <input data-kokey-paste>            — via observe()
 *   bindPaste(el)                       — imperative
 *
 * Detection is a heuristic and deliberately conservative; it only fires on
 * the two Korean cases where composition itself is the signal:
 *
 *  - English typed in Korean mode ("ㅗ디ㅣㅐ") — real Korean text never mixes
 *    standalone vowel jamo with consonants/syllables, so that mix marks
 *    gibberish. Laughter runs (ㅋㅋㅋ, ㅎㅎ, ㅠㅠ) stay untouched.
 *  - Korean typed in English mode ("dkssudgktpdy") — fires only when every
 *    word recomposes into complete syllables with nothing left over. Short
 *    English words can compose too ("sos" → 낸), so a single word must
 *    yield at least three syllables.
 *
 * Other layouts (ru, th, …) are out of scope for auto-detection — any Latin
 * string maps to those scripts, so there is no validity signal without a
 * dictionary. Use `toEn` / explicit modes for those.
 *
 * Before applying, a cancelable `kokey-paste` CustomEvent fires on the input
 * with `detail: { pasted, fixed }`; call `preventDefault()` to veto.
 */
import { toEn } from './registry'
import { enToKo } from './enToKo'

type Bindable = HTMLInputElement | HTMLTextAreaElement

const isSyllable = (cp: number): boolean => cp >= 0xac00 && cp <= 0xd7a3
const isJamo = (cp: number): boolean =>
  (cp >= 0x3130 && cp <= 0x318f) || (cp >= 0x1100 && cp <= 0x11ff)
const isVowelJamo = (cp: number): boolean => cp >= 0x314f && cp <= 0x3163
const hasLatin = (s: string): boolean => /[a-zA-Z]/.test(s)

/** English typed in Korean mode: standalone vowel jamo mixed with more. */
function looksLikeMistypedEnglish(text: string): boolean {
  let vowel = false
  let other = false
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    if (isJamo(cp)) {
      if (isVowelJamo(cp)) vowel = true
      else other = true
    } else if (isSyllable(cp)) {
      other = true
    }
  }
  return vowel && other
}

/** Korean typed in English mode: every word recomposes completely. */
function looksLikeMistypedKorean(text: string): boolean {
  const tokens = text.split(/\s+/).filter(hasLatin)
  if (tokens.length === 0) return false
  let syllables = 0
  for (const token of tokens) {
    const composed = enToKo(token)
    if (hasLatin(composed)) return false
    for (const ch of composed) {
      const cp = ch.codePointAt(0)!
      if (isJamo(cp)) return false
      if (isSyllable(cp)) syllables += 1
    }
  }
  return tokens.length > 1 ? syllables >= 2 : syllables >= 3
}

/**
 * Return the corrected text if `text` looks like wrong-layout gibberish,
 * `null` otherwise. The building block behind `bindPaste` — usable directly
 * to build suggest-instead-of-replace UIs.
 */
export function fixMistyped(text: string): string | null {
  if (looksLikeMistypedEnglish(text)) {
    const fixed = toEn(text)
    return fixed === text ? null : fixed
  }
  const cp = [...text].some((ch) => {
    const c = ch.codePointAt(0)!
    return isJamo(c) || isSyllable(c)
  })
  if (!cp && looksLikeMistypedKorean(text)) {
    const fixed = enToKo(text)
    return fixed === text ? null : fixed
  }
  return null
}

const pasteUnbinders = new WeakMap<Bindable, () => void>()

/**
 * Watch an input for pastes and auto-correct wrong-layout text. Returns an
 * unbind function; binding an already-bound element returns the existing
 * unbinder. Fires a bubbling `input` event after correcting so framework
 * bindings pick up the new value.
 */
export function bindPaste(el: Bindable): () => void {
  const existing = pasteUnbinders.get(el)
  if (existing) return existing

  const onPaste = (e: Event): void => {
    const pasted = (e as ClipboardEvent).clipboardData?.getData('text')
    if (!pasted) return
    const fixed = fixMistyped(pasted)
    if (fixed === null || fixed === pasted) return
    const approved = el.dispatchEvent(
      new CustomEvent('kokey-paste', {
        bubbles: true,
        cancelable: true,
        detail: { pasted, fixed }
      })
    )
    if (!approved) return
    e.preventDefault()
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    el.value = el.value.slice(0, start) + fixed + el.value.slice(end)
    const caret = start + fixed.length
    el.setSelectionRange(caret, caret)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }

  el.addEventListener('paste', onPaste)
  const unbind = (): void => {
    el.removeEventListener('paste', onPaste)
    pasteUnbinders.delete(el)
  }
  pasteUnbinders.set(el, unbind)
  return unbind
}
