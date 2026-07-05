import type { Layout } from './layout'
import { ko } from './layouts/ko'

/**
 * Layout registry + script auto-detection.
 *
 * Korean is registered out of the box; other layouts are opt-in:
 *
 *   import { register, toEn } from '@devslab/kokey'
 *   import { ru } from '@devslab/kokey/ru'
 *   register(ru)
 *   toEn('привет')  // 'ghbdtn'
 */

const registry = new Map<string, Layout>()

/** Register layouts for `toEn` auto-detection and the DOM `data-kokey` modes. */
export function register(...layouts: Layout[]): void {
  for (const layout of layouts) registry.set(layout.id, layout)
}

/** Look up a registered layout by id. */
export function getLayout(id: string): Layout | undefined {
  return registry.get(id)
}

/** All registered layouts, in registration order. */
export function layouts(): Layout[] {
  return [...registry.values()]
}

register(ko)

function inScript(layout: Layout, codePoint: number): boolean {
  for (const [start, end] of layout.script) {
    if (codePoint >= start && codePoint <= end) return true
  }
  return false
}

/**
 * When several registered layouts share a script (ru/uk are both Cyrillic),
 * pick the one whose reverse conversion actually covers the most characters
 * of the run — привіт resolves to uk because ru leaves і untouched.
 */
function pickLayout(candidates: Layout[], run: string): Layout {
  if (candidates.length === 1) return candidates[0]!
  let best = candidates[0]!
  let bestScore = -1
  for (const layout of candidates) {
    let score = 0
    for (const ch of run) if (layout.toLatin(ch) !== ch) score += 1
    if (score > bestScore) {
      best = layout
      bestScore = score
    }
  }
  return best
}

/**
 * Restore mistyped text to the QWERTY keystrokes that produced it, whatever
 * registered layout it was typed on. Runs of each script are detected and
 * converted independently, so mixed strings work; characters outside every
 * registered script (Latin, digits, punctuation) pass through untouched.
 */
export function toEn(text: string): string {
  const all = layouts()
  let out = ''
  let i = 0
  while (i < text.length) {
    const cp = text.codePointAt(i)!
    const candidates = all.filter((l) => inScript(l, cp))
    if (candidates.length === 0) {
      out += text[i]
      i += 1
      continue
    }
    let j = i + 1
    while (
      j < text.length &&
      candidates.some((l) => inScript(l, text.codePointAt(j)!))
    ) {
      j += 1
    }
    const run = text.slice(i, j)
    out += pickLayout(candidates, run).toLatin(run)
    i = j
  }
  return out
}

/**
 * Compose QWERTY keystrokes into the text the given layout would produce.
 * The layout must be registered (Korean always is).
 */
export function fromEn(text: string, layoutId: string): string {
  const layout = registry.get(layoutId)
  if (!layout) {
    throw new Error(
      `kokey: unknown layout '${layoutId}' — register() it first`
    )
  }
  return layout.fromLatin(text)
}
