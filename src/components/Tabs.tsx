import { useTranslation } from 'react-i18next'

type Tab = 'table' | 'charts'

interface TabsProps {
  value: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'table', labelKey: 'tabs.table' },
  { id: 'charts', labelKey: 'tabs.charts' },
]

export function Tabs({ value, onChange }: TabsProps) {
  const { t } = useTranslation()
  return (
    <div
      role="tablist"
      aria-label={t('tabs.ariaLabel')}
      className="mb-6 inline-flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1 shadow-sm"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-xl border-b-2 px-5 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text)] hover:bg-[var(--social-bg)] hover:text-[var(--text-h)]'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        )
      })}
    </div>
  )
}
