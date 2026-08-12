/**
 * Conversion decision for an EXPLICIT user action (context menu / hotkey).
 * Unlike the library's paste heuristic, the user is telling us the text is
 * mistyped — so after the conservative fixMistyped pass we always try both
 * directions instead of giving up:
 *
 *   1. fixMistyped   — best-effort Korean heuristic (jamo gibberish etc.)
 *   2. toEn          — any registered non-Latin script → QWERTY
 *                      (привет → ghbdtn, ㅗ디ㅣㅐ → hello, …)
 *   3. enToKo        — pure-Latin fallback → Korean (v1 default target;
 *                      a per-layout choice belongs to a future options page)
 *
 * Returns null only when nothing would change.
 * Loaded after kokey.global.js; exposes `kokeyExt.decide` for content.js.
 */
;(() => {
  const k = globalThis.kokey

  function decide(text) {
    if (!text) return null
    const fixed = k.fixMistyped(text)
    if (fixed !== null) return fixed
    const restored = k.toEn(text)
    if (restored !== text) return restored
    const composed = k.enToKo(text)
    return composed !== text ? composed : null
  }

  /**
   * The conversion to OFFER without being asked (the in-field suggest
   * button). Only the library's conservative heuristic counts here: an
   * uninvited button must be right nearly always, so unlike `decide` this
   * never falls back to "compose the Latin text into Korean" — on an
   * ordinary English field that guess would be wrong far more often than
   * right. Returns null when nothing should be offered.
   */
  function suggestFix(text) {
    return text ? k.fixMistyped(text) : null
  }

  globalThis.kokeyExt = { decide, suggestFix }
})()
