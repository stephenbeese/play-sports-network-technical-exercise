import { useCallback, useMemo, useState } from 'react'
import { ALL } from './constants'
import type { DateBounds } from './useFilterOptions'

export interface Filterable {
  title: string
  account_name: string
  video_type: string
  published_at_date: string
}

export interface VideoFilters {
  search: string
  channel: string
  videoType: string
  effectiveDateFrom: string
  effectiveDateTo: string
  canReset: boolean
  matchesFilters: (item: Filterable) => boolean
  setSearch: (value: string) => void
  setChannel: (value: string) => void
  setVideoType: (value: string) => void
  setDateFrom: (value: string) => void
  setDateTo: (value: string) => void
  reset: () => void
}

export function useVideoFilters(dateBounds: DateBounds): VideoFilters {
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState(ALL)
  const [videoType, setVideoType] = useState(ALL)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const effectiveDateFrom = dateFrom || dateBounds.min
  const effectiveDateTo = dateTo || dateBounds.max

  const searchQuery = search.trim().toLowerCase()

  const matchesFilters = useCallback(
    (item: Filterable) =>
      (searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.account_name.toLowerCase().includes(searchQuery)) &&
      (channel === ALL || item.account_name === channel) &&
      (videoType === ALL || item.video_type === videoType) &&
      (effectiveDateFrom === '' ||
        item.published_at_date >= effectiveDateFrom) &&
      (effectiveDateTo === '' || item.published_at_date <= effectiveDateTo),
    [searchQuery, channel, videoType, effectiveDateFrom, effectiveDateTo],
  )

  const canReset =
    search !== '' ||
    channel !== ALL ||
    videoType !== ALL ||
    dateFrom !== '' ||
    dateTo !== ''

  const reset = useCallback(() => {
    setSearch('')
    setChannel(ALL)
    setVideoType(ALL)
    setDateFrom('')
    setDateTo('')
  }, [])

  return useMemo(
    () => ({
      search,
      channel,
      videoType,
      effectiveDateFrom,
      effectiveDateTo,
      canReset,
      matchesFilters,
      setSearch,
      setChannel,
      setVideoType,
      setDateFrom,
      setDateTo,
      reset,
    }),
    [
      search,
      channel,
      videoType,
      effectiveDateFrom,
      effectiveDateTo,
      canReset,
      matchesFilters,
      reset,
    ],
  )
}
