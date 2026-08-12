/**
 * Settings — one place that knows the storage shape, shared by the options
 * page and the content script.
 *
 * `chrome.storage.sync` is used when available so the choice follows the
 * user's profile, falling back to `local` (Firefox private windows and any
 * build without sync). Reads never reject: a storage failure yields the
 * defaults rather than breaking the page the content script sits on.
 */
;(() => {
  /**
   * Firefox's promise-returning namespace is `browser`; its `chrome` alias
   * is callback-style, so `await chrome.storage.sync.get(...)` there yields
   * undefined and every setting silently reads as its default. Chrome has
   * no `browser`, so this picks the promise-based API on both.
   */
  const api = globalThis.browser ?? globalThis.chrome

  const DEFAULTS = {
    /** Show the in-field convert button when a value looks mistyped. */
    suggestButton: true
  }

  const area = () =>
    (api.storage && (api.storage.sync || api.storage.local)) || null

  async function load() {
    const store = area()
    if (!store) return { ...DEFAULTS }
    try {
      const got = await store.get(DEFAULTS)
      return { ...DEFAULTS, ...got }
    } catch {
      return { ...DEFAULTS }
    }
  }

  async function save(patch) {
    const store = area()
    if (!store) return
    try {
      await store.set(patch)
    } catch {
      /* nothing we can do from a content script / options page */
    }
  }

  /** Call `fn` with the new settings whenever any of them change. */
  function subscribe(fn) {
    if (!api.storage?.onChanged) return
    api.storage.onChanged.addListener(() => {
      load().then(fn)
    })
  }

  // `api` is shared so options.js / content.js don't each re-derive it
  globalThis.kokeySettings = { api, DEFAULTS, load, save, subscribe }
})()
