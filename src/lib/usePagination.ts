import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from './constants'

export interface Pagination {
  /** Clamped current page (never exceeds pageCount). */
  currentPage: number
  pageCount: number
  pageSize: number
  /** Index of the first item on the current page, for slicing and rank offsets. */
  startIndex: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

/**
 * Owns page/pageSize state and derives page bounds from totalItems. Passing a
 * `resetKey` (e.g. the active filters and sort) snaps back to page 1 whenever it
 * changes, so the user never lands on an out-of-range page after re-filtering.
 */
export function usePagination(totalItems: number, resetKey: unknown): Pagination {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Snap back to page 1 whenever the filters/sort or page size change. Adjusting
  // state during render (rather than in an effect) avoids a wasted extra render.
  const key = `${String(resetKey)}|${pageSize}`
  const [prevKey, setPrevKey] = useState(key)
  if (key !== prevKey) {
    setPrevKey(key)
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize

  return { currentPage, pageCount, pageSize, startIndex, setPage, setPageSize }
}
