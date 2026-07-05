/**
 * IIFE entry — everything under a single `kokey` global for <script> usage.
 * The CDN build ships every layout, pre-registered, so
 * `kokey.toEn('привет안녕')` works with zero setup.
 */
export * from './index'
export * from './layouts/ru'
export * from './layouts/uk'
export * from './layouts/he'
export * from './layouts/el'
export * from './layouts/th'
export * from './layouts/ar'
export * from './layouts/ka'

import { register } from './registry'
import { ru } from './layouts/ru'
import { uk } from './layouts/uk'
import { he } from './layouts/he'
import { el } from './layouts/el'
import { th } from './layouts/th'
import { ar } from './layouts/ar'
import { ka } from './layouts/ka'

register(ru, uk, he, el, th, ar, ka)
