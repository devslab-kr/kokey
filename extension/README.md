# kokey browser extension

Fix wrong-layout text on any site — the [kokey](https://github.com/devslab-kr/kokey)
engine as a Manifest V3 extension. All processing is local; nothing leaves
the browser.

Install: **[Chrome Web Store](https://chromewebstore.google.com/detail/kokey-%E2%80%94-wrong-layout-text/behceldadncjkojneillkiiilldmihln)** · **[Firefox Add-ons](https://addons.mozilla.org/firefox/addon/kokey-wrong-layout-text-fixer/)** ·
**[Naver Whale](https://store.whale.naver.com/detail/mgenmihaioegdmifaelfhhdgfonbnchm)**. Edge is on hold — see
[store/listing.md](./store/listing.md).

The extension has its **own version track**, unrelated to the library's npm
version.

[한국어](./README.ko.md)

## What it does

- **Context menu** — select mistyped text (or right-click inside a field) →
  *"kokey: fix mistyped text"*.
- **Hotkey** — `Alt+K` fixes the focused `<input>`/`<textarea>`: the
  selected range if there is one, the whole value otherwise. Rebind at
  `chrome://extensions/shortcuts`.
- **Non-editable selections** are converted to the clipboard (a toast
  confirms) — the page itself is never rewritten.
- **In-field convert button** — when a value looks mistyped, a small "Fix"
  button appears at the right edge of the field. It only converts when
  clicked; nothing changes on its own. Password fields are excluded (the
  shortcut still works there). Turn it off in the options page.

## Options

Open the extension's options (about:addons → kokey → Preferences on
Firefox; the puzzle-piece menu → kokey → Options on Chrome/Edge):

- **Show a convert button inside text fields** — on by default.
- **Button colour** — *Auto* measures how light or dark the field under the
  button is and picks the readable kokey palette, checking the WCAG contrast
  of the result; *For light backgrounds* / *For dark backgrounds* pin it.
  Auto deliberately does **not** copy the page's own colours: a page's
  "theme colour" is only incidentally related to what a designer would call
  its accent, and reading it as fact ships unreadable controls.
- **Keyboard shortcut** — Firefox implements `commands.update()`, so the
  shortcut is editable right in the options page. Chromium browsers have no
  such API, so the page opens `chrome://extensions/shortcuts` instead. The
  page feature-detects rather than sniffing the browser.

## Firefox: grant site access after installing

Firefox MV3 does **not** grant host access at install time, so the
extension appears to do nothing until you allow it: **about:addons → kokey
→ Permissions → "Access your data for all websites"**. Chrome and Edge
grant the content script at install.

Conversion order for an explicit action (see `convert.js`): the library's
`fixMistyped` heuristic first, then any registered non-Latin script →
QWERTY (`привет` → `ghbdtn`), then pure Latin → Korean (`dkssud` → `안녕`).
Choosing the target layout for Latin input is not in the options page yet —
until then Latin text always composes to Korean. (The in-field button never
makes that guess; see `suggest.js`.)

Out of scope for v1: `contenteditable` editors (Gmail, Notion, …) — the
selection-to-clipboard path covers them for now.

## Load it locally

```sh
npm run build:extension   # builds dist/ and copies kokey.global.js in here
```

Then `chrome://extensions` → enable **Developer mode** → **Load unpacked**
→ pick this `extension/` folder. Firefox: `about:debugging` → *This
Firefox* → *Load Temporary Add-on* → pick `manifest.json`.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | MV3 manifest (Chrome service worker + Firefox event script) |
| `background.js` | context-menu registration, hotkey → message relay |
| `settings.js` | storage shape shared by the options page and content scripts |
| `convert.js` | conversion decision for explicit actions (`kokeyExt.decide`) |
| `content.js` | applies the fix to fields / selections, shows the toast |
| `suggest.js` | which fields get the library's suggest button, and when |
| `options.html` / `options.js` | the options page |
| `kokey.global.js` | the CDN bundle, copied by the build (gitignored) |

Every script reaches the extension APIs through
`globalThis.browser ?? globalThis.chrome` — Firefox's `chrome` alias is
callback-style, so an awaited `chrome.storage.sync.get()` there resolves to
`undefined` and every setting would silently read as its default.

`content.test.ts` runs the real `convert.js` + `content.js` against a
stubbed `chrome.runtime` in the main vitest suite.

## Store submission

```sh
npm run package:extension   # → extension/kokey-extension-v<version>.zip
```

The zip contains runtime files only (no harness/tests/READMEs). Listing
copy, permission justifications and dashboard values are in
[store/listing.md](./store/listing.md); screenshots in `store/`; privacy
policy at https://devslab-kr.github.io/kokey/privacy.html.
