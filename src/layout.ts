/**
 * Generic keyboard-layout machinery.
 *
 * A `Layout` converts between Latin (US QWERTY) keystrokes and the text those
 * keystrokes produce on another layout. Most layouts are plain character
 * tables (`defineLayout`); Korean is a functional layout wrapping the
 * Dubeolsik composition automaton.
 */

/** Inclusive Unicode code-point range. */
export type ScriptRange = readonly [number, number]

export interface Layout {
  /** Layout id — 'ko', 'ru', 'he', … Also the `data-kokey` attribute value. */
  readonly id: string
  /**
   * Unicode ranges of the script this layout produces. Used by `toEn` to
   * detect which layout a mistyped string came from.
   */
  readonly script: readonly ScriptRange[]
  /** Latin keystrokes → the text the layout would produce. */
  fromLatin(text: string): string
  /** Native text → the Latin keystrokes that produced it. */
  toLatin(text: string): string
}

export interface TableLayoutDef {
  id: string
  script: readonly ScriptRange[]
  /**
   * Latin key(s) → native character(s). Case-sensitive: uppercase entries are
   * the shifted layer. Keys may be multi-character (dead-key sequences like
   * Greek `;a` → ά); values may be too (Arabic `b` → لا).
   */
  fromKey: Record<string, string>
  /**
   * Extra native → Latin entries. The reverse table is derived by inverting
   * `fromKey` (preferring the shortest, lowercase key on collisions); use
   * this only when the derived entry needs overriding.
   */
  toKeyOverrides?: Record<string, string>
}

/**
 * Greedy longest-match table conversion. Unmapped characters pass through.
 */
export function convertByTable(
  text: string,
  table: Record<string, string>,
  maxKeyLength: number
): string {
  let out = ''
  let i = 0
  while (i < text.length) {
    let matched = false
    for (let len = Math.min(maxKeyLength, text.length - i); len > 0; len--) {
      const replacement = table[text.slice(i, i + len)]
      if (replacement !== undefined) {
        out += replacement
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      out += text[i]
      i += 1
    }
  }
  return out
}

/** True when `candidate` is a better reverse key than `current`. */
function isBetterKey(candidate: string, current: string): boolean {
  if (candidate.length !== current.length) return candidate.length < current.length
  return candidate === candidate.toLowerCase() && current !== current.toLowerCase()
}

/**
 * Invert a fromKey table into a toKey table. When several keys produce the
 * same character (e.g. a shifted key falling back to the same letter), the
 * shortest — then lowercase — key wins, so round-trips stay canonical.
 */
export function invert(fromKey: Record<string, string>): Record<string, string> {
  const toKey: Record<string, string> = {}
  for (const [key, char] of Object.entries(fromKey)) {
    const existing = toKey[char]
    if (existing === undefined || isBetterKey(key, existing)) toKey[char] = key
  }
  return toKey
}

function maxKeyLength(table: Record<string, string>): number {
  let max = 1
  for (const key of Object.keys(table)) if (key.length > max) max = key.length
  return max
}

/** Build a table-driven layout: two greedy table passes, nothing else. */
export function defineLayout(def: TableLayoutDef): Layout {
  const fromKey = def.fromKey
  const toKey = { ...invert(fromKey), ...def.toKeyOverrides }
  const maxFrom = maxKeyLength(fromKey)
  const maxTo = maxKeyLength(toKey)
  return {
    id: def.id,
    script: def.script,
    fromLatin: (text) => convertByTable(text, fromKey, maxFrom),
    toLatin: (text) => convertByTable(text, toKey, maxTo)
  }
}
