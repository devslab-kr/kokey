# Changelog

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
  `<script src="https://cdn.jsdelivr.net/npm/kokey/dist/kokey.global.js">`.
  브라우저 전역 빌드 — CDN `<script>` 한 줄로 사용 가능.
- **Homepage** — live demo at https://devslab-kr.github.io/kokey/
  (GitHub Pages, deployed on every main push).

## 0.1.0 (2026-07-05)

Initial release. / 최초 릴리스.

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
