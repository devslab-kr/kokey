# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

Конвертер раскладок клавиатуры — восстанавливает текст, набранный не в той
раскладке. TypeScript-first, **без зависимостей**, ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · **Русский** · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md)

Try it online: [⚡ StackBlitz — Vanilla](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vanilla) · [Vue](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vue) · [React](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/react) | [📦 CodeSandbox](https://codesandbox.io/s/github/devslab-kr/kokey/tree/main/examples/vanilla)

Набирали `ghbdtn`, когда хотели написать `привет`? Забыли переключить
раскладку — и получили кириллическую кашу вместо пароля или артикула?
`kokey` преобразует «что набралось» в «что имелось в виду» — в обе стороны,
в точности по раскладке Windows ЙЦУКЕН: буква ё на клавише `` ` ``,
точка на `/`, запятая через Shift, `№` на Shift+3.

## Установка

```sh
npm install @devslab/kokey
```

## Использование

```ts
import { ruToEn, enToRu } from '@devslab/kokey/ru'

ruToEn('привет')   // 'ghbdtn'
enToRu('ghbdtn')   // 'привет'
enToRu('Vjcrdf')   // 'Москва' — регистр учитывается
```

Автоопределение письменности (смешанный текст тоже работает):

```ts
import { register, toEn } from '@devslab/kokey'
import { ru } from '@devslab/kokey/ru'

register(ru)
toEn('привет hello 123')  // 'ghbdtn hello 123'
```

Русская и украинская раскладки различаются автоматически: `привіт`
распознаётся как украинский (буква і), `привет` — как русский.

## DOM: поле, которое чинит себя само

```html
<input data-kokey="ru">  <!-- латинские нажатия становятся русским текстом -->
<input data-kokey="en">  <!-- любая зарегистрированная письменность → QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { ru } from '@devslab/kokey/ru'

register(ru)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="ru" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

Компонент выполняет преобразование внутри потока данных фреймворка, поэтому
`v-model` / controlled-инпуты всегда получают уже преобразованное значение.

## Полная документация

Полное описание API (все раскладки, `defineLayout`, хуки, директивы) —
в [английском README](./README.md).

## Лицензия

[MIT](./LICENSE) © devslab
