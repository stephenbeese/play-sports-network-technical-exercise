export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset'

export interface ThemeOption {
  id: Theme
  label: string
  isDark: boolean
  swatch: string
}

export const THEMES: ThemeOption[] = [
  { id: 'light', label: 'Light', isDark: false, swatch: '#aa3bff' },
  { id: 'dark', label: 'Dark', isDark: true, swatch: '#c084fc' },
  { id: 'ocean', label: 'Ocean', isDark: true, swatch: '#38bdf8' },
  { id: 'forest', label: 'Forest', isDark: false, swatch: '#16a34a' },
  { id: 'sunset', label: 'Sunset', isDark: false, swatch: '#f97316' },
]

export const THEME_IDS = THEMES.map((theme) => theme.id)

export const DEFAULT_THEME: Theme = 'light'

const DARK_THEME_IDS = new Set(
  THEMES.filter((theme) => theme.isDark).map((theme) => theme.id),
)

export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEME_IDS as string[]).includes(value)
}

export function isDarkTheme(theme: Theme): boolean {
  return DARK_THEME_IDS.has(theme)
}
