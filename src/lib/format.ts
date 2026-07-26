/** Format an integer with thousands separators, e.g. 1452781 -> "1,452,781". */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB')
}

/**
 * Compact number formatting used for watch-time hours, e.g. 11700 -> "11.7k".
 * Values under 1,000 are shown as whole numbers.
 */
export function formatCompact(value: number): string {
  if (value < 1000) return Math.round(value).toString()
  return value.toLocaleString('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
}

/** Convert a watch-time value in seconds to a compact "11.7k hrs" string. */
export function formatWatchTime(seconds: number): string {
  const hours = seconds / 3600
  return `${formatCompact(hours)} hrs`
}

/** Convert a video length in milliseconds to "m:ss" (or "h:mm:ss"). */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

/** Format an ISO date (YYYY-MM-DD) as "13 Dec 2025". */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
