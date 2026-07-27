import type { VideoRow } from '../types'

export type SortKey = 'views' | 'engagements' | 'watchtime' | 'avgPctWatched'

export type SortDirection = 'asc' | 'desc'

export function avgPercentWatched(row: VideoRow): number {
  const lengthMinutes = row.video_length / 60000
  if (row.views <= 0 || lengthMinutes <= 0) return Number.NaN
  return row.watchtime / (row.views * lengthMinutes)
}
