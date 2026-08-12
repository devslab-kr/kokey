/**
 * Content script — receives 'kokey-fix' from the background worker and
 * fixes either the focused <input>/<textarea> (selection if there is one,
 * whole value otherwise) or, for a non-editable selection, copies the
 * converted text to the clipboard. contenteditable editors are out of scope
 * for v1 — they fall through to the clipboard path.
 */
;(() => {
  const { decide } = globalThis.kokeyExt
  const api = globalThis.kokeySettings.api

  const ko = (navigator.language || '').toLowerCase().startsWith('ko')
  const MSG = {
    nothing: ko ? 'kokey: 변환할 내용이 없어요' : 'kokey: nothing to convert',
    copied: ko
      ? 'kokey: 변환 결과를 클립보드에 복사했어요'
      : 'kokey: converted text copied to clipboard',
    copyFailed: ko
      ? 'kokey: 클립보드에 복사하지 못했어요'
      : 'kokey: could not copy to clipboard'
  }

  let toastEl = null
  let toastTimer = 0
  function toast(text) {
    if (!document.body) return
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.setAttribute('role', 'status')
      toastEl.style.cssText =
        'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);' +
        'z-index:2147483647;max-width:80vw;padding:10px 16px;' +
        'border-radius:999px;background:rgba(23,23,23,.92);color:#fafafa;' +
        'border:1px solid rgba(255,255,255,.14);' +
        'font:13px/1.4 system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25);' +
        'opacity:0;transition:opacity .15s ease;pointer-events:none;' +
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis'
      document.body.appendChild(toastEl)
    }
    toastEl.textContent = text
    toastEl.style.opacity = '1'
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      if (toastEl) toastEl.style.opacity = '0'
    }, 2200)
  }

  function isTextField(el) {
    if (!el) return false
    if (el instanceof HTMLTextAreaElement) return true
    if (!(el instanceof HTMLInputElement)) return false
    // selectionStart throws on email/number etc.; text-ish types only
    return ['text', 'search', 'url', 'tel', 'password', ''].includes(el.type)
  }

  function fixField(el) {
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start !== null && end !== null && end > start) {
      const fixed = decide(el.value.slice(start, end))
      if (fixed === null) return false
      el.value = el.value.slice(0, start) + fixed + el.value.slice(end)
      const caret = start + fixed.length
      el.setSelectionRange(caret, caret)
    } else {
      const fixed = decide(el.value)
      if (fixed === null) return false
      el.value = fixed
      el.setSelectionRange(fixed.length, fixed.length)
    }
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }

  function fixSelection() {
    const fixed = decide(String(document.getSelection() ?? ''))
    if (fixed === null) {
      toast(MSG.nothing)
      return
    }
    navigator.clipboard
      .writeText(fixed)
      .then(() => toast(MSG.copied))
      .catch(() => toast(MSG.copyFailed))
  }

  api.runtime.onMessage.addListener((msg) => {
    if (msg?.type !== 'kokey-fix') return
    const el = document.activeElement
    if (isTextField(el)) {
      if (!fixField(el)) toast(MSG.nothing)
    } else {
      fixSelection()
    }
  })
})()
