# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

Keyboard layout converter — restore text typed with the wrong layout.
Korean (Dubeolsik ↔ QWERTY) built in; Russian, Ukrainian, Hebrew, Greek,
Thai, Arabic and Georgian available as tree-shakeable subpath imports.
TypeScript-first, **zero dependencies**, ESM/CJS dual package.

**English** · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md) · [Live demo](https://devslab-kr.github.io/kokey/)

Try it online: [⚡ StackBlitz — Vanilla](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vanilla) · [Vue](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vue) · [React](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/react) | [📦 CodeSandbox](https://codesandbox.io/s/github/devslab-kr/kokey/tree/main/examples/vanilla)

<p align="center">
  <a href="https://devslab-kr.github.io/kokey/"><img src="https://raw.githubusercontent.com/devslab-kr/kokey/main/docs/preview.png" alt="kokey demo — dkssud → 안녕, ghbdtn → привет, wrong-layout text restored live" width="720"></a>
</p>

Ever typed `dkssud` when you meant `안녕`, or scanned a barcode while the
Korean IME was on and got `ㅇㄴㅁ쇼2068601` instead of `DSATY2068601`?
`kokey` converts between what was typed and what was meant — in both
directions, exactly the way a Dubeolsik IME composes Hangul.

The same slip exists in every language that toggles a non-Latin layout with
QWERTY: Russians type `ghbdtn` for `привет`, Israelis `akuo` for `שלום`,
Thais scan barcodes with Kedmanee on. `kokey` covers those layouts too —
see [Beyond Korean](#beyond-korean--any-registered-layout).

*Numeric fields in the same form — amounts that need live comma grouping,
a stable caret, and right alignment? That's kokey's sibling,
[numkey](https://github.com/devslab-kr/numkey).*

## Install

```sh
npm install @devslab/kokey
```

Or straight from a CDN — no build step, everything under the `kokey` global:

```html
<script src="https://cdn.jsdelivr.net/npm/@devslab/kokey/dist/kokey.global.js"></script>
<script>
  kokey.enToKo('dkssud')   // '안녕'
  kokey.toEn('привет안녕')  // 'ghbdtndkssud' — the CDN build ships every layout
  kokey.observe()          // auto-bind every <input data-kokey> / <input data-hangul>
</script>
```

## Usage

```ts
import { koToEn, enToKo } from '@devslab/kokey'

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

### Beyond Korean — any registered layout

Each layout is a subpath import (unused ones never reach your bundle) and
plugs into the same machinery:

```ts
import { register, toEn, fromEn } from '@devslab/kokey'
import { ru, ruToEn, enToRu } from '@devslab/kokey/ru'
import { he } from '@devslab/kokey/he'

// direct, per-layout
ruToEn('привет')   // 'ghbdtn'  — the Punto Switcher classic
enToRu('ghbdtn')   // 'привет'

// or register + auto-detect by script, mixed strings included
register(ru, he)
toEn('안녕 привет שלום')  // 'dkssud ghbdtn akuo'
fromEn('ghbdtn', 'ru')    // 'привет'
```

| Layout | Import | Notes |
| --- | --- | --- |
| Korean 두벌식 | built-in (`ko`) | full IME composition automaton |
| Russian ЙЦУКЕН | `@devslab/kokey/ru` | moved punctuation (ё on backtick, №, `.` on `/`) mapped faithfully |
| Ukrainian Enhanced | `@devslab/kokey/uk` | і/є/ї; AltGr-only ґ restored in reverse; ru/uk auto-disambiguated |
| Hebrew | `@devslab/kokey/he` | final forms, swapped brackets, caps-lock safe |
| Greek | `@devslab/kokey/el` | tonos/dialytika dead keys (`;a` → ά), final sigma |
| Thai Kedmanee | `@devslab/kokey/th` | full digit-row remap — barcode rescue works for Thai too |
| Arabic (101) | `@devslab/kokey/ar` | lam-alef لا on `b`, hamza forms, tashkeel |
| Georgian QWERTY | `@devslab/kokey/ka` | near-phonetic (`gamarjoba` ↔ გამარჯობა) |

Languages whose IME needs a candidate-selection step (Chinese pinyin,
Japanese kanji) are out of scope by construction — the keystroke ↔ text
relation there isn't deterministic. Need another deterministic layout?
It's one `defineLayout({ id, script, fromKey })` table —
[PRs welcome](https://github.com/devslab-kr/kokey/pulls).

### DOM layer — enforce an input mode

Force an `<input>`/`<textarea>` to a specific mode regardless of the user's
IME state — the field converts as you type, composition-safe, cursor
preserved:

```html
<input data-kokey="ko">   <!-- QWERTY keystrokes compose into Hangul -->
<input data-kokey="ru">   <!-- QWERTY keystrokes become Russian (register(ru) first) -->
<input data-kokey="en">   <!-- any registered script restored to QWERTY -->
<input data-hangul="ko">  <!-- legacy attribute, still supported -->
```

```ts
import { bind, observe } from '@devslab/kokey'

observe()                    // bind all [data-kokey]/[data-hangul] + watch for new ones
const unbind = bind(el, 'en') // or bind a single element explicitly
```

`data-kokey="en"` shines on invoice/e-mail/ID fields: whatever layout the
user forgot to switch off — Korean, Russian, Thai — the field self-heals to
Latin with no per-language branching.

### Vue / React

For plain (uncontrolled) inputs, the directive/hook:

```vue
<script setup>
import { vKokey } from '@devslab/kokey/vue'
</script>
<template>
  <input v-kokey="'ko'">
  <input v-kokey="'ru'">
</template>
```

```tsx
import { useKokey } from '@devslab/kokey/react'

function Field() {
  return <input ref={useKokey('en')} />
}
```

For `v-model` / controlled inputs, use the `KokeyInput` component — it
converts **inside the framework's data flow**, so your bound state always
holds the converted value (the ref-based bindings mutate the DOM after the
framework reads it, which fights `v-model`/`value=`):

```vue
<script setup>
import { KokeyInput } from '@devslab/kokey/vue'
const name = ref('')
</script>
<template>
  <KokeyInput v-model="name" mode="ko" />
  <KokeyInput v-model="memo" mode="en" as="textarea" />
</template>
```

```tsx
import { KokeyInput } from '@devslab/kokey/react'

function Form() {
  const [v, setV] = useState('')
  return <KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
}
```

All are thin wrappers over the DOM layer — `vue`/`react` are optional peer
dependencies, so the core stays zero-dependency. The legacy `vHangul` /
`useHangul` names still work.

## API

| Function | Signature | Description |
| --- | --- | --- |
| `koToEn` | `(text: string) => string` | Decompose Hangul syllables/jamo into their Dubeolsik QWERTY key sequence |
| `enToKo` | `(text: string) => string` | Compose QWERTY key sequence into Hangul via the standard IME automaton |
| `toEn` | `(text: string) => string` | Restore any registered script to QWERTY, auto-detected per run |
| `fromEn` | `(text, layoutId) => string` | Compose QWERTY keystrokes into the given registered layout |
| `register` | `(...layouts) => void` | Register layouts for `toEn` and the DOM `data-kokey` modes |
| `defineLayout` | `(def) => Layout` | Build a table-driven layout (`{ id, script, fromKey }`) |
| `bind` | `(el, mode?) => unbind` | Enforce a mode on one input/textarea (mode defaults to its `data-kokey`/`data-hangul` attribute) |
| `observe` | `(root?) => stop` | Bind every `[data-kokey]`/`[data-hangul]` under `root` and keep watching via MutationObserver |
| `createRefBinder` | `(mode?) => (el \| null) => void` | Framework-agnostic ref-callback factory (what `useKokey` wraps) |
| `vKokey` | `@devslab/kokey/vue` | Vue 3 directive: `v-kokey="'ko'"` (legacy `vHangul` kept) |
| `KokeyInput` | `@devslab/kokey/vue` · `/react` | Component for `v-model` / controlled inputs (`mode`, `as="input\|textarea"`) |
| `useKokey` | `@devslab/kokey/react` | React hook returning a ref callback (legacy `useHangul` kept) |
| `convert` | `(text, mode) => string` | One-shot conversion for a mode (`'en'` or a layout id) |
| `applyToInput` | `(el, mode) => boolean` | Convert an input's value in place, caret preserved |

Per-layout modules also export direct converters: `ruToEn`/`enToRu`,
`heToEn`/`enToHe`, `thToEn`/`enToTh`, … Low-level Korean tables (`CHOSUNG`,
`JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`, `KEY_TO_JAMO`) are exported for
advanced use.

## Roadmap

- ~~`v0.2` — DOM layer~~ ✅ shipped
- ~~`v0.3` — Vue directive / React hook~~ ✅ shipped
- ~~`v0.4` — multi-layout: ru/uk/he/el/th/ar/ka + `toEn` auto-detection~~ ✅ shipped

## Why not inko?

[inko](https://github.com/738/inko) pioneered this space but has been
unmaintained since 2019 and predates modern TypeScript/ESM packaging.
`kokey` is a from-scratch implementation: typed, tree-shakeable, dual
ESM/CJS, tested against real IME behavior (compound finals, carry-over,
shift handling).

## Contributing

Issues and PRs welcome — new layouts especially. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for the dev setup and the two hard
rules for layout tables (anchor verification + round-trip tests).

## License

[MIT](./LICENSE) © devslab
