type Tab = 'table' | 'charts'

interface TabsProps {
  value: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'table', label: 'Table' },
  { id: 'charts', label: 'Charts' },
]

/** Accessible tab bar for switching between the table and charts views. */
export function Tabs({ value, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="View"
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
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
