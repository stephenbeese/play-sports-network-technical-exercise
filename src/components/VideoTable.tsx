import type { VideoRow } from '../types'
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatWatchTime,
} from '../lib/format'
import { FormatBadge } from './FormatBadge'

/** Metric columns that the table can be sorted by. */
export type SortKey = 'views' | 'engagements' | 'watchtime'

/** Sort direction: descending (highest first) or ascending (lowest first). */
export type SortDirection = 'asc' | 'desc'

interface VideoTableProps {
  rows: VideoRow[]
  /** Rank offset for the first row, so numbering stays continuous across pages. */
  startIndex?: number
  sortKey: SortKey
  sortDirection: SortDirection
}

const SORTABLE_COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: 'views', label: 'Views', className: 'px-4' },
  { key: 'engagements', label: 'Engagements', className: 'px-4' },
  { key: 'watchtime', label: 'Watch Time', className: 'px-6' },
]

export function VideoTable({
  rows,
  startIndex = 0,
  sortKey,
  sortDirection,
}: VideoTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-sm">
      <table className="w-full min-w-[860px] border-collapse text-left">
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
                  className={`${column.className} py-4 text-right ${
                    active ? 'font-bold text-[var(--text-h)]' : 'font-semibold'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.label}
                    {active && (
                      <span aria-hidden="true">
                        {sortDirection === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.video_id}
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
              <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-[var(--text-h)]">
                {formatNumber(row.views)}
              </td>
              <td className="px-4 py-3 text-right text-sm tabular-nums text-[var(--text)]">
                {formatNumber(row.engagements)}
              </td>
              <td className="px-6 py-3 text-right text-sm tabular-nums text-[var(--text)]">
                {formatWatchTime(row.watchtime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
