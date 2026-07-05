# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

ממיר פריסות מקלדת — משחזר טקסט שהוקלד בפריסה הלא נכונה.
TypeScript-first, **ללא תלויות**, ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · **עברית** · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md)

הקלדתם `akuo` כשהתכוונתם ל־`שלום`? שכחתם להחליף שפה וקיבלתם ג'יבריש
בעברית במקום סיסמה או מק"ט? `kokey` ממיר בין "מה שהוקלד" ל"מה שהתכוונתם" —
בשני הכיוונים, בדיוק לפי הפריסה העברית הסטנדרטית של Windows: אותיות
סופיות (ך ם ן ף ץ), סוגריים מוחלפים, נקודה על מקש `/`.

## התקנה

```sh
npm install @devslab/kokey
```

## שימוש

```ts
import { heToEn, enToHe } from '@devslab/kokey/he'

heToEn('שלום')   // 'akuo'
enToHe('akuo')   // 'שלום'
enToHe('AKUO')   // 'שלום' — בטוח גם עם Caps Lock
```

זיהוי כתב אוטומטי (גם טקסט מעורב):

```ts
import { register, toEn } from '@devslab/kokey'
import { he } from '@devslab/kokey/he'

register(he)
toEn('שלום hello 123')  // 'akuo hello 123'
```

## DOM: שדה שמתקן את עצמו

```html
<input data-kokey="he">  <!-- הקשות לטיניות הופכות לעברית -->
<input data-kokey="en">  <!-- כל כתב רשום משוחזר ל־QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { he } from '@devslab/kokey/he'

register(he)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="he" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

הקומפוננטה ממירה בתוך זרימת הנתונים של הפריימוורק, ולכן `v-model` /
controlled inputs תמיד מקבלים את הערך המומר.

## תיעוד מלא

תיעוד ה־API המלא (כל הפריסות, `defineLayout`, hooks, directives) —
ב־[README באנגלית](./README.md).

## רישיון

[MIT](./LICENSE) © devslab
