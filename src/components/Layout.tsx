import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-svh w-full flex-col text-left">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
            {t('common.logo')}
          </span>
          <span className="text-base font-semibold text-[var(--text-h)]">
            {t('common.appName')}
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--text)] sm:px-10">
        {t('common.footer')}
      </footer>
    </div>
  )
}
