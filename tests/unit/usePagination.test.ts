import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePagination } from '../../src/lib/usePagination'

const DEFAULT_PAGE_SIZE = 10

function setup(totalItems: number, resetKey: unknown = 'key') {
  return renderHook(
    ({ total, key }) => usePagination(total, key),
    { initialProps: { total: totalItems, key: resetKey } },
  )
}

describe('usePagination', () => {
  it('derives page count and start index from the totals', () => {
    const { result } = setup(25)
    expect(result.current.pageCount).toBe(3)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.startIndex).toBe(0)

    act(() => result.current.setPage(2))
    expect(result.current.startIndex).toBe(DEFAULT_PAGE_SIZE)
  })

  it('clamps the current page to the last page', () => {
    const { result } = setup(25)
    act(() => result.current.setPage(99))
    expect(result.current.currentPage).toBe(3)
    expect(result.current.startIndex).toBe(20)
  })

  it('always reports at least one page, even with no items', () => {
    const { result } = setup(0)
    expect(result.current.pageCount).toBe(1)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.startIndex).toBe(0)
  })

  it('snaps back to page 1 when the page size changes', () => {
    const { result } = setup(100)
    act(() => result.current.setPage(5))
    expect(result.current.currentPage).toBe(5)

    act(() => result.current.setPageSize(25))
    expect(result.current.pageSize).toBe(25)
    expect(result.current.currentPage).toBe(1)
  })

  it('snaps back to page 1 when the reset key changes (e.g. new filters)', () => {
    const { result, rerender } = setup(100, 'filters-a')
    act(() => result.current.setPage(4))
    expect(result.current.currentPage).toBe(4)

    rerender({ total: 100, key: 'filters-b' })
    expect(result.current.currentPage).toBe(1)
  })
})
