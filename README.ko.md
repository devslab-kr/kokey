# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

자판 오입력 복원 라이브러리 — 잘못된 자판으로 친 텍스트를 되돌립니다.
한국어(두벌식 ↔ QWERTY) 기본 내장, 러시아어·우크라이나어·히브리어·그리스어·
태국어·아랍어·조지아어는 서브패스 import (tree-shaking 지원).
TypeScript-first, **zero-dependency**, ESM/CJS 듀얼 패키지.

[English](./README.md) · **한국어** · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md) · [라이브 데모](https://devslab-kr.github.io/kokey/)

`안녕`을 치려다 `dkssud`를 쳐본 적, 한글 IME가 켜진 채 바코드를 스캔해서
`DSATY2068601` 대신 `ㅇㄴㅁ쇼2068601`이 들어온 적 있다면 — `kokey`가
"입력된 것"과 "의도한 것" 사이를 양방향으로 변환합니다. 실제 두벌식 IME의
조합 규칙 그대로.

같은 실수는 비라틴 자판을 QWERTY와 토글하는 모든 언어권에 존재합니다.
러시아 사람은 `привет` 대신 `ghbdtn`을, 이스라엘 사람은 `שלום` 대신
`akuo`를 칩니다. `kokey`는 그 자판들도 지원합니다 —
[한국어 너머](#한국어-너머--등록된-모든-자판) 참고.

*같은 폼의 숫자 필드 — 실시간 콤마, 안정적인 커서, 오른쪽 정렬이 필요한
금액 인풋이라면? kokey의 형제 [numkey](https://github.com/devslab-kr/numkey)를
보세요.*

## 설치

```sh
npm install @devslab/kokey
```

CDN으로 빌드 없이 바로 — 전부 `kokey` 전역 아래에 노출됩니다:

```html
<script src="https://cdn.jsdelivr.net/npm/@devslab/kokey/dist/kokey.global.js"></script>
<script>
  kokey.enToKo('dkssud')   // '안녕'
  kokey.toEn('привет안녕')  // 'ghbdtndkssud' — CDN 빌드에는 전 자판 내장
  kokey.observe()          // <input data-kokey> / <input data-hangul> 자동 바인딩
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

### 한국어 너머 — 등록된 모든 자판

자판별 모듈은 서브패스 import라 안 쓰는 자판은 번들에 들어가지 않고,
전부 같은 엔진에 연결됩니다:

```ts
import { register, toEn, fromEn } from '@devslab/kokey'
import { ru, ruToEn, enToRu } from '@devslab/kokey/ru'
import { he } from '@devslab/kokey/he'

// 자판별 직접 변환
ruToEn('привет')   // 'ghbdtn'  — Punto Switcher의 그 사례
enToRu('ghbdtn')   // 'привет'

// register 후 스크립트 자동 감지 — 혼합 문자열도 OK
register(ru, he)
toEn('안녕 привет שלום')  // 'dkssud ghbdtn akuo'
fromEn('ghbdtn', 'ru')    // 'привет'
```

| 자판 | import | 비고 |
| --- | --- | --- |
| 한국어 두벌식 | 기본 내장 (`ko`) | IME 조합 오토마타 완전 구현 |
| 러시아어 ЙЦУКЕН | `@devslab/kokey/ru` | 이동된 문장부호(백틱의 ё, №, `/`의 `.`)까지 충실 매핑 |
| 우크라이나어 Enhanced | `@devslab/kokey/uk` | і/є/ї, AltGr 전용 ґ는 역방향 복원, ru/uk 자동 판별 |
| 히브리어 | `@devslab/kokey/he` | 어말형 문자, 괄호 스왑, Caps Lock 안전 |
| 그리스어 | `@devslab/kokey/el` | tonos/dialytika dead key (`;a` → ά), 어말 시그마 |
| 태국어 Kedmanee | `@devslab/kokey/th` | 숫자행까지 전면 재배치 — 태국어 바코드 복원 가능 |
| 아랍어 (101) | `@devslab/kokey/ar` | `b` 키의 lam-alef لا, hamza 형태, tashkeel |
| 조지아어 QWERTY | `@devslab/kokey/ka` | 거의 음성적 배열 (`gamarjoba` ↔ გამარჯობა) |

IME에 후보 선택 단계가 있는 언어(중국어 병음, 일본어 한자)는 키 입력 ↔
텍스트 관계가 결정적이지 않아 원리적으로 지원 대상이 아닙니다. 다른
결정적 자판이 필요하다면 `defineLayout({ id, script, fromKey })` 테이블
하나면 됩니다 — [PR 환영](https://github.com/devslab-kr/kokey/pulls).

### DOM 레이어 — 입력 모드 강제

사용자 IME 상태와 무관하게 `<input>`/`<textarea>`를 특정 모드로 고정합니다 —
타이핑하는 대로 변환되고, IME 조합 중엔 건드리지 않으며, 커서가 보존됩니다:

```html
<input data-kokey="ko">   <!-- 영타가 한글로 조합됨 -->
<input data-kokey="ru">   <!-- 영타가 러시아어로 (register(ru) 필요) -->
<input data-kokey="en">   <!-- 등록된 어떤 스크립트든 QWERTY로 복원 -->
<input data-hangul="ko">  <!-- 기존 속성도 계속 동작 -->
```

```ts
import { bind, observe } from '@devslab/kokey'

observe()                     // [data-kokey]/[data-hangul] 전부 바인딩 + 감시
const unbind = bind(el, 'en') // 개별 엘리먼트 명시 바인딩
```

`data-kokey="en"`은 송장번호/이메일/아이디 필드에 특히 유용합니다 —
사용자가 한국어든 러시아어든 태국어든 어떤 자판을 켜두고 쳐도 필드가
알아서 라틴으로 복원되므로 언어별 분기가 필요 없습니다.

### Vue / React

일반(비제어) 인풋에는 디렉티브/훅을:

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

`v-model` / controlled 인풋에는 `KokeyInput` 컴포넌트를 쓰세요 — 변환이
**프레임워크 데이터 플로우 안에서** 일어나므로 바인딩된 상태가 항상 변환된
값을 갖습니다 (ref 방식은 프레임워크가 값을 읽은 뒤 DOM을 바꾸는 구조라
`v-model`/`value=`와 충돌할 수 있음):

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

전부 DOM 레이어의 얇은 래퍼입니다 — `vue`/`react`는 optional peer dependency라
코어는 여전히 zero-dependency. 기존 `vHangul` / `useHangul` 이름도 유지됩니다.

## API

| 함수 | 시그니처 | 설명 |
| --- | --- | --- |
| `koToEn` | `(text: string) => string` | 한글 음절/자모를 두벌식 QWERTY 키 시퀀스로 분해 |
| `enToKo` | `(text: string) => string` | QWERTY 키 시퀀스를 표준 IME 오토마타로 한글 조합 |
| `toEn` | `(text: string) => string` | 등록된 모든 스크립트를 자동 감지해 QWERTY로 복원 |
| `fromEn` | `(text, layoutId) => string` | QWERTY 키 시퀀스를 지정 자판의 텍스트로 조합 |
| `register` | `(...layouts) => void` | `toEn`·DOM `data-kokey` 모드에 자판 등록 |
| `defineLayout` | `(def) => Layout` | 테이블 기반 자판 정의 (`{ id, script, fromKey }`) |
| `bind` | `(el, mode?) => unbind` | 인풋 하나에 모드 강제 (mode 생략 시 `data-kokey`/`data-hangul` 속성값) |
| `observe` | `(root?) => stop` | `root` 아래 `[data-kokey]`/`[data-hangul]` 전부 바인딩 + MutationObserver로 감시 |
| `createRefBinder` | `(mode?) => (el \| null) => void` | 프레임워크 무관 ref 콜백 팩토리 (`useKokey`의 코어) |
| `vKokey` | `@devslab/kokey/vue` | Vue 3 디렉티브: `v-kokey="'ko'"` (기존 `vHangul` 유지) |
| `KokeyInput` | `@devslab/kokey/vue` · `/react` | `v-model` / controlled 인풋용 컴포넌트 (`mode`, `as="input\|textarea"`) |
| `useKokey` | `@devslab/kokey/react` | ref 콜백을 반환하는 React 훅 (기존 `useHangul` 유지) |
| `convert` | `(text, mode) => string` | 모드 단발 변환 (`'en'` 또는 자판 id) |
| `applyToInput` | `(el, mode) => boolean` | 인풋 값을 커서 보존하며 제자리 변환 |

자판별 모듈은 직접 변환 함수도 export 합니다: `ruToEn`/`enToRu`,
`heToEn`/`enToHe`, `thToEn`/`enToTh`, … 저수준 한국어 테이블(`CHOSUNG`,
`JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`, `KEY_TO_JAMO`)도 export 됩니다.

## 로드맵

- ~~`v0.2` — DOM 레이어~~ ✅ 출시됨
- ~~`v0.3` — Vue 디렉티브 / React 훅~~ ✅ 출시됨
- ~~`v0.4` — 다국어 자판: ru/uk/he/el/th/ar/ka + `toEn` 자동 감지~~ ✅ 출시됨

## inko가 아닌 이유

[inko](https://github.com/738/inko)가 이 영역을 개척했지만 2019년 이후
유지보수가 멈췄고 현대 TypeScript/ESM 패키징 이전 세대입니다. `kokey`는
처음부터 다시 구현했습니다: 타입 지원, tree-shaking, ESM/CJS 듀얼,
실제 IME 동작(겹받침, 받침 넘김, Shift 처리) 기준 테스트.

## 라이선스

[MIT](./LICENSE) © devslab
