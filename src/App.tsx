import { useMemo, useState } from 'react'
import { Charts } from './components/Charts'
import { Filters } from './components/Filters'
import { KpiCards } from './components/KpiCards'
import { Layout } from './components/Layout'
import { Pagination } from './components/Pagination'
import { Tabs } from './components/Tabs'
import { VideoTable } from './components/VideoTable'
import { PAGE_SIZE_OPTIONS } from './lib/constants'
import { useFilterOptions } from './lib/useFilterOptions'
import { useFilteredVideos } from './lib/useFilteredVideos'
import { usePagination } from './lib/usePagination'
import { useSort } from './lib/useSort'
import { useVideoData } from './lib/useVideoData'
import { useVideoFilters } from './lib/useVideoFilters'

function App() {
  const { rows, daily, loading, error } = useVideoData()

  const { channels, videoTypes, searchSuggestions, dateBounds } =
    useFilterOptions(rows)

  const filters = useVideoFilters(dateBounds)
  const { sortKey, sortDirection, setSortKey, setSortDirection } = useSort()
  const [tab, setTab] = useState<'table' | 'charts'>('table')

  const { filteredRows, filteredDaily } = useFilteredVideos(
    rows,
    daily,
    filters.matchesFilters,
    sortKey,
    sortDirection,
  )

  const resetKey = `${filters.search}|${filters.channel}|${filters.videoType}|${filters.effectiveDateFrom}|${filters.effectiveDateTo}|${sortKey}|${sortDirection}`

  const { currentPage, pageCount, pageSize, startIndex, setPage, setPageSize } =
    usePagination(filteredRows.length, resetKey)

  const pageRows = useMemo(
    () => filteredRows.slice(startIndex, startIndex + pageSize),
    [filteredRows, startIndex, pageSize],
  )

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
            search={filters.search}
            channel={filters.channel}
            videoType={filters.videoType}
            dateFrom={filters.effectiveDateFrom}
            dateTo={filters.effectiveDateTo}
            minDate={dateBounds.min}
            maxDate={dateBounds.max}
            onSearchChange={filters.setSearch}
            onChannelChange={filters.setChannel}
            onVideoTypeChange={filters.setVideoType}
            onDateFromChange={filters.setDateFrom}
            onDateToChange={filters.setDateTo}
            canReset={filters.canReset}
            onReset={filters.reset}
          />
          <KpiCards rows={filteredRows} />
          <Tabs value={tab} onChange={setTab} />
          {tab === 'table' ? (
            <>
              <VideoTable
                rows={pageRows}
                startIndex={startIndex}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortKeyChange={setSortKey}
                onSortDirectionChange={setSortDirection}
              />
              <Pagination
                page={currentPage}
                pageCount={pageCount}
                pageSize={pageSize}
                totalItems={filteredRows.length}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          ) : (
            <Charts rows={filteredRows} daily={filteredDaily} />
          )}
        </>
      )}
    </Layout>
  )
}

export default App
