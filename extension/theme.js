/**
 * Button theming — adapt to the surface the button sits on, without ever
 * pretending to know the page's brand colour.
 *
 * The distinction matters. Reading a page's "theme colour" and treating it
 * as an accent to copy is guesswork: the value is only incidentally related
 * to what a designer would call the brand, and getting it wrong ships an
 * unreadable or garish control. So this reads exactly one thing it can
 * actually know — how light or dark the surface underneath the button is —
 * and picks between two kokey palettes, then checks the result is legible
 * before using it.
 *
 * The relevant surface is the FIELD's background, not the page's: the
 * button floats over the input's right edge. Backgrounds are frequently
 * transparent, so resolution walks up the ancestor chain.
 */
;(() => {
  // kokey teal, one variant per surface polarity
  const ON_LIGHT = { bg: '#0d9488', fg: '#ffffff', border: 'rgba(0,0,0,.12)' }
  const ON_DARK = { bg: '#5eead4', fg: '#0f1117', border: 'rgba(255,255,255,.18)' }

  /** "rgb(r, g, b)" / "rgba(r, g, b, a)" → [r,g,b,a], or null. */
  function parseColor(value) {
    const m = /rgba?\(([^)]+)\)/.exec(value || '')
    if (!m) return null
    const parts = m[1].split(',').map((n) => parseFloat(n))
    if (parts.length < 3 || parts.some(Number.isNaN)) return null
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1]
  }

  function srgbToLinear(channel) {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  /** WCAG relative luminance, 0 (black) – 1 (white). */
  function luminance([r, g, b]) {
    return (
      0.2126 * srgbToLinear(r) +
      0.7152 * srgbToLinear(g) +
      0.0722 * srgbToLinear(b)
    )
  }

  /** WCAG contrast ratio between two luminances, 1 – 21. */
  function contrast(l1, l2) {
    const hi = Math.max(l1, l2) + 0.05
    const lo = Math.min(l1, l2) + 0.05
    return hi / lo
  }

  /**
   * The colour actually painted behind `el` — walks up past transparent
   * backgrounds, and falls back to white, the browser default canvas.
   */
  function surfaceColor(el) {
    let node = el
    while (node && node.nodeType === 1) {
      const parsed = parseColor(getComputedStyle(node).backgroundColor)
      if (parsed && parsed[3] > 0.15) return parsed
      node = node.parentElement
    }
    return [255, 255, 255, 1]
  }

  /**
   * Pick the palette for a field. `mode` is 'auto' | 'light' | 'dark',
   * where 'light'/'dark' name the SURFACE, not the button.
   */
  function paletteFor(el, mode) {
    if (mode === 'light') return ON_LIGHT
    if (mode === 'dark') return ON_DARK

    const surface = luminance(surfaceColor(el))
    const first = surface > 0.5 ? ON_LIGHT : ON_DARK
    const second = first === ON_LIGHT ? ON_DARK : ON_LIGHT

    // the button has to be distinguishable from the field it sits on; if the
    // obvious choice is nearly the same shade, take the other one
    const separation = (p) =>
      contrast(luminance(parseColor(hexToRgb(p.bg))), surface)
    return separation(first) >= 1.6 || separation(first) >= separation(second)
      ? first
      : second
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16)
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
  }

  globalThis.kokeyTheme = {
    paletteFor,
    // exported for tests
    luminance,
    contrast,
    parseColor,
    surfaceColor,
    ON_LIGHT,
    ON_DARK
  }
})()
