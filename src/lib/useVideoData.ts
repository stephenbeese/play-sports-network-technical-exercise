import { useEffect, useState } from 'react'
import type { Post, PostStat, VideoRow } from '../types'

interface VideoData {
  rows: VideoRow[]
  loading: boolean
  error: string | null
}

/** Sum the daily stats for every video into a single lifetime total. */
function aggregateStats(stats: PostStat[]): Map<string, Omit<VideoRow, keyof Post>> {
  const totals = new Map<string, Omit<VideoRow, keyof Post>>()

  for (const stat of stats) {
    const current = totals.get(stat.video_id) ?? {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      watchtime: 0,
      engagements: 0,
    }

    current.likes += stat.likes
    current.comments += stat.comments
    current.shares += stat.shares
    current.views += stat.views
    current.watchtime += stat.watchtime
    current.engagements += stat.likes + stat.comments + stat.shares

    totals.set(stat.video_id, current)
  }

  return totals
}

/**
 * Loads the posts and per-day stats, joins them, and returns one row per video
 * with lifetime totals, sorted by views (most viewed first).
 */
export function useVideoData(): VideoData {
  const [rows, setRows] = useState<VideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [postsRes, statsRes] = await Promise.all([
          fetch('/data/posts.json', { signal: controller.signal }),
          fetch('/data/poststats.json', { signal: controller.signal }),
        ])

        if (!postsRes.ok || !statsRes.ok) {
          throw new Error('Failed to load data files')
        }

        const [posts, stats] = await Promise.all([
          postsRes.json() as Promise<Post[]>,
          statsRes.json() as Promise<PostStat[]>,
        ])

        const totals = aggregateStats(stats)

        const joined: VideoRow[] = posts.map((post) => {
          const stat = totals.get(post.video_id) ?? {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            watchtime: 0,
            engagements: 0,
          }
          return { ...post, ...stat }
        })

        joined.sort((a, b) => b.views - a.views)

        setRows(joined)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return { rows, loading, error }
}
