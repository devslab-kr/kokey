/**
 * Suggest button, extension side.
 *
 * The button itself now lives in the library (`kokey.bindSuggest`), which
 * ships in the bundle this extension already loads — so what is left here
 * is only the part that is genuinely extension policy:
 *
 *  - WHICH fields get one. A site opts in per field with
 *    `data-kokey-suggest`; an extension has no markup to read, so it decides
 *    for itself: text-ish inputs and textareas, never password fields (the
 *    keyboard shortcut still works there — an uninvited control hovering
 *    over a password box is not something a user asked for).
 *  - WHEN to bind. Binding every field on every page would be wasteful, so
 *    fields are bound lazily on first focus and remembered.
 *  - The `theme: 'auto'` choice, because the extension has no stylesheet on
 *    the pages it runs in and cannot ask the site to style `.kokey-suggest`.
 *
 * The user's own preference (on/off, colour) comes from the options page.
 */
;(() => {
  const OVERLAY_TYPES = ['text', 'search', 'url', 'tel', '']

  const bound = new WeakMap() // field -> unbind
  let enabled = true
  let theme = 'auto'

  function eligible(el) {
    if (!el) return false
    if (el instanceof HTMLTextAreaElement) return true
    if (!(el instanceof HTMLInputElement)) return false
    return OVERLAY_TYPES.includes(el.type) // note: password excluded
  }

  function attach(el) {
    if (!enabled || bound.has(el) || !eligible(el)) return
    // 'site' would leave the button unstyled — there is no site stylesheet
    // to pick it up here, so the extension always themes it.
    bound.set(el, kokey.bindSuggest(el, { theme: theme === 'site' ? 'auto' : theme }))
  }

  function detachAll() {
    // WeakMap has no iteration; unbinding is per-field on the next focus,
    // so instead we hide by unbinding what we can reach right now
    for (const el of document.querySelectorAll('input, textarea')) {
      const unbind = bound.get(el)
      if (unbind) {
        unbind()
        bound.delete(el)
      }
    }
  }

  document.addEventListener('focusin', (e) => attach(e.target), true)

  globalThis.kokeySuggest = {
    setEnabled(on) {
      enabled = on
      if (!on) detachAll()
      else if (eligible(document.activeElement)) attach(document.activeElement)
    },
    setTheme(next) {
      if (next === theme) return
      theme = next
      detachAll() // re-bound with the new palette on next focus
      if (eligible(document.activeElement)) attach(document.activeElement)
    },
    // test seams
    _attach: attach,
    _button: () => document.querySelector('.kokey-suggest')
  }

  globalThis.kokeySettings.load().then((s) => {
    enabled = s.suggestButton
    theme = s.buttonTheme
    if (eligible(document.activeElement)) attach(document.activeElement)
  })
  globalThis.kokeySettings.subscribe((s) => {
    globalThis.kokeySuggest.setTheme(s.buttonTheme)
    globalThis.kokeySuggest.setEnabled(s.suggestButton)
  })
})()
