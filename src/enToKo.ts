import {
  CHOSUNG,
  HANGUL_SYLLABLE_START,
  JONGSUNG,
  JONG_COMPOSE,
  JONG_SPLIT,
  JUNGSUNG,
  JUNG_COMPOSE,
  KEY_TO_JAMO,
  canBeJongsung,
  isVowelJamo
} from './maps'

/**
 * Convert QWERTY keystrokes to the Hangul a Dubeolsik IME would compose.
 *
 * Implements the standard composition automaton:
 * - 겹모음: `hk` → ㅘ, `ml` → ㅢ …
 * - 겹받침: `dksgek` → 않다 (ㄴ+ㅎ → ㄶ)
 * - 받침 넘김: a vowel steals the previous trailing consonant
 *   (`dkswk` → 안자) and splits compound ones (`ekfrl` → 달기),
 *   exactly as a real IME composes.
 *
 * Case matters: `R` is ㄲ while `r` is ㄱ. Unmapped characters (digits,
 * punctuation, whitespace) flush the current syllable and pass through.
 */
export function enToKo(text: string): string {
  let out = ''
  let cho: string | null = null
  let jung: string | null = null
  let jong: string | null = null

  const flush = (): void => {
    if (cho !== null && jung !== null) {
      const choIdx = CHOSUNG.indexOf(cho)
      const jungIdx = JUNGSUNG.indexOf(jung)
      const jongIdx = jong === null ? -1 : JONGSUNG.indexOf(jong)
      out += String.fromCharCode(
        HANGUL_SYLLABLE_START + (choIdx * 21 + jungIdx) * 28 + jongIdx + 1
      )
    } else {
      // incomplete state — emit as standalone compatibility jamo
      if (cho !== null) out += cho
      if (jung !== null) out += jung
      if (jong !== null) out += jong
    }
    cho = null
    jung = null
    jong = null
  }

  for (const ch of text) {
    const jamo = KEY_TO_JAMO[ch]
    if (jamo === undefined) {
      flush()
      out += ch
      continue
    }

    if (isVowelJamo(jamo)) {
      if (jong !== null) {
        // 받침 넘김: trailing consonant moves to the new syllable
        let moved: string = jong
        const split: [string, string] | undefined = JONG_SPLIT[jong]
        if (split) {
          jong = split[0]
          moved = split[1]
        } else {
          jong = null
        }
        flush()
        cho = moved
        jung = jamo
      } else if (jung !== null) {
        const combined: string | undefined = JUNG_COMPOSE[jung + jamo]
        if (combined) {
          jung = combined
        } else {
          flush()
          jung = jamo
        }
      } else {
        jung = jamo
      }
    } else {
      if (jung !== null && cho !== null && jong === null) {
        if (canBeJongsung(jamo)) {
          jong = jamo
        } else {
          flush()
          cho = jamo
        }
      } else if (jung !== null && cho !== null) {
        const combined: string | undefined = JONG_COMPOSE[jong! + jamo]
        if (combined) {
          jong = combined
        } else {
          flush()
          cho = jamo
        }
      } else {
        // no complete syllable base yet — a new consonant starts over
        if (cho !== null || jung !== null) flush()
        cho = jamo
      }
    }
  }
  flush()
  return out
}
