import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_THEME,
  isDarkTheme,
  isValidTheme,
  THEME_IDS,
  type Theme,
} from './themes'

const STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme')
    if (isValidTheme(current)) return current
  }
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : DEFAULT_THEME
  }
  return DEFAULT_THEME
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.toggleAttribute('data-dark', isDarkTheme(theme))
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage errors (e.g. private mode).
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const index = THEME_IDS.indexOf(prev)
      return THEME_IDS[(index + 1) % THEME_IDS.length]
    })
  }, [])

  return { theme, setTheme, toggleTheme }
}
