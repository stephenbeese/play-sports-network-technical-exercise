import { useMemo } from 'react'
import { avgPercentWatched, type SortDirection, type SortKey } from './sort'
import type { DailyStatRow, VideoRow } from '../types'
import type { Filterable } from './useVideoFilters'

/**
 * Numeric value a row sorts by for a given key. `avgPctWatched` is derived, and
 * videos with no views (NaN) fall to the bottom on descending sorts.
 */
function sortValue(row: VideoRow, key: SortKey): number {
  const value = key === 'avgPctWatched' ? avgPercentWatched(row) : row[key]
  return Number.isFinite(value) ? value : Number.NEGATIVE_INFINITY
}

/** A daily point aggregated across every video matching the current filters. */
export interface DailyPoint {
  date: string
  views: number
  engagements: number
}

export interface FilteredVideos {
  filteredRows: VideoRow[]
  filteredDaily: DailyPoint[]
}

/**
 * Applies the active filter predicate and sort to the videos, and aggregates the
 * matching daily stats into a single time series for the charts.
 */
export function useFilteredVideos(
  rows: VideoRow[],
  daily: DailyStatRow[],
  matchesFilters: (item: Filterable) => boolean,
  sortKey: SortKey,
  sortDirection: SortDirection,
): FilteredVideos {
  const filteredRows = useMemo(
    () =>
      rows
        .filter(matchesFilters)
        .sort((a, b) =>
          sortDirection === 'desc'
            ? sortValue(b, sortKey) - sortValue(a, sortKey)
            : sortValue(a, sortKey) - sortValue(b, sortKey),
        ),
    [rows, matchesFilters, sortKey, sortDirection],
  )

  const filteredDaily = useMemo(() => {
    const byDate = new Map<string, { views: number; engagements: number }>()
    for (const stat of daily) {
      if (!matchesFilters(stat)) continue
      const current = byDate.get(stat.data_date) ?? { views: 0, engagements: 0 }
      current.views += stat.views
      current.engagements += stat.likes + stat.comments + stat.shares
      byDate.set(stat.data_date, current)
    }
    return Array.from(byDate.entries())
      .map(([date, totals]) => ({ date, ...totals }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [daily, matchesFilters])

  return { filteredRows, filteredDaily }
}
