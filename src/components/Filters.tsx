interface FiltersProps {
  channels: string[]
  videoTypes: string[]
  channel: string
  videoType: string
  onChannelChange: (channel: string) => void
  onVideoTypeChange: (videoType: string) => void
}

const ALL = 'all'

const selectClass =
  'rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-sm text-[var(--text-h)] transition-colors hover:bg-[var(--social-bg)]'

/** Dropdown filters for the video table: by channel and by video type. */
export function Filters({
  channels,
  videoTypes,
  channel,
  videoType,
  onChannelChange,
  onVideoTypeChange,
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
    </div>
  )
}
