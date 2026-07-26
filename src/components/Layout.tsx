import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh w-full flex-col text-left">
      <header className="border-b border-[var(--border)] px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
            PSN
          </span>
          <span className="text-base font-semibold text-[var(--text-h)]">
            Play Sports Network
          </span>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>

      <footer className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--text)] sm:px-10">
        Play Sports Network — Content performance dashboard
      </footer>
    </div>
  )
}
