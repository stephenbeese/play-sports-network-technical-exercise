import { SearchInput } from './SearchInput'
import type { SortDirection, SortKey } from './VideoTable'

interface FiltersProps {
  channels: string[]
  videoTypes: string[]
  searchSuggestions: string[]
  search: string
  channel: string
  videoType: string
  dateFrom: string
  dateTo: string
  minDate: string
  maxDate: string
  sortKey: SortKey
  sortDirection: SortDirection
  canReset: boolean
  onSearchChange: (search: string) => void
  onChannelChange: (channel: string) => void
  onVideoTypeChange: (videoType: string) => void
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  onSortKeyChange: (sortKey: SortKey) => void
  onSortDirectionChange: (sortDirection: SortDirection) => void
  onReset: () => void
}

const ALL = 'all'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'engagements', label: 'Engagements' },
  { value: 'watchtime', label: 'Watch Time' },
]

const selectClass =
  'rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]'

const fieldClass = 'flex flex-col gap-1'

const labelClass =
  'text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]'

/** Dropdown filters and sorting controls for the video table. */
export function Filters({
  channels,
  videoTypes,
  searchSuggestions,
  search,
  channel,
  videoType,
  dateFrom,
  dateTo,
  minDate,
  maxDate,
  sortKey,
  sortDirection,
  canReset,
  onSearchChange,
  onChannelChange,
  onVideoTypeChange,
  onDateFromChange,
  onDateToChange,
  onSortKeyChange,
  onSortDirectionChange,
  onReset,
}: FiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className={fieldClass}>
          <span className={labelClass}>Search</span>
          <SearchInput
            value={search}
            suggestions={searchSuggestions}
            placeholder="Title or channel…"
            onChange={onSearchChange}
            className={`${selectClass} w-56`}
          />
        </label>

        <label className={fieldClass}>
          <span className={labelClass}>Channel</span>
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

        <label className={fieldClass}>
          <span className={labelClass}>Format</span>
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

        <label className={fieldClass}>
          <span className={labelClass}>From</span>
          <input
            type="date"
            value={dateFrom}
            min={minDate || undefined}
            max={dateTo || maxDate || undefined}
            onChange={(event) => onDateFromChange(event.target.value)}
            className={selectClass}
          />
        </label>

        <label className={fieldClass}>
          <span className={labelClass}>To</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || minDate || undefined}
            max={maxDate || undefined}
            onChange={(event) => onDateToChange(event.target.value)}
            className={selectClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className={fieldClass}>
          <span className={labelClass}>Rank by</span>
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

        <label className={fieldClass}>
          <span className={labelClass}>Order</span>
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

        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
