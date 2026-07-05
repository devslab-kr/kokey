# kokey

[![npm](https://img.shields.io/npm/v/%40devslab%2Fkokey)](https://www.npmjs.com/package/@devslab/kokey)
[![CI](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml/badge.svg)](https://github.com/devslab-kr/kokey/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40devslab%2Fkokey)](./LICENSE)

Μετατροπέας διατάξεων πληκτρολογίου — επαναφέρει κείμενο που πληκτρολογήθηκε
με λάθος διάταξη. TypeScript-first, **χωρίς εξαρτήσεις**, ESM/CJS.

[English](./README.md) · [한국어](./README.ko.md) · [Русский](./README.ru.md) · [Українська](./README.uk.md) · [עברית](./README.he.md) · **Ελληνικά** · [ไทย](./README.th.md) · [العربية](./README.ar.md) · [ქართული](./README.ka.md)

Πληκτρολογήσατε `kalhm;era` ενώ θέλατε `καλημέρα`; Ξεχάσατε να αλλάξετε
γλώσσα και ο κωδικός βγήκε ελληνικά; Το `kokey` μετατρέπει «ό,τι
πληκτρολογήθηκε» σε «ό,τι εννοούσατε» — και προς τις δύο κατευθύνσεις,
ακριβώς όπως η ελληνική διάταξη των Windows: νεκρά πλήκτρα τόνου και
διαλυτικών (`;a` → ά, `:i` → ϊ), τελικό σίγμα στο `w`, ερωτηματικό στο `q`.

## Εγκατάσταση

```sh
npm install @devslab/kokey
```

## Χρήση

```ts
import { elToEn, enToEl } from '@devslab/kokey/el'

elToEn('καλημέρα')    // 'kalhm;era'
enToEl('kalhm;era')   // 'καλημέρα'
enToEl(';v')          // 'ώ' — νεκρό πλήκτρο τόνου
```

Αυτόματη ανίχνευση γραφής (και σε μικτό κείμενο):

```ts
import { register, toEn } from '@devslab/kokey'
import { el } from '@devslab/kokey/el'

register(el)
toEn('καλημέρα hello 123')  // 'kalhm;era hello 123'
```

## DOM: πεδίο που διορθώνεται μόνο του

```html
<input data-kokey="el">  <!-- λατινικά πλήκτρα γίνονται ελληνικά -->
<input data-kokey="en">  <!-- κάθε καταχωρημένη γραφή επανέρχεται σε QWERTY -->
```

```ts
import { observe, register } from '@devslab/kokey'
import { el } from '@devslab/kokey/el'

register(el)
observe()
```

## Vue / React

```vue
<KokeyInput v-model="value" mode="el" />
```

```tsx
<KokeyInput mode="en" value={v} onChange={(e) => setV(e.target.value)} />
```

Το component μετατρέπει μέσα στη ροή δεδομένων του framework, οπότε τα
`v-model` / controlled inputs λαμβάνουν πάντα τη μετατραπείσα τιμή.

## Πλήρης τεκμηρίωση

Το πλήρες API (όλες οι διατάξεις, `defineLayout`, hooks, directives) —
στο [αγγλικό README](./README.md).

## Άδεια

[MIT](./LICENSE) © devslab
