import { useMemo, useState } from 'react'
import { Filters } from './components/Filters'
import { Layout } from './components/Layout'
import { Pagination } from './components/Pagination'
import { VideoTable, type SortDirection, type SortKey } from './components/VideoTable'
import { useVideoData } from './lib/useVideoData'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE = 10
const ALL = 'all'

function App() {
  const { rows, loading, error } = useVideoData()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [channel, setChannel] = useState(ALL)
  const [videoType, setVideoType] = useState(ALL)
  const [sortKey, setSortKey] = useState<SortKey>('views')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const channels = useMemo(
    () => Array.from(new Set(rows.map((row) => row.account_name))).sort(),
    [rows],
  )
  const videoTypes = useMemo(
    () => Array.from(new Set(rows.map((row) => row.video_type))).sort(),
    [rows],
  )

  const filteredRows = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            (channel === ALL || row.account_name === channel) &&
            (videoType === ALL || row.video_type === videoType),
        )
        .sort((a, b) =>
          sortDirection === 'desc'
            ? b[sortKey] - a[sortKey]
            : a[sortKey] - b[sortKey],
        ),
    [rows, channel, videoType, sortKey, sortDirection],
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

  const handleChannelChange = (value: string) => {
    setChannel(value)
    setPage(1)
  }

  const handleVideoTypeChange = (value: string) => {
    setVideoType(value)
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="!m-0 !text-2xl !font-semibold !tracking-tight text-[var(--text-h)]">
          Top performing videos
        </h1>
        <p className="mt-1 text-sm text-[var(--text)]">
          Ranked by total views across all channels.
        </p>
      </div>

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
            channel={channel}
            videoType={videoType}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onChannelChange={handleChannelChange}
            onVideoTypeChange={handleVideoTypeChange}
            onSortKeyChange={handleSortKeyChange}
            onSortDirectionChange={handleSortDirectionChange}
          />
          <VideoTable
            rows={pageRows}
            startIndex={startIndex}
            sortKey={sortKey}
            sortDirection={sortDirection}
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
