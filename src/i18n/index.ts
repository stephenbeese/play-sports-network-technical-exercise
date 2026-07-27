import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'

/**
 * Central i18n setup. English is the source-of-truth catalog; add further
 * locales by dropping a JSON file in `locales/` and registering it below.
 */
export const defaultNS = 'translation'

export const resources = {
  en: { translation: en },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en'],
    defaultNS,
    interpolation: {
      // React already escapes values, so let i18next pass them through.
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n
