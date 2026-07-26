import type { SortDirection, SortKey } from './VideoTable'

interface FiltersProps {
  channels: string[]
  videoTypes: string[]
  channel: string
  videoType: string
  sortKey: SortKey
  sortDirection: SortDirection
  onChannelChange: (channel: string) => void
  onVideoTypeChange: (videoType: string) => void
  onSortKeyChange: (sortKey: SortKey) => void
  onSortDirectionChange: (sortDirection: SortDirection) => void
}

const ALL = 'all'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'engagements', label: 'Engagements' },
  { value: 'watchtime', label: 'Watch Time' },
]

const selectClass =
  'rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]'

/** Dropdown filters and sorting controls for the video table. */
export function Filters({
  channels,
  videoTypes,
  channel,
  videoType,
  sortKey,
  sortDirection,
  onChannelChange,
  onVideoTypeChange,
  onSortKeyChange,
  onSortDirectionChange,
}: FiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-xs text-[var(--text)]">
        Channel
        <select
          value={channel}
          onChange={(event) => onChannelChange(event.target.value)}
          className={selectClass}
        >
          <option value={ALL}>All channels</option>
          {channels.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs text-[var(--text)]">
        Format
        <select
          value={videoType}
          onChange={(event) => onVideoTypeChange(event.target.value)}
          className={selectClass}
        >
          <option value={ALL}>All formats</option>
          {videoTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="ml-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
        Rank by
        <select
          value={sortKey}
          onChange={(event) => onSortKeyChange(event.target.value as SortKey)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
        Order
        <select
          value={sortDirection}
          onChange={(event) =>
            onSortDirectionChange(event.target.value as SortDirection)
          }
          className={selectClass}
        >
          <option value="desc">Highest first</option>
          <option value="asc">Lowest first</option>
        </select>
      </label>
    </div>
  )
}
