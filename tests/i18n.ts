// Shared translation lookup for tests so assertions track the locale file
// rather than hardcoded copy. Standalone (no i18next) so it loads under both
// vitest and Playwright's node config loader — importing the app's i18n pulls
// in a JSON import that node rejects without an import attribute.
import en from '../src/i18n/locales/en.json' with { type: 'json' }

// ponytail: minimal {{var}} interpolation — the only i18next feature our
// assertions use. Add richer formatting only if a test needs it.
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const value = key.split('.').reduce<unknown>((node, part) => {
    return node && typeof node === 'object'
      ? (node as Record<string, unknown>)[part]
      : undefined
  }, en)
  if (typeof value !== 'string') {
    throw new Error(`Missing or non-string translation key: ${key}`)
  }
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) => String(vars[name] ?? ''))
}
