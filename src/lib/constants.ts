import type { SortDirection, SortKey } from './sort'

export const ALL = 'all'

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
export const DEFAULT_PAGE_SIZE = 10

export const DEFAULT_SORT_KEY: SortKey = 'views'
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc'
