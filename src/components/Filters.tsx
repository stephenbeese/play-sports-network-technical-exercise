import { ALL } from '../lib/constants'
import { SearchInput } from './SearchInput'

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
  canReset: boolean
  onSearchChange: (search: string) => void
  onChannelChange: (channel: string) => void
  onVideoTypeChange: (videoType: string) => void
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  onReset: () => void
}

const selectClass =
  'rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]'

const fieldClass = 'flex flex-col gap-1.5'

const labelClass =
  'text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]'

/** Horizontal filter bar with search, dropdown filters and a reset button. */
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
  canReset,
  onSearchChange,
  onChannelChange,
  onVideoTypeChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: FiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-sm">
      <label className={`${fieldClass} min-w-56 flex-1`}>
        <span className={labelClass}>Search videos</span>
        <SearchInput
          value={search}
          suggestions={searchSuggestions}
          placeholder="Search by title…"
          onChange={onSearchChange}
          className={`${selectClass} w-full`}
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

      <button
        type="button"
        onClick={onReset}
        disabled={!canReset}
        className="rounded-lg bg-lime-300 px-5 py-2 text-sm font-semibold text-lime-950 transition-colors hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-lime-400 dark:text-lime-950 dark:hover:bg-lime-300"
      >
        Reset
      </button>
    </div>
  )
}
