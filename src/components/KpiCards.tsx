import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { VideoRow } from '../types'
import { formatCompact, formatNumber, formatWatchTime } from '../lib/format'
import { fadeUp, staggerContainer } from '../lib/motion'

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
  const { t } = useTranslation()
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
      label: t('kpi.totalViews'),
      value: formatCompact(totals.views),
      hint: t('kpi.totalViewsHint'),
      accent: 'var(--metric-views)',
    },
    {
      label: t('kpi.watchTime'),
      value: formatWatchTime(totals.watchtime),
      hint: t('kpi.watchTimeHint'),
      accent: 'var(--metric-watchtime)',
    },
    {
      label: t('kpi.engagements'),
      value: formatCompact(totals.engagements),
      hint: t('kpi.engagementsHint'),
      accent: 'var(--metric-engagements)',
    },
    {
      label: t('kpi.activeVideos'),
      value: formatNumber(activeCount),
      hint: t('kpi.activeVideosHint', { matched: formatNumber(matchedCount) }),
      accent: 'var(--accent)',
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={fadeUp}
          whileHover={{ y: -2 }}
          style={{ borderTopColor: kpi.accent }}
          className="rounded-2xl border border-t-4 border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
            {kpi.label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--text-h)]">
            {kpi.value}
          </p>
          <p className="mt-1 text-xs text-[var(--text)]">{kpi.hint}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
