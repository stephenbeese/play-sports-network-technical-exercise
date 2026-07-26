import { useMemo, useState } from 'react'
import { Filters } from './components/Filters'
import { KpiCards } from './components/KpiCards'
import { Layout } from './components/Layout'
import { Pagination } from './components/Pagination'
import { VideoTable, type SortDirection, type SortKey } from './components/VideoTable'
import { useVideoData } from './lib/useVideoData'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10
const ALL = 'all'
const DEFAULT_SORT_KEY: SortKey = 'views'
const DEFAULT_SORT_DIRECTION: SortDirection = 'desc'

function App() {
  const { rows, loading, error } = useVideoData()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState(ALL)
  const [videoType, setVideoType] = useState(ALL)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT_KEY)
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(DEFAULT_SORT_DIRECTION)

  const channels = useMemo(
    () => Array.from(new Set(rows.map((row) => row.account_name))).sort(),
    [rows],
  )
  const videoTypes = useMemo(
    () => Array.from(new Set(rows.map((row) => row.video_type))).sort(),
    [rows],
  )
  const searchSuggestions = useMemo(
    () =>
      Array.from(
        new Set([
          ...rows.map((row) => row.account_name),
          ...rows.map((row) => row.title),
        ]),
      ),
    [rows],
  )

  const dateBounds = useMemo(() => {
    if (rows.length === 0) return { min: '', max: '' }
    let min = rows[0].published_at_date
    let max = rows[0].published_at_date
    for (const row of rows) {
      if (row.published_at_date < min) min = row.published_at_date
      if (row.published_at_date > max) max = row.published_at_date
    }
    return { min, max }
  }, [rows])

  const effectiveDateFrom = dateFrom || dateBounds.min
  const effectiveDateTo = dateTo || dateBounds.max

  const searchQuery = search.trim().toLowerCase()

  const filteredRows = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            (searchQuery === '' ||
              row.title.toLowerCase().includes(searchQuery) ||
              row.account_name.toLowerCase().includes(searchQuery)) &&
            (channel === ALL || row.account_name === channel) &&
            (videoType === ALL || row.video_type === videoType) &&
            (effectiveDateFrom === '' ||
              row.published_at_date >= effectiveDateFrom) &&
            (effectiveDateTo === '' ||
              row.published_at_date <= effectiveDateTo),
        )
        .sort((a, b) =>
          sortDirection === 'desc'
            ? b[sortKey] - a[sortKey]
            : a[sortKey] - b[sortKey],
        ),
    [
      rows,
      searchQuery,
      channel,
      videoType,
      effectiveDateFrom,
      effectiveDateTo,
      sortKey,
      sortDirection,
    ],
  )

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const startIndex = (currentPage - 1) * pageSize

  const pageRows = useMemo(
    () => filteredRows.slice(startIndex, startIndex + pageSize),
    [filteredRows, startIndex, pageSize],
  )

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleChannelChange = (value: string) => {
    setChannel(value)
    setPage(1)
  }

  const handleVideoTypeChange = (value: string) => {
    setVideoType(value)
    setPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
  }

  const handleSortKeyChange = (key: SortKey) => {
    setSortKey(key)
    setPage(1)
  }

  const handleSortDirectionChange = (direction: SortDirection) => {
    setSortDirection(direction)
    setPage(1)
  }

  const canReset =
    search !== '' ||
    channel !== ALL ||
    videoType !== ALL ||
    dateFrom !== '' ||
    dateTo !== ''

  const handleReset = () => {
    setSearch('')
    setChannel(ALL)
    setVideoType(ALL)
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <Layout>
      {loading && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-10 text-center text-sm text-[var(--text)]">
          Loading videos…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-10 text-center text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          Failed to load data: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <Filters
            channels={channels}
            videoTypes={videoTypes}
            searchSuggestions={searchSuggestions}
            search={search}
            channel={channel}
            videoType={videoType}
            dateFrom={effectiveDateFrom}
            dateTo={effectiveDateTo}
            minDate={dateBounds.min}
            maxDate={dateBounds.max}
            onSearchChange={handleSearchChange}
            onChannelChange={handleChannelChange}
            onVideoTypeChange={handleVideoTypeChange}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
            canReset={canReset}
            onReset={handleReset}
          />
          <KpiCards rows={filteredRows} />
          <VideoTable
            rows={pageRows}
            startIndex={startIndex}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortKeyChange={handleSortKeyChange}
            onSortDirectionChange={handleSortDirectionChange}
          />
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={filteredRows.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </Layout>
  )
}

export default App
