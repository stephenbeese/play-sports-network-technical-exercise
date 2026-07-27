import type { VideoRow } from '../types'
import { formatNumber, formatWatchTime } from './format'
import type { DailyPoint } from './useFilteredVideos'

/**
 * Keyword-based answer engine so the chatbot works with no API key ("demo
 * mode"). Handles the common leaderboard/total questions directly from the
 * joined rows; returns null when the question doesn't match a known intent.
 */

type Metric = 'views' | 'engagements' | 'watchtime'

const METRIC_LABEL: Record<Metric, string> = {
  views: 'views',
  engagements: 'engagements',
  watchtime: 'watch time',
}

function detectMetric(q: string): Metric {
  if (/watch\s*time|watchtime|hours/.test(q)) return 'watchtime'
  if (/engagement|likes|comments|shares/.test(q)) return 'engagements'
  return 'views'
}

function formatMetric(metric: Metric, value: number): string {
  return metric === 'watchtime' ? formatWatchTime(value) : formatNumber(value)
}

function isShort(row: VideoRow): boolean {
  return row.video_type.toLowerCase().includes('short')
}

function topChannel(rows: VideoRow[], metric: Metric): string {
  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.account_name, (totals.get(row.account_name) ?? 0) + row[metric])
  }
  const ranked = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  const [name, value] = ranked[0]
  return `${name} leads on ${METRIC_LABEL[metric]} with ${formatMetric(metric, value)} across the current data.`
}

function topVideo(rows: VideoRow[], metric: Metric): string {
  const best = rows.reduce((a, b) => (b[metric] > a[metric] ? b : a))
  return `The top video by ${METRIC_LABEL[metric]} is “${best.title}” (${best.account_name}) with ${formatMetric(metric, best[metric])}.`
}

function totals(rows: VideoRow[], metric: Metric): string {
  const total = rows.reduce((sum, row) => sum + row[metric], 0)
  return `Total ${METRIC_LABEL[metric]} across ${formatNumber(rows.length)} videos: ${formatMetric(metric, total)}.`
}

function formatSplit(rows: VideoRow[]): string {
  const shorts = rows.filter(isShort).length
  return `There are ${formatNumber(shorts)} Shorts and ${formatNumber(rows.length - shorts)} long-form videos (${formatNumber(rows.length)} total).`
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

/** "views for december 2025" -> monthly totals from the daily stats. */
function monthlyTotals(q: string, daily: DailyPoint[]): string | null {
  const monthIndex = MONTHS.findIndex((m) => q.includes(m) || q.includes(`${m.slice(0, 3)} `))
  const year = /\b(20\d{2})\b/.exec(q)?.[1]
  if (monthIndex === -1 || !year) return null

  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  let views = 0
  let engagements = 0
  let matched = false
  for (const point of daily) {
    if (!point.date.startsWith(prefix)) continue
    matched = true
    views += point.views
    engagements += point.engagements
  }
  const label = `${MONTHS[monthIndex][0].toUpperCase()}${MONTHS[monthIndex].slice(1)} ${year}`
  if (!matched) return `There is no daily data for ${label} in the current selection.`
  return `In ${label} the selected videos recorded ${formatNumber(views)} views and ${formatNumber(engagements)} engagements.`
}

/** Answer a question from the rows, or null if no known intent matches. */
export function answerLocally(
  question: string,
  rows: VideoRow[],
  daily: DailyPoint[] = [],
): string | null {
  if (rows.length === 0) return 'No videos match the current filters.'
  const q = question.toLowerCase()
  const metric = detectMetric(q)

  const monthly = monthlyTotals(q, daily)
  if (monthly) return monthly

  if (/short|long[\s-]?form|format/.test(q) && /how many|count|split|vs|versus/.test(q)) {
    return formatSplit(rows)
  }
  if (/how many videos|number of videos|video count/.test(q)) {
    return `There are ${formatNumber(rows.length)} videos in the current data.`
  }
  if (/(which|what|top|best|most|highest|leading).*(channel|account)/.test(q)) {
    return topChannel(rows, metric)
  }
  if (/(which|what|top|best|most|highest|popular).*(video|post|title)/.test(q)) {
    return topVideo(rows, metric)
  }
  if (/total|overall|altogether|sum|combined/.test(q)) {
    return totals(rows, metric)
  }
  return null
}

/** Shown when demo mode can't match the question. */
export const DEMO_FALLBACK =
  'Demo mode can answer questions like “top video by views”, “which channel has the most watch time”, “how many Shorts vs long-form?”, “total engagements” or “total views for December 2025”. Add an OpenAI API key for free-form questions.'
