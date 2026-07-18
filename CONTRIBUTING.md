# Contributing to kokey

Thanks for your interest! Issues and pull requests are welcome — new keyboard
layouts especially. 이슈·PR 환영합니다 (한국어로 쓰셔도 됩니다).

## Dev setup

```sh
git clone https://github.com/devslab-kr/kokey.git
cd kokey
npm install
npm test          # vitest (automaton + layout round-trips + jsdom + Vue mount)
npm run typecheck
npm run build     # ESM/CJS + dist/kokey.global.js (CDN build)
```

## Adding a layout

A layout is one `defineLayout({ id, script, fromKey })` table (see
`src/layouts/`). Two hard requirements, learned the hard way:

1. **Anchor-verify the table** against a physical-keyboard reference —
   scraped layout charts repeatedly ship off-by-one column slides. Pick a
   few unambiguous anchors (e.g. Thai home row `ฟหกด`, ЙЦУКЕН `.` on `/`,
   Arabic `ذ` on backtick) and assert them in tests.
2. **Round-trip tests**: `fromLatin(toLatin(s)) === s` for representative
   text, including shifted characters and moved punctuation.

Layouts must be deterministic (one keystroke sequence ↔ one text). IMEs with
a candidate-selection step (Chinese pinyin, Japanese kanji) are out of scope
by construction — please don't propose them.

## Guidelines

- Every behavior change needs a test; composition (IME) safety is
  non-negotiable — nothing may touch the input mid-composition.
- `react` is intentionally NOT a devDependency — React adapters share the
  tested `dom.ts` building blocks; Vue components are mount-tested.
- README is localized in 9 languages; for structural changes, updating
  README.md + README.ko.md is enough — mention it and we'll sync the rest.

## Releases

Maintainer-driven via a dispatch workflow — feature PRs don't need to touch
versions, tags, or CHANGELOG headers.
