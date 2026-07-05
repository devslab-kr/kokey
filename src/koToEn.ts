import {
  CHOSUNG,
  HANGUL_SYLLABLE_END,
  HANGUL_SYLLABLE_START,
  JAMO_TO_KEY,
  JONGSUNG,
  JUNGSUNG
} from './maps'

/**
 * Convert Hangul typed on a Dubeolsik layout back to the QWERTY keystrokes
 * that produced it.
 *
 * - Syllables are decomposed (초성/중성/종성) and each jamo is mapped to its
 *   key sequence: `koToEn('안녕') === 'dkssud'`
 * - Standalone jamo work too: `koToEn('ㅘ') === 'hk'`
 * - Shifted jamo produce uppercase: `koToEn('뛰다') === 'Enlek'`
 * - Characters with no mapping (Latin, digits, punctuation) pass through as-is.
 */
export function koToEn(text: string): string {
  let out = ''
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= HANGUL_SYLLABLE_START && code <= HANGUL_SYLLABLE_END) {
      const idx = code - HANGUL_SYLLABLE_START
      const cho = CHOSUNG[Math.floor(idx / 588)]!
      const jung = JUNGSUNG[Math.floor(idx / 28) % 21]!
      const jongIdx = idx % 28
      out += JAMO_TO_KEY[cho]! + JAMO_TO_KEY[jung]!
      if (jongIdx > 0) out += JAMO_TO_KEY[JONGSUNG[jongIdx - 1]!]!
    } else {
      out += JAMO_TO_KEY[ch] ?? ch
    }
  }
  return out
}
