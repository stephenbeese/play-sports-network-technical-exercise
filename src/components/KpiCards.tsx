import type { VideoRow } from '../types'
import { formatCompact, formatNumber, formatWatchTime } from '../lib/format'

interface KpiCardsProps {
  rows: VideoRow[]
}

interface Kpi {
  label: string
  value: string
  hint: string
  accent: string
}

/** Summary metric cards for the currently filtered set of videos. */
export function KpiCards({ rows }: KpiCardsProps) {
  const matchedCount = rows.length
  const activeCount = rows.reduce(
    (count, row) => (row.views > 0 ? count + 1 : count),
    0,
  )
  const totals = rows.reduce(
    (acc, row) => {
      acc.views += row.views
      acc.engagements += row.engagements
      acc.watchtime += row.watchtime
      return acc
    },
    { views: 0, engagements: 0, watchtime: 0 },
  )

  const kpis: Kpi[] = [
    {
      label: 'Total Views',
      value: formatCompact(totals.views),
      hint: 'Across the selected window',
      accent: '#84cc16',
    },
    {
      label: 'Watch Time',
      value: formatWatchTime(totals.watchtime),
      hint: 'Estimated audience attention',
      accent: '#3b82f6',
    },
    {
      label: 'Engagements',
      value: formatCompact(totals.engagements),
      hint: 'Likes, comments and shares',
      accent: '#fb7185',
    },
    {
      label: 'Active Videos',
      value: formatNumber(activeCount),
      hint: `${formatNumber(matchedCount)} matched filters`,
      accent: 'var(--accent)',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          style={{ borderTopColor: kpi.accent }}
          className="rounded-2xl border border-t-4 border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
            {kpi.label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--text-h)]">
            {kpi.value}
          </p>
          <p className="mt-1 text-xs text-[var(--text)]">{kpi.hint}</p>
        </div>
      ))}
    </div>
  )
}
