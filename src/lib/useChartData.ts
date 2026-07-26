import { useMemo } from 'react'
import type { VideoRow } from '../types'

export interface TopVideo {
  title: string
  fullTitle: string
  views: number
}

export interface ChannelViews {
  account_name: string
  views: number
}

export interface ChannelWatchTime {
  account_name: string
  watchtime: number
}

export interface FormatSplitEntry {
  name: string
  value: number
}

export interface ChartData {
  topVideos: TopVideo[]
  viewsByChannel: ChannelViews[]
  watchTimeByChannel: ChannelWatchTime[]
  formatSplit: FormatSplitEntry[]
}

/** Shorten a long video title for use as a compact axis label. */
function shortTitle(title: string): string {
  return title.length > 22 ? `${title.slice(0, 22)}…` : title
}

/** Derives the aggregated series that back the charts from the filtered videos. */
export function useChartData(rows: VideoRow[]): ChartData {
  const topVideos = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)
        .map((row) => ({
          title: shortTitle(row.title),
          fullTitle: row.title,
          views: row.views,
        })),
    [rows],
  )

  const viewsByChannel = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of rows) {
      totals.set(row.account_name, (totals.get(row.account_name) ?? 0) + row.views)
    }
    return Array.from(totals.entries())
      .map(([account_name, views]) => ({ account_name, views }))
      .sort((a, b) => b.views - a.views)
  }, [rows])

  const watchTimeByChannel = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of rows) {
      totals.set(
        row.account_name,
        (totals.get(row.account_name) ?? 0) + row.watchtime,
      )
    }
    return Array.from(totals.entries())
      .map(([account_name, watchtime]) => ({ account_name, watchtime }))
      .sort((a, b) => b.watchtime - a.watchtime)
  }, [rows])

  const formatSplit = useMemo(() => {
    let shorts = 0
    let longForm = 0
    for (const row of rows) {
      if (row.video_type.toLowerCase().includes('short')) shorts += 1
      else longForm += 1
    }
    return [
      { name: 'Shorts', value: shorts },
      { name: 'Long-form', value: longForm },
    ].filter((entry) => entry.value > 0)
  }, [rows])

  return { topVideos, viewsByChannel, watchTimeByChannel, formatSplit }
}
