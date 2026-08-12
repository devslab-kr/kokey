/**
 * Surface measurement for the suggest button.
 *
 * This reads exactly one thing it can actually know — how light or dark the
 * surface under the button is — and never tries to guess a page's accent
 * colour. A page's `theme-color` (or a nearby button's background) is only
 * incidentally related to what a designer would call the brand, so copying
 * it ships controls that are unreadable as often as they are apt.
 *
 * The surface that matters is the FIELD's, not the page's: the button
 * floats over the input's right edge. Backgrounds are frequently
 * transparent, so resolution walks up the ancestor chain.
 */

export interface Palette {
  bg: string
  fg: string
  border: string
}

/** kokey teal, one variant per surface polarity. */
export const ON_LIGHT: Palette = {
  bg: '#0d9488',
  fg: '#ffffff',
  border: 'rgba(0,0,0,.12)'
}
export const ON_DARK: Palette = {
  bg: '#5eead4',
  fg: '#0f1117',
  border: 'rgba(255,255,255,.18)'
}

type Rgba = [number, number, number, number]

/** `rgb(r, g, b)` / `rgba(r, g, b, a)` → channels, or `null`. */
export function parseColor(value: string | null): Rgba | null {
  const m = /rgba?\(([^)]+)\)/.exec(value ?? '')
  if (!m) return null
  const parts = (m[1] as string).split(',').map((n) => parseFloat(n))
  const [r, g, b, a] = parts
  if (r === undefined || g === undefined || b === undefined) return null
  if ([r, g, b].some(Number.isNaN)) return null
  return [r, g, b, a === undefined || Number.isNaN(a) ? 1 : a]
}

function srgbToLinear(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/** WCAG relative luminance, 0 (black) – 1 (white). */
export function luminance([r, g, b]: readonly number[]): number {
  return (
    0.2126 * srgbToLinear(r as number) +
    0.7152 * srgbToLinear(g as number) +
    0.0722 * srgbToLinear(b as number)
  )
}

/** WCAG contrast ratio between two luminances, 1 – 21. */
export function contrast(l1: number, l2: number): number {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/**
 * The colour actually painted behind `el` — walks up past transparent
 * backgrounds, falling back to white, the default canvas. Note that an
 * `<input>` carries an opaque UA background on most pages, so the walk
 * usually stops at the field itself, which is the right surface anyway.
 */
export function surfaceColor(el: Element): Rgba {
  let node: Element | null = el
  while (node) {
    const parsed = parseColor(getComputedStyle(node).backgroundColor)
    if (parsed && parsed[3] > 0.15) return parsed
    node = node.parentElement
  }
  return [255, 255, 255, 1]
}

function hexToRgbString(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

/**
 * Pick the palette for a field by measuring its surface. If the obvious
 * choice would sit too close in tone to the field itself, the other one is
 * used, so the button never disappears into its background.
 */
export function paletteFor(el: Element): Palette {
  const surface = luminance(surfaceColor(el))
  const first = surface > 0.5 ? ON_LIGHT : ON_DARK
  const second = first === ON_LIGHT ? ON_DARK : ON_LIGHT

  const separation = (p: Palette): number =>
    contrast(luminance(parseColor(hexToRgbString(p.bg)) as Rgba), surface)

  return separation(first) >= 1.6 || separation(first) >= separation(second)
    ? first
    : second
}
