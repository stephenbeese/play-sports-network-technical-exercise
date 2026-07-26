import { useState } from 'react'
import type { SortDirection, SortKey } from '../components/VideoTable'
import { DEFAULT_SORT_DIRECTION, DEFAULT_SORT_KEY } from './constants'

export interface Sort {
  sortKey: SortKey
  sortDirection: SortDirection
  setSortKey: (key: SortKey) => void
  setSortDirection: (direction: SortDirection) => void
}

/** Owns the table's sort key and direction. */
export function useSort(): Sort {
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT_KEY)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_SORT_DIRECTION,
  )

  return { sortKey, sortDirection, setSortKey, setSortDirection }
}
