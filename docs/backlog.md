# Backlog — considered, not committed

Ideas that came up for kokey, with the reasoning. The [Roadmap](../README.md#roadmap)
holds only what is shipped or actively being built; this file holds
everything else, so the same discussion doesn't get re-run and so
contributors can see what's wanted before opening a PR.

kokey를 두고 검토한 항목과 그 근거입니다. README 로드맵에는 출시됐거나
진행 중인 것만 두고, 나머지는 여기 적어 같은 논의를 반복하지 않도록 합니다.

**Last reviewed: 2026-08-09.** Signal at that point: **0 issues** ever
opened, ~23 npm downloads/week. Nothing below was requested by a user —
they are all our own ideas, which is exactly why they are not on the
roadmap. / 이슈 0건, 주간 다운로드 23. 아래는 전부 사용자 요청이 아니라
우리 아이디어이므로 로드맵에 올리지 않았습니다.

## Candidate layouts

Adding a layout is cheap — one `defineLayout({ id, script, fromKey })`
table plus anchor verification and round-trip tests (see
[CONTRIBUTING](../CONTRIBUTING.md)) — and each one brings its own audience
and search terms. Best value per unit of work.
자판 추가는 테이블 하나면 되고, 개당 사용자층과 검색 유입이 붙습니다.

| Layout | Why | Notes |
| --- | --- | --- |
| Persian (fa) | Same class as the Arabic/Hebrew layouts already shipped; large user base | Watch for the shared Arabic script range in `toEn` auto-detection — ar/fa will need coverage-based disambiguation the way ru/uk already do |
| Hindi InScript (Devanagari) | Deterministic; India is a market the team already looks at | Own script range, so detection is unambiguous |
| Bulgarian БДС | A completely different arrangement from ЙЦУКЕН, so the Russian layout does **not** cover it | Shares the Cyrillic range with ru/uk — same disambiguation path |

## Deliberately NOT doing

- **Turkish (Q / F)** — Latin ↔ Latin. `toEn`'s auto-detection works by
  script range, so it cannot tell which side a Latin string is on. It
  would need an explicit-mode-only exception to the whole detection model,
  which is a bigger design change than the layout itself is worth.
  / 터키어는 라틴↔라틴이라 스크립트 기반 자동 감지가 원리적으로 불가능 —
  명시 모드 전용 예외가 필요해 자판 하나 값어치를 넘어섭니다.
- **Chinese / Japanese** — the IME needs a candidate-selection step, so the
  keystroke ↔ text relation is not deterministic. Out of scope by
  construction (also stated in the README).
  / 후보 선택 단계가 있어 키 입력 ↔ 텍스트가 결정적이지 않음.

## Browser extension follow-ups

Held until the extension is actually live in the stores — it is submitted
to Chrome, Firefox and Whale and awaiting review, and store feedback may
reorder these. (Note the extension has its own version track: 0.7.0, not
the library's.) Recorded in [extension/README.md](../extension/README.md) too.
스토어에 실제로 올라간 뒤로 미룸 — 심사 결과가 우선순위를 바꿀 수 있음.
확장은 라이브러리와 별개 버전 트랙(0.7.0)임에 유의.

- Target layout for Latin input — the options page exists as of 0.7.0, but
  Latin text still always composes to Korean (`extension/convert.js`). The
  in-field suggest button deliberately never makes that guess at all.
- `contenteditable` support (Gmail, Notion) — currently falls through to
  the clipboard path
- `_locales` for a localized store listing

## numkey-side idea that touches kokey

None. The two libraries deliberately share no runtime code — see the
sibling repo's [backlog](https://github.com/devslab-kr/numkey/blob/main/docs/backlog.md).

## The rule we're applying

With zero issues and low download numbers, more features will not move
anything — discovery is the bottleneck, not capability. Wait for a real
request, then build. An idea sitting in this file is not a promise.
이슈 0건·낮은 다운로드 상황에서 기능을 더 얹어도 지표는 안 움직입니다.
실제 요청이 오면 그때 만듭니다. 여기 적힌 항목은 약속이 아닙니다.
