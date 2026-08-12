# Changelog

## 0.6.0 (2026-08-12)

### Added

- **`bindSuggest`** (`<input data-kokey-suggest>` via `observe()`) — when a
  field's value looks mistyped, a small button appears at its right edge and
  converts it on click. Nothing changes until the click. It offers only what
  `fixMistyped` is confident about, never the "compose this Latin text into
  Korean" guess an explicit `convert(text, 'ko')` will make: an uninvited
  button has to be right nearly always, so `dkssudgktpdy` gets one and a
  bare `dkssud` does not.
  **Styling belongs to the site** — the button carries the class
  `kokey-suggest` and no colours. `{ theme: 'auto' }` is the opt-in for
  contexts with no stylesheet of their own: it measures the *field's* own
  background brightness and picks a readable kokey palette, verifying WCAG
  contrast. It never copies the page's colours; a page's "theme colour" is
  only incidentally related to its accent, and reading it as fact ships
  unreadable controls.
  **변환 제안 버튼** — 값이 자판 착오로 보이면 입력란 오른쪽 끝에 버튼을
  띄우고 누를 때만 변환합니다. 색은 사이트의 CSS(`.kokey-suggest`)가 소유하고,
  자체 스타일시트가 없는 환경만 `theme: 'auto'`로 자동 배색합니다.

This is the button the browser extension shipped in 0.7.0; it now lives in
the library, and the extension consumes it — the extension keeps only what
is genuinely its own policy (which fields qualify, when to bind, and that
it must self-theme because it has no stylesheet on the pages it runs in).
/ 확장에 있던 버튼을 라이브러리로 내리고, 확장은 그것을 소비합니다.

## 0.5.2 (2026-08-09)

Docs-only republish — no code changes. The Roadmap still listed `v0.5` as
planned after it shipped; it is now marked shipped, and the `v0.6` line says
where the browser extension actually stands (built, in `extension/`,
submitted to the Chrome, Firefox and Whale stores, awaiting review).
/ 문서 재배포 — 코드 무변경. 출시된 v0.5가 로드맵에 여전히 예정으로 남아
있던 것을 수정하고, v0.6 확장의 현재 상태(스토어 심사 대기)를 명시합니다.

## 0.5.1 (2026-08-08)

Docs-only republish — no code changes. Runnable `examples/svelte` and
`examples/solid` and their StackBlitz try-online links now appear on the npm
page, so the framework list there matches what 0.5.0 actually shipped.
/ 문서 재배포 — 코드 무변경. Svelte·Solid 예제와 원클릭 실행 링크가 npm
페이지에 반영됩니다.

## 0.5.0 (2026-08-07)

### Added

- **Svelte adapter** (`@devslab/kokey/svelte`) — `use:kokey` action +
  `use:kokeyPaste`. `bind:value` works: the action binds with `resync`, so
  after a conversion it re-dispatches `input` and the binding picks up the
  converted value. Imports nothing from `svelte` — no peer dependency.
  **Svelte 어댑터** — `use:kokey` 액션 + `use:kokeyPaste`. `bind:value`
  동작(변환 후 `input` 재발행으로 재동기화). `svelte` import 없음 —
  peer dependency 자체가 없습니다.
- **Solid adapter** (`@devslab/kokey/solid`) — `use:kokey` directive
  (reactive to a mode signal), `use:kokeyPaste`, and a `useKokey` ref
  factory. `solid-js` is an optional peer dependency.
  **Solid 어댑터** — 모드 시그널에 반응하는 `use:kokey` 디렉티브,
  `use:kokeyPaste`, `useKokey` ref 팩토리. `solid-js`는 optional peer.
- **Paste auto-correction** — `fixMistyped(text)` returns the corrected
  text when a string looks like wrong-layout gibberish (`null` otherwise);
  `bindPaste(el)` / `<input data-kokey-paste>` (via `observe()`) apply it on
  paste, with a cancelable `kokey-paste` CustomEvent as a veto/suggest hook.
  Detection is conservative and Korean-only — composition itself is the
  signal (standalone vowel jamo → mistyped English; fully-recomposing Latin
  words → mistyped Korean; a single word needs ≥3 syllables). ㅋㅋㅋ/ㅠㅠ
  laughter and real text in either language pass through.
  **붙여넣기 자동 교정** — `fixMistyped` / `bindPaste` /
  `data-kokey-paste`. 보수적 한국어 전용 휴리스틱(조합 가능성이 신호),
  취소 가능한 `kokey-paste` 이벤트 훅 제공.
- **`bind(el, mode, { resync })`** — opt-in re-dispatch of `input` after a
  conversion changes the value, for frameworks whose own listeners run
  before the conversion (what the Svelte action uses). Loop-safe because
  conversion is idempotent.
  **`bind` `resync` 옵션** — 변환 후 `input` 재발행(루프 안전).

## 0.4.1 (2026-07-17)

Docs-only republish — no code changes. Runnable `examples/{vanilla,vue,react}`,
StackBlitz / CodeSandbox try-online links in all nine READMEs, and the numkey
sibling cross-link now appear on the npm page.
/ 문서 재배포 — 코드 무변경. examples 3종, 9개 언어 README의 원클릭 실행
링크, numkey 형제 링크가 npm 페이지에 반영됩니다.

## 0.4.0 (2026-07-06)

### Added

- **Multi-layout support** — seven new keyboard layouts as tree-shakeable
  subpath imports, each with faithful punctuation/shift handling and
  round-trip tests against the Windows reference layouts:
  `@devslab/kokey/ru` (Russian ЙЦУКЕН), `/uk` (Ukrainian Enhanced),
  `/he` (Hebrew), `/el` (Greek, tonos/dialytika dead keys), `/th`
  (Thai Kedmanee, full digit-row remap), `/ar` (Arabic 101, lam-alef +
  tashkeel), `/ka` (Georgian QWERTY).
  **다국어 자판 지원** — 서브패스 import 7종 (러시아어·우크라이나어·
  히브리어·그리스어·태국어·아랍어·조지아어), Windows 표준 배열 기준
  왕복 테스트 포함.
- **`register` / `toEn` / `fromEn`** — layout registry with per-run script
  auto-detection: `toEn('안녕 привет')` → `'dkssud ghbdtn'`. Layouts sharing
  a script (ru/uk) are disambiguated by character coverage.
  자판 registry + 스크립트 자동 감지. 같은 문자권(ru/uk)은 커버리지로 판별.
- **`defineLayout`** — public helper to build custom table-driven layouts
  (`{ id, script, fromKey }`), with greedy multi-key matching (dead keys,
  lam-alef) and automatic reverse-table derivation.
  커스텀 자판 정의 헬퍼 (dead key·다문자 시퀀스 지원).
- **`data-kokey` attribute** — DOM layer generalized: `data-kokey="ru"`
  enforces any registered layout, `data-kokey="en"` restores whatever
  registered script was mistyped. `data-hangul` keeps working.
  DOM 레이어 일반화 — `data-hangul`도 계속 동작.
- **`vKokey` / `useKokey`** — generalized Vue directive & React hook;
  `vHangul` / `useHangul` kept as aliases.
  일반화된 Vue 디렉티브·React 훅; 기존 이름은 별칭으로 유지.
- **`KokeyInput` component (Vue & React)** — converts inside the framework's
  data flow, so `v-model` / controlled inputs receive the converted value
  (the ref/directive bindings mutate the DOM after the framework reads it).
  Props: `mode`, `as="input|textarea"`. IME-composition-safe.
  **`KokeyInput` 컴포넌트** — `v-model`/controlled 인풋용. 변환이 데이터
  플로우 안에서 일어나 상태가 항상 변환된 값을 가짐.
- **`convert(text, mode)` / `applyToInput(el, mode)`** — the DOM layer's
  building blocks exported for custom integrations.
  커스텀 통합용 저수준 헬퍼 export.
- **CDN global build** now ships every layout pre-registered —
  `kokey.toEn('привет안녕')` works with zero setup.
  CDN 빌드에는 전 자판이 사전 등록됨.

- **Localized READMEs** — README.ru/uk/he/el/th/ar/ka.md, each opening with
  that language's own wrong-layout example (`ghbdtn`, `akuo`, `l;ylfu`, …)
  and linking to the English README for the full API; language switcher row
  in every README.
  **다국어 README** — 지원 언어 7종 각각의 대표 사례로 시작하는 현지어 문서.
- **Multilingual demo site** — 9-language switcher (auto-detected from
  `navigator.language`, persisted, RTL for he/ar) plus new demo fields for
  `data-kokey="ru"` and the auto-restoring `data-kokey="en"`.
  **데모 사이트 다국어화** — 9개 언어 스위처, RTL 지원, 자동 감지.

### Changed

- npm `homepage` now points to the live demo
  (https://devslab-kr.github.io/kokey/) instead of the GitHub README.
  npm 홈페이지 링크를 라이브 데모로 변경.

## 0.3.0 (2026-07-05)

### Added

- **`@devslab/kokey/vue`** — Vue 3 directive `vHangul` (`v-hangul="'ko'"`, or
  mode from the `data-hangul` attribute). Vue 3 디렉티브.
- **`@devslab/kokey/react`** — `useHangul(mode?)` hook returning a ref callback.
  ref 콜백을 반환하는 React 훅.
- **`createRefBinder(mode?)`** — framework-agnostic ref-callback factory in
  the core (what `useHangul` wraps). 프레임워크 무관 ref 콜백 팩토리.
- `vue` / `react` are **optional peer dependencies** — the core stays
  zero-dependency. 코어는 여전히 zero-dependency.

## 0.2.0 (2026-07-05)

### Added

- **DOM layer** — `bind(el, mode?)` and `observe(root?)` enforce an input
  mode on `<input data-hangul="ko|en">` regardless of IME state.
  Composition-safe (never touches the value mid-IME-composition), cursor
  preserved via prefix conversion.
  **DOM 레이어** — IME 상태와 무관하게 인풋 모드 강제. 조합 중 미개입,
  커서 보존.
- **Browser global build** — `dist/kokey.global.js` (IIFE, minified) with
  `unpkg`/`jsdelivr` fields, usable via
  `<script src="https://cdn.jsdelivr.net/npm/@devslab/kokey/dist/kokey.global.js">`.
  브라우저 전역 빌드 — CDN `<script>` 한 줄로 사용 가능.
- **Homepage** — live demo at https://devslab-kr.github.io/kokey/
  (GitHub Pages, deployed on every main push).

## 0.1.0 (2026-07-05)

Initial release, published as **`@devslab/kokey`** — npm's name-similarity
rule blocks the unscoped name `kokey` (too similar to `hdkey`).
최초 릴리스, **`@devslab/kokey`** 로 발행 — unscoped `kokey`는 npm 유사 이름
규칙(`hdkey`와 유사)에 걸려 사용 불가.

### Added

- `koToEn(text)` — decompose Hangul syllables/jamo into their Dubeolsik QWERTY
  key sequence. Shift-aware (ㄲ→`R`, ㄱ→`r`), compound jamo supported (ㅘ→`hk`,
  ㄵ→`sw`), unmapped characters pass through.
  한글 음절/자모를 두벌식 QWERTY 키 시퀀스로 분해. Shift 구분, 겹자모 지원,
  미매핑 문자 통과.
- `enToKo(text)` — compose QWERTY keystrokes into Hangul via the standard IME
  automaton: compound vowels/finals, final-consonant carry-over (받침 넘김)
  including compound-final splitting (`ekfrl` → 달기). Round-trip safe:
  `enToKo(koToEn(s)) === s` for Korean text.
  QWERTY 입력을 표준 IME 오토마타로 한글 조합: 겹모음/겹받침, 받침 넘김(겹받침
  분해 포함). 한글 텍스트 왕복 보장.
- Low-level tables exported: `CHOSUNG`, `JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`,
  `KEY_TO_JAMO`.
- Zero dependencies, ESM/CJS dual package (tsup), strict TypeScript, 15 vitest
  tests, CI + tag-triggered npm publish with provenance.
