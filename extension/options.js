/**
 * Options page.
 *
 * The shortcut control is browser-dependent, and deliberately so:
 *
 *  - Firefox implements `commands.update()`, so the shortcut can be edited
 *    right here.
 *  - Chrome has no such API — an extension cannot rebind its own command.
 *    The only route is chrome://extensions/shortcuts, which we can open
 *    with `tabs.create` but cannot link to from a page. So on Chrome the
 *    editor is replaced by a button that opens that page.
 *
 * Feature-detecting `chrome.commands.update` (rather than sniffing the
 * browser) is what picks between them.
 */
;(() => {
  const api = globalThis.kokeySettings.api
  const ko = (navigator.language || '').toLowerCase().startsWith('ko')
  const T = ko
    ? {
        suggestLabel: '입력란에 변환 버튼 표시',
        suggestHint:
          '자판을 잘못 두고 친 것으로 보이면 입력란 오른쪽 끝에 작은 "변환" 버튼이 나타납니다. 눌러야만 바뀌고, 저절로 고치지는 않습니다. (비밀번호 입력란은 제외 — 거기서도 단축키는 그대로 동작합니다.)',
        themeLabel: '버튼 색상',
        themeAuto: '자동 (입력란 밝기에 맞춤)',
        themeLight: '밝은 배경용',
        themeDark: '어두운 배경용',
        themeHint:
          '자동은 버튼이 얹히는 입력란의 배경 밝기를 재서 읽기 좋은 쪽을 고릅니다. 페이지의 색을 흉내내지는 않습니다 — 그건 사이트마다 엉뚱한 값을 읽기 쉬워서입니다.',
        shortcutLabel: '단축키',
        shortcutHint: '포커스된 입력란이나 선택한 텍스트를 복원합니다.',
        save: '저장',
        reset: '기본값',
        openShortcuts: '브라우저 단축키 설정 열기',
        chromeHint:
          '이 브라우저는 확장이 단축키를 직접 바꿀 수 없어, 브라우저 설정 페이지에서 변경해야 합니다.',
        saved: '저장했습니다.',
        badShortcut:
          '이 단축키는 쓸 수 없습니다. 예: Alt+K, Ctrl+Shift+Y (수식키가 하나는 필요합니다)',
        resetDone: '기본값(Alt+K)으로 되돌렸습니다.'
      }
    : {
        suggestLabel: 'Show a convert button inside text fields',
        suggestHint:
          'When a value looks mistyped, a small "Fix" button appears at the right edge of the field. It only converts when you click it — nothing is changed on its own. (Password fields are excluded; the keyboard shortcut still works there.)',
        themeLabel: 'Button colour',
        themeAuto: 'Auto (match the field)',
        themeLight: 'For light backgrounds',
        themeDark: 'For dark backgrounds',
        themeHint:
          "Auto measures how light or dark the field under the button is and picks the readable variant. It does not try to copy the page's own colours — that reads the wrong value far too often.",
        shortcutLabel: 'Keyboard shortcut',
        shortcutHint: 'Fixes the focused field, or the selected text.',
        save: 'Save',
        reset: 'Default',
        openShortcuts: "Open the browser's shortcut settings",
        chromeHint:
          "This browser doesn't let an extension rebind its own shortcut, so it has to be changed in the browser's own settings page.",
        saved: 'Saved.',
        badShortcut:
          'That shortcut cannot be used. Try Alt+K or Ctrl+Shift+Y (at least one modifier is required).',
        resetDone: 'Reset to the default (Alt+K).'
      }

  const COMMAND = 'kokey-fix'
  const DEFAULT_SHORTCUT = 'Alt+K'

  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = T[el.dataset.i18n] ?? ''
  }

  const status = document.getElementById('status')
  function say(text, kind) {
    status.textContent = text
    status.className = `status ${kind || ''}`
  }

  // --- suggest button toggle -------------------------------------------
  const suggest = document.getElementById('suggest')
  globalThis.kokeySettings.load().then((s) => {
    suggest.checked = s.suggestButton
  })
  suggest.addEventListener('change', () => {
    globalThis.kokeySettings.save({ suggestButton: suggest.checked })
    say(T.saved, 'ok')
  })

  const theme = document.getElementById('theme')
  globalThis.kokeySettings.load().then((s) => {
    theme.value = s.buttonTheme
  })
  theme.addEventListener('change', () => {
    globalThis.kokeySettings.save({ buttonTheme: theme.value })
    say(T.saved, 'ok')
  })

  // --- shortcut ---------------------------------------------------------
  const canEdit = typeof api.commands?.update === 'function'
  const editor = document.getElementById('editor')
  const deeplink = document.getElementById('deeplink')
  const input = document.getElementById('shortcut')

  async function showCurrent() {
    try {
      const all = await api.commands.getAll()
      const cmd = all.find((c) => c.name === COMMAND)
      input.value = cmd?.shortcut || ''
    } catch {
      /* leave the placeholder */
    }
  }

  if (canEdit) {
    editor.hidden = false
    showCurrent()

    document.getElementById('save').addEventListener('click', async () => {
      const shortcut = input.value.trim()
      try {
        await api.commands.update({ name: COMMAND, shortcut })
        say(T.saved, 'ok')
      } catch {
        // the browser rejects shortcuts without a modifier, and reserved ones
        say(T.badShortcut, 'err')
      }
    })

    document.getElementById('reset').addEventListener('click', async () => {
      try {
        if (typeof api.commands.reset === 'function') {
          await api.commands.reset(COMMAND)
        } else {
          await api.commands.update({
            name: COMMAND,
            shortcut: DEFAULT_SHORTCUT
          })
        }
        await showCurrent()
        say(T.resetDone, 'ok')
      } catch {
        say(T.badShortcut, 'err')
      }
    })
  } else {
    deeplink.hidden = false
    say(T.chromeHint)
    document.getElementById('open').addEventListener('click', () => {
      api.tabs.create({ url: 'chrome://extensions/shortcuts' })
    })
  }
})()
