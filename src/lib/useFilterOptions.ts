import { useMemo } from 'react'
import type { VideoRow } from '../types'

export interface DateBounds {
  min: string
  max: string
}

export interface FilterOptions {
  channels: string[]
  videoTypes: string[]
  searchSuggestions: string[]
  dateBounds: DateBounds
}

/**
 * Derives the dropdown options and publish-date bounds from the loaded videos,
 * so the filter controls stay in sync with the data rather than being hard-coded.
 */
export function useFilterOptions(rows: VideoRow[]): FilterOptions {
  const channels = useMemo(
    () => Array.from(new Set(rows.map((row) => row.account_name))).sort(),
    [rows],
  )

  const videoTypes = useMemo(
    () => Array.from(new Set(rows.map((row) => row.video_type))).sort(),
    [rows],
  )

  const searchSuggestions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.title))),
    [rows],
  )

  const dateBounds = useMemo<DateBounds>(() => {
    if (rows.length === 0) return { min: '', max: '' }
    let min = rows[0].published_at_date
    let max = rows[0].published_at_date
    for (const row of rows) {
      if (row.published_at_date < min) min = row.published_at_date
      if (row.published_at_date > max) max = row.published_at_date
    }
    return { min, max }
  }, [rows])

  return { channels, videoTypes, searchSuggestions, dateBounds }
}
