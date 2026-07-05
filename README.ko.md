# kokey

[![npm](https://img.shields.io/npm/v/kokey)](https://www.npmjs.com/package/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kokey)](./LICENSE)

한↔영 자판 변환 라이브러리 (두벌식 ↔ QWERTY).
TypeScript-first, **zero-dependency**, ESM/CJS 듀얼 패키지.

[English docs](./README.md)

`안녕`을 치려다 `dkssud`를 쳐본 적, 한글 IME가 켜진 채 바코드를 스캔해서
`DSATY2068601` 대신 `ㅇㄴㅁ쇼2068601`이 들어온 적 있다면 — `kokey`가
"입력된 것"과 "의도한 것" 사이를 양방향으로 변환합니다. 실제 두벌식 IME의
조합 규칙 그대로.

## 설치

```sh
npm install kokey
```

## 사용법

```ts
import { koToEn, enToKo } from 'kokey'

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

## API

| 함수 | 시그니처 | 설명 |
| --- | --- | --- |
| `koToEn` | `(text: string) => string` | 한글 음절/자모를 두벌식 QWERTY 키 시퀀스로 분해 |
| `enToKo` | `(text: string) => string` | QWERTY 키 시퀀스를 표준 IME 오토마타로 한글 조합 |

저수준 테이블(`CHOSUNG`, `JUNGSUNG`, `JONGSUNG`, `JAMO_TO_KEY`,
`KEY_TO_JAMO`)도 export 됩니다.

## 로드맵

- `v0.2` — DOM 레이어: `<input data-hangul="ko|en">` 입력 강제
  (IME `compositionend` 처리 + 커서 보존), `observe(document)` 자동 바인딩
- `v0.3` — Vue 디렉티브 / React 훅

## inko가 아닌 이유

[inko](https://github.com/738/inko)가 이 영역을 개척했지만 2019년 이후
유지보수가 멈췄고 현대 TypeScript/ESM 패키징 이전 세대입니다. `kokey`는
처음부터 다시 구현했습니다: 타입 지원, tree-shaking, ESM/CJS 듀얼,
실제 IME 동작(겹받침, 받침 넘김, Shift 처리) 기준 테스트.

## 라이선스

[MIT](./LICENSE) © devslab
