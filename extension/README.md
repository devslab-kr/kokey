# kokey browser extension

Fix wrong-layout text on any site — the [kokey](https://github.com/devslab-kr/kokey)
engine as a Manifest V3 extension. All processing is local; nothing leaves
the browser.

[한국어](./README.ko.md)

## What it does

- **Context menu** — select mistyped text (or right-click inside a field) →
  *"kokey: fix mistyped text"*.
- **Hotkey** — `Alt+K` fixes the focused `<input>`/`<textarea>`: the
  selected range if there is one, the whole value otherwise. Rebind at
  `chrome://extensions/shortcuts`.
- **Non-editable selections** are converted to the clipboard (a toast
  confirms) — the page itself is never rewritten.

Conversion order for an explicit action (see `convert.js`): the library's
`fixMistyped` heuristic first, then any registered non-Latin script →
QWERTY (`привет` → `ghbdtn`), then pure Latin → Korean (`dkssud` → `안녕`).
A per-layout target picker is a planned options page — until then Latin
text always composes to Korean.

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
| `convert.js` | conversion decision for explicit actions (`kokeyExt.decide`) |
| `content.js` | applies the fix to fields / selections, shows the toast |
| `kokey.global.js` | the CDN bundle, copied by the build (gitignored) |

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
