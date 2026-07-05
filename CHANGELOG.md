# Changelog

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
