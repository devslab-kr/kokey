# kokey 브라우저 확장

어느 사이트에서든 자판 착오 텍스트를 복원 — [kokey](https://github.com/devslab-kr/kokey)
엔진의 Manifest V3 확장판. 모든 처리는 로컬이며 브라우저 밖으로 아무것도
나가지 않습니다.

[English](./README.md)

## 하는 일

- **컨텍스트 메뉴** — 잘못 친 텍스트를 드래그(또는 입력란에서 우클릭) →
  *"kokey: fix mistyped text / 자판 착오 복원"*.
- **단축키** — `Alt+K`가 포커스된 `<input>`/`<textarea>`를 복원합니다:
  선택 범위가 있으면 그 부분만, 없으면 값 전체. 재바인딩은
  `chrome://extensions/shortcuts`.
- **편집 불가 영역의 선택**은 변환 결과를 클립보드로 복사합니다(토스트로
  안내) — 페이지 자체는 건드리지 않습니다.

명시적 액션의 변환 순서(`convert.js` 참고): 라이브러리의 `fixMistyped`
휴리스틱 → 등록된 비라틴 스크립트 → QWERTY(`привет` → `ghbdtn`) → 순수
라틴 → 한국어 조합(`dkssud` → `안녕`). 자판별 타깃 선택은 옵션 페이지로
예정 — 그 전까지 라틴 텍스트는 항상 한국어로 조합됩니다.

v1 범위 밖: `contenteditable` 에디터(Gmail, Notion 등) — 당분간은
선택-클립보드 경로로 대응합니다.

## 로컬에서 띄우기

```sh
npm run build:extension   # dist/ 빌드 후 kokey.global.js를 이 폴더로 복사
```

그다음 `chrome://extensions` → **개발자 모드** 켜기 → **압축해제된 확장
프로그램을 로드합니다** → 이 `extension/` 폴더 선택. Firefox는
`about:debugging` → *This Firefox* → *Load Temporary Add-on* →
`manifest.json` 선택.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `manifest.json` | MV3 매니페스트 (Chrome 서비스 워커 + Firefox 이벤트 스크립트) |
| `background.js` | 컨텍스트 메뉴 등록, 단축키 → 메시지 릴레이 |
| `convert.js` | 명시적 액션의 변환 결정 (`kokeyExt.decide`) |
| `content.js` | 필드/선택 텍스트에 적용, 토스트 표시 |
| `kokey.global.js` | CDN 번들, 빌드가 복사 (gitignore 대상) |

`content.test.ts`가 실제 `convert.js` + `content.js`를 `chrome.runtime`
스텁과 함께 메인 vitest 스위트에서 구동합니다.
