# kokey

[![npm](https://img.shields.io/npm/v/kokey)](https://www.npmjs.com/package/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kokey)](./LICENSE)

Korean ↔ English keyboard layout converter (Dubeolsik ↔ QWERTY).
TypeScript-first, **zero dependencies**, ESM/CJS dual package.

[한국어 문서](./README.ko.md)

Ever typed `dkssud` when you meant `안녕`, or scanned a barcode while the
Korean IME was on and got `ㅇㄴㅁ쇼2068601` instead of `DSATY2068601`?
`kokey` converts between what was typed and what was meant — in both
directions, exactly the way a Dubeolsik IME composes Hangul.

## Install

```sh
npm install kokey
```

Or straight from a CDN — no build step, everything under the `kokey` global:

```html
<script src="https://cdn.jsdelivr.net/npm/kokey/dist/kokey.global.js"></script>
<script>
  kokey.enToKo('dkssud') // '안녕'
  kokey.observe()        // auto-bind every <input data-hangul>
</script>
```

## Usage

```ts
import { koToEn, enToKo } from 'kokey'

// Hangul → the QWERTY keystrokes that produced it
koToEn('안녕')            // 'dkssud'
koToEn('값없는 닭갈비')     // 'rkqtdjqtsms ekfrrkfql'
koToEn('ㅇㄴㅁ쇼2068601')  // 'dsaty2068601' (wedge-scanner rescue)

// QWERTY keystrokes → composed Hangul (full IME automaton)
enToKo('dkssud')          // '안녕'
enToKo('gksrmf')          // '한글'
enToKo('ekfrl')           // '달기' (compound-final split, like a real IME)
```

### Details that matter

- **Shift is honored**: `R` → ㄲ, `r` → ㄱ, `koToEn('뛰다') === 'Enlek'`
- **Compound vowels/finals**: ㅘ ↔ `hk`, ㄵ ↔ `sw`, …
- **받침 넘김 (final-consonant carry-over)**: `enToKo('dkswk') === '안자'`
- **Pass-through**: digits, punctuation, and unmapped letters are left as-is
- Round-trip safe for Korean text: `enToKo(koToEn(s)) === s`

### DOM layer — enforce an input mode

Force an `<input>`/`<textarea>` to a specific mode regardless of the user's
IME state — the field converts as you type, composition-safe, cursor
preserved:

```html
<input data-hangul="ko">  <!-- QWERTY keystrokes compose into Hangul -->
<input data-hangul="en">  <!-- Hangul (IME left on) restored to QWERTY -->
```

```ts
import { bind, observe } from 'kokey'

observe()                    // bind all [data-hangul] now + watch for new ones
const unbind = bind(el, 'en') // or bind a single element explicitly
```

## API

| Function | Signature | Description |
| --- | --- | --- |
| `koToEn` | `(text: string) => string` | Decompose Hangul syllables/jamo into their Dubeolsik QWERTY key sequence |
| `enToKo` | `(text: string) => string` | Compose QWERTY key sequence into Hangul via the standard IME automaton |
| `bind` | `(el, mode?) => unbind` | Enforce a mode on one input/textarea (mode defaults to its `data-hangul` attribute) |
| `observe` | `(root?) => stop` | Bind every `[data-hangul]` under `root` and keep watching via MutationObserver |

Low-level tables (`CHOSUNG`, `JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`,
`KEY_TO_JAMO`) are exported for advanced use.

## Roadmap

- ~~`v0.2` — DOM layer~~ ✅ shipped
- `v0.3` — Vue directive / React hook

## Why not inko?

[inko](https://github.com/738/inko) pioneered this space but has been
unmaintained since 2019 and predates modern TypeScript/ESM packaging.
`kokey` is a from-scratch implementation: typed, tree-shakeable, dual
ESM/CJS, tested against real IME behavior (compound finals, carry-over,
shift handling).

## License

[MIT](./LICENSE) © devslab
