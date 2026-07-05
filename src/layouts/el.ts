import { defineLayout } from '../layout'

/**
 * Greek (Windows "Greek", KBDHE).
 *
 * The `;` key is the tonos dead key and `:` the dialytika dead key, so
 * accented vowels are two-key sequences (`;a` → ά) — handled by the greedy
 * multi-character matching. The `q` key types the Greek question mark `;`.
 * Final sigma ς sits on `w`; Σ inverts to `s`.
 */
export const el = defineLayout({
  id: 'el',
  script: [[0x0370, 0x03ff]],
  fromKey: {
    q: ';', Q: ':',
    w: 'ς', W: 'ς',
    e: 'ε', E: 'Ε', r: 'ρ', R: 'Ρ', t: 'τ', T: 'Τ', y: 'υ', Y: 'Υ',
    u: 'θ', U: 'Θ', i: 'ι', I: 'Ι', o: 'ο', O: 'Ο', p: 'π', P: 'Π',
    a: 'α', A: 'Α', s: 'σ', S: 'Σ', d: 'δ', D: 'Δ', f: 'φ', F: 'Φ',
    g: 'γ', G: 'Γ', h: 'η', H: 'Η', j: 'ξ', J: 'Ξ', k: 'κ', K: 'Κ',
    l: 'λ', L: 'Λ',
    z: 'ζ', Z: 'Ζ', x: 'χ', X: 'Χ', c: 'ψ', C: 'Ψ', v: 'ω', V: 'Ω',
    b: 'β', B: 'Β', n: 'ν', N: 'Ν', m: 'μ', M: 'Μ',
    // dead keys: tonos on `;`, dialytika on `:`
    ';': '΄', ':': '¨',
    ';a': 'ά', ';e': 'έ', ';h': 'ή', ';i': 'ί', ';o': 'ό', ';u': 'ύ',
    ';v': 'ώ',
    ';A': 'Ά', ';E': 'Έ', ';H': 'Ή', ';I': 'Ί', ';O': 'Ό', ';U': 'Ύ',
    ';V': 'Ώ',
    ':i': 'ϊ', ':u': 'ϋ', ':I': 'Ϊ', ':U': 'Ϋ'
  }
})

/** Greek text → the QWERTY keystrokes that produced it. */
export const elToEn = (text: string): string => el.toLatin(text)
/** QWERTY keystrokes → the Greek text the layout produces. */
export const enToEl = (text: string): string => el.fromLatin(text)
