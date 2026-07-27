// Shared translation lookup for tests so assertions track the locale file
// rather than hardcoded copy. Uses the app's i18n instance directly.
import i18n from '../src/i18n'

export const t = i18n.t.bind(i18n)
