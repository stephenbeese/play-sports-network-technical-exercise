import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useVideoFilters, type Filterable } from '../../src/lib/useVideoFilters'

const BOUNDS = { min: '2025-01-01', max: '2025-12-31' }

const item = (overrides: Partial<Filterable> = {}): Filterable => ({
  title: 'Match highlights',
  account_name: 'Alpha FC',
  video_type: 'Long-form',
  published_at_date: '2025-06-01',
  ...overrides,
})

function setup() {
  return renderHook(() => useVideoFilters(BOUNDS))
}

describe('useVideoFilters.matchesFilters', () => {
  it('matches everything by default', () => {
    const { result } = setup()
    expect(result.current.matchesFilters(item())).toBe(true)
    expect(result.current.canReset).toBe(false)
  })

  it('matches search against the title only, case-insensitively', () => {
    const { result } = setup()
    act(() => result.current.setSearch('ALPHA'))

    expect(
      result.current.matchesFilters(item({ title: 'An alpha story', account_name: 'Beta' })),
    ).toBe(true)
    expect(
      result.current.matchesFilters(item({ title: 'Nothing', account_name: 'Alpha FC' })),
    ).toBe(false)
  })

  it('filters by channel and video type', () => {
    const { result } = setup()
    act(() => result.current.setChannel('Alpha FC'))
    expect(result.current.matchesFilters(item({ account_name: 'Alpha FC' }))).toBe(true)
    expect(result.current.matchesFilters(item({ account_name: 'Beta United' }))).toBe(false)

    act(() => {
      result.current.setChannel('all')
      result.current.setVideoType('Short')
    })
    expect(result.current.matchesFilters(item({ video_type: 'Short' }))).toBe(true)
    expect(result.current.matchesFilters(item({ video_type: 'Long-form' }))).toBe(false)
  })

  it('treats the publish-date range as inclusive of its bounds', () => {
    const { result } = setup()
    act(() => {
      result.current.setDateFrom('2025-03-01')
      result.current.setDateTo('2025-03-31')
    })

    expect(result.current.matchesFilters(item({ published_at_date: '2025-03-01' }))).toBe(true)
    expect(result.current.matchesFilters(item({ published_at_date: '2025-03-31' }))).toBe(true)
    expect(result.current.matchesFilters(item({ published_at_date: '2025-02-28' }))).toBe(false)
    expect(result.current.matchesFilters(item({ published_at_date: '2025-04-01' }))).toBe(false)
  })

  it('ignores search but honours channel/type/date (drives scoped suggestions)', () => {
    const { result } = setup()
    act(() => {
      result.current.setSearch('nonexistent')
      result.current.setChannel('Alpha FC')
    })

    expect(
      result.current.matchesNonSearchFilters(item({ account_name: 'Alpha FC' })),
    ).toBe(true)
    expect(
      result.current.matchesNonSearchFilters(item({ account_name: 'Beta United' })),
    ).toBe(false)
    expect(result.current.matchesFilters(item({ account_name: 'Alpha FC' }))).toBe(false)
  })

  it('flags canReset and clears every filter on reset', () => {
    const { result } = setup()
    act(() => {
      result.current.setSearch('alpha')
      result.current.setChannel('Alpha FC')
      result.current.setVideoType('Short')
      result.current.setDateFrom('2025-03-01')
    })
    expect(result.current.canReset).toBe(true)

    act(() => result.current.reset())

    expect(result.current.canReset).toBe(false)
    expect(result.current.search).toBe('')
    expect(result.current.channel).toBe('all')
    expect(result.current.videoType).toBe('all')
    expect(result.current.effectiveDateFrom).toBe(BOUNDS.min)
    expect(result.current.effectiveDateTo).toBe(BOUNDS.max)
  })
})
