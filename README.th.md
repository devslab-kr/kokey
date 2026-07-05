# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

ตัวแปลงผังแป้นพิมพ์ — กู้คืนข้อความที่พิมพ์ด้วยผังแป้นพิมพ์ผิด
TypeScript-first, **ไม่มี dependency**, ESM/CJS

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · [Ελληνικά](./README.el.md) · **ไทย** · [العربية](./README.ar.md) · [ქართული](./README.ka.md)

เคยพิมพ์ `l;ylfu` ทั้งที่ตั้งใจจะพิมพ์ `สวัสดี` ไหม? หรือสแกนบาร์โค้ด
ตอนที่แป้นพิมพ์ยังเป็นภาษาไทย แล้วได้อักษรไทยแทนตัวเลข? `kokey`
แปลงระหว่าง "สิ่งที่พิมพ์ไป" กับ "สิ่งที่ตั้งใจ" — ได้ทั้งสองทิศทาง
ตรงตามผังแป้นพิมพ์เกษมณี (Kedmanee) ของ Windows ทุกปุ่ม
รวมถึงแถวตัวเลขที่ถูกแทนที่ทั้งแถว (`8` → ค, Shift+2 → ๑)

## การติดตั้ง

```sh
npm install @devslab/kokey
```

## การใช้งาน

```ts
import { thToEn, enToTh } from '@devslab/kokey/th'

thToEn('สวัสดี')    // 'l;ylfu'
enToTh('l;ylfu')   // 'สวัสดี'
enToTh('asdf')     // 'ฟหกด' — แถวเหย้าของเกษมณี

// กู้คืนบาร์โค้ดที่สแกนตอนแป้นพิมพ์เป็นภาษาไทย
thToEn('ค้าขาย2068601')  // '8hk-kp2068601'
```

ตรวจจับชนิดอักษรอัตโนมัติ (ข้อความผสมก็ใช้ได้):

```ts
import { register, toEn } from '@devslab/kokey'
import { th } from '@devslab/kokey/th'

register(th)
toEn('สวัสดี hello 123')  // 'l;ylfu hello 123'
```

## DOM: ช่องกรอกที่แก้ตัวเองได้

```html
<input data-kokey="th">  <!-- การกดแป้นละตินกลายเป็นอักษรไทย -->
<input data-kokey="en">  <!-- อักษรที่ลงทะเบียนไว้ถูกกู้คืนเป็น QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { th } from '@devslab/kokey/th'

register(th)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="th" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

คอมโพเนนต์แปลงค่าภายใน data flow ของเฟรมเวิร์ก ดังนั้น `v-model` /
controlled input จะได้รับค่าที่แปลงแล้วเสมอ

## เอกสารฉบับเต็ม

API ฉบับเต็ม (ทุกผังแป้นพิมพ์, `defineLayout`, hooks, directives) อยู่ใน
[README ภาษาอังกฤษ](./README.md)

## สัญญาอนุญาต

[MIT](./LICENSE) © devslab
