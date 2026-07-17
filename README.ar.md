# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

محوِّل تخطيطات لوحة المفاتيح — يستعيد النص المكتوب بالتخطيط الخاطئ.
TypeScript-first، **بدون تبعيات**، ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · [ไทย](./README.th.md) · **العربية** · [ქართული](./README.ka.md)

Try it online: [⚡ StackBlitz — Vanilla](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vanilla) · [Vue](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/vue) · [React](https://stackblitz.com/github/devslab-kr/kokey/tree/main/examples/react) | [📦 CodeSandbox](https://codesandbox.io/s/github/devslab-kr/kokey/tree/main/examples/vanilla)

كتبت `lvpfh` وأنت تقصد `مرحبا`؟ نسيت تبديل اللغة فخرجت كلمة السر أو رقم
المنتج حروفًا عربية؟ يحوّل `kokey` بين «ما كُتب» و«ما قُصد» — في الاتجاهين،
بدقة تخطيط Windows «العربية (101)»: ذ على مفتاح `` ` ``، لام-ألف لا على
مفتاح `b`، أشكال الهمزة والتشكيل على طبقة Shift.

## التثبيت

```sh
npm install @devslab/kokey
```

## الاستخدام

```ts
import { arToEn, enToAr } from '@devslab/kokey/ar'

arToEn('مرحبا')    // 'lvpfh'
enToAr('lvpfh')   // 'مرحبا'
enToAr('hgsbl')   // 'السلام' — لام-ألف تُعامل كمفتاح b
```

كشف تلقائي لنوع الكتابة (يعمل مع النص المختلط أيضًا):

```ts
import { register, toEn } from '@devslab/kokey'
import { ar } from '@devslab/kokey/ar'

register(ar)
toEn('مرحبا hello 123')  // 'lvpfh hello 123'
```

## DOM: حقل يُصلح نفسه بنفسه

```html
<input data-kokey="ar">  <!-- الضغطات اللاتينية تتحول إلى نص عربي -->
<input data-kokey="en">  <!-- أي كتابة مسجّلة تُستعاد إلى QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { ar } from '@devslab/kokey/ar'

register(ar)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="ar" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

يجري المكوِّن التحويل داخل تدفق بيانات إطار العمل، لذا تتلقى `v-model` /
الحقول المتحكَّم بها القيمة المحوَّلة دائمًا.

## التوثيق الكامل

وصف الـ API الكامل (كل التخطيطات، `defineLayout`، الـ hooks والـ directives)
في [README الإنجليزي](./README.md).

## الترخيص

[MIT](./LICENSE) © devslab
