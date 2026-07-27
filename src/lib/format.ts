export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB')
}

export function formatCompact(value: number): string {
  if (value < 1000) return Math.round(value).toString()
  return value.toLocaleString('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
}

export function formatWatchTime(minutes: number): string {
  const hours = minutes / 60
  return `${formatCompact(hours)} hrs`
}

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  return `${Math.round(ratio * 100)}%`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

const CHANNEL_ACRONYMS = new Set(['GCN', 'GMBN', 'GTN', 'EMBN'])

export function formatChannel(name: string): string {
  return name
    .split(/\s+/)
    .map((word) =>
      CHANNEL_ACRONYMS.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ')
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
