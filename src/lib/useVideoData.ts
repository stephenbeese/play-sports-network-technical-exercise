import { useEffect, useState } from 'react'
import type { DailyStatRow, Post, PostStat, VideoRow } from '../types'

interface VideoData {
  rows: VideoRow[]
  daily: DailyStatRow[]
  loading: boolean
  error: string | null
}

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

export function useVideoData(): VideoData {
  const [rows, setRows] = useState<VideoRow[]>([])
  const [daily, setDaily] = useState<DailyStatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [postsRes, statsRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/posts.json`, { signal: controller.signal }),
          fetch(`${import.meta.env.BASE_URL}data/poststats.json`, { signal: controller.signal }),
        ])

        if (!postsRes.ok || !statsRes.ok) {
          throw new Error('Failed to load data files')
        }

        const [posts, stats] = await Promise.all([
          postsRes.json() as Promise<Post[]>,
          statsRes.json() as Promise<PostStat[]>,
        ])

        const totals = aggregateStats(stats)

        const postsById = new Map<string, Post>()
        for (const post of posts) {
          postsById.set(post.video_id, post)
        }

        const enrichedDaily: DailyStatRow[] = []
        for (const stat of stats) {
          const post = postsById.get(stat.video_id)
          if (!post) continue
          enrichedDaily.push({
            ...stat,
            account_name: post.account_name,
            video_type: post.video_type,
            title: post.title,
            published_at_date: post.published_at_date,
          })
        }

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
        setDaily(enrichedDaily)
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

  return { rows, daily, loading, error }
}
