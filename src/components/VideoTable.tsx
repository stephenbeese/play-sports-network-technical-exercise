import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import type { VideoRow } from '../types'
import {
  formatChannel,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatWatchTime,
} from '../lib/format'
import { avgPercentWatched, type SortDirection, type SortKey } from '../lib/sort'
import { FormatBadge } from './FormatBadge'

interface VideoTableProps {
  rows: VideoRow[]
  startIndex?: number
  sortKey: SortKey
  sortDirection: SortDirection
  onSortKeyChange: (sortKey: SortKey) => void
  onSortDirectionChange: (sortDirection: SortDirection) => void
}

const SORTABLE_COLUMNS: { key: SortKey; labelKey: string; className: string }[] = [
  { key: 'views', labelKey: 'table.views', className: 'px-4' },
  { key: 'engagements', labelKey: 'table.engagements', className: 'px-4' },
  { key: 'watchtime', labelKey: 'table.watchTime', className: 'px-6' },
  { key: 'avgPctWatched', labelKey: 'table.avgWatched', className: 'px-6' },
]

const RANK_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: 'views', labelKey: 'table.views' },
  { value: 'engagements', labelKey: 'table.engagements' },
  { value: 'watchtime', labelKey: 'table.watchTime' },
  { value: 'avgPctWatched', labelKey: 'table.avgWatched' },
]

export function VideoTable({
  rows,
  startIndex = 0,
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionChange,
}: VideoTableProps) {
  const { t } = useTranslation()
  const handleColumnSort = (key: SortKey) => {
    if (key === sortKey) {
      onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      onSortKeyChange(key)
      onSortDirectionChange('desc')
    }
  }

  const metricCellClass = (key: SortKey, padding: string) =>
    `${padding} py-3 text-right text-sm tabular-nums ${
      sortKey === key
        ? 'font-semibold text-[var(--text-h)]'
        : 'text-[var(--text)]'
    }`

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
            {t('table.eyebrow')}
          </p>
          <h2 className="!m-0 !mt-1 !text-2xl !font-semibold !tracking-tight text-[var(--text-h)]">
            {t('table.heading')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 max-sm:w-full">
          <label className="flex items-center gap-2 max-sm:w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              {t('table.rankBy')}
            </span>
            <select
              value={sortKey}
              onChange={(event) =>
                onSortKeyChange(event.target.value as SortKey)
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)] max-sm:flex-1"
            >
              {RANK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 max-sm:w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              {t('table.order')}
            </span>
            <select
              value={sortDirection}
              onChange={(event) =>
                onSortDirectionChange(event.target.value as SortDirection)
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)] max-sm:flex-1"
            >
              <option value="desc">{t('table.highestFirst')}</option>
              <option value="asc">{t('table.lowestFirst')}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              <th className="px-6 py-4 font-semibold">{t('table.video')}</th>
              <th className="px-4 py-4 font-semibold">{t('table.channel')}</th>
              <th className="px-4 py-4 font-semibold">{t('table.format')}</th>
              {SORTABLE_COLUMNS.map((column) => {
                const active = sortKey === column.key
                return (
                  <th
                    key={column.key}
                    aria-sort={
                      active
                        ? sortDirection === 'desc'
                          ? 'descending'
                          : 'ascending'
                        : 'none'
                    }
                    className={`${column.className} py-4 text-right whitespace-nowrap`}
                  >
                    <button
                      type="button"
                      onClick={() => handleColumnSort(column.key)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-[var(--text-h)] ${
                        active
                          ? 'font-bold text-[var(--text-h)]'
                          : 'font-semibold'
                      }`}
                    >
                      {t(column.labelKey)}
                      {active && (
                        <span
                          aria-hidden="true"
                          className={`inline-block transition-transform duration-200 ${
                            sortDirection === 'asc' ? 'rotate-180' : ''
                          }`}
                        >
                          ↓
                        </span>
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.video_id}
                layout
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: Math.min(index, 10) * 0.03 },
                }}
                className="border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--social-bg)]"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="w-6 shrink-0 text-sm tabular-nums text-[var(--text)]">
                      {(startIndex + index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="relative shrink-0">
                      <img
                        src={row.thumbnail_url}
                        alt=""
                        loading="lazy"
                        width={80}
                        height={45}
                        className="h-[45px] w-[80px] rounded-md object-cover"
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
                        {formatDuration(row.video_length)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <a
                        href={row.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 text-sm font-semibold text-[var(--text-h)] hover:underline"
                      >
                        {row.title}
                      </a>
                      <p className="mt-0.5 text-xs text-[var(--text)]">
                        {t('table.published', {
                          date: formatDate(row.published_at_date),
                        })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text)]">
                  {formatChannel(row.account_name)}
                </td>
                <td className="px-4 py-3">
                  <FormatBadge format={row.video_type} />
                </td>
                <td className={metricCellClass('views', 'px-4')}>
                  {formatNumber(row.views)}
                </td>
                <td className={metricCellClass('engagements', 'px-4')}>
                  {formatNumber(row.engagements)}
                </td>
                <td className={metricCellClass('watchtime', 'px-6')}>
                  {formatWatchTime(row.watchtime)}
                </td>
                <td className={metricCellClass('avgPctWatched', 'px-6')}>
                  {formatPercent(avgPercentWatched(row))}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
