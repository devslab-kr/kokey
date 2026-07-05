/**
 * Standard Dubeolsik (두벌식) keyboard layout tables.
 *
 * Unicode Hangul syllable composition:
 *   code = 0xAC00 + (choIndex * 21 + jungIndex) * 28 + jongIndex
 */

/** 초성 19 (leading consonants, syllable order) */
export const CHOSUNG = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ']

/** 중성 21 (vowels, syllable order) */
export const JUNGSUNG = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ']

/** 종성 27 (trailing consonants, syllable order — index 0 means "no jong") */
export const JONGSUNG = [...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']

/**
 * Jamo → QWERTY key(s). Shifted jamo (ㅃㅉㄸㄲㅆ / ㅒㅖ) map to uppercase,
 * compound jamo (ㅘ, ㄳ, …) map to their two-key sequences.
 */
export const JAMO_TO_KEY: Record<string, string> = {
  // consonants
  ㄱ: 'r', ㄲ: 'R', ㄴ: 's', ㄷ: 'e', ㄸ: 'E', ㄹ: 'f', ㅁ: 'a', ㅂ: 'q',
  ㅃ: 'Q', ㅅ: 't', ㅆ: 'T', ㅇ: 'd', ㅈ: 'w', ㅉ: 'W', ㅊ: 'c', ㅋ: 'z',
  ㅌ: 'x', ㅍ: 'v', ㅎ: 'g',
  // vowels
  ㅏ: 'k', ㅐ: 'o', ㅑ: 'i', ㅒ: 'O', ㅓ: 'j', ㅔ: 'p', ㅕ: 'u', ㅖ: 'P',
  ㅗ: 'h', ㅘ: 'hk', ㅙ: 'ho', ㅚ: 'hl', ㅛ: 'y', ㅜ: 'n', ㅝ: 'nj',
  ㅞ: 'np', ㅟ: 'nl', ㅠ: 'b', ㅡ: 'm', ㅢ: 'ml', ㅣ: 'l',
  // compound trailing consonants
  ㄳ: 'rt', ㄵ: 'sw', ㄶ: 'sg', ㄺ: 'fr', ㄻ: 'fa', ㄼ: 'fq', ㄽ: 'ft',
  ㄾ: 'fx', ㄿ: 'fv', ㅀ: 'fg', ㅄ: 'qt'
}

/**
 * QWERTY key → jamo. Case-sensitive: uppercase produces the shifted jamo
 * where one exists (QWERT / OP rows), otherwise the same jamo as lowercase.
 */
export const KEY_TO_JAMO: Record<string, string> = {
  r: 'ㄱ', R: 'ㄲ', s: 'ㄴ', S: 'ㄴ', e: 'ㄷ', E: 'ㄸ', f: 'ㄹ', F: 'ㄹ',
  a: 'ㅁ', A: 'ㅁ', q: 'ㅂ', Q: 'ㅃ', t: 'ㅅ', T: 'ㅆ', d: 'ㅇ', D: 'ㅇ',
  w: 'ㅈ', W: 'ㅉ', c: 'ㅊ', C: 'ㅊ', z: 'ㅋ', Z: 'ㅋ', x: 'ㅌ', X: 'ㅌ',
  v: 'ㅍ', V: 'ㅍ', g: 'ㅎ', G: 'ㅎ',
  k: 'ㅏ', K: 'ㅏ', o: 'ㅐ', O: 'ㅒ', i: 'ㅑ', I: 'ㅑ', j: 'ㅓ', J: 'ㅓ',
  p: 'ㅔ', P: 'ㅖ', u: 'ㅕ', U: 'ㅕ', h: 'ㅗ', H: 'ㅗ', y: 'ㅛ', Y: 'ㅛ',
  n: 'ㅜ', N: 'ㅜ', b: 'ㅠ', B: 'ㅠ', m: 'ㅡ', M: 'ㅡ', l: 'ㅣ', L: 'ㅣ'
}

/** 겹모음 조합: ㅗ+ㅏ→ㅘ 등 */
export const JUNG_COMPOSE: Record<string, string> = {
  ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ'
}

/** 겹받침 조합: ㄴ+ㅈ→ㄵ 등 */
export const JONG_COMPOSE: Record<string, string> = {
  ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ',
  ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ'
}

/** 겹받침 분해 (받침 넘김용): ㄵ → [ㄴ, ㅈ] */
export const JONG_SPLIT: Record<string, [string, string]> = {
  ㄳ: ['ㄱ', 'ㅅ'], ㄵ: ['ㄴ', 'ㅈ'], ㄶ: ['ㄴ', 'ㅎ'], ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'], ㄼ: ['ㄹ', 'ㅂ'], ㄽ: ['ㄹ', 'ㅅ'], ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'], ㅀ: ['ㄹ', 'ㅎ'], ㅄ: ['ㅂ', 'ㅅ']
}

export const HANGUL_SYLLABLE_START = 0xac00
export const HANGUL_SYLLABLE_END = 0xd7a3

export function isVowelJamo(jamo: string): boolean {
  return JUNGSUNG.includes(jamo)
}

export function canBeChosung(jamo: string): boolean {
  return CHOSUNG.includes(jamo)
}

export function canBeJongsung(jamo: string): boolean {
  return JONGSUNG.includes(jamo)
}
