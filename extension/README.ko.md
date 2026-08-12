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
- **입력란 변환 버튼** — 값이 자판 착오로 보이면 입력란 오른쪽 끝에 작은
  "변환" 버튼이 뜹니다. 눌러야만 바뀌고 저절로 고치지 않습니다. 비밀번호
  입력란은 제외(거기서도 단축키는 동작). 옵션에서 끌 수 있습니다.

## 옵션

확장 옵션 열기(Firefox는 about:addons → kokey → 설정, Chrome·Edge는
퍼즐 조각 메뉴 → kokey → 옵션):

- **입력란에 변환 버튼 표시** — 기본 켜짐.
- **버튼 색상** — *자동*은 버튼이 얹히는 입력란의 배경 밝기를 재서 읽기 좋은
  kokey 팔레트를 고르고, 결과의 WCAG 명도 대비까지 확인합니다. *밝은
  배경용* / *어두운 배경용*으로 고정할 수도 있습니다. 자동은 페이지의 색을
  **흉내내지 않습니다** — 페이지의 "테마 색"은 디자이너가 말하는 강조색과
  우연히만 상관 있어서, 그걸 사실로 읽으면 안 보이는 버튼이 나갑니다.
- **단축키** — Firefox는 `commands.update()`가 있어 옵션 페이지에서 바로
  변경됩니다. Chrome·Edge는 해당 API가 없어 `chrome://extensions/shortcuts`를
  열어줍니다. 브라우저 판별이 아니라 API 존재 여부로 갈립니다.

## Firefox: 설치 후 사이트 접근 허용

Firefox MV3는 설치만으로 사이트 접근 권한을 주지 않아서, 허용 전까지는
확장이 동작하지 않는 것처럼 보입니다: **about:addons → kokey → 권한 →
"모든 사이트의 데이터 접근"**을 켜주세요. Chrome·Edge는 설치 시 콘텐츠
스크립트가 바로 적용됩니다.

명시적 액션의 변환 순서(`convert.js` 참고): 라이브러리의 `fixMistyped`
휴리스틱 → 등록된 비라틴 스크립트 → QWERTY(`привет` → `ghbdtn`) → 순수
라틴 → 한국어 조합(`dkssud` → `안녕`). 라틴 입력의 타깃 자판 선택은 아직 옵션
페이지에 없습니다 — 그 전까지 라틴 텍스트는 항상 한국어로 조합됩니다.
(입력란 버튼은 이 추측을 아예 하지 않습니다 — `suggest.js` 참고.)

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

## 스토어 제출

```sh
npm run package:extension   # → extension/kokey-extension-v<version>.zip
```

zip에는 런타임 파일만 들어갑니다(하네스/테스트/README 제외). 목록 문안·
권한 정당화·대시보드 입력값은 [store/listing.md](./store/listing.md),
스크린샷은 `store/`, 개인정보 방침은
https://devslab-kr.github.io/kokey/privacy.html 입니다.
