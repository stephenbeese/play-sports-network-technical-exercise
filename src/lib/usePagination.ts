import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from './constants'

export interface Pagination {
  currentPage: number
  pageCount: number
  pageSize: number
  startIndex: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

export function usePagination(totalItems: number, resetKey: unknown): Pagination {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

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
