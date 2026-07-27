import { motion } from 'motion/react'
import type { VideoRow } from '../types'
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatPercent,
  formatWatchTime,
} from '../lib/format'
import { FormatBadge } from './FormatBadge'

/** Metric columns that the table can be sorted by. */
export type SortKey = 'views' | 'engagements' | 'watchtime' | 'avgPctWatched'

/** Sort direction: descending (highest first) or ascending (lowest first). */
export type SortDirection = 'asc' | 'desc'

interface VideoTableProps {
  rows: VideoRow[]
  /** Rank offset for the first row, so numbering stays continuous across pages. */
  startIndex?: number
  sortKey: SortKey
  sortDirection: SortDirection
  onSortKeyChange: (sortKey: SortKey) => void
  onSortDirectionChange: (sortDirection: SortDirection) => void
}

const SORTABLE_COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: 'views', label: 'Views', className: 'px-4' },
  { key: 'engagements', label: 'Engagements', className: 'px-4' },
  { key: 'watchtime', label: 'Est. Watch Time', className: 'px-6' },
  { key: 'avgPctWatched', label: 'Avg % Watched', className: 'px-6' },
]

const RANK_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'engagements', label: 'Engagements' },
  { value: 'watchtime', label: 'Est. Watch Time' },
  { value: 'avgPctWatched', label: 'Avg % Watched' },
]

/**
 * Average share of each video actually watched: total watch-time minutes over
 * the maximum possible (views x length). Can exceed 100% when Shorts loop.
 * Returns NaN when a video has no views (rendered as "—").
 */
export function avgPercentWatched(row: VideoRow): number {
  const lengthMinutes = row.video_length / 60000
  if (row.views <= 0 || lengthMinutes <= 0) return Number.NaN
  return row.watchtime / (row.views * lengthMinutes)
}

export function VideoTable({
  rows,
  startIndex = 0,
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionChange,
}: VideoTableProps) {
  const handleColumnSort = (key: SortKey) => {
    if (key === sortKey) {
      onSortDirectionChange(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      onSortKeyChange(key)
      onSortDirectionChange('desc')
    }
  }

  // Emphasise whichever metric column is currently driving the sort.
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
            Editorial Leaderboard
          </p>
          <h2 className="!m-0 !mt-1 !text-2xl !font-semibold !tracking-tight text-[var(--text-h)]">
            Videos driving performance
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              Rank by
            </span>
            <select
              value={sortKey}
              onChange={(event) =>
                onSortKeyChange(event.target.value as SortKey)
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
            >
              {RANK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              Order
            </span>
            <select
              value={sortDirection}
              onChange={(event) =>
                onSortDirectionChange(event.target.value as SortDirection)
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]"
            >
              <option value="desc">Highest first</option>
              <option value="asc">Lowest first</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
              <th className="px-6 py-4 font-semibold">Video</th>
              <th className="px-4 py-4 font-semibold">Channel</th>
              <th className="px-4 py-4 font-semibold">Format</th>
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
                      {column.label}
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
                  // ponytail: stagger capped at 10 rows so large pages don't crawl in
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
                        Published {formatDate(row.published_at_date)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--text)]">
                  {row.account_name}
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
