import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFilterOptions } from '../../src/lib/useFilterOptions'
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
  return renderHook(() => useFilterOptions(rows)).result.current
}

describe('useFilterOptions', () => {
  const rows = [
    makeRow({ account_name: 'Beta', video_type: 'Short', title: 'B1', published_at_date: '2025-03-10' }),
    makeRow({ account_name: 'Alpha', video_type: 'Long-form', title: 'A1', published_at_date: '2025-01-05' }),
    makeRow({ account_name: 'Alpha', video_type: 'Short', title: 'A2', published_at_date: '2025-08-20' }),
  ]

  it('lists unique channels and video types, sorted', () => {
    const { channels, videoTypes } = render(rows)
    expect(channels).toEqual(['Alpha', 'Beta'])
    expect(videoTypes).toEqual(['Long-form', 'Short'])
  })

  it('builds de-duplicated search suggestions from titles only', () => {
    const { searchSuggestions } = render(rows)
    // Contains every title (channels are filtered separately), with no duplicates.
    expect(new Set(searchSuggestions)).toEqual(new Set(['B1', 'A1', 'A2']))
    expect(searchSuggestions).toHaveLength(new Set(searchSuggestions).size)
  })

  it('derives the min and max publish dates', () => {
    const { dateBounds } = render(rows)
    expect(dateBounds).toEqual({ min: '2025-01-05', max: '2025-08-20' })
  })

  it('returns empty options and blank date bounds for no rows', () => {
    const { channels, videoTypes, searchSuggestions, dateBounds } = render([])
    expect(channels).toEqual([])
    expect(videoTypes).toEqual([])
    expect(searchSuggestions).toEqual([])
    expect(dateBounds).toEqual({ min: '', max: '' })
  })
})
