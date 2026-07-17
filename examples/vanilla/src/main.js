import { observe, register } from '@devslab/kokey'
import { ru } from '@devslab/kokey/ru'

// Korean is built in; other layouts are tree-shakeable subpath imports.
register(ru)

// Bind every [data-kokey] input, now and as they appear.
observe()
