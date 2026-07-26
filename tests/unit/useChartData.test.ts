import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useChartData } from '../../src/lib/useChartData'
import type { VideoRow } from '../../src/types'

function makeRow(overrides: Partial<VideoRow>): VideoRow {
  return {
    video_id: 'id',
    account_name: 'Channel',
    published_at_date: '2025-01-01',
    video_url: 'https://example.com',
    video_type: 'Long-form',
    title: 'Title',
    video_length: 60000,
    thumbnail_url: 'https://example.com/thumb.jpg',
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    watchtime: 0,
    engagements: 0,
    ...overrides,
  }
}

function render(rows: VideoRow[]) {
  return renderHook(() => useChartData(rows)).result.current
}

describe('useChartData', () => {
  describe('topVideos', () => {
    it('ranks by views (desc) and caps the list at 10', () => {
      const rows = Array.from({ length: 15 }, (_, i) =>
        makeRow({ video_id: `v${i}`, title: `Video ${i}`, views: i * 100 }),
      )
      const { topVideos } = render(rows)

      expect(topVideos).toHaveLength(10)
      const views = topVideos.map((v) => v.views)
      expect(views).toEqual([...views].sort((a, b) => b - a))
      expect(topVideos[0].views).toBe(1400)
    })

    it('shortens long titles for the axis but keeps the full title', () => {
      const longTitle = 'A'.repeat(30)
      const { topVideos } = render([makeRow({ title: longTitle, views: 1 })])

      expect(topVideos[0].fullTitle).toBe(longTitle)
      expect(topVideos[0].title).toBe(`${'A'.repeat(22)}…`)
    })

    it('leaves short titles untouched', () => {
      const { topVideos } = render([makeRow({ title: 'Short one', views: 1 })])
      expect(topVideos[0].title).toBe('Short one')
    })
  })

  describe('viewsByChannel', () => {
    it('sums views per channel and sorts by total (desc)', () => {
      const { viewsByChannel } = render([
        makeRow({ account_name: 'Alpha', views: 100 }),
        makeRow({ account_name: 'Beta', views: 500 }),
        makeRow({ account_name: 'Alpha', views: 50 }),
      ])

      expect(viewsByChannel).toEqual([
        { account_name: 'Beta', views: 500 },
        { account_name: 'Alpha', views: 150 },
      ])
    })
  })

  describe('watchTimeByChannel', () => {
    it('sums watch time per channel and sorts by total (desc)', () => {
      const { watchTimeByChannel } = render([
        makeRow({ account_name: 'Alpha', watchtime: 300 }),
        makeRow({ account_name: 'Beta', watchtime: 100 }),
        makeRow({ account_name: 'Alpha', watchtime: 200 }),
      ])

      expect(watchTimeByChannel).toEqual([
        { account_name: 'Alpha', watchtime: 500 },
        { account_name: 'Beta', watchtime: 100 },
      ])
    })
  })

  describe('formatSplit', () => {
    it('classifies types containing "short" (case-insensitive) as Shorts', () => {
      const { formatSplit } = render([
        makeRow({ video_type: 'Short' }),
        makeRow({ video_type: 'SHORTS' }),
        makeRow({ video_type: 'Long-form' }),
      ])

      expect(formatSplit).toEqual([
        { name: 'Shorts', value: 2 },
        { name: 'Long-form', value: 1 },
      ])
    })

    it('drops a bucket with no videos rather than showing a zero slice', () => {
      const { formatSplit } = render([
        makeRow({ video_type: 'Long-form' }),
        makeRow({ video_type: 'Long-form' }),
      ])

      expect(formatSplit).toEqual([{ name: 'Long-form', value: 2 }])
    })

    it('returns nothing when there are no videos', () => {
      expect(render([]).formatSplit).toEqual([])
    })
  })
})
