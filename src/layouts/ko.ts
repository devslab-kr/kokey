import type { Layout } from '../layout'
import { enToKo } from '../enToKo'
import { koToEn } from '../koToEn'

/**
 * Korean Dubeolsik — the built-in layout. Unlike the table-driven layouts it
 * needs the full IME composition automaton (`enToKo`) and syllable
 * decomposition (`koToEn`), so it is a functional layout.
 */
export const ko: Layout = {
  id: 'ko',
  script: [
    [0xac00, 0xd7a3], // Hangul syllables
    [0x1100, 0x11ff], // Hangul jamo
    [0x3130, 0x318f] // Hangul compatibility jamo
  ],
  fromLatin: enToKo,
  toLatin: koToEn
}
