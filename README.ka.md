# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

კლავიატურის განლაგების გადამყვანი — აღადგენს არასწორი განლაგებით აკრეფილ
ტექსტს. TypeScript-first, **დამოკიდებულებების გარეშე**, ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · **ქართული**

აკრიფეთ `gamarjoba`, როცა გინდოდათ `გამარჯობა`? დაგავიწყდათ ენის
გადართვა და პაროლი ქართული ასოებით გამოვიდა? `kokey` გარდაქმნის
„რაც აიკრიფა" და „რაც იგულისხმებოდა" ერთმანეთში — ორივე მიმართულებით,
ზუსტად Windows-ის „ქართული (QWERTY)" განლაგებით: შვიდი ასო Shift-ის
ფენაზეა (თ შ ღ ჭ ჟ ძ ჩ), დანარჩენი თითქმის ფონეტიკურია.

## ინსტალაცია

```sh
npm install @devslab/kokey
```

## გამოყენება

```ts
import { kaToEn, enToKa } from '@devslab/kokey/ka'

kaToEn('გამარჯობა')    // 'gamarjoba'
enToKa('gamarjoba')   // 'გამარჯობა'
enToKa('Tbilisi')     // 'თბილისი' — Shift-ის ფენა (T → თ)
```

დამწერლობის ავტომატური ამოცნობა (შერეული ტექსტიც მუშაობს):

```ts
import { register, toEn } from '@devslab/kokey'
import { ka } from '@devslab/kokey/ka'

register(ka)
toEn('გამარჯობა hello 123')  // 'gamarjoba hello 123'
```

## DOM: ველი, რომელიც თავს ისწორებს

```html
<input data-kokey="ka">  <!-- ლათინური კლავიშები ქართულად იქცევა -->
<input data-kokey="en">  <!-- ნებისმიერი რეგისტრირებული დამწერლობა → QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { ka } from '@devslab/kokey/ka'

register(ka)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="ka" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

კომპონენტი გარდაქმნას ფრეიმვორკის მონაცემთა ნაკადში ასრულებს, ამიტომ
`v-model` / controlled input ყოველთვის გარდაქმნილ მნიშვნელობას იღებს.

## სრული დოკუმენტაცია

სრული API (ყველა განლაგება, `defineLayout`, hooks, directives) —
[ინგლისურ README-ში](./README.md).

## ლიცენზია

[MIT](./LICENSE) © devslab
