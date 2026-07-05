# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

한↔영 자판 변환 라이브러리 (두벌식 ↔ QWERTY).
TypeScript-first, **zero-dependency**, ESM/CJS 듀얼 패키지.

[English docs](./README.md)

`안녕`을 치려다 `dkssud`를 쳐본 적, 한글 IME가 켜진 채 바코드를 스캔해서
`DSATY2068601` 대신 `ㅇㄴㅁ쇼2068601`이 들어온 적 있다면 — `kokey`가
"입력된 것"과 "의도한 것" 사이를 양방향으로 변환합니다. 실제 두벌식 IME의
조합 규칙 그대로.

## 설치

```sh
npm install @devslab/kokey
```

CDN으로 빌드 없이 바로 — 전부 `kokey` 전역 아래에 노출됩니다:

```html
<script src="https://cdn.jsdelivr.net/npm/@devslab/kokey/dist/kokey.global.js"></script>
<script>
  kokey.enToKo('dkssud') // '안녕'
  kokey.observe()        // <input data-hangul> 전부 자동 바인딩
</script>
```

## 사용법

```ts
import { koToEn, enToKo } from '@devslab/kokey'

// 한글 → 그 한글을 만든 QWERTY 키 시퀀스
koToEn('안녕')            // 'dkssud'
koToEn('값없는 닭갈비')     // 'rkqtdjqtsms ekfrrkfql'
koToEn('ㅇㄴㅁ쇼2068601')  // 'dsaty2068601' (스캐너 웨지 입력 복원)

// QWERTY 키 시퀀스 → 조합된 한글 (IME 오토마타 완전 구현)
enToKo('dkssud')          // '안녕'
enToKo('gksrmf')          // '한글'
enToKo('ekfrl')           // '달기' (겹받침 분해 — 실제 IME와 동일)
```

### 디테일

- **Shift 구분**: `R` → ㄲ, `r` → ㄱ, `koToEn('뛰다') === 'Enlek'`
- **겹모음/겹받침**: ㅘ ↔ `hk`, ㄵ ↔ `sw`, …
- **받침 넘김**: `enToKo('dkswk') === '안자'`
- **통과 처리**: 숫자·문장부호·미매핑 문자는 그대로 유지
- 한글 텍스트 왕복 보장: `enToKo(koToEn(s)) === s`

### DOM 레이어 — 입력 모드 강제

사용자 IME 상태와 무관하게 `<input>`/`<textarea>`를 특정 모드로 고정합니다 —
타이핑하는 대로 변환되고, IME 조합 중엔 건드리지 않으며, 커서가 보존됩니다:

```html
<input data-hangul="ko">  <!-- 영타가 한글로 조합됨 -->
<input data-hangul="en">  <!-- 한글 IME가 켜져 있어도 QWERTY로 복원 -->
```

```ts
import { bind, observe } from '@devslab/kokey'

observe()                     // 현재 + 이후 추가되는 [data-hangul] 전부 바인딩
const unbind = bind(el, 'en') // 개별 엘리먼트 명시 바인딩
```

### Vue / React

```vue
<script setup>
import { vHangul } from '@devslab/kokey/vue'
</script>
<template>
  <input v-hangul="'ko'">
</template>
```

```tsx
import { useHangul } from '@devslab/kokey/react'

function Field() {
  return <input ref={useHangul('en')} />
}
```

둘 다 DOM 레이어의 얇은 래퍼입니다 — `vue`/`react`는 optional peer dependency라
코어는 여전히 zero-dependency.

## API

| 함수 | 시그니처 | 설명 |
| --- | --- | --- |
| `koToEn` | `(text: string) => string` | 한글 음절/자모를 두벌식 QWERTY 키 시퀀스로 분해 |
| `enToKo` | `(text: string) => string` | QWERTY 키 시퀀스를 표준 IME 오토마타로 한글 조합 |
| `bind` | `(el, mode?) => unbind` | 인풋 하나에 모드 강제 (mode 생략 시 `data-hangul` 속성값) |
| `observe` | `(root?) => stop` | `root` 아래 `[data-hangul]` 전부 바인딩 + MutationObserver로 감시 |
| `createRefBinder` | `(mode?) => (el \| null) => void` | 프레임워크 무관 ref 콜백 팩토리 (`useHangul`의 코어) |
| `vHangul` | `@devslab/kokey/vue` | Vue 3 디렉티브: `v-hangul="'ko'"` |
| `useHangul` | `@devslab/kokey/react` | ref 콜백을 반환하는 React 훅 |

저수준 테이블(`CHOSUNG`, `JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`,
`KEY_TO_JAMO`)도 export 됩니다.

## 로드맵

- ~~`v0.2` — DOM 레이어~~ ✅ 출시됨
- ~~`v0.3` — Vue 디렉티브 / React 훅~~ ✅ 출시됨

## inko가 아닌 이유

[inko](https://github.com/738/inko)가 이 영역을 개척했지만 2019년 이후
유지보수가 멈췄고 현대 TypeScript/ESM 패키징 이전 세대입니다. `kokey`는
처음부터 다시 구현했습니다: 타입 지원, tree-shaking, ESM/CJS 듀얼,
실제 IME 동작(겹받침, 받침 넘김, Shift 처리) 기준 테스트.

## 라이선스

[MIT](./LICENSE) © devslab
