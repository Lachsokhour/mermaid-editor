import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { en, kh } from './translations'

const LS_KEY = 'mermaid-editor-locale'
const LOCALES = { en, kh }

function detectBrowserLocale() {
  try {
    const lang = navigator.language?.split('-')[0]
    if (lang === 'km') return 'kh'
  } catch {}
  return 'en'
}

function loadLocale() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved && LOCALES[saved]) return saved
  } catch {}
  return detectBrowserLocale()
}

function flatten(obj, prefix = '') {
  let result = {}
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? prefix + '.' + key : key
    if (typeof val === 'object' && val !== null) {
      Object.assign(result, flatten(val, k))
    } else {
      result[k] = val
    }
  }
  return result
}

const flatEn = flatten(en)
const flatLocales = {}
for (const [locale, data] of Object.entries(LOCALES)) {
  flatLocales[locale] = flatten(data)
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(loadLocale)

  const setLocale = useCallback((loc) => {
    if (LOCALES[loc]) {
      setLocaleState(loc)
      try { localStorage.setItem(LS_KEY, loc) } catch {}
    }
  }, [])

  const t = useCallback((key, fallback) => {
    if (!key) return fallback ?? key
    const val = flatLocales[locale]?.[key] ?? flatEn[key] ?? fallback ?? key
    return val
  }, [locale])

  useEffect(() => {
    document.documentElement.lang = locale === 'kh' ? 'km' : 'en'
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
