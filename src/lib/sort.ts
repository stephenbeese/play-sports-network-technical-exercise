import type { VideoRow } from '../types'

/** Metric columns that the table can be sorted by. */
export type SortKey = 'views' | 'engagements' | 'watchtime' | 'avgPctWatched'

/** Sort direction: descending (highest first) or ascending (lowest first). */
export type SortDirection = 'asc' | 'desc'

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
