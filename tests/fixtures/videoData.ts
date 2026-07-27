import type { Post, PostStat } from '../../src/types'
import postsJson from './posts.json' with { type: 'json' }
import poststatsJson from './poststats.json' with { type: 'json' }

export const posts: Post[] = postsJson
export const poststats: PostStat[] = poststatsJson

export interface AggregatedVideo {
  video_id: string
  account_name: string
  video_type: string
  title: string
  published_at_date: string
  views: number
  engagements: number
  watchtime: number
}

export function aggregate(): AggregatedVideo[] {
  const byId = new Map<string, AggregatedVideo>()

  for (const post of posts) {
    byId.set(post.video_id, {
      video_id: post.video_id,
      account_name: post.account_name,
      video_type: post.video_type,
      title: post.title,
      published_at_date: post.published_at_date,
      views: 0,
      engagements: 0,
      watchtime: 0,
    })
  }

  for (const stat of poststats) {
    const row = byId.get(stat.video_id)
    if (!row) continue
    row.views += stat.views
    row.engagements += stat.likes + stat.comments + stat.shares
    row.watchtime += stat.watchtime
  }

  return Array.from(byId.values())
}

const aggregated = aggregate()

export function orderedIdsBy(
  key: 'views' | 'engagements' | 'watchtime',
  direction: 'asc' | 'desc' = 'desc',
): string[] {
  return [...aggregated]
    .sort((a, b) => (direction === 'desc' ? b[key] - a[key] : a[key] - b[key]))
    .map((row) => row.video_id)
}

export function orderedTitlesBy(
  key: 'views' | 'engagements' | 'watchtime',
  direction: 'asc' | 'desc' = 'desc',
): string[] {
  const titleById = new Map(aggregated.map((row) => [row.video_id, row.title]))
  return orderedIdsBy(key, direction).map((id) => titleById.get(id)!)
}

export const videoCount = posts.length

export const channels = Array.from(
  new Set(posts.map((post) => post.account_name)),
).sort()

export const videoTypes = Array.from(
  new Set(posts.map((post) => post.video_type)),
).sort()

export const dateBounds = {
  min: posts.reduce(
    (min, post) => (post.published_at_date < min ? post.published_at_date : min),
    posts[0].published_at_date,
  ),
  max: posts.reduce(
    (max, post) => (post.published_at_date > max ? post.published_at_date : max),
    posts[0].published_at_date,
  ),
}

export const totals = aggregated.reduce(
  (acc, row) => {
    acc.views += row.views
    acc.engagements += row.engagements
    acc.watchtime += row.watchtime
    return acc
  },
  { views: 0, engagements: 0, watchtime: 0 },
)

export function countByChannel(channel: string): number {
  return posts.filter((post) => post.account_name === channel).length
}

export function countByType(type: string): number {
  return posts.filter((post) => post.video_type === type).length
}
