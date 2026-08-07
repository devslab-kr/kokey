# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vanilla)

Конвертер розкладок клавіатури — відновлює текст, набраний не в тій
розкладці. TypeScript-first, **без залежностей**, ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · **Українська** · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md)

Try it online: [⚡ StackBlitz — Vanilla](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vanilla) · [Vue](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vue) · [React](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/react) | [📦 CodeSandbox](https://codesandbox.io/s/github/devslab-kr/kokey/tree/main/examples/vanilla)

Набирали `ghbdsn`, коли хотіли написати `привіт`? Забули перемкнути
розкладку — і замість пароля чи артикула вийшла кирилична каша? `kokey`
перетворює «що набралося» на «що малося на увазі» — в обидва боки, точно за
розкладкою Windows «Українська (розширена)»: і/є/ї на своїх місцях,
апостроф на клавіші `` ` ``, ₴ через Shift.

## Встановлення

```sh
npm install @devslab/kokey
```

## Використання

```ts
import { ukToEn, enToUk } from '@devslab/kokey/uk'

ukToEn('привіт')   // 'ghbdsn'
enToUk('ghbdsn')   // 'привіт'
enToUk("']s")      // 'єїі'
```

Літера ґ доступна лише через AltGr, тому власної латинської клавіші не має —
у зворотному напрямку вона відновлюється як `u`: `ukToEn('ґанок') === 'ufyjr'`.

Автовизначення письма (змішаний текст теж працює):

```ts
import { register, toEn } from '@devslab/kokey'
import { uk } from '@devslab/kokey/uk'

register(uk)
toEn('привіт hello 123')  // 'ghbdsn hello 123'
```

Українська та російська розкладки розрізняються автоматично: `привіт`
розпізнається як українська (літера і), `привет` — як російська.

## DOM: поле, що виправляє себе саме

```html
<input data-kokey="uk">  <!-- латинські натискання стають українським текстом -->
<input data-kokey="en">  <!-- будь-яке зареєстроване письмо → QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { uk } from '@devslab/kokey/uk'

register(uk)
observe()
```

## Vue / React / Svelte / Solid

```vue
<KokeyInput v-model="value" mode="uk" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

Компонент виконує перетворення всередині потоку даних фреймворку, тому
`v-model` / controlled-інпути завжди отримують уже перетворене значення.

У Svelte і Solid — дія/директива `use:kokey` (`@devslab/kokey/svelte`, `/solid`):

```svelte
<input use:kokey={'uk'} />
```

## Повна документація

Повний опис API (усі розкладки, `defineLayout`, хуки, директиви) —
в [англійському README](./README.md).

## Ліцензія

[MIT](./LICENSE) © devslab
