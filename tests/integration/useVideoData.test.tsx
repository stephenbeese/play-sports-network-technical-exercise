import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useVideoData } from '../../src/lib/useVideoData'
import { mockDataFetch } from '../fixtures/mockFetch'
import { aggregate, poststats, videoCount } from '../fixtures/videoData'

describe('useVideoData', () => {
  it('joins posts with summed daily stats into lifetime totals', async () => {
    mockDataFetch()
    const { result } = renderHook(() => useVideoData())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.rows).toHaveLength(videoCount)

    const expected = new Map(
      aggregate().map((row) => [row.video_id, row]),
    )
    for (const row of result.current.rows) {
      const want = expected.get(row.video_id)!
      expect(row.views).toBe(want.views)
      expect(row.watchtime).toBe(want.watchtime)
      // engagements is defined as likes + comments + shares.
      expect(row.engagements).toBe(row.likes + row.comments + row.shares)
      expect(row.engagements).toBe(want.engagements)
    }

    // Rows arrive pre-sorted by views, most-viewed first.
    const views = result.current.rows.map((row) => row.views)
    expect(views).toEqual([...views].sort((a, b) => b - a))

    // Every daily stat row is enriched and returned for the charts.
    expect(result.current.daily).toHaveLength(poststats.length)
  })
})
