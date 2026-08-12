# Chrome Web Store listing — copy-paste kit

Everything the dashboard asks for, ready to paste. Korean first (primary
locale), English below. AMO reuses the same copy.

---

## 기본 정보 (ko — 기본 언어)

**이름** (45자 이내)

```
kokey — 자판 착오 복원
```

**짧은 설명** (132자 이내)

```
잘못된 자판으로 친 텍스트를 한 번에 복원 — dkssud→안녕, ghbdtn→привет. 우클릭 메뉴 또는 Alt+K. 모든 처리는 로컬에서만.
```

**상세 설명**

```
한/영 키를 안 누르고 쳐서 "dkssud"가 된 적, 한글 IME가 켜진 채 바코드를
스캔해 "ㅇㄴㅁ쇼2068601"이 된 적 있나요? kokey가 "입력된 것"을 "의도한
것"으로 되돌립니다 — 실제 두벌식 IME 조합 규칙 그대로.

사용법
• 입력란에 포커스를 두고 Alt+K — 잘못 친 값이 제자리에서 복원됩니다
  (드래그해둔 부분이 있으면 그 부분만). 단축키는
  chrome://extensions/shortcuts 에서 변경할 수 있습니다.
• 아무 텍스트나 드래그 후 우클릭 → "kokey: fix mistyped text" — 편집할 수
  없는 영역이면 변환 결과를 클립보드에 복사해줍니다.

지원 자판
한국어 두벌식(완전한 IME 오토마타)을 기본으로, 러시아어 ЙЦУКЕН·
우크라이나어·히브리어·그리스어·태국어 Kedmanee·아랍어·조지아어를
자동 감지해 QWERTY로 복원합니다. 라틴 문자는 한국어로 조합합니다.

프라이버시
모든 변환은 브라우저 안에서만 실행됩니다. 네트워크 요청 0, 데이터 수집 0,
외부 전송 0. 오픈소스입니다: https://github.com/devslab-kr/kokey
```

## Listing (en)

**Name**

```
kokey — wrong-layout text fixer
```

**Short description** (≤132 chars)

```
Fix text typed with the wrong keyboard layout — dkssud→안녕, ghbdtn→привет. Right-click or Alt+K. Everything runs locally.
```

**Detailed description**

```
Ever typed "dkssud" when you meant "안녕"? Or "ghbdtn" instead of "привет"?
kokey restores text typed with the wrong keyboard layout — exactly the way
a real IME composes it.

How to use
• Focus a text field and press Alt+K — the mistyped value is fixed in
  place (only the selected part, if you have a selection). Rebind the key
  at chrome://extensions/shortcuts.
• Select any text and right-click → "kokey: fix mistyped text" — for
  non-editable text the conversion is copied to your clipboard.

Layouts
Korean Dubeolsik (full IME automaton) built in, plus auto-detected
restoration for Russian ЙЦУКЕН, Ukrainian, Hebrew, Greek, Thai Kedmanee,
Arabic and Georgian. Latin text composes to Korean.

Privacy
Everything runs inside your browser. Zero network requests, zero data
collection. Open source: https://github.com/devslab-kr/kokey
```

---

## 대시보드 설정값

| 항목 | 값 |
| --- | --- |
| 카테고리 | 생산성 / Productivity (Tools) |
| 기본 언어 | 한국어 |
| 홈페이지 URL | https://devslab-kr.github.io/kokey/ |
| 지원 URL | https://github.com/devslab-kr/kokey/issues |
| 개인정보처리방침 URL | https://devslab-kr.github.io/kokey/privacy.html |
| 스크린샷 | `extension/store/screenshot-1.png`, `screenshot-2.png` (1280×800) |
| 스토어 아이콘 | `extension/icons/icon128.png` |

## 개인정보 보호 탭 — 심사 답변 (그대로 붙여넣기)

**단일 목적 설명 / Single purpose**

```
Convert text typed with the wrong keyboard layout back to the intended
text, on the user's explicit action (context menu click or keyboard
shortcut). 자판을 잘못 두고 친 텍스트를 사용자의 명시적 동작(우클릭 메뉴
또는 단축키)에 한해 의도한 텍스트로 복원합니다.
```

**호스트 권한(`<all_urls>` 콘텐츠 스크립트) 정당화**

```
The extension fixes mistyped text inside input fields on whatever site the
user is typing on, so the content script must be available on all pages.
It runs no logic until the user explicitly triggers it via the context
menu or the keyboard shortcut. All processing is local; the extension
makes no network requests and collects no data.
```

**storage 정당화**

```
Stores the user's own preferences only — whether the in-field convert
button is shown. No browsing data, no page content, nothing about the user
is stored or transmitted; the value is a single boolean kept in the
browser's extension storage.
```

**contextMenus 정당화**

```
Adds the single "fix mistyped text" entry to the right-click menu for
selections and editable fields — one of the two ways the user triggers
the conversion.
```

**데이터 사용 (Data usage disclosure)** — 전 항목 **수집 안 함** 체크.
원격 코드 사용 여부: **아니오** (모든 코드는 패키지에 동봉).

---

## 제출 순서 (요약)

1. `npm run package:extension` → `extension/kokey-extension-v<version>.zip`
2. https://chrome.google.com/webstore/devconsole → 새 항목 → zip 업로드
3. 위 문안 붙여넣기 (기본 언어 한국어 → 영어 번역 추가)
4. 스크린샷 2장 + 아이콘 업로드, 개인정보 탭 답변 입력
5. 공개 범위 "공개" → 심사 제출 (보통 1~3일)
6. AMO는 같은 zip으로 https://addons.mozilla.org/developers/ 에서 제출
   (gecko id는 매니페스트에 이미 있음). minified `kokey.global.js`가 있어
   **소스 zip 제출 필수** — `git archive -o kokey-source-v<version>.zip HEAD`
7. Edge는 https://partner.microsoft.com/dashboard/microsoftedge 에서 같은
   zip으로 제출 (Partner Center 등록 무료, Chromium이라 수정 없음)
8. 네이버 웨일은 https://store.whale.naver.com 개발자 센터에서 같은 zip

### 업데이트 제출 시 (0.7.0~)

`storage` 권한이 추가되어 **모든 스토어가 다시 심사**합니다. 권한 사유는
아래 정당화 문안에 이미 포함돼 있습니다.
